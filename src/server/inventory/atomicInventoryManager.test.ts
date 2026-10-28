import { describe, it, expect, beforeEach } from 'vitest';
import { AtomicInventoryManager } from './atomicInventoryManager';

describe('AtomicInventoryManager — Concurrencia y Atomicidad Real', () => {
  let manager: AtomicInventoryManager;

  beforeEach(() => {
    manager = new AtomicInventoryManager();
  });

  it('CASO OBLIGATORIO: 50 clientes compiten simultáneamente por 1 sola unidad en stock', async () => {
    const productId = 'prod_aceite_virgen_extra_5L';
    // Stock inicial: 1 unidad física, 0 reservadas
    manager.setStock(productId, 1, 0);

    const clientCount = 50;
    const promises: Promise<any>[] = [];

    // Lanzar 50 peticiones simultáneas asíncronas
    for (let i = 0; i < clientCount; i++) {
      const intentId = `intent_${i + 1}`;
      const idempotencyKey = `key_client_${i + 1}`;
      promises.push(
        manager.reserveInventory(intentId, idempotencyKey, [{ productId, quantity: 1 }])
      );
    }

    const results = await Promise.all(promises);

    // Contar éxitos y fallos
    const successes = results.filter(r => r.success === true);
    const outOfStockFailures = results.filter(r => r.success === false && r.error === 'OUT_OF_STOCK');

    // VERIFICACIÓN ESTRICTA:
    // 1. Exactamente 1 cliente consigue la reserva
    expect(successes.length).toBe(1);

    // 2. Exactamente 49 clientes reciben OUT_OF_STOCK
    expect(outOfStockFailures.length).toBe(49);

    // 3. El stock disponible final es exactamente 0 (nunca negativo)
    expect(manager.getAvailableStock(productId)).toBe(0);
    expect(manager.getPhysicalStock(productId)).toBe(1);
    expect(manager.getReservedStock(productId)).toBe(1);
  });

  it('debe revertir atómicamente si 1 de los 3 productos de un pedido no tiene stock suficiente (All or Nothing)', async () => {
    manager.setStock('p1', 5, 0);
    manager.setStock('p2', 0, 0); // Agotado
    manager.setStock('p3', 10, 0);

    const res = await manager.reserveInventory('intent_bundle_1', 'idemp_bundle', [
      { productId: 'p1', quantity: 1 },
      { productId: 'p2', quantity: 1 },
      { productId: 'p3', quantity: 2 },
    ]);

    expect(res.success).toBe(false);
    expect(res.error).toBe('OUT_OF_STOCK');
    expect(res.failedProductId).toBe('p2');

    // Verificar que p1 y p3 no quedaron reservados (Rollback completo)
    expect(manager.getAvailableStock('p1')).toBe(5);
    expect(manager.getAvailableStock('p3')).toBe(10);
    expect(manager.getReservedStock('p1')).toBe(0);
    expect(manager.getReservedStock('p3')).toBe(0);
  });

  it('debe capturar stock definitivamente al aprobarse el pago', async () => {
    manager.setStock('p1', 10, 0);

    const res = await manager.reserveInventory('intent_ok', 'idemp_ok', [{ productId: 'p1', quantity: 2 }]);
    expect(res.success).toBe(true);

    expect(manager.getPhysicalStock('p1')).toBe(10);
    expect(manager.getReservedStock('p1')).toBe(2);
    expect(manager.getAvailableStock('p1')).toBe(8);

    // Captura definitiva tras confirmación del webhook de pago
    await manager.captureInventory('intent_ok');

    expect(manager.getPhysicalStock('p1')).toBe(8);
    expect(manager.getReservedStock('p1')).toBe(0);
    expect(manager.getAvailableStock('p1')).toBe(8);
  });

  it('debe liberar la reserva y devolver el stock a disponible al cancelarse el pago', async () => {
    manager.setStock('p1', 5, 0);

    await manager.reserveInventory('intent_cancel', 'idemp_cancel', [{ productId: 'p1', quantity: 2 }]);
    expect(manager.getAvailableStock('p1')).toBe(3);

    // Rechazo de pasarela -> Liberar
    await manager.releaseInventory('intent_cancel');

    expect(manager.getPhysicalStock('p1')).toBe(5);
    expect(manager.getReservedStock('p1')).toBe(0);
    expect(manager.getAvailableStock('p1')).toBe(5);
  });

  it('debe expirar reservas no pagadas tras superar el tiempo límite', async () => {
    manager.setStock('p1', 4, 0);

    // Reserva con timeout de 0 minutos (expira inmediatamente)
    await manager.reserveInventory('intent_timeout', 'idemp_timeout', [{ productId: 'p1', quantity: 2 }], -1);
    expect(manager.getAvailableStock('p1')).toBe(2);

    // Ejecutar tarea de limpieza de reservas expiradas
    const cleaned = await manager.expireInventoryReservations();
    expect(cleaned).toBe(1);

    // Stock devuelto a disponible
    expect(manager.getAvailableStock('p1')).toBe(4);
    expect(manager.getReservedStock('p1')).toBe(0);
  });
});
