import { describe, it, expect, beforeEach } from 'vitest';
import { recipeImportService } from './recipeImportService';
import { dailyNutritionStore } from './dailyNutritionStore';

describe('Recipe Import Service (P2-B)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Normaliza ingredientes con cantidades y unidades habituales', () => {
    const ing1 = recipeImportService.normalizeIngredient('200 g de garbanzos cocidos');
    expect(ing1.amount).toBe(200);
    expect(ing1.unit).toBe('g');
    expect(ing1.normalizedName).toContain('garbanzos cocidos');

    const ing2 = recipeImportService.normalizeIngredient('1 bote de espinacas');
    expect(ing2.amount).toBe(250);
    expect(ing2.unit).toContain('bote');
  });

  it('2. Cruza ingredientes contra la despensa del usuario', () => {
    // La despensa por defecto tiene Aceite de Oliva Virgen Extra Ecológico
    const ing = recipeImportService.normalizeIngredient('2 cucharadas de Aceite de Oliva Virgen Extra');
    expect(ing.inPantry).toBe(true);

    const ingMissing = recipeImportService.normalizeIngredient('100g de algas wakame exóticas');
    expect(ingMissing.inPantry).toBe(false);
  });

  it('3. Parsea una receta desde texto libre preservando atribución y pasos', () => {
    const rawText = `Título: Ensalada templada de garbanzos bio
Ingredientes:
- 200 g de garbanzos cocidos
- 1 cucharada de aceite de oliva virgen extra
- 50g de hojas de espinacas
Pasos:
1. Lavar las espinacas frescas.
2. Saltear los garbanzos con aceite.
3. Mezclar y servir templado.`;

    const recipe = recipeImportService.parseRecipe({
      type: 'text',
      rawInput: rawText
    });

    expect(recipe.title).toContain('Ensalada templada');
    expect(recipe.ingredients.length).toBeGreaterThanOrEqual(3);
    expect(recipe.steps.length).toBeGreaterThanOrEqual(3);
    expect(recipe.sourceAttribution).toContain('Texto introducido por el usuario');
  });

  it('4. Envía ingredientes faltantes a la lista de compra sin tocar el carrito', () => {
    const sampleRecipe = {
      title: 'Curry rápido',
      sourceAttribution: 'Test Blog',
      servings: 2,
      prepTimeMinutes: 20,
      estimatedCalories: 420,
      estimatedProtein: 14,
      estimatedFiber: 8,
      id: 'test-recipe',
      createdAt: new Date().toISOString(),
      ingredients: [
        { raw: 'Quinoa real bio 150g', normalizedName: 'quinoa', amount: 150, unit: 'g', inPantry: true },
        { raw: 'Pasta de curry rojo 50g', normalizedName: 'pasta de curry rojo', amount: 50, unit: 'g', inPantry: false, estimatedMissingCostEuro: 2.80 }
      ],
      steps: ['Cocer y mezclar']
    };

    const countBefore = dailyNutritionStore.getShoppingList().length;
    const addedCount = recipeImportService.addMissingIngredientsToShoppingList(sampleRecipe);

    expect(addedCount).toBe(1);
    const countAfter = dailyNutritionStore.getShoppingList().length;
    expect(countAfter).toBe(countBefore + 1);
  });
});
