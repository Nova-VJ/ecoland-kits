import { describe, it, expect, beforeEach } from 'vitest';
import { offlineSyncService } from './offlineSyncService';

describe('Resilient Offline Core Service (P3-E)', () => {
  beforeEach(() => {
    localStorage.clear();
    offlineSyncService.clearOfflineSessionData();
  });

  it('1. Encolado de mutación offline con UUID, timestamp y device_id', () => {
    const mut = offlineSyncService.queueMutation({
      entity: 'DAILY_LOG',
      operation: 'CREATE',
      payload: { name: 'Manzana ecológica', calories: 75 }
    });

    expect(mut.mutation_id).toBeDefined();
    expect(mut.device_id).toBeDefined();
    expect(mut.timestamp).toBeGreaterThan(0);
  });

  it('2. Sincronización idempotente: misma mutación no se ejecuta dos veces', async () => {
    const mut = offlineSyncService.queueMutation({
      entity: 'HABITUAL_MEAL',
      operation: 'CREATE',
      payload: { name: 'Desayuno habitual' }
    });

    const res1 = await offlineSyncService.syncPendingMutations();
    expect(res1.synced).toBe(1);

    // Intentar sincronizar de nuevo
    const res2 = await offlineSyncService.syncPendingMutations();
    expect(res2.synced).toBe(0);
    expect(res2.conflicts).toBe(0);
  });

  it('3. Resolución determinista de deltas para hogares multi-dispositivo', () => {
    // Configurar despensa con 400g de avena
    localStorage.setItem('ecoland_zero_friction_pantry_v1', JSON.stringify([
      { id: 'item_avena', name: 'Avena', quantity: 400, unit: 'g' }
    ]));

    // Dispositivo A consume 200g
    const resA = offlineSyncService.applyDeterministicPantryDelta({
      itemId: 'item_avena',
      deltaQuantity: -200,
      unit: 'g'
    });
    expect(resA.finalQuantity).toBe(200);

    // Dispositivo B (que estaba offline) consume 100g y sincroniza
    const resB = offlineSyncService.applyDeterministicPantryDelta({
      itemId: 'item_avena',
      deltaQuantity: -100,
      unit: 'g'
    });
    // Se respeta el decremento total (200 + 100 = 300g consumidos, quedan 100g)
    expect(resB.finalQuantity).toBe(100);
    expect(resB.conflictResolved).toBe(true);
  });

  it('4. Indicador UI de estado de red', () => {
    // Estado inicial online
    const stateOnline = offlineSyncService.getNetworkState();
    expect(stateOnline.status).toBe('ONLINE_SYNCED');

    // Cambiar a offline
    offlineSyncService.handleNetworkChange(false);
    const stateOffline = offlineSyncService.getNetworkState();
    expect(stateOffline.isOnline).toBe(false);
    expect(stateOffline.status).toBe('OFFLINE_PENDING');

    // Restaurar online
    offlineSyncService.handleNetworkChange(true);
    const stateBack = offlineSyncService.getNetworkState();
    expect(stateBack.isOnline).toBe(true);
  });

  it('5. Seguridad: Purga total de datos domésticos al cerrar sesión', () => {
    offlineSyncService.queueMutation({
      entity: 'PANTRY',
      operation: 'UPDATE',
      payload: { test: true }
    });

    // Cerrar sesión
    offlineSyncService.clearOfflineSessionData();
    const pending = offlineSyncService.getPendingMutations();
    expect(pending.length).toBe(0);
  });
});
