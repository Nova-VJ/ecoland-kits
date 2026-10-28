/**
 * ECOLAND P4: HOUSEHOLD BUDGET & FOOD EXPENSE CONTROLLER
 * 
 * Funcionalidad:
 * 1. Control de presupuesto de alimentación doméstico (semanal o mensual).
 * 2. Seguimiento de gastos reales: pedidos Ecoland + tickets de supermercado externos (OCR).
 * 3. Cálculo de coste real medio por plato/ración cocinada.
 * 4. Ahorro acumulado por despensa y aprovechamiento de sobras.
 * 5. Proyección a final de mes con alertas amables sin alarmismos.
 */

import { zeroFrictionPantryService } from './zeroFrictionPantryService';
import { dailyNutritionStore } from './dailyNutritionStore';

export interface ExpenseRecord {
  id: string;
  date: string;
  source: 'ECOLAND_ORDER' | 'EXTERNAL_TICKET' | 'MANUAL';
  description: string;
  amountEuro: number;
  category: 'frescos' | 'despensa' | 'general' | 'hogar';
}

export interface HouseholdBudgetConfig {
  monthlyCapEuro: number;
  weeklyCapEuro: number;
  alertThresholdPercent: number; // Por defecto 85%
  householdMembers: number;
  isBudgetTrackingActive: boolean;
}

export interface BudgetFinancialSummary {
  monthlyCapEuro: number;
  currentMonthSpentEuro: number;
  remainingBudgetEuro: number;
  burnRatePercent: number;
  averageCostPerServingEuro: number;
  pantrySavingsTotalEuro: number;
  leftoversSavingsTotalEuro: number;
  monthEndProjectedSpentEuro: number;
  status: 'OPTIMAL' | 'MODERATE' | 'NEAR_LIMIT' | 'EXCEEDED';
  adviceMessage: string;
}

class HouseholdBudgetService {
  private readonly BUDGET_KEY = 'ecoland_household_budget_v1';
  private readonly EXPENSES_KEY = 'ecoland_budget_expenses_v1';

  // ==========================================
  // 1. CONFIGURACIÓN DEL PRESUPUESTO
  // ==========================================

  public getBudgetConfig(): HouseholdBudgetConfig {
    try {
      const raw = localStorage.getItem(this.BUDGET_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaults: HouseholdBudgetConfig = {
      monthlyCapEuro: 350.00,
      weeklyCapEuro: 85.00,
      alertThresholdPercent: 85,
      householdMembers: 2,
      isBudgetTrackingActive: true
    };
    this.saveBudgetConfig(defaults);
    return defaults;
  }

  public saveBudgetConfig(config: HouseholdBudgetConfig): void {
    try {
      localStorage.setItem(this.BUDGET_KEY, JSON.stringify(config));
    } catch {}
  }

  // ==========================================
  // 2. REGISTRO DE GASTOS
  // ==========================================

  public getExpenses(): ExpenseRecord[] {
    try {
      const raw = localStorage.getItem(this.EXPENSES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const today = new Date().toISOString().split('T')[0];
    const defaults: ExpenseRecord[] = [
      {
        id: 'exp_eco_deliv_1',
        date: '2026-10-18',
        source: 'ECOLAND_ORDER',
        description: 'Pedido Ecoland Bio #ECO-DELIV-908',
        amountEuro: 42.50,
        category: 'despensa'
      },
      {
        id: 'exp_ticket_super_2',
        date: '2026-10-24',
        source: 'EXTERNAL_TICKET',
        description: 'Ticket Supermercado Ecológico (Frutería)',
        amountEuro: 16.80,
        category: 'frescos'
      },
      {
        id: 'exp_eco_order_3',
        date: today,
        source: 'ECOLAND_ORDER',
        description: 'Compra semanal Ecoland Básicos',
        amountEuro: 38.20,
        category: 'general'
      }
    ];

    this.saveExpenses(defaults);
    return defaults;
  }

  public saveExpenses(expenses: ExpenseRecord[]): void {
    try {
      localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(expenses));
    } catch {}
  }

  public addExpense(params: Omit<ExpenseRecord, 'id'>): ExpenseRecord {
    const list = this.getExpenses();
    const newRecord: ExpenseRecord = {
      id: `exp_${Date.now()}`,
      ...params
    };
    list.unshift(newRecord);
    this.saveExpenses(list);
    return newRecord;
  }

  // ==========================================
  // 3. CÁLCULO FINANCIERO Y RESUMEN INTELIGENTE
  // ==========================================

  public getFinancialSummary(): BudgetFinancialSummary {
    const config = this.getBudgetConfig();
    const expenses = this.getExpenses();

    // Filtrar gastos del mes en curso
    const currentYearMonth = new Date().toISOString().slice(0, 7); // '2026-10'
    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentYearMonth));
    const currentMonthSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amountEuro, 0);

    const remaining = Math.max(0, config.monthlyCapEuro - currentMonthSpent);
    const burnRate = config.monthlyCapEuro > 0 ? (currentMonthSpent / config.monthlyCapEuro) * 100 : 0;

    // Calcular ahorro estimado por despensa y sobras
    const pantryItems = zeroFrictionPantryService.getPantryItems();
    const leftovers = pantryItems.filter(p => p.type === 'LEFTOVER');
    const leftoversSavings = leftovers.reduce((acc, l) => acc + (l.quantity * 2.50), 0); // 2.50€ ahorrados por ración aprovechada

    const activePantrySavings = pantryItems
      .filter(p => p.freshnessState !== 'CONSUMIDO' && p.quantity > 0)
      .reduce((acc, p) => acc + 1.20, 0); // Estimación suave de stock ya pagado

    // Coste medio por ración estimado
    const mealsLoggedToday = dailyNutritionStore.getTodayLogs().length || 3;
    const estimatedMonthlyServings = config.householdMembers * mealsLoggedToday * 30;
    const avgCostPerServing = estimatedMonthlyServings > 0
      ? +(currentMonthSpent / (config.householdMembers * 2 * 20)).toFixed(2)
      : 2.10;

    // Proyección a final de mes
    const currentDay = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailyAvg = currentDay > 0 ? currentMonthSpent / currentDay : 0;
    const projectedMonthEnd = +(dailyAvg * daysInMonth).toFixed(2);

    let status: BudgetFinancialSummary['status'] = 'OPTIMAL';
    let advice = 'Tu presupuesto familiar está en un rango óptimo y equilibrado.';

    if (currentMonthSpent > config.monthlyCapEuro) {
      status = 'EXCEEDED';
      advice = 'Has alcanzado el límite mensual establecido. Te recomendamos priorizar recetas de despensa a 0€ de gasto.';
    } else if (burnRate >= config.alertThresholdPercent) {
      status = 'NEAR_LIMIT';
      advice = `Has utilizado el ${burnRate.toFixed(1)}% de tu presupuesto. Buenas noticias: tienes alimentos en tu despensa para cubrir los próximos días.`;
    } else if (burnRate >= 60) {
      status = 'MODERATE';
      advice = 'Gasto controlado a buen ritmo. Las sobras y la despensa inteligente te han ahorrado compras imprevistas.';
    }

    return {
      monthlyCapEuro: config.monthlyCapEuro,
      currentMonthSpentEuro: +currentMonthSpent.toFixed(2),
      remainingBudgetEuro: +remaining.toFixed(2),
      burnRatePercent: +burnRate.toFixed(1),
      averageCostPerServingEuro: avgCostPerServing > 0 ? avgCostPerServing : 2.10,
      pantrySavingsTotalEuro: +activePantrySavings.toFixed(2),
      leftoversSavingsTotalEuro: +leftoversSavings.toFixed(2),
      monthEndProjectedSpentEuro: projectedMonthEnd,
      status,
      adviceMessage: advice
    };
  }
}

export const householdBudgetService = new HouseholdBudgetService();
