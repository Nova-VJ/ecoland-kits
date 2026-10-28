import { describe, it, expect, beforeEach } from 'vitest';
import { householdBudgetService } from './householdBudgetService';

describe('Household Budget Service (P4)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Carga configuración de presupuesto por defecto y permite actualizarla', () => {
    const config = householdBudgetService.getBudgetConfig();
    expect(config.monthlyCapEuro).toBe(350);
    expect(config.householdMembers).toBe(2);

    householdBudgetService.saveBudgetConfig({
      ...config,
      monthlyCapEuro: 400,
      householdMembers: 3
    });

    const updated = householdBudgetService.getBudgetConfig();
    expect(updated.monthlyCapEuro).toBe(400);
    expect(updated.householdMembers).toBe(3);
  });

  it('2. Registra nuevos gastos y calcula el resumen financiero', () => {
    householdBudgetService.addExpense({
      date: new Date().toISOString().split('T')[0],
      source: 'MANUAL',
      description: 'Compra ecológica de mercado',
      amountEuro: 25.50,
      category: 'frescos'
    });

    const summary = householdBudgetService.getFinancialSummary();
    expect(summary.currentMonthSpentEuro).toBeGreaterThan(0);
    expect(summary.remainingBudgetEuro).toBeLessThanOrEqual(summary.monthlyCapEuro);
    expect(summary.averageCostPerServingEuro).toBeGreaterThan(0);
    expect(summary.adviceMessage).toBeDefined();
  });

  it('3. Detecta alerta cuando se aproxima al límite de presupuesto', () => {
    // Configurar presupuesto bajo para probar el aviso
    householdBudgetService.saveBudgetConfig({
      monthlyCapEuro: 50,
      weeklyCapEuro: 15,
      alertThresholdPercent: 80,
      householdMembers: 2,
      isBudgetTrackingActive: true
    });

    // Añadir gasto que supere el 80%
    householdBudgetService.addExpense({
      date: new Date().toISOString().split('T')[0],
      source: 'MANUAL',
      description: 'Compra grande mensual',
      amountEuro: 45.00,
      category: 'general'
    });

    const summary = householdBudgetService.getFinancialSummary();
    expect(summary.burnRatePercent).toBeGreaterThanOrEqual(80);
    expect(['NEAR_LIMIT', 'EXCEEDED']).toContain(summary.status);
    expect(summary.adviceMessage.length).toBeGreaterThan(10);
  });
});
