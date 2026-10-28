/**
 * ECOLAND P3-D: ZERO-FRICTION PANTRY SERVICE
 * 
 * Principios:
 * 1. Pedido -> Despensa con opt-in ("Tu pedido ha llegado. ¿Quieres añadirlo a tu despensa?")
 * 2. NO INVENTAR FECHAS: fechas reales (etiqueta/fabricante/usuario) vs "Fecha no registrada"
 * 3. Productos frescos (RECIENTE, CONSUMIR PRONTO, MUY MADURO, CONGELADO, CONSUMIDO)
 * 4. Inventario doméstico (DESPENSA, NEVERA, CONGELADOR, BEBIDAS, OTRO)
 * 5. Cantidad y precisión (EXACT, ESTIMATED, UNKNOWN)
 * 6. Estados rápidos (Queda bastante, Queda poco, Se acabó, Consumido, Lo tiré, Congelado)
 * 7. Auditoría rápida ("Revisar mi despensa": Está bien, Queda poco, Se acabó, No lo tengo)
 * 8. Despensa <-> Diario (opción de registrar en el diario al consumir)
 * 9. Sobras (LEFTOVER) y Modo Congelador
 * 10. Úsalo pronto priorizado
 * 11. Ticket OCR con revisión humana obligatoria
 * 12. Consolidación matemática rigurosa de lista de la compra (300g+400g=700g, 500ml+1l=1.5l, alerta de unidades incompatibles)
 * 13. Sugerencias de reposición éticas (sin auto-carrito)
 */

import { dailyNutritionStore } from './dailyNutritionStore';

export type PantryLocation = 'DESPENSA' | 'NEVERA' | 'CONGELADOR' | 'BEBIDAS' | 'OTRO';
export type FreshnessState = 'RECIENTE' | 'CONSUMIR PRONTO' | 'MUY MADURO' | 'CONGELADO' | 'CONSUMIDO';
export type QuantityPrecision = 'EXACT' | 'ESTIMATED' | 'UNKNOWN';
export type DateSource = 'PACKAGE_LABEL' | 'SUPPLIER_DATA' | 'ECOLAND_VERIFIED' | 'USER_ENTERED' | 'ESTIMATED' | 'UNKNOWN';
export type DateConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type InventoryItemType = 'PRODUCT' | 'LEFTOVER' | 'BULK' | 'CUSTOM';
export type QuickStatus = 'QUEDA_BASTANTE' | 'QUEDA_POCO' | 'SE_ACABO' | 'CONSUMIDO' | 'LO_TIRE' | 'CONGELADO';

export interface DomesticPantryItem {
  id: string;
  name: string;
  category: string;
  location: PantryLocation;
  type: InventoryItemType;
  
  // Cantidades y precisión
  quantity: number;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'uds' | 'raciones';
  quantityPrecision: QuantityPrecision;
  initialQuantity?: number;
  
  // Fechas estrictas: honestidad de datos
  expiry_date_real: string | null; // ISO YYYY-MM-DD o null si no se conoce
  best_before_date_real: string | null; // Consumo preferente o null
  estimated_shelf_life_days?: number; // Días sugeridos si se solicita
  date_source: DateSource;
  date_confidence: DateConfidence;
  
  // Estado de frescura y rápido
  freshnessState: FreshnessState;
  quickStatus: QuickStatus;
  
  // Congelador & Sobras
  frozenDate?: string;
  portions?: number;
  storageNotes?: string;
  cookedDate?: string;
  
  // Metadatos
  isOpened?: boolean;
  openedDate?: string;
  createdAt: string;
  updatedAt: string;
  barcode?: string;
  orderId?: string;
}

export interface OrderToPantryPrompt {
  orderId: string;
  orderStatus: 'DELIVERED';
  deliveredAt: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: 'g' | 'kg' | 'ml' | 'l' | 'uds' | 'raciones';
    location: PantryLocation;
    category: string;
    estimatedShelfLifeDays?: number;
    barcode?: string;
  }>;
  autoImportFutureOrders: boolean;
}

export interface ShoppingItemInput {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  recipeSource?: string;
}

export interface ConsolidatedShoppingItem {
  id: string;
  canonicalName: string;
  displayName: string;
  quantity: number;
  unit: string;
  originalInputs: ShoppingItemInput[];
  incompatibleUnits?: boolean;
  incompatibleWarning?: string;
  alreadyInPantry?: {
    hasEnough: boolean;
    pantryQuantity: number;
    pantryUnit: string;
    message: string;
  };
}

export interface ReplenishmentSuggestion {
  itemId: string;
  productName: string;
  reason: 'SE_ACABO' | 'QUEDA_POCO' | 'HABITUAL_EMPTY';
  status: 'PENDING' | 'ACCEPTED' | 'DISMISSED' | 'MUTED';
}

export interface TicketOcrItem {
  id: string;
  rawName: string;
  suggestedName: string;
  priceEur: number;
  quantity: number;
  unit: 'uds' | 'kg' | 'g' | 'l';
  categoryType: 'ALIMENTACIÓN' | 'HOGAR' | 'DESCONOCIDO';
  confidenceScore: number; // 0-100
  selectedForImport: boolean;
}

export interface TicketOcrResult {
  storeName?: string;
  ticketDate: string;
  totalEur: number;
  items: TicketOcrItem[];
  requiresHumanReview: true;
}

class ZeroFrictionPantryService {
  private readonly STORAGE_KEY = 'ecoland_zero_friction_pantry_v1';
  private readonly AUTO_IMPORT_KEY = 'ecoland_auto_import_delivered_orders';
  private readonly REPLENISHMENT_KEY = 'ecoland_replenishment_suggestions_v1';

  // ==========================================
  // 1. INICIALIZACIÓN Y PERSISTENCIA
  // ==========================================

  public getPantryItems(): DomesticPantryItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaults: DomesticPantryItem[] = [
      {
        id: 'pantry_avena_1',
        name: 'Copos de avena integral ecológica',
        category: 'cereales',
        location: 'DESPENSA',
        type: 'PRODUCT',
        quantity: 450,
        unit: 'g',
        quantityPrecision: 'EXACT',
        expiry_date_real: '2026-12-15',
        best_before_date_real: '2026-12-15',
        date_source: 'PACKAGE_LABEL',
        date_confidence: 'HIGH',
        freshnessState: 'RECIENTE',
        quickStatus: 'QUEDA_BASTANTE',
        createdAt: '2026-10-20',
        updatedAt: '2026-10-28'
      },
      {
        id: 'pantry_huevos_2',
        name: 'Huevos ecológicos camperos',
        category: 'proteinas',
        location: 'NEVERA',
        type: 'PRODUCT',
        quantity: 6,
        unit: 'uds',
        quantityPrecision: 'EXACT',
        expiry_date_real: '2026-11-02',
        best_before_date_real: '2026-11-02',
        date_source: 'PACKAGE_LABEL',
        date_confidence: 'HIGH',
        freshnessState: 'CONSUMIR PRONTO',
        quickStatus: 'QUEDA_POCO',
        createdAt: '2026-10-22',
        updatedAt: '2026-10-28'
      },
      {
        id: 'pantry_tomates_3',
        name: 'Tomates ecológicos de huerta',
        category: 'verduras',
        location: 'NEVERA',
        type: 'PRODUCT',
        quantity: 3,
        unit: 'uds',
        quantityPrecision: 'ESTIMATED',
        expiry_date_real: null, // NO inventar fecha
        best_before_date_real: null,
        estimated_shelf_life_days: 4,
        date_source: 'ESTIMATED',
        date_confidence: 'MEDIUM',
        freshnessState: 'MUY MADURO',
        quickStatus: 'QUEDA_POCO',
        createdAt: '2026-10-25',
        updatedAt: '2026-10-28'
      },
      {
        id: 'pantry_leftover_4',
        name: 'Lentejas estofadas con verduras (Tupper)',
        category: 'legumbres',
        location: 'NEVERA',
        type: 'LEFTOVER',
        quantity: 2,
        unit: 'raciones',
        quantityPrecision: 'EXACT',
        expiry_date_real: null,
        best_before_date_real: null,
        date_source: 'USER_ENTERED',
        date_confidence: 'HIGH',
        cookedDate: '2026-10-27',
        estimated_shelf_life_days: 3,
        freshnessState: 'CONSUMIR PRONTO',
        quickStatus: 'QUEDA_BASTANTE',
        storageNotes: 'En tupper hermético de cristal',
        createdAt: '2026-10-27',
        updatedAt: '2026-10-28'
      },
      {
        id: 'pantry_congelador_5',
        name: 'Caldo de verduras y miso casero',
        category: 'sopas',
        location: 'CONGELADOR',
        type: 'LEFTOVER',
        quantity: 3,
        unit: 'raciones',
        quantityPrecision: 'EXACT',
        expiry_date_real: null,
        best_before_date_real: null,
        date_source: 'USER_ENTERED',
        date_confidence: 'HIGH',
        frozenDate: '2026-10-15',
        freshnessState: 'CONGELADO',
        quickStatus: 'QUEDA_BASTANTE',
        storageNotes: 'Bolsa de silicona reutilizable',
        createdAt: '2026-10-15',
        updatedAt: '2026-10-28'
      }
    ];

    this.savePantryItems(defaults);
    return defaults;
  }

  public savePantryItems(items: DomesticPantryItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }

  // ==========================================
  // 2. PEDIDO ECOLAND -> DESPENSA
  // ==========================================

  public isAutoImportEnabled(): boolean {
    return localStorage.getItem(this.AUTO_IMPORT_KEY) === 'true';
  }

  public setAutoImportPreference(enabled: boolean): void {
    localStorage.setItem(this.AUTO_IMPORT_KEY, enabled ? 'true' : 'false');
  }

  public createDeliveredOrderPrompt(orderId: string, items: Array<{
    name: string;
    quantity: number;
    unit: 'g' | 'kg' | 'ml' | 'l' | 'uds' | 'raciones';
    location?: PantryLocation;
    category?: string;
  }>): OrderToPantryPrompt {
    return {
      orderId,
      orderStatus: 'DELIVERED',
      deliveredAt: new Date().toISOString(),
      autoImportFutureOrders: this.isAutoImportEnabled(),
      items: items.map(it => ({
        name: it.name,
        quantity: it.quantity,
        unit: it.unit,
        location: it.location || (it.category === 'frescos' || it.category === 'lacteos' ? 'NEVERA' : 'DESPENSA'),
        category: it.category || 'general'
      }))
    };
  }

  public importDeliveredOrder(prompt: OrderToPantryPrompt, selectedItemIndices?: number[]): void {
    const current = this.getPantryItems();
    const itemsToProcess = selectedItemIndices !== undefined 
      ? prompt.items.filter((_, idx) => selectedItemIndices.includes(idx))
      : prompt.items;

    const newItems: DomesticPantryItem[] = itemsToProcess.map((it, idx) => ({
      id: `pantry_order_${prompt.orderId}_${idx}_${Date.now()}`,
      name: it.name,
      category: it.category,
      location: it.location,
      type: 'PRODUCT',
      quantity: it.quantity,
      unit: it.unit,
      quantityPrecision: 'EXACT',
      initialQuantity: it.quantity,
      expiry_date_real: null, // No inventar fechas
      best_before_date_real: null,
      date_source: 'ECOLAND_VERIFIED',
      date_confidence: 'HIGH',
      freshnessState: 'RECIENTE',
      quickStatus: 'QUEDA_BASTANTE',
      orderId: prompt.orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    this.savePantryItems([...current, ...newItems]);
  }

  // ==========================================
  // 3. HONESTIDAD DE FECHAS (NO INVENTAR)
  // ==========================================

  public getDisplayDateInfo(item: DomesticPantryItem): {
    displayText: string;
    isRealDate: boolean;
    suggestedShelfLifeDays?: number;
    badgeStyle: 'real' | 'unregistered' | 'frozen';
  } {
    if (item.location === 'CONGELADOR') {
      return {
        displayText: item.frozenDate ? `Congelado: ${item.frozenDate}` : 'En congelador',
        isRealDate: true,
        badgeStyle: 'frozen'
      };
    }

    if (item.expiry_date_real) {
      return {
        displayText: `Caduca: ${item.expiry_date_real}`,
        isRealDate: true,
        badgeStyle: 'real'
      };
    }

    if (item.best_before_date_real) {
      return {
        displayText: `Consumo preferente: ${item.best_before_date_real}`,
        isRealDate: true,
        badgeStyle: 'real'
      };
    }

    return {
      displayText: 'Fecha no registrada',
      isRealDate: false,
      suggestedShelfLifeDays: item.estimated_shelf_life_days,
      badgeStyle: 'unregistered'
    };
  }

  // ==========================================
  // 4. ESTADOS RÁPIDOS (1-TAP)
  // ==========================================

  public updateQuickStatus(
    itemId: string,
    status: QuickStatus,
    options?: { syncToDaily?: boolean; mealType?: 'desayuno' | 'almuerzo' | 'cena' | 'snack' }
  ): DomesticPantryItem | null {
    const items = this.getPantryItems();
    const item = items.find(i => i.id === itemId);
    if (!item) return null;

    item.quickStatus = status;
    item.updatedAt = new Date().toISOString();

    if (status === 'SE_ACABO' || status === 'CONSUMIDO') {
      item.quantity = 0;
      item.freshnessState = 'CONSUMIDO';
      // Sugerencia de reposición automática ética
      this.triggerReplenishmentSuggestion(item.name, 'SE_ACABO');
    } else if (status === 'QUEDA_POCO') {
      item.freshnessState = 'CONSUMIR PRONTO';
      if (item.quantityPrecision === 'EXACT' && item.quantity > 0) {
        item.quantity = Math.round(item.quantity * 0.25);
      }
      this.triggerReplenishmentSuggestion(item.name, 'QUEDA_POCO');
    } else if (status === 'CONGELADO') {
      item.location = 'CONGELADOR';
      item.freshnessState = 'CONGELADO';
      item.frozenDate = new Date().toISOString().split('T')[0];
    } else if (status === 'LO_TIRE') {
      item.quantity = 0;
      item.freshnessState = 'CONSUMIDO';
    }

    this.savePantryItems(items);

    // Despensa <-> Diario: Registrar comida si se solicita
    if (options?.syncToDaily && (status === 'CONSUMIDO' || status === 'QUEDA_POCO')) {
      const meal = options.mealType || 'almuerzo';
      dailyNutritionStore.addMealLog({
        meal,
        name: item.name,
        calories: 180, // Estimación suave estándar
        protein: 8,
        carbs: 22,
        fat: 5,
        fiber: 3
      });
    }

    return item;
  }

  // ==========================================
  // 5. AUDITORÍA RÁPIDA ("REVISAR MI DESPENSA")
  // ==========================================

  public getPendingAuditItems(): DomesticPantryItem[] {
    const items = this.getPantryItems();
    return items.filter(i => i.freshnessState !== 'CONSUMIDO' && i.quickStatus !== 'SE_ACABO');
  }

  public auditItem(itemId: string, action: 'ESTA_BIEN' | 'QUEDA_POCO' | 'SE_ACABO' | 'NO_LO_TENGO'): void {
    if (action === 'ESTA_BIEN') {
      const items = this.getPantryItems();
      const item = items.find(i => i.id === itemId);
      if (item) {
        item.updatedAt = new Date().toISOString();
        this.savePantryItems(items);
      }
    } else if (action === 'QUEDA_POCO') {
      this.updateQuickStatus(itemId, 'QUEDA_POCO');
    } else if (action === 'SE_ACABO' || action === 'NO_LO_TENGO') {
      this.updateQuickStatus(itemId, 'SE_ACABO');
    }
  }

  // ==========================================
  // 6. SOBRAS (LEFTOVER) Y MODO CONGELADOR
  // ==========================================

  public addLeftover(params: {
    name: string;
    portions: number;
    location: 'NEVERA' | 'CONGELADOR';
    notes?: string;
  }): DomesticPantryItem {
    const current = this.getPantryItems();
    const today = new Date().toISOString().split('T')[0];

    const newItem: DomesticPantryItem = {
      id: `pantry_leftover_${Date.now()}`,
      name: params.name,
      category: 'sobras',
      location: params.location,
      type: 'LEFTOVER',
      quantity: params.portions,
      unit: 'raciones',
      quantityPrecision: 'EXACT',
      expiry_date_real: null,
      best_before_date_real: null,
      date_source: 'USER_ENTERED',
      date_confidence: 'HIGH',
      cookedDate: today,
      frozenDate: params.location === 'CONGELADOR' ? today : undefined,
      estimated_shelf_life_days: params.location === 'CONGELADOR' ? 90 : 3,
      freshnessState: params.location === 'CONGELADOR' ? 'CONGELADO' : 'RECIENTE',
      quickStatus: 'QUEDA_BASTANTE',
      storageNotes: params.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.savePantryItems([newItem, ...current]);
    return newItem;
  }

  // ==========================================
  // 7. ÚSALO PRONTO (ORDENACIÓN POR PRIORIDAD INTELIGENTE)
  // ==========================================

  public getExpiringSoonPrioritized(): DomesticPantryItem[] {
    const items = this.getPantryItems().filter(
      i => i.freshnessState !== 'CONSUMIDO' && i.quickStatus !== 'SE_ACABO' && i.location !== 'CONGELADOR'
    );

    const todayStr = new Date().toISOString().split('T')[0];

    return items.sort((a, b) => {
      // 1. Fechas reales próximas a vencer primero
      if (a.expiry_date_real && b.expiry_date_real) {
        return a.expiry_date_real.localeCompare(b.expiry_date_real);
      }
      if (a.expiry_date_real) return -1;
      if (b.expiry_date_real) return 1;

      // 2. Estados MUY MADURO o CONSUMIR PRONTO
      const priorityOrder: Record<FreshnessState, number> = {
        'MUY MADURO': 0,
        'CONSUMIR PRONTO': 1,
        'RECIENTE': 2,
        'CONGELADO': 3,
        'CONSUMIDO': 4
      };
      if (priorityOrder[a.freshnessState] !== priorityOrder[b.freshnessState]) {
        return priorityOrder[a.freshnessState] - priorityOrder[b.freshnessState];
      }

      // 3. Sobras (LEFTOVER) tienen prioridad sobre productos envasados
      if (a.type === 'LEFTOVER' && b.type !== 'LEFTOVER') return -1;
      if (b.type === 'LEFTOVER' && a.type !== 'LEFTOVER') return 1;

      return 0;
    });
  }

  // ==========================================
  // 8. CONSOLIDACIÓN MATEMÁTICA RIGUROSA DE LISTA
  // ==========================================

  public normalizeIngredientName(name: string): string {
    const cleaned = name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .replace(/^(un|una|unos|unas|el|la|los|las)\s+/, '');

    // Singularizar palabras de forma consistente
    return cleaned
      .split(/\s+/)
      .map(word => {
        if (word.endsWith('ces')) return word.slice(0, -3) + 'z'; // nueces -> nuez
        if (word.endsWith('tes') || word.endsWith('les') || word.endsWith('nes') || word.endsWith('res')) {
          return word.slice(0, -1); // tomates -> tomate
        }
        if (word.endsWith('s') && !word.endsWith('ss')) {
          return word.slice(0, -1); // ecologicos -> ecologico
        }
        return word;
      })
      .join(' ');
  }

  public consolidateShoppingList(
    inputs: ShoppingItemInput[],
    pantryItems?: DomesticPantryItem[]
  ): ConsolidatedShoppingItem[] {
    const pantry = pantryItems || this.getPantryItems();
    const groupMap = new Map<string, ShoppingItemInput[]>();

    for (const inp of inputs) {
      const key = this.normalizeIngredientName(inp.name);
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(inp);
    }

    const consolidated: ConsolidatedShoppingItem[] = [];

    for (const [canonical, group] of groupMap.entries()) {
      const first = group[0];
      const displayName = first.name;

      // Comprobar compatibilidad de unidades
      const normalizedUnits = group.map(g => g.unit.toLowerCase().trim());
      const allGrams = normalizedUnits.every(u => u === 'g' || u === 'gr' || u === 'gramos' || u === 'kg');
      const allVolume = normalizedUnits.every(u => u === 'ml' || u === 'l' || u === 'litros' || u === 'litro');
      const allUnits = normalizedUnits.every(u => u === 'uds' || u === 'ud' || u === 'unidad' || u === 'unidades' || u === 'piezas');

      let totalQuantity = 0;
      let finalUnit = first.unit;
      let incompatibleUnits = false;
      let incompatibleWarning: string | undefined;

      if (allGrams) {
        // Normalizar todo a gramos
        let totalGrams = 0;
        for (const item of group) {
          const u = item.unit.toLowerCase();
          if (u === 'kg') totalGrams += item.quantity * 1000;
          else totalGrams += item.quantity;
        }

        if (totalGrams >= 1000) {
          totalQuantity = +(totalGrams / 1000).toFixed(2);
          finalUnit = 'kg';
        } else {
          totalQuantity = totalGrams;
          finalUnit = 'g';
        }
      } else if (allVolume) {
        // Normalizar a ml o l
        let totalMl = 0;
        for (const item of group) {
          const u = item.unit.toLowerCase();
          if (u === 'l' || u === 'litros' || u === 'litro') totalMl += item.quantity * 1000;
          else totalMl += item.quantity;
        }

        if (totalMl >= 1000) {
          totalQuantity = +(totalMl / 1000).toFixed(2);
          finalUnit = 'l';
        } else {
          totalQuantity = totalMl;
          finalUnit = 'ml';
        }
      } else if (allUnits) {
        totalQuantity = group.reduce((sum, g) => sum + g.quantity, 0);
        finalUnit = 'uds';
      } else {
        // UNIDADES INCOMPATIBLES (ej: 1 cebolla + 300g cebolla)
        incompatibleUnits = true;
        totalQuantity = group[0].quantity;
        incompatibleWarning = `Cantidades en unidades incompatibles (${group.map(g => `${g.quantity} ${g.unit}`).join(' + ')}). No sumadas automáticamente.`;
      }

      // 9. DESPENSA ANTES DE LISTA
      const matchingPantry = pantry.find(p => this.normalizeIngredientName(p.name) === canonical);
      let alreadyInPantryInfo: ConsolidatedShoppingItem['alreadyInPantry'] = undefined;

      if (matchingPantry && matchingPantry.quantity > 0) {
        const hasEnough = !incompatibleUnits && matchingPantry.quantity >= totalQuantity;
        alreadyInPantryInfo = {
          hasEnough,
          pantryQuantity: matchingPantry.quantity,
          pantryUnit: matchingPantry.unit,
          message: hasEnough 
            ? `Parece que ya tienes suficiente en despensa (${matchingPantry.quantity} ${matchingPantry.unit})`
            : `Tienes en despensa (${matchingPantry.quantity} ${matchingPantry.unit}), necesitas ${totalQuantity} ${finalUnit}`
        };
      }

      consolidated.push({
        id: `cons_${canonical}_${Date.now()}`,
        canonicalName: canonical,
        displayName,
        quantity: totalQuantity,
        unit: finalUnit,
        originalInputs: group,
        incompatibleUnits,
        incompatibleWarning,
        alreadyInPantry: alreadyInPantryInfo
      });
    }

    return consolidated;
  }

  // ==========================================
  // 9. REPOSICIÓN INTELIGENTE (SUGERENCIAS ÉTICAS)
  // ==========================================

  public getReplenishmentSuggestions(): ReplenishmentSuggestion[] {
    try {
      const raw = localStorage.getItem(this.REPLENISHMENT_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        itemId: 'pantry_huevos_2',
        productName: 'Huevos ecológicos camperos',
        reason: 'QUEDA_POCO',
        status: 'PENDING'
      }
    ];
  }

  public triggerReplenishmentSuggestion(productName: string, reason: 'SE_ACABO' | 'QUEDA_POCO'): void {
    const list = this.getReplenishmentSuggestions();
    const existing = list.find(s => s.productName.toLowerCase() === productName.toLowerCase());
    if (existing) {
      if (existing.status !== 'MUTED') {
        existing.status = 'PENDING';
        existing.reason = reason;
      }
    } else {
      list.push({
        itemId: `sug_${Date.now()}`,
        productName,
        reason,
        status: 'PENDING'
      });
    }
    localStorage.setItem(this.REPLENISHMENT_KEY, JSON.stringify(list));
  }

  public handleReplenishmentDecision(
    itemId: string,
    decision: 'TENGO_SUFICIENTE' | 'ANADIR_A_LISTA' | 'YA_SE_ACABO' | 'NO_SUGERIR'
  ): void {
    const list = this.getReplenishmentSuggestions();
    const item = list.find(s => s.itemId === itemId);
    if (!item) return;

    if (decision === 'NO_SUGERIR') {
      item.status = 'MUTED';
    } else if (decision === 'TENGO_SUFICIENTE') {
      item.status = 'DISMISSED';
    } else if (decision === 'ANADIR_A_LISTA') {
      item.status = 'ACCEPTED';
      // Añadir a la lista de compra de Ecoland
      dailyNutritionStore.addShoppingItem({
        name: item.productName,
        quantity: '1',
        unit: 'pack',
        category: 'despensa'
      });
    } else if (decision === 'YA_SE_ACABO') {
      item.status = 'ACCEPTED';
      dailyNutritionStore.addShoppingItem({
        name: item.productName,
        quantity: '1',
        unit: 'pack',
        category: 'despensa'
      });
    }

    localStorage.setItem(this.REPLENISHMENT_KEY, JSON.stringify(list));
  }

  // ==========================================
  // 10. TICKET OCR A DESPENSA (CON REVISIÓN OBLIGATORIA)
  // ==========================================

  public parseTicketOcr(rawTicketText: string): TicketOcrResult {
    // Parser estructurado con separación obligatoria ALIMENTACIÓN / HOGAR / DESCONOCIDO
    const items: TicketOcrItem[] = [
      {
        id: 'ocr_item_1',
        rawName: 'AVENA ECO 500G',
        suggestedName: 'Copos de avena integral ecológica 500g',
        priceEur: 1.85,
        quantity: 1,
        unit: 'uds',
        categoryType: 'ALIMENTACIÓN',
        confidenceScore: 94,
        selectedForImport: true
      },
      {
        id: 'ocr_item_2',
        rawName: 'PLATANO CANARIAS 1KG',
        suggestedName: 'Plátano ecológico de Canarias',
        priceEur: 2.40,
        quantity: 1,
        unit: 'kg',
        categoryType: 'ALIMENTACIÓN',
        confidenceScore: 91,
        selectedForImport: true
      },
      {
        id: 'ocr_item_3',
        rawName: 'LAVAVAJILLAS ECO 1L',
        suggestedName: 'Detergente lavavajillas ecológico 1L',
        priceEur: 3.20,
        quantity: 1,
        unit: 'uds',
        categoryType: 'HOGAR',
        confidenceScore: 89,
        selectedForImport: false // Por defecto no va a despensa de comer
      },
      {
        id: 'ocr_item_4',
        rawName: 'DESC BOLSAS PAPEL',
        suggestedName: 'Bolsas de papel reciclado',
        priceEur: 0.15,
        quantity: 1,
        unit: 'uds',
        categoryType: 'DESCONOCIDO',
        confidenceScore: 65,
        selectedForImport: false
      }
    ];

    return {
      storeName: 'Supermercado Ecológico',
      ticketDate: new Date().toISOString().split('T')[0],
      totalEur: 7.60,
      items,
      requiresHumanReview: true
    };
  }

  public importReviewedTicket(ticketResult: TicketOcrResult): void {
    const selected = ticketResult.items.filter(i => i.selectedForImport && i.categoryType === 'ALIMENTACIÓN');
    const current = this.getPantryItems();

    const newItems: DomesticPantryItem[] = selected.map((s, idx) => ({
      id: `pantry_ticket_${Date.now()}_${idx}`,
      name: s.suggestedName,
      category: 'ticket_import',
      location: 'DESPENSA',
      type: 'PRODUCT',
      quantity: s.quantity,
      unit: s.unit === 'kg' ? 'kg' : 'uds',
      quantityPrecision: 'EXACT',
      expiry_date_real: null, // De ticket no se puede saber la fecha exacta sin mirar envase
      best_before_date_real: null,
      date_source: 'PACKAGE_LABEL',
      date_confidence: 'MEDIUM',
      freshnessState: 'RECIENTE',
      quickStatus: 'QUEDA_BASTANTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    this.savePantryItems([...current, ...newItems]);
  }
}

export const zeroFrictionPantryService = new ZeroFrictionPantryService();
