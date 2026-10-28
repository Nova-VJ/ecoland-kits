import { describe, it, expect, beforeEach } from 'vitest';
import { recipeQueueService } from './recipeQueueService';
import { zeroFrictionPantryService } from './zeroFrictionPantryService';
import { dailyNutritionStore } from './dailyNutritionStore';

describe('Recipe Queue & Smart Cooking Service (P3-B & P3-C)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Carga recetas iniciales con estados INBOX, QUEUE, HABITUAL y PINNED', () => {
    const list = recipeQueueService.getRecipes();
    expect(list.length).toBeGreaterThanOrEqual(3);

    const inbox = list.filter(r => r.queueStatus === 'INBOX');
    const queue = list.filter(r => r.queueStatus === 'QUEUE');
    const habitual = list.filter(r => r.queueStatus === 'HABITUAL');
    const pinned = list.filter(r => r.isPinned);

    expect(inbox.length).toBeGreaterThan(0);
    expect(queue.length).toBeGreaterThan(0);
    expect(habitual.length).toBeGreaterThan(0);
    expect(pinned.length).toBeGreaterThan(0);
  });

  it('2. Transición de estados de recetas y fijado rápido', () => {
    const recipes = recipeQueueService.getRecipes();
    const target = recipes[0];

    // Mover a HABITUAL
    recipeQueueService.setRecipeStatus(target.id, 'HABITUAL');
    const updatedList = recipeQueueService.getRecipes();
    const updatedTarget = updatedList.find(r => r.id === target.id);
    expect(updatedTarget?.queueStatus).toBe('HABITUAL');

    // Cambiar estado de fijado (pin)
    const prevPin = updatedTarget?.isPinned;
    const newPin = recipeQueueService.togglePinned(target.id);
    expect(newPin).toBe(!prevPin);

    // Planificar para un día concreto
    recipeQueueService.planRecipeForDay(target.id, '2026-10-30', 'almuerzo');
    const plannedTarget = recipeQueueService.getRecipes().find(r => r.id === target.id);
    expect(plannedTarget?.plannedDate).toBe('2026-10-30');
    expect(plannedTarget?.plannedMeal).toBe('almuerzo');
    expect(plannedTarget?.queueStatus).toBe('QUEUE');
  });

  it('3. Smart Pantry Matcher: calcula cobertura y rescate de alimentos que caducan', () => {
    const recipes = recipeQueueService.getRecipes();
    const lentilRecipe = recipes.find(r => r.id === 'rec_lentejas_salteadas')!;

    const match = recipeQueueService.evaluateRecipePantryMatch(lentilRecipe);

    expect(match.totalIngredientsCount).toBe(4);
    expect(match.pantryCoveredPercent).toBeGreaterThan(0);
    // Tomates ecológicos están en estado MUY MADURO en la despensa por defecto
    expect(match.rescuesExpiringItems.length).toBeGreaterThan(0);
    expect(match.ecoScore).toBeGreaterThan(match.pantryCoveredPercent);
  });

  it('4. Recomendaciones inteligentes ordenadas por aprovechamiento ecológico', () => {
    const recommendations = recipeQueueService.getSmartMealRecommendations();
    expect(recommendations.length).toBeGreaterThan(1);
    // La primera recomendación debe tener mayor o igual ecoScore que la segunda
    expect(recommendations[0].ecoScore).toBeGreaterThanOrEqual(recommendations[1].ecoScore);
  });

  it('5. Detección automática de temporizadores en los pasos de cocina', () => {
    const stepWith3Min = 'Dorar el ajo laminado en una sartén con AOVE durante 3 minutos a fuego medio.';
    const timer3 = recipeQueueService.extractTimerFromStep(stepWith3Min);
    expect(timer3.hasTimer).toBe(true);
    expect(timer3.minutes).toBe(3);

    const stepWith8Min = 'Añadir los tomates y cocinar a fuego lento durante 8 minutos hasta que caramelicen.';
    const timer8 = recipeQueueService.extractTimerFromStep(stepWith8Min);
    expect(timer8.hasTimer).toBe(true);
    expect(timer8.minutes).toBe(8);

    const stepWithoutTimer = 'Lavar y cortar los tomates en dados pequeños.';
    const noTimer = recipeQueueService.extractTimerFromStep(stepWithoutTimer);
    expect(noTimer.hasTimer).toBe(false);
  });

  it('6. Finalización de cocinado: descuenta despensa, genera sobra y anota en diario', () => {
    const recipes = recipeQueueService.getRecipes();
    const recipe = recipes[0];

    const result = recipeQueueService.finishCookingRecipe({
      recipeId: recipe.id,
      portionsCooked: 4,
      portionsLeftoverToSave: 2, // Sobraron 2 raciones
      deductPantryIngredients: true,
      syncToTodayDiary: true,
      mealType: 'almuerzo'
    });

    expect(result.success).toBe(true);
    expect(result.leftoverSaved).toBe(true);
    expect(result.loggedToDiary).toBe(true);

    // Comprobar que se creó la sobra en la despensa
    const pantryItems = zeroFrictionPantryService.getPantryItems();
    const createdLeftover = pantryItems.find(p => p.type === 'LEFTOVER' && p.name.includes(recipe.title));
    expect(createdLeftover).toBeDefined();
    expect(createdLeftover?.quantity).toBe(2);

    // Comprobar que se incrementó el contador de veces cocinada
    const updatedRecipe = recipeQueueService.getRecipes().find(r => r.id === recipe.id);
    expect(updatedRecipe?.timesCooked).toBe(recipe.timesCooked + 1);
  });
});
