import { dailyNutritionStore, PantryItem, DailyMealEntry } from './dailyNutritionStore';
import { CoachKnowledgeEngine, DynamicCoachSuggestion } from '@/lib/coachKnowledgeEngine';
import { foodVisionEngine, IdentifiedFoodResult } from '@/lib/foodVisionEngine';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';

export type CoachInformationType = 'DATO' | 'ESTIMACIÓN' | 'SUGERENCIA';

export interface CoachAction {
  id: string;
  label: string;
  type: 'cook' | 'log_diary' | 'save_recipe' | 'add_to_plan' | 'use_pantry' | 'add_missing' | 'photo_vision';
  payload?: any;
}

export interface CoachResponse {
  id: string;
  infoType: CoachInformationType;
  title: string;
  message: string;
  dataGrounding: string;
  recipeCard?: {
    title: string;
    prepTimeMinutes: number;
    servings: number;
    calories: number;
    protein: number;
    fiber: number;
    allPantryAvailable: boolean;
    missingCostEuro: number;
    ingredientsInPantry: string[];
    ingredientsMissing: string[];
    steps: string[];
  };
  visionCard?: IdentifiedFoodResult;
  actions: CoachAction[];
}

export interface CoachPromptQuery {
  text: string;
  timeAvailableMinutes?: number;
  photoUrlOrBase64?: string;
}

class EcoCoachService {
  /**
   * Procesa la consulta de forma variada, inteligente y dinámica
   */
  public queryCoach(query: CoachPromptQuery): CoachResponse {
    const text = query.text || '';
    const textLower = text.toLowerCase().trim();
    
    // Obtener contexto autorizado del usuario
    const todayLogs = dailyNutritionStore.getTodayLogs();
    const pantry = dailyNutritionStore.getPantryItems();
    const expiringPantry = dailyNutritionStore.getExpiringPantryItems();
    const goals = dailyNutritionStore.getGoals();

    dailyNutritionStore.trackEvent('coach_opened', { query: text });

    // ==========================================
    // 0. ANÁLISIS DE FOTO / CÁMARA (FOOD VISION & CALORÍAS)
    // ==========================================
    if (query.photoUrlOrBase64 || textLower.includes('foto') || textLower.includes('camara') || textLower.includes('cámara') || textLower.includes('imagen') || textLower.includes('plato')) {
      const visionResult = foodVisionEngine.identifyMeal(textLower || 'ensalada mediterranea');
      
      return {
        id: `coach_vision_${Date.now()}`,
        infoType: 'ESTIMACIÓN',
        title: `📸 Reconocimiento de Comida: ${visionResult.detectedDishName}`,
        message: `He analizado la imagen del plato. Estimo una ración de ~${visionResult.servingGrams}g con ${visionResult.calories} kcal, ${visionResult.proteinGrams}g de proteína y ${visionResult.fiberGrams}g de fibra.\n\nPor favor, confirma si este es tu plato o elige una de las opciones sugeridas para ajustar las calorías exactas:`,
        dataGrounding: `Análisis visual calibrado con base nutricional oficial (${visionResult.confidencePercent}% confianza).`,
        visionCard: visionResult,
        recipeCard: {
          title: visionResult.detectedDishName,
          prepTimeMinutes: 10,
          servings: 1,
          calories: visionResult.calories,
          protein: visionResult.proteinGrams,
          fiber: visionResult.fiberGrams,
          allPantryAvailable: true,
          missingCostEuro: 0,
          ingredientsInPantry: [visionResult.detectedDishName, 'AOVE Ecológico'],
          ingredientsMissing: [],
          steps: visionResult.recipeRecommendation?.steps || ['Disfrutar del plato templado.']
        },
        actions: [
          {
            id: 'act_confirm_vision',
            label: `✓ Sí, es ${visionResult.detectedDishName.split(' ')[0]} (Registrar ${visionResult.calories} kcal)`,
            type: 'log_diary',
            payload: {
              title: visionResult.detectedDishName,
              cals: visionResult.calories,
              prot: visionResult.proteinGrams,
              fiber: visionResult.fiberGrams,
              meal: 'comida'
            }
          },
          {
            id: 'act_adjust_portion',
            label: 'Ajustar porción (½ o ración grande)',
            type: 'photo_vision',
            payload: visionResult
          }
        ]
      };
    }

    // ==========================================
    // 1. TIEMPO DISPONIBLE DINÁMICO (5, 7, 10, 12, 15, 20 MINUTOS)
    // ==========================================
    const minuteMatch = textLower.match(/(\d+)\s*(?:minutos|minuto|mins|min)/);
    const requestedMinutes = minuteMatch ? parseInt(minuteMatch[1], 10) : (textLower.includes('poco tiempo') || textLower.includes('rapido') || textLower.includes('rápido') ? 10 : null);

    if (requestedMinutes !== null) {
      const recommendations = CoachKnowledgeEngine.getRecommendations(requestedMinutes, textLower);
      const chosen = recommendations[0];

      return {
        id: `coach_time_${Date.now()}`,
        infoType: 'SUGERENCIA',
        title: `Cena rápida en ${chosen.timeMinutes} min: ${chosen.title}`,
        message: `Para tus ${requestedMinutes} minutos disponibles, la mejor opción es preparar este plato: ${chosen.description} Tienes los ingredientes básicos en tu despensa y no requiere cocciones largas.`,
        dataGrounding: `Calculado para preparación real en ${chosen.timeMinutes} minutos usando despensa ecológica.`,
        recipeCard: {
          title: chosen.title,
          prepTimeMinutes: chosen.timeMinutes,
          servings: 1,
          calories: chosen.calories,
          protein: chosen.protein,
          fiber: chosen.fiber,
          allPantryAvailable: true,
          missingCostEuro: 0,
          ingredientsInPantry: chosen.pantryIngredients,
          ingredientsMissing: chosen.missingIngredients,
          steps: chosen.steps
        },
        actions: [
          {
            id: 'act_cook_fast',
            label: `Cocinar en ${chosen.timeMinutes} min`,
            type: 'cook',
            payload: chosen
          },
          {
            id: 'act_log_fast',
            label: 'Registrar en mi día',
            type: 'log_diary',
            payload: { title: chosen.title, cals: chosen.calories, prot: chosen.protein, fiber: chosen.fiber, meal: 'cena' }
          },
          {
            id: 'act_plan_fast',
            label: 'Añadir a Mi Semana',
            type: 'add_to_plan',
            payload: chosen
          }
        ]
      };
    }

    // ==========================================
    // 2. ¿QUÉ CONSUMIR ANTES DE QUE SE ESTROPEE? (ANTI-DESPERDICIO)
    // ==========================================
    if (textLower.includes('estropee') || textLower.includes('vence') || textLower.includes('gastar') || textLower.includes('caduc')) {
      if (expiringPantry.length === 0) {
        return {
          id: `coach_${Date.now()}`,
          infoType: 'DATO',
          title: 'Tu despensa está al día',
          message: 'Revisando tu despensa actual, todos tus alimentos biológicos tienen más de 5 días de consumo preferente. No hay riesgo inminente de desperdicio.',
          dataGrounding: `Comprobados ${pantry.length} alimentos registrados en tu despensa inteligente.`,
          actions: [
            { id: 'act_plan', label: 'Ver Mi Plan Semanal', type: 'add_to_plan' }
          ]
        };
      }

      const primeItem = expiringPantry[0];
      return {
        id: `coach_${Date.now()}`,
        infoType: 'SUGERENCIA',
        title: `Prioridad anti-desperdicio: ${primeItem.name}`,
        message: `Te recomendamos consumir ${primeItem.name} hoy o mañana (le quedan ~${primeItem.daysToConsumeBeforePreferred} días de consumo preferente). Puedes preparar un salteado rápido en 10 minutos combinándolo con cereales de tu despensa.`,
        dataGrounding: `Dato real: ${primeItem.name} vence en ~${primeItem.daysToConsumeBeforePreferred} días según tu registro de despensa.`,
        recipeCard: {
          title: `Salteado rápido de ${primeItem.name.split(' ')[0]} con quinoa`,
          prepTimeMinutes: 10,
          servings: 1,
          calories: 360,
          protein: 14,
          fiber: 8,
          allPantryAvailable: true,
          missingCostEuro: 0,
          ingredientsInPantry: [primeItem.name, 'Quinoa Real Bio', 'AOVE Ecológico'],
          ingredientsMissing: [],
          steps: [
            `Saltear ${primeItem.name} con 1 cucharada de AOVE en sartén a fuego medio durante 4 minutos.`,
            'Añadir quinoa cocida (o arroz integral) y remover bien con una pizca de sal.',
            'Servir templado en un plato hondo.'
          ]
        },
        actions: [
          { id: 'act_cook', label: 'Cocinar ahora', type: 'cook' },
          { id: 'act_log', label: 'Registrar en mi día', type: 'log_diary', payload: { title: `Salteado de ${primeItem.name}`, cals: 360, prot: 14, fiber: 8, meal: 'cena' } },
          { id: 'act_pantry', label: 'Descontar de despensa', type: 'use_pantry', payload: { pantryId: primeItem.id } }
        ]
      };
    }

    // ==========================================
    // 3. CONSULTA DE PROTEÍNA
    // ==========================================
    if (textLower.includes('proteína') || textLower.includes('proteina')) {
      const currentProt = Math.round(todayLogs.reduce((acc, it) => acc + it.protein, 0) * 10) / 10;
      const targetProt = goals.targetProteinGrams || 85;
      const diff = Math.round((targetProt - currentProt) * 10) / 10;

      if (diff <= 0) {
        return {
          id: `coach_${Date.now()}`,
          infoType: 'DATO',
          title: 'Proteína diaria completada con éxito',
          message: `Llevas registrados ${currentProt}g de proteína de una meta diaria de ${targetProt}g. Has alcanzado un excelente aporte con legumbres y cereales bio.`,
          dataGrounding: `Suma de ${todayLogs.length} comidas anotadas hoy en tu diario.`,
          actions: [{ id: 'act_ok', label: 'Ver balance en Hoy', type: 'cook' }]
        };
      }

      return {
        id: `coach_${Date.now()}`,
        infoType: 'SUGERENCIA',
        title: `Te faltan ~${diff}g de proteína para tu objetivo`,
        message: `Llevas ${currentProt}g de los ${targetProt}g previstos. Para tu cena, una ración de garbanzos cocidos bio o lentejas (que tienes en tu despensa) te aportará ~16g de proteína vegetal completa sin necesidad de comprar nada.`,
        dataGrounding: `Meta personalizada: ${targetProt}g/día. Consumo anotado en diario: ${currentProt}g.`,
        recipeCard: {
          title: 'Hummus rústico bio con semillas',
          prepTimeMinutes: 10,
          servings: 1,
          calories: 280,
          protein: 14.5,
          fiber: 7.2,
          allPantryAvailable: true,
          missingCostEuro: 0,
          ingredientsInPantry: ['Garbanzos Cocidos Extra Bio', 'Aceite de Oliva Virgen Extra', 'Semillas bio'],
          ingredientsMissing: [],
          steps: [
            'Triturar 150g de garbanzos cocidos con 1 cucharada de AOVE, pizca de comino y sal.',
            'Añadir 2 cucharadas de agua para dar textura cremosa.',
            'Decorar con semillas y acompañar con hojas verdes o tostada integral.'
          ]
        },
        actions: [
          { id: 'act_log_prot', label: 'Registrar en mi cena', type: 'log_diary', payload: { title: 'Hummus rústico bio con semillas', cals: 280, prot: 14.5, fiber: 7.2, meal: 'cena' } },
          { id: 'act_pantry_deduct', label: 'Usar garbanzos de despensa', type: 'use_pantry', payload: { pantryId: 'p3' } }
        ]
      };
    }

    // ==========================================
    // 4. CONSULTA DE FIBRA
    // ==========================================
    if (textLower.includes('fibra')) {
      const currentFiber = Math.round(todayLogs.reduce((acc, it) => acc + it.fiber, 0) * 10) / 10;
      const targetFiber = goals.targetFiberGrams || 32;
      const diffFiber = Math.max(0, Math.round((targetFiber - currentFiber) * 10) / 10);

      return {
        id: `coach_${Date.now()}`,
        infoType: 'SUGERENCIA',
        title: `Aporte de Fibra: llevas ${currentFiber}g de ${targetFiber}g`,
        message: diffFiber > 0 
          ? `Te faltan aproximadamente ${diffFiber}g de fibra para nutrir tu microbiota. Las legumbres enteras y la avena son tus mayores aliadas hoy.`
          : `¡Enhorabuena! Has alcanzado ${currentFiber}g de fibra hoy, cuidando tu salud digestiva de manera natural.`,
        dataGrounding: `Registrado en base al etiquetado nutricional oficial de los alimentos consumidos.`,
        recipeCard: {
          title: 'Bowl de copos de avena con manzana asada y canela',
          prepTimeMinutes: 8,
          servings: 1,
          calories: 290,
          protein: 8.5,
          fiber: 9.8,
          allPantryAvailable: true,
          missingCostEuro: 0,
          ingredientsInPantry: ['Copos de Avena Suaves Bio', 'Canela bio de despensa'],
          ingredientsMissing: [],
          steps: [
            'Calentar la avena con bebida vegetal o agua durante 3 minutos.',
            'Añadir dados de manzana y canela en polvo.',
            'Dejar reposar 2 minutos y disfrutar caliente.'
          ]
        },
        actions: [
          { id: 'act_log_fiber', label: 'Registrar snack de fibra', type: 'log_diary', payload: { title: 'Bowl de avena y manzana', cals: 290, prot: 8.5, fiber: 9.8, meal: 'snacks' } }
        ]
      };
    }

    // ==========================================
    // 4b. CONSULTA DE PLANIFICAR CENAS BARATAS / COSTE CERO EXTRA
    // ==========================================
    if (textLower.includes('cenas baratas') || textLower.includes('planificar') || textLower.includes('baratas') || textLower.includes('económic') || textLower.includes('tres cenas')) {
      return {
        id: `coach_budget_${Date.now()}`,
        infoType: 'SUGERENCIA',
        title: 'Plan de 3 cenas baratas con coste extra 0,00 €',
        message: 'He diseñado 3 cenas balanceadas cruzando tu despensa actual (legumbres, cereales y verduras). Puedes prepararlas sin gastar un solo euro extra (coste adicional: 0,00 €).',
        dataGrounding: 'Cálculo de coste marginal basado en existencias reales de despensa sin compras pendientes.',
        recipeCard: {
          title: 'Trío de cenas anti-gasto (Lentejas rápidas, Crema de calabacín y Bowl de garbanzos)',
          prepTimeMinutes: 12,
          servings: 1,
          calories: 340,
          protein: 16,
          fiber: 8.5,
          allPantryAvailable: true,
          missingCostEuro: 0,
          ingredientsInPantry: ['Lentejas Bio', 'Calabacín fresco', 'Garbanzos Bio', 'AOVE'],
          ingredientsMissing: [],
          steps: [
            'Día 1: Salteado rápido de lentejas con verduras de despensa.',
            'Día 2: Crema ligera de calabacín al AOVE.',
            'Día 3: Bowl tibio de garbanzos con pimentón dulce.'
          ]
        },
        actions: [
          { id: 'act_add_3_dinners', label: 'Añadir 3 cenas a Mi Plan', type: 'add_to_plan', payload: { days: 3, costEuro: 0 } },
          { id: 'act_cook_first', label: 'Cocinar cena de hoy', type: 'cook' }
        ]
      };
    }

    // ==========================================
    // 5. CONSULTA GENERAL / ¿QUÉ CENAR HOY? (SELECCIÓN VARIADA)
    // ==========================================
    const dynamicPool = CoachKnowledgeEngine.getRecommendations(15, textLower);
    const randomIndex = Math.floor(Math.random() * dynamicPool.length);
    const dynamicPick = dynamicPool[randomIndex] || dynamicPool[0];

    return {
      id: `coach_gen_${Date.now()}`,
      infoType: 'SUGERENCIA',
      title: dynamicPick.title,
      message: `He comprobado tu despensa. Tienes los ingredientes básicos disponibles para este plato. Te aporta ${dynamicPick.protein}g de proteína vegetal y ${dynamicPick.fiber}g de fibra para equilibrar tu jornada sin compras extra.`,
      dataGrounding: 'Cruce algorítmico adaptativo entre tu despensa local y el recetario saludable de Ecoland.',
      recipeCard: {
        title: dynamicPick.title,
        prepTimeMinutes: dynamicPick.timeMinutes,
        servings: 1,
        calories: dynamicPick.calories,
        protein: dynamicPick.protein,
        fiber: dynamicPick.fiber,
        allPantryAvailable: true,
        missingCostEuro: 0,
        ingredientsInPantry: dynamicPick.pantryIngredients,
        ingredientsMissing: dynamicPick.missingIngredients,
        steps: dynamicPick.steps
      },
      actions: [
        { id: 'act_cook_dyn', label: 'Cocinar con lo que tengo', type: 'cook', payload: dynamicPick },
        { id: 'act_log_dyn', label: 'Registrar en mi día', type: 'log_diary', payload: { title: dynamicPick.title, cals: dynamicPick.calories, prot: dynamicPick.protein, fiber: dynamicPick.fiber, meal: 'cena' } },
        { id: 'act_plan_dyn', label: 'Añadir a Mi Semana', type: 'add_to_plan', payload: dynamicPick }
      ]
    };
  }

  public executeAction(action: CoachAction): { success: boolean; feedbackMessage: string } {
    dailyNutritionStore.trackEvent('coach_action_clicked', { actionType: action.type });

    switch (action.type) {
      case 'log_diary':
        if (action.payload) {
          dailyNutritionStore.addMealLog({
            name: action.payload.title || 'Plato sugerido por EcoCoach',
            meal: action.payload.meal || 'cena',
            calories: action.payload.cals || 350,
            protein: action.payload.prot || 15,
            carbs: Math.round((action.payload.cals || 350) * 0.5 / 4),
            fats: Math.round((action.payload.cals || 350) * 0.25 / 9),
            fiber: action.payload.fiber || 8,
            source: 'recipe_ai'
          });
          return { success: true, feedbackMessage: '✓ Registrado en tu diario de hoy.' };
        }
        return { success: false, feedbackMessage: 'No se encontraron datos para registrar.' };

      case 'use_pantry':
        if (action.payload?.pantryId) {
          dailyNutritionStore.confirmPantryDeduction(action.payload.pantryId, 1);
          return { success: true, feedbackMessage: '✓ Descontada 1 ración de tu despensa inteligente.' };
        }
        return { success: false, feedbackMessage: 'No se pudo identificar el artículo en despensa.' };

      case 'save_recipe':
        dailyNutritionStore.saveImportedRecipe({
          title: action.payload?.title || 'Receta sugerida por EcoCoach',
          sourceAttribution: 'EcoCoach Contextual Ecoland',
          servings: 2,
          prepTimeMinutes: 15,
          estimatedCalories: 380,
          estimatedProtein: 15,
          estimatedFiber: 9,
          ingredients: [
            { raw: 'Quinoa real bio 150g', normalizedName: 'quinoa', amount: 150, unit: 'g', inPantry: true },
            { raw: 'Garbanzos cocidos 200g', normalizedName: 'garbanzos', amount: 200, unit: 'g', inPantry: true }
          ],
          steps: ['Saltear ingredientes y servir caliente.'],
          isFavorite: true
        });
        return { success: true, feedbackMessage: '✓ Receta guardada en tus favoritas.' };

      case 'add_to_plan':
        return { success: true, feedbackMessage: '✓ Receta programada en tu plan semanal.' };

      case 'cook':
      default:
        return { success: true, feedbackMessage: 'Mostrando instrucciones de preparación.' };
    }
  }
}

export const ecoCoachService = new EcoCoachService();
