import { describe, it, expect, beforeEach } from 'vitest';
import { zeroFrictionPantryService } from './zeroFrictionPantryService';

describe('Zero-Friction Pantry Service (P3-D)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Pedido -> Despensa: prompt con opt-in y preferencia de auto-importación', () => {
    expect(zeroFrictionPantryService.isAutoImportEnabled()).toBe(false);

    // Activar preferencia opt-in
    zeroFrictionPantryService.setAutoImportPreference(true);
    expect(zeroFrictionPantryService.isAutoImportEnabled()).toBe(true);

    const prompt = zeroFrictionPantryService.createDeliveredOrderPrompt('ord_123', [
      { name: 'Copos de avena integral eco', quantity: 500, unit: 'g', category: 'cereales' },
      { name: 'Yogur de oveja artesano', quantity: 2, unit: 'uds', category: 'lacteos' }
    ]);

    expect(prompt.orderStatus).toBe('DELIVERED');
    expect(prompt.items.length).toBe(2);
    expect(prompt.items[1].location).toBe('NEVERA'); // Auto asigna nevera a lácteos

    // Importar a despensa
    zeroFrictionPantryService.importDeliveredOrder(prompt);
    const items = zeroFrictionPantryService.getPantryItems();
    const importedAvena = items.find(i => i.name === 'Copos de avena integral eco');

    expect(importedAvena).toBeDefined();
    expect(importedAvena?.quantity).toBe(500);
    // Honestidad de fechas: no inventa fechas
    expect(importedAvena?.expiry_date_real).toBeNull();
  });

  it('2. Honestidad de fechas: distingue fechas reales de "Fecha no registrada"', () => {
    const items = zeroFrictionPantryService.getPantryItems();
    const avena = items.find(i => i.id === 'pantry_avena_1')!;
    const tomates = items.find(i => i.id === 'pantry_tomates_3')!;
    const congelado = items.find(i => i.id === 'pantry_congelador_5')!;

    // Avena tiene fecha real
    const avenaDateInfo = zeroFrictionPantryService.getDisplayDateInfo(avena);
    expect(avenaDateInfo.isRealDate).toBe(true);
    expect(avenaDateInfo.displayText).toContain('Caduca: 2026-12-15');

    // Tomates no tienen fecha real -> "Fecha no registrada"
    const tomateDateInfo = zeroFrictionPantryService.getDisplayDateInfo(tomates);
    expect(tomateDateInfo.isRealDate).toBe(false);
    expect(tomateDateInfo.displayText).toBe('Fecha no registrada');
    expect(tomateDateInfo.suggestedShelfLifeDays).toBe(4);

    // Congelador muestra fecha de congelación
    const congeladoDateInfo = zeroFrictionPantryService.getDisplayDateInfo(congelado);
    expect(congeladoDateInfo.badgeStyle).toBe('frozen');
    expect(congeladoDateInfo.displayText).toContain('Congelado');
  });

  it('3. Estados rápidos (1-tap): actualiza estado, cantidad y genera sugerencia', () => {
    // Marcar como que queda poco
    const updated = zeroFrictionPantryService.updateQuickStatus('pantry_avena_1', 'QUEDA_POCO');
    expect(updated?.freshnessState).toBe('CONSUMIR PRONTO');
    expect(updated?.quickStatus).toBe('QUEDA_POCO');

    // Marcar como se acabó
    const finished = zeroFrictionPantryService.updateQuickStatus('pantry_avena_1', 'SE_ACABO');
    expect(finished?.quantity).toBe(0);
    expect(finished?.freshnessState).toBe('CONSUMIDO');

    // Comprobar que disparó sugerencia ética de reposición
    const suggestions = zeroFrictionPantryService.getReplenishmentSuggestions();
    const avenaSug = suggestions.find(s => s.productName.includes('avena'));
    expect(avenaSug).toBeDefined();
    expect(avenaSug?.reason).toBe('SE_ACABO');
  });

  it('4. Auditoría rápida ("Revisar mi despensa"): filtra items pendientes', () => {
    const pending = zeroFrictionPantryService.getPendingAuditItems();
    expect(pending.length).toBeGreaterThan(0);

    // Confirmar que está bien
    zeroFrictionPantryService.auditItem(pending[0].id, 'ESTA_BIEN');
    const items = zeroFrictionPantryService.getPantryItems();
    expect(items[0].updatedAt).toBeDefined();
  });

  it('5. Sobras (LEFTOVER) y Modo Congelador', () => {
    const leftover = zeroFrictionPantryService.addLeftover({
      name: 'Arroz basmati salteado con verduras',
      portions: 2,
      location: 'NEVERA',
      notes: 'Consumir en 48h'
    });

    expect(leftover.type).toBe('LEFTOVER');
    expect(leftover.quantity).toBe(2);
    expect(leftover.location).toBe('NEVERA');
    expect(leftover.freshnessState).toBe('RECIENTE');
  });

  it('6. Úsalo pronto: prioriza fechas reales próximas y sobras', () => {
    const sorted = zeroFrictionPantryService.getExpiringSoonPrioritized();
    expect(sorted.length).toBeGreaterThan(0);

    // Huevos caducan el 2026-11-02, deberían ir antes de avena (2026-12-15)
    const eggsIdx = sorted.findIndex(i => i.id === 'pantry_huevos_2');
    const avenaIdx = sorted.findIndex(i => i.id === 'pantry_avena_1');
    expect(eggsIdx).toBeLessThan(avenaIdx);
  });

  it('7. Consolidación matemática rigurosa de ingredientes para lista de compra', () => {
    // Caso 1: 300g + 400g = 700g
    const resGrams = zeroFrictionPantryService.consolidateShoppingList([
      { name: 'Arroz integral', quantity: 300, unit: 'g' },
      { name: 'Arroz integral', quantity: 400, unit: 'g' }
    ]);
    expect(resGrams[0].quantity).toBe(700);
    expect(resGrams[0].unit).toBe('g');

    // Caso 2: 1kg + 500g = 1.5kg
    const resKg = zeroFrictionPantryService.consolidateShoppingList([
      { name: 'Harina de espelta', quantity: 1, unit: 'kg' },
      { name: 'Harina de espelta', quantity: 500, unit: 'g' }
    ]);
    expect(resKg[0].quantity).toBe(1.5);
    expect(resKg[0].unit).toBe('kg');

    // Caso 3: 500ml + 1l = 1.5l
    const resVol = zeroFrictionPantryService.consolidateShoppingList([
      { name: 'Bebida de avena', quantity: 500, unit: 'ml' },
      { name: 'Bebida de avena', quantity: 1, unit: 'l' }
    ]);
    expect(resVol[0].quantity).toBe(1.5);
    expect(resVol[0].unit).toBe('l');

    // Caso 4: 3 uds + 2 uds = 5 uds
    const resUds = zeroFrictionPantryService.consolidateShoppingList([
      { name: 'Aguacates', quantity: 3, unit: 'uds' },
      { name: 'Aguacates', quantity: 2, unit: 'uds' }
    ]);
    expect(resUds[0].quantity).toBe(5);
    expect(resUds[0].unit).toBe('uds');

    // Caso 5: Unidades incompatibles (1 cebolla + 300g cebolla) -> Alerta
    const resIncompat = zeroFrictionPantryService.consolidateShoppingList([
      { name: 'Cebolla dulce', quantity: 1, unit: 'uds' },
      { name: 'Cebolla dulce', quantity: 300, unit: 'g' }
    ]);
    expect(resIncompat[0].incompatibleUnits).toBe(true);
    expect(resIncompat[0].incompatibleWarning).toContain('unidades incompatibles');

    // Caso 6: Normalización canónica (Tomates ecológicos vs Tomate ecológico)
    const resNorm = zeroFrictionPantryService.consolidateShoppingList([
      { name: 'Tomates ecológicos', quantity: 2, unit: 'uds' },
      { name: 'Tomate ecológico', quantity: 3, unit: 'uds' }
    ]);
    expect(resNorm.length).toBe(1);
    expect(resNorm[0].quantity).toBe(5);

    // Caso 7: Despensa antes de lista (Avena ya tiene 450g en despensa por defecto)
    const resPantryCheck = zeroFrictionPantryService.consolidateShoppingList([
      { name: 'Copos de avena integral ecológica', quantity: 300, unit: 'g' }
    ]);
    expect(resPantryCheck[0].alreadyInPantry?.hasEnough).toBe(true);
    expect(resPantryCheck[0].alreadyInPantry?.message).toContain('ya tienes suficiente en despensa');
  });

  it('8. Reposición ética: sugerencias accionables sin auto-carrito', () => {
    const list = zeroFrictionPantryService.getReplenishmentSuggestions();
    expect(list.length).toBeGreaterThan(0);

    const first = list[0];
    zeroFrictionPantryService.handleReplenishmentDecision(first.itemId, 'TENGO_SUFICIENTE');
    const after = zeroFrictionPantryService.getReplenishmentSuggestions();
    const updated = after.find(s => s.itemId === first.itemId);
    expect(updated?.status).toBe('DISMISSED');
  });

  it('9. Ticket OCR: segregación obligatoria ALIMENTACIÓN / HOGAR / DESCONOCIDO con revisión humana', () => {
    const result = zeroFrictionPantryService.parseTicketOcr('AVENA ECO 500G\nLAVAVAJILLAS 1L');
    expect(result.requiresHumanReview).toBe(true);

    const foodItems = result.items.filter(i => i.categoryType === 'ALIMENTACIÓN');
    const homeItems = result.items.filter(i => i.categoryType === 'HOGAR');

    expect(foodItems.length).toBeGreaterThan(0);
    expect(homeItems.length).toBeGreaterThan(0);
    expect(homeItems[0].selectedForImport).toBe(false); // No se importa a despensa de comida por defecto

    // Importar los revisados
    zeroFrictionPantryService.importReviewedTicket(result);
    const pantry = zeroFrictionPantryService.getPantryItems();
    const importedFood = pantry.find(p => p.name.includes('Plátano'));
    expect(importedFood).toBeDefined();
  });
});
