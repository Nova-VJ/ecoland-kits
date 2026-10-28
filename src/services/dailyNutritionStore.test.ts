import { describe, it, expect, beforeEach } from 'vitest';
import { dailyNutritionStore, NUTRITIONAL_GOALS_CATALOG } from './dailyNutritionStore';

describe('DailyNutritionStore - P1 Daily Intelligence Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Goals Catalog', () => {
    it('has at least 10 distinct health goals avoiding pure weight loss focus', () => {
      expect(NUTRITIONAL_GOALS_CATALOG.length).toBeGreaterThanOrEqual(10);
      const ids = NUTRITIONAL_GOALS_CATALOG.map(g => g.id);
      expect(ids).toContain('equilibrio');
      expect(ids).toContain('fibra');
      expect(ids).toContain('proteina');
      expect(ids).toContain('despensa');
      expect(ids).toContain('presupuesto');
    });

    it('allows changing active user goal', () => {
      const updated = dailyNutritionStore.setGoal('fibra');
      expect(updated.activeGoalId).toBe('fibra');
      expect(dailyNutritionStore.getGoals().activeGoalId).toBe('fibra');
    });
  });

  describe('Saved Meals (Guardar como comida)', () => {
    it('saves a new custom combination as a saved meal', () => {
      const saved = dailyNutritionStore.saveAsMeal({
        name: 'Bowl Post-entreno Proteico',
        meal: 'comida',
        description: 'Tofu bio, quinoa y espinacas',
        servings: 1,
        calories: 450,
        protein: 28,
        carbs: 45,
        fats: 12,
        fiber: 9
      });

      expect(saved.id).toBeDefined();
      expect(dailyNutritionStore.getSavedMeals().some(m => m.name === 'Bowl Post-entreno Proteico')).toBe(true);
    });

    it('logs a saved meal with 1 click', () => {
      const first = dailyNutritionStore.getSavedMeals()[0];
      const logged = dailyNutritionStore.logSavedMeal(first.id);
      expect(logged).not.toBeNull();
      expect(logged?.calories).toBe(first.calories);
      expect(logged?.source).toBe('saved_meal');
    });
  });

  describe('Yesterday and Repeat Actions', () => {
    it('retrieves yesterday logs and allows repeating a meal', () => {
      const yesterday = dailyNutritionStore.getYesterdayLogs();
      expect(yesterday.length).toBeGreaterThan(0);

      const repeated = dailyNutritionStore.repeatMealFromYesterday('desayuno');
      expect(repeated.length).toBeGreaterThan(0);
      expect(repeated[0].name).toContain('Repetido de ayer');
    });

    it('copies yesterday entirely to today', () => {
      const copied = dailyNutritionStore.copyYesterdayEntirely();
      expect(copied.length).toBeGreaterThanOrEqual(2);
      const today = dailyNutritionStore.getTodayLogs();
      expect(today.some(m => m.name.includes('Copiado de ayer'))).toBe(true);
    });
  });

  describe('Predictive Context (Time-of-day suggestions)', () => {
    it('returns morning breakfast suggestions at 8am', () => {
      const pred = dailyNutritionStore.getPredictiveSuggestions(8);
      expect(pred.timeSlot).toBe('desayuno');
      expect(pred.recommendedMealType).toBe('desayuno');
      expect(pred.suggestions.length).toBeGreaterThan(0);
    });

    it('returns lunch suggestions at 13pm', () => {
      const pred = dailyNutritionStore.getPredictiveSuggestions(13);
      expect(pred.timeSlot).toBe('comida');
      expect(pred.recommendedMealType).toBe('comida');
    });

    it('returns dinner suggestions at 21pm', () => {
      const pred = dailyNutritionStore.getPredictiveSuggestions(21);
      expect(pred.timeSlot).toBe('cena');
      expect(pred.recommendedMealType).toBe('cena');
    });
  });

  describe('Despensa ↔ Diario Interaction', () => {
    it('proposes deducting from pantry when logged item contains pantry ingredient', () => {
      const entry = {
        id: 'test_1',
        name: 'Copos de avena cocidos con bebida vegetal',
        meal: 'desayuno' as const,
        calories: 220,
        protein: 7,
        carbs: 38,
        fats: 4,
        fiber: 5,
        timeString: '09:00'
      };

      const proposal = dailyNutritionStore.checkPantryDeductionSuggestions(entry);
      expect(proposal).not.toBeNull();
      expect(proposal?.pantryName.toLowerCase()).toContain('avena');
      expect(proposal?.newEstimatedServings).toBeLessThan(proposal!.currentEstimatedServings);
    });

    it('confirms pantry deduction explicitly', () => {
      const pantry = dailyNutritionStore.getPantryItems();
      const target = pantry[0];
      const initialServings = target.estimatedRemainingServings;

      dailyNutritionStore.confirmPantryDeduction(target.id, 1);
      const after = dailyNutritionStore.getPantryItems().find(p => p.id === target.id);
      expect(after?.estimatedRemainingServings).toBe(initialServings - 1);
    });

    it('adds delivered order items to pantry', () => {
      dailyNutritionStore.addOrderItemsToPantry([
        { name: 'Lentejas pardinas bio', category: 'legumbres', servings: 8, price: 2.80 }
      ]);

      const pantry = dailyNutritionStore.getPantryItems();
      expect(pantry.some(p => p.name.includes('Lentejas pardinas bio'))).toBe(true);
    });
  });

  describe('Completa Mi Día 2.0 (Pantry-First & Effects)', () => {
    it('places 100% pantry available suggestions at the top', () => {
      const res = dailyNutritionStore.getCompleteMyDaySuggestions();
      expect(res.suggestions.length).toBeGreaterThan(0);
      expect(res.suggestions[0].allPantryAvailable).toBe(true);
      expect(res.suggestions[0].missingCost).toBe(0);
      expect(res.suggestions[0].effectBefore).toBeDefined();
      expect(res.suggestions[0].effectAfter.protein).toBeGreaterThan(res.suggestions[0].effectBefore.protein);
    });
  });

  describe('Plan Semanal & Lista de Compra (/semana)', () => {
    it('generates a 7-day meal plan with lunch and dinner recipes', () => {
      const plan = dailyNutritionStore.getWeeklyPlan();
      expect(plan.days.length).toBe(7);
      expect(plan.days[0].almuerzo).toBeDefined();
      expect(plan.days[0].cena).toBeDefined();
    });

    it('generates shopping list classifying what user already has vs what is missing', () => {
      const list = dailyNutritionStore.generateShoppingListFromPlan();
      expect(list.length).toBeGreaterThan(0);
      expect(list.some(it => it.status === 'have')).toBe(true);
      expect(list.some(it => it.status === 'missing')).toBe(true);
    });
  });

  describe('Weight Tracking (Optional & Smoothed)', () => {
    it('allows toggling weight tracking and calculates smoothed trend', () => {
      dailyNutritionStore.toggleWeightTracking(true);
      expect(dailyNutritionStore.isWeightTrackingEnabled()).toBe(true);

      const entry = dailyNutritionStore.addWeightEntry(69.5);
      expect(entry.weightKg).toBe(69.5);
      expect(typeof entry.smoothedTrendKg).toBe('number');
    });
  });

  describe('Telemetry & Friction Tracking', () => {
    it('records user action events in local telemetry buffer', () => {
      dailyNutritionStore.trackEvent('test_action', { step: 1 });
      const events = dailyNutritionStore.getRecentTelemetryEvents();
      expect(events.some(e => e.eventName === 'test_action')).toBe(true);
    });
  });
});
