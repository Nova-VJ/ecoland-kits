import { describe, it, expect, beforeEach } from 'vitest';
import { dailyNutritionStore, NUTRITIONAL_GOALS_CATALOG } from './dailyNutritionStore';

describe('DailyNutritionStore - Engagement, Habituals, Macros and Complete My Day', () => {
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

  describe('Meal Logging & Calculations', () => {
    it('adds meal log and persists it to today logs', () => {
      const added = dailyNutritionStore.addMealLog({
        name: 'Tostada de pan integral con aguacate',
        meal: 'desayuno',
        calories: 280,
        protein: 7,
        carbs: 32,
        fats: 14,
        fiber: 6.5,
        source: 'manual'
      });

      expect(added.id).toBeDefined();
      expect(added.timeString).toBeDefined();

      const today = dailyNutritionStore.getTodayLogs();
      expect(today.some(m => m.id === added.id)).toBe(true);
    });

    it('supports deleting a meal log', () => {
      const added = dailyNutritionStore.addMealLog({
        name: 'Snack temporal a borrar',
        meal: 'snacks',
        calories: 100,
        protein: 2,
        carbs: 10,
        fats: 5,
        fiber: 1,
        source: 'manual'
      });

      const beforeDelete = dailyNutritionStore.getTodayLogs();
      expect(beforeDelete.some(l => l.id === added.id)).toBe(true);

      dailyNutritionStore.removeMealLog(added.id);
      const afterDelete = dailyNutritionStore.getTodayLogs();
      expect(afterDelete.some(l => l.id === added.id)).toBe(false);
    });
  });

  describe('Habitual Meals (1-Tap Repeat)', () => {
    it('provides default habitual meals', () => {
      const habituals = dailyNutritionStore.getHabitualMeals();
      expect(habituals.length).toBeGreaterThan(0);
      expect(habituals[0].title).toBeDefined();
      expect(habituals[0].calories).toBeGreaterThan(0);
    });

    it('logs habitual meal with 1 click', () => {
      const habitual = dailyNutritionStore.getHabitualMeals()[0];
      const entry = dailyNutritionStore.logHabitualMeal(habitual.id);
      expect(entry).not.toBeNull();
      expect(entry?.meal).toBe(habitual.meal);
      expect(entry?.calories).toBe(habitual.calories);
      expect(entry?.isHabitual).toBe(true);
    });
  });

  describe('Water Tracker', () => {
    it('increments and decrements water glasses with boundaries', () => {
      localStorage.setItem('ecoland-water-glasses', '5');
      expect(dailyNutritionStore.getWaterGlasses()).toBe(5);

      const incremented = dailyNutritionStore.updateWaterGlasses(1);
      expect(incremented).toBe(6);

      const decremented = dailyNutritionStore.updateWaterGlasses(-1);
      expect(decremented).toBe(5);

      // Boundary check at zero
      dailyNutritionStore.updateWaterGlasses(-10);
      expect(dailyNutritionStore.getWaterGlasses()).toBe(0);
    });
  });

  describe('Chef IA to Diary', () => {
    it('scales recipe servings and adds directly to today diary', () => {
      const entry = dailyNutritionStore.logRecipeToDiary(
        'Salteado Mediterráneo Rápido Bio',
        2, // 2 raciones
        350,
        15,
        'comida'
      );

      expect(entry.name).toContain('2 raciones');
      expect(entry.calories).toBe(700);
      expect(entry.protein).toBe(30);
      expect(entry.source).toBe('recipe_ai');

      const logs = dailyNutritionStore.getTodayLogs();
      expect(logs.some(m => m.id === entry.id)).toBe(true);
    });
  });

  describe('Completa Mi Día Contextual', () => {
    it('cross-references pantry inventory to generate personalized dinner recommendations', () => {
      const res = dailyNutritionStore.getCompleteMyDaySuggestions();
      expect(res.suggestions.length).toBeGreaterThan(0);
      expect(res.summaryNote).toBeDefined();

      const firstSug = res.suggestions[0];
      expect(firstSug.title).toBeDefined();
      expect(firstSug.pantryMatches).toBeDefined();
      expect(typeof firstSug.missingCost).toBe('number');
    });
  });

  describe('Resumen Semanal Amable ("Tu Semana en Ecoland")', () => {
    it('returns positive non-punitive consistency summary', () => {
      const weekly = dailyNutritionStore.getWeeklySummary();
      expect(weekly.daysLogged).toBeGreaterThan(0);
      expect(weekly.plantDiversityCount).toBeGreaterThan(0);
      expect(weekly.friendlyMessage).toContain('consistencia');
    });
  });
});
