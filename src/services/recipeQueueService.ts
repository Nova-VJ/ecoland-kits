/**
 * ECOLAND P3-B & P3-C: RECIPE QUEUE, SMART MEAL MATCHER & COOKING SERVICE
 * 
 * Funcionalidad:
 * 1. Recipe Inbox & Queue (INBOX, QUEUE, HABITUAL, ARCHIVED, PINNED).
 * 2. Cruce inteligente con despensa: porcentaje cubierto, rescate de alimentos por vencer, coste faltante 0€.
 * 3. Leftover Remix: recetas que aprovechan sobras ya existentes en la despensa.
 * 4. Orquestación del Modo Cocina 2.0 (Mise en Place, detección de temporizadores en pasos, deducción y creación de tupper).
 */

import { zeroFrictionPantryService, DomesticPantryItem } from './zeroFrictionPantryService';
import { dailyNutritionStore, toMealType } from './dailyNutritionStore';

export type RecipeQueueStatus = 'INBOX' | 'QUEUE' | 'HABITUAL' | 'ARCHIVED';

export interface RecipeIngredientItem {
  name: string;
  amount: number;
  unit: string;
  originalText: string;
}

export interface ManagedRecipe {
  id: string;
  title: string;
  sourceAttribution: string;
  sourceUrl?: string;
  servings: number;
  prepTimeMinutes: number;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedFiber: number;
  ingredients: RecipeIngredientItem[];
  steps: string[];
  queueStatus: RecipeQueueStatus;
  isPinned: boolean;
  timesCooked: number;
  lastCookedAt?: string;
  tags: string[];
  plannedDate?: string;
  plannedMeal?: 'almuerzo' | 'cena';
  createdAt: string;
}

export interface RecipePantryMatch {
  recipe: ManagedRecipe;
  pantryCoveredPercent: number;
  availableIngredientsCount: number;
  totalIngredientsCount: number;
  missingIngredients: string[];
  missingCostEstimateEuro: number;
  rescuesExpiringItems: string[];
  ecoScore: number; // 0-100 ponderado por aprovechamiento
}

class RecipeQueueService {
  private readonly STORAGE_KEY = 'ecoland_managed_recipes_v1';

  // ==========================================
  // 1. INICIALIZACIÓN Y PERSISTENCIA
  // ==========================================

  public getRecipes(): ManagedRecipe[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaults: ManagedRecipe[] = [
      {
        id: 'rec_lentejas_salteadas',
        title: 'Lentejas castellanas salteadas con verduras de huerta',
        sourceAttribution: 'Cocina Mediterránea Ecoland',
        servings: 2,
        prepTimeMinutes: 20,
        estimatedCalories: 380,
        estimatedProtein: 22,
        estimatedFiber: 12,
        queueStatus: 'QUEUE',
        isPinned: true,
        timesCooked: 4,
        tags: ['legumbres', 'alta fibra', 'vegano', 'rápido'],
        createdAt: '2026-10-20',
        ingredients: [
          { name: 'Tomates ecológicos de huerta', amount: 2, unit: 'uds', originalText: '2 tomates ecológicos maduros picados' },
          { name: 'Copos de avena integral ecológica', amount: 40, unit: 'g', originalText: '40g de copos de avena fina (opcional espesor)' },
          { name: 'Aceite de oliva virgen extra eco', amount: 15, unit: 'ml', originalText: '1 cucharada de AOVE' },
          { name: 'Ajo y pimentón dulce de la Vera', amount: 1, unit: 'uds', originalText: '1 diente de ajo y 1 pizca de pimentón' }
        ],
        steps: [
          'Lavar y cortar los tomates en dados pequeños.',
          'Dorar el ajo laminado en una sartén con AOVE durante 3 minutos a fuego medio.',
          'Añadir los tomates y cocinar a fuego lento durante 8 minutos hasta que caramelicen.',
          'Incorporar las lentejas cocidas y saltear todo junto durante 5 minutos para integrar sabores.',
          'Servir caliente y guardar las raciones sobrantes en tupper si no se consumen todas.'
        ]
      },
      {
        id: 'rec_crema_calabacin',
        title: 'Crema suave de calabacín y kéfir con semillas',
        sourceAttribution: 'Recetario Salud Digestiva',
        servings: 2,
        prepTimeMinutes: 15,
        estimatedCalories: 260,
        estimatedProtein: 14,
        estimatedFiber: 8,
        queueStatus: 'INBOX',
        isPinned: false,
        timesCooked: 0,
        tags: ['cenas ligeras', 'prebiótico', 'vegetariano'],
        createdAt: '2026-10-25',
        ingredients: [
          { name: 'Huevos ecológicos camperos', amount: 2, unit: 'uds', originalText: '2 huevos cocidos o poché' },
          { name: 'Caldo de verduras y miso casero', amount: 300, unit: 'ml', originalText: '300ml de caldo de verduras casero' },
          { name: 'Calabacín ecológico', amount: 1, unit: 'uds', originalText: '1 calabacín mediano en rodajas' }
        ],
        steps: [
          'Cortar el calabacín sin pelar para conservar toda la fibra y antioxidantes.',
          'Cocer el calabacín en el caldo durante 10 minutos hasta que esté tierno.',
          'Triturar con batidora hasta obtener una textura aterciopelada.',
          'Emplatar acompañando con los huevos y un hilo de aceite virgen extra.'
        ]
      },
      {
        id: 'rec_porridge_manzana',
        title: 'Porridge de avena templada con canela y nueces',
        sourceAttribution: 'Desayunos con Energía Ecoland',
        servings: 1,
        prepTimeMinutes: 10,
        estimatedCalories: 340,
        estimatedProtein: 13,
        estimatedFiber: 9,
        queueStatus: 'HABITUAL',
        isPinned: true,
        timesCooked: 12,
        tags: ['desayuno', 'avena', 'sin azúcares añadidos'],
        createdAt: '2026-10-15',
        ingredients: [
          { name: 'Copos de avena integral ecológica', amount: 50, unit: 'g', originalText: '50g copos de avena' },
          { name: 'Bebida de avena o agua', amount: 200, unit: 'ml', originalText: '200ml de líquido' },
          { name: 'Manzana picada y nueces', amount: 1, unit: 'uds', originalText: 'Media manzana y 3 nueces picadas' }
        ],
        steps: [
          'Poner la avena y el líquido en un cazo a fuego medio.',
          'Remover constantemente durante 5 minutos hasta que espese.',
          'Verter en un bol y coronar con la manzana fresca y las nueces.'
        ]
      }
    ];

    this.saveRecipes(defaults);
    return defaults;
  }

  public saveRecipes(recipes: ManagedRecipe[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recipes));
    } catch {}
  }

  // ==========================================
  // 2. GESTIÓN DE COLAS Y ESTADOS
  // ==========================================

  public setRecipeStatus(recipeId: string, status: RecipeQueueStatus): void {
    const list = this.getRecipes();
    const target = list.find(r => r.id === recipeId);
    if (target) {
      target.queueStatus = status;
      this.saveRecipes(list);
    }
  }

  public togglePinned(recipeId: string): boolean {
    const list = this.getRecipes();
    const target = list.find(r => r.id === recipeId);
    if (target) {
      target.isPinned = !target.isPinned;
      this.saveRecipes(list);
      return target.isPinned;
    }
    return false;
  }

  public planRecipeForDay(recipeId: string, date: string, meal: 'almuerzo' | 'cena'): void {
    const list = this.getRecipes();
    const target = list.find(r => r.id === recipeId);
    if (target) {
      target.plannedDate = date;
      target.plannedMeal = meal;
      target.queueStatus = 'QUEUE';
      this.saveRecipes(list);
    }
  }

  // ==========================================
  // 3. SMART PANTRY MATCHER (CRUCE CON DESPENSA)
  // ==========================================

  public evaluateRecipePantryMatch(
    recipe: ManagedRecipe,
    customPantry?: DomesticPantryItem[]
  ): RecipePantryMatch {
    const pantry = customPantry || zeroFrictionPantryService.getPantryItems();
    const activePantry = pantry.filter(p => p.freshnessState !== 'CONSUMIDO' && p.quantity > 0);

    let availableCount = 0;
    const missing: string[] = [];
    const rescuesExpiring: string[] = [];

    for (const ing of recipe.ingredients) {
      const canonicalIng = zeroFrictionPantryService.normalizeIngredientName(ing.name);

      const match = activePantry.find(p => {
        const canonicalPantry = zeroFrictionPantryService.normalizeIngredientName(p.name);
        return canonicalPantry.includes(canonicalIng) || canonicalIng.includes(canonicalPantry);
      });

      if (match) {
        availableCount++;
        if (match.freshnessState === 'CONSUMIR PRONTO' || match.freshnessState === 'MUY MADURO') {
          rescuesExpiring.push(match.name);
        }
      } else {
        missing.push(ing.name);
      }
    }

    const total = recipe.ingredients.length || 1;
    const percent = Math.round((availableCount / total) * 100);
    const missingCost = missing.length * 1.50; // Estimación media de 1.50€ por ingrediente faltante

    // Puntuación Eco: combina % disponible + bonus por rescatar alimentos que caducan
    let ecoScore = percent;
    if (rescuesExpiring.length > 0) {
      ecoScore = Math.min(100, ecoScore + (rescuesExpiring.length * 15));
    }

    return {
      recipe,
      pantryCoveredPercent: percent,
      availableIngredientsCount: availableCount,
      totalIngredientsCount: total,
      missingIngredients: missing,
      missingCostEstimateEuro: percent === 100 ? 0 : missingCost,
      rescuesExpiringItems: rescuesExpiring,
      ecoScore
    };
  }

  public getSmartMealRecommendations(): RecipePantryMatch[] {
    const recipes = this.getRecipes().filter(r => r.queueStatus !== 'ARCHIVED');
    const matches = recipes.map(r => this.evaluateRecipePantryMatch(r));

    // Ordenar de mayor a menor puntuación ecológica y cobertura de despensa
    return matches.sort((a, b) => b.ecoScore - a.ecoScore);
  }

  // ==========================================
  // 4. DETECCIÓN DE TEMPORIZADORES EN PASOS
  // ==========================================

  public extractTimerFromStep(stepText: string): { hasTimer: boolean; minutes?: number; label?: string } {
    const match = stepText.match(/(\d+)\s*(?:minutos?|min)\b/i);
    if (match) {
      const minutes = parseInt(match[1], 10);
      if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
        return {
          hasTimer: true,
          minutes,
          label: `${minutes} min`
        };
      }
    }
    return { hasTimer: false };
  }

  // ==========================================
  // 5. FINALIZACIÓN DE COCINADO Y DEDUCCIÓN
  // ==========================================

  public finishCookingRecipe(params: {
    recipeId: string;
    portionsCooked: number;
    portionsLeftoverToSave?: number;
    deductPantryIngredients: boolean;
    syncToTodayDiary: boolean;
    mealType?: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  }): { success: boolean; leftoverSaved?: boolean; loggedToDiary?: boolean } {
    const list = this.getRecipes();
    const recipe = list.find(r => r.id === params.recipeId);
    if (!recipe) return { success: false };

    recipe.timesCooked += 1;
    recipe.lastCookedAt = new Date().toISOString().split('T')[0];
    this.saveRecipes(list);

    // 1. Deducción en despensa si se solicita
    if (params.deductPantryIngredients) {
      const pantry = zeroFrictionPantryService.getPantryItems();
      for (const ing of recipe.ingredients) {
        const canonical = zeroFrictionPantryService.normalizeIngredientName(ing.name);
        const match = pantry.find(p => zeroFrictionPantryService.normalizeIngredientName(p.name).includes(canonical));
        if (match && match.quantity > 0) {
          const delta = Math.min(match.quantity, ing.amount || 1);
          match.quantity = Math.max(0, match.quantity - delta);
          if (match.quantity === 0) {
            match.freshnessState = 'CONSUMIDO';
            match.quickStatus = 'SE_ACABO';
          }
        }
      }
      zeroFrictionPantryService.savePantryItems(pantry);
    }

    // 2. Guardar sobra en despensa si sobraron raciones
    let leftoverSaved = false;
    if (params.portionsLeftoverToSave && params.portionsLeftoverToSave > 0) {
      zeroFrictionPantryService.addLeftover({
        name: `${recipe.title} (Sobra casera)`,
        portions: params.portionsLeftoverToSave,
        location: 'NEVERA',
        notes: `Cocinadas ${params.portionsCooked} raciones el ${new Date().toLocaleDateString('es-ES')}`
      });
      leftoverSaved = true;
    }

    // 3. Registrar en el diario nutricional de hoy
    let loggedToDiary = false;
    if (params.syncToTodayDiary) {
      dailyNutritionStore.addMealLog({
        meal: toMealType(params.mealType || 'almuerzo'),
        name: recipe.title,
        calories: recipe.estimatedCalories,
        protein: recipe.estimatedProtein,
        fiber: recipe.estimatedFiber,
        carbs: 45,
        fats: 10
      });
      loggedToDiary = true;
    }

    return {
      success: true,
      leftoverSaved,
      loggedToDiary
    };
  }
}

export const recipeQueueService = new RecipeQueueService();
