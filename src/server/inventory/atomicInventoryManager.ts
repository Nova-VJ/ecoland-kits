/**
 * GESTOR ATÓMICO DE INVENTARIO CON CONTROL DE CONCURRENCIA ESTRICTO
 * Ecoland E-commerce Omnicanal (Tienda Valladolid + Web)
 * 
 * Implementa la semántica transaccional pesimista de PostgreSQL:
 * 1. Serialización / Mutex por producto para evitar condiciones de carrera (Race Conditions).
 * 2. Comprobación estricta de (físico - reservado >= solicitado).
 * 3. Reserva con caducidad automática (15 min).
 * 4. Idempotencia por clave única.
 * 5. Rollback integral ante error en cualquiera de los productos del lote.
 */

export interface InventoryItemState {
  productId: string;
  physicalStock: number;
  reservedStock: number;
}

export interface ReservationRecord {
  id: string;
  orderIntentId: string;
  idempotencyKey: string;
  productId: string;
  quantity: number;
  expiresAt: number;
  status: 'active' | 'captured' | 'released' | 'expired';
}

export interface ReserveResult {
  success: boolean;
  orderIntentId?: string;
  expiresAt?: number;
  error?: 'OUT_OF_STOCK' | 'PRODUCT_NOT_FOUND' | 'INVALID_QUANTITY';
  failedProductId?: string;
  requested?: number;
  available?: number;
  idempotentReplay?: boolean;
}

export class AtomicInventoryManager {
  private stockMap: Map<string, InventoryItemState> = new Map();
  private reservations: Map<string, ReservationRecord> = new Map(); // reservationId -> record
  private idempotencyIndex: Map<string, string> = new Map(); // idempotencyKey -> orderIntentId
  
  // Mutex de serialización por producto para garantizar atomicidad concurrente
  private mutexLocks: Map<string, Promise<void>> = new Map();

  constructor() {
    this.reset();
  }

  public reset() {
    this.stockMap.clear();
    this.reservations.clear();
    this.idempotencyIndex.clear();
    this.mutexLocks.clear();
  }

  public setStock(productId: string, physicalStock: number, reservedStock = 0) {
    this.stockMap.set(productId, {
      productId,
      physicalStock: Math.max(0, physicalStock),
      reservedStock: Math.max(0, reservedStock)
    });
  }

  public getAvailableStock(productId: string): number {
    const item = this.stockMap.get(productId);
    if (!item) return 0;
    return Math.max(0, item.physicalStock - item.reservedStock);
  }

  public getPhysicalStock(productId: string): number {
    return this.stockMap.get(productId)?.physicalStock ?? 0;
  }

  public getReservedStock(productId: string): number {
    return this.stockMap.get(productId)?.reservedStock ?? 0;
  }

  /**
   * Adquiere un bloqueo exclusivo sobre un recurso (emulación de SELECT FOR UPDATE)
   */
  private async acquireLock(productId: string): Promise<() => void> {
    while (this.mutexLocks.has(productId)) {
      await this.mutexLocks.get(productId);
    }
    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });
    this.mutexLocks.set(productId, promise);
    return () => {
      this.mutexLocks.delete(productId);
      resolver!();
    };
  }

  /**
   * OPERACIÓN ATÓMICA TRANSACCIONAL: reserve_inventory()
   * Bloquea en orden alfabético para prevenir Deadlocks.
   */
  public async reserveInventory(
    orderIntentId: string,
    idempotencyKey: string,
    items: { productId: string; quantity: number }[],
    timeoutMinutes = 15
  ): Promise<ReserveResult> {
    // 1. Idempotencia inmediata
    if (this.idempotencyIndex.has(idempotencyKey)) {
      const existingIntentId = this.idempotencyIndex.get(idempotencyKey)!;
      return {
        success: true,
        orderIntentId: existingIntentId,
        idempotentReplay: true
      };
    }

    if (!items || items.length === 0) {
      return { success: false, error: 'INVALID_QUANTITY' };
    }

    // Ordenar productos por ID para prevenir deadlocks en transacciones concurrentes
    const sortedItems = [...items].sort((a, b) => a.productId.localeCompare(b.productId));
    const releaseFns: (() => void)[] = [];

    try {
      // 2. Adquirir bloqueos pesimistas sobre todos los productos requeridos
      for (const item of sortedItems) {
        const release = await this.acquireLock(item.productId);
        releaseFns.push(release);
      }

      // 3. Validar disponibilidad de stock de todos los artículos antes de alterar el estado
      for (const item of sortedItems) {
        if (item.quantity <= 0) {
          return { success: false, error: 'INVALID_QUANTITY', failedProductId: item.productId };
        }

        const state = this.stockMap.get(item.productId);
        if (!state) {
          return { success: false, error: 'PRODUCT_NOT_FOUND', failedProductId: item.productId };
        }

        const available = state.physicalStock - state.reservedStock;
        if (available < item.quantity) {
          // Fallo atómico: no se reserva ningún producto del pedido (Rollback implícito)
          return {
            success: false,
            error: 'OUT_OF_STOCK',
            failedProductId: item.productId,
            requested: item.quantity,
            available
          };
        }
      }

      // 4. Todo verificado: Aplicar incremento de reserved_stock y registrar reserva
      const expiresAt = Date.now() + timeoutMinutes * 60 * 1000;

      for (const item of sortedItems) {
        const state = this.stockMap.get(item.productId)!;
        state.reservedStock += item.quantity;

        const resId = `res_${orderIntentId}_${item.productId}`;
        this.reservations.set(resId, {
          id: resId,
          orderIntentId,
          idempotencyKey,
          productId: item.productId,
          quantity: item.quantity,
          expiresAt,
          status: 'active'
        });
      }

      this.idempotencyIndex.set(idempotencyKey, orderIntentId);

      return {
        success: true,
        orderIntentId,
        expiresAt
      };

    } finally {
      // Liberar todos los bloqueos en orden inverso
      while (releaseFns.length > 0) {
        const release = releaseFns.pop()!;
        release();
      }
    }
  }

  /**
   * OPERACIÓN ATÓMICA: release_inventory()
   * Libera la reserva si el cliente abandona o la pasarela rechaza el pago.
   */
  public async releaseInventory(orderIntentId: string): Promise<boolean> {
    for (const [resId, res] of this.reservations.entries()) {
      if (res.orderIntentId === orderIntentId && res.status === 'active') {
        const release = await this.acquireLock(res.productId);
        try {
          const state = this.stockMap.get(res.productId);
          if (state) {
            state.reservedStock = Math.max(0, state.reservedStock - res.quantity);
          }
          res.status = 'released';
        } finally {
          release();
        }
      }
    }
    return true;
  }

  /**
   * OPERACIÓN ATÓMICA: capture_inventory()
   * Consolida la venta definitiva: reduce physical_stock y reduce reserved_stock.
   */
  public async captureInventory(orderIntentId: string): Promise<boolean> {
    for (const [resId, res] of this.reservations.entries()) {
      if (res.orderIntentId === orderIntentId && res.status === 'active') {
        const release = await this.acquireLock(res.productId);
        try {
          const state = this.stockMap.get(res.productId);
          if (state) {
            state.physicalStock = Math.max(0, state.physicalStock - res.quantity);
            state.reservedStock = Math.max(0, state.reservedStock - res.quantity);
          }
          res.status = 'captured';
        } finally {
          release();
        }
      }
    }
    return true;
  }

  /**
   * OPERACIÓN DE MANTENIMIENTO: expire_inventory_reservations()
   * Limpia reservas no pagadas tras superar los 15 minutos.
   */
  public async expireInventoryReservations(): Promise<number> {
    let expiredCount = 0;
    const now = Date.now();

    for (const [resId, res] of this.reservations.entries()) {
      if (res.status === 'active' && res.expiresAt < now) {
        const release = await this.acquireLock(res.productId);
        try {
          const state = this.stockMap.get(res.productId);
          if (state) {
            state.reservedStock = Math.max(0, state.reservedStock - res.quantity);
          }
          res.status = 'expired';
          expiredCount++;
        } finally {
          release();
        }
      }
    }
    return expiredCount;
  }
}

export const atomicInventoryManager = new AtomicInventoryManager();
