/**
 * ALMACÉN CENTRAL DE NUTRICIÓN DIARIA, DESPENSA Y RETENCIÓN (ECOLAND DAILY P1)
 * Almacenamiento local reactivo para soporte offline, privacidad total y cero fricción
 */

import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';

export type MealType = 'desayuno' | 'comida' | 'cena' | 'snacks';

export interface DailyMealEntry {
  id: string;
  name: string;
  meal: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  timeString: string;
  isHabitual?: boolean;
  productSlug?: string;
  source?: 'manual' | 'habitual' | 'recipe_ai' | 'photo' | 'voice' | 'barcode' | 'saved_meal';
}

export interface HabitualMeal {
  id: string;
  title: string;
  meal: MealType;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  timesLogged: number;
  lastLoggedDate: string;
}

export interface SavedMeal {
  id: string;
  name: string;
  meal: MealType;
  description: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  timesLogged: number;
  createdAt: string;
}

export interface PantryItem {
  id: string;
  name: string;
  slug?: string;
  category: string;
  estimatedRemainingServings: number;
  totalServings: number;
  daysToConsumeBeforePreferred: number; // Consumo preferente
  status: 'ok' | 'low' | 'expiring';
  price?: number;
}

export interface DailyGoals {
  activeGoalId: string;
  goalTitle: string;
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatsGrams: number;
  targetFiberGrams: number;
  targetWaterGlasses: number;
}

export interface CompleteMyDaySuggestion {
  id: string;
  title: string;
  reason: string;
  timeMinutes: number;
  calories: number;
  protein: number;
  fiber: number;
  effectBefore: { protein: number; fiber: number };
  effectAfter: { protein: number; fiber: number };
  pantryMatches: { name: string; available: boolean; isLow?: boolean }[];
  missingCost: number;
  missingProducts: { name: string; price: number; slug: string }[];
  recipeSteps: string[];
  allPantryAvailable: boolean;
}

export interface WeeklyTrendSummary {
  daysLogged: number;
  totalDays: number;
  averageCalories: number;
  averageProtein: number;
  averageFiber: number;
  plantDiversityCount: number; // Variedad de vegetales distintos consumidos
  waterAverageGlasses: number;
  pantryMealsCooked: number;
  estimatedEuroSavedAntiWaste: number;
  friendlyMessage: string;
  previousWeekAverageFiber?: number;
  previousWeekAverageProtein?: number;
}

export interface PredictiveItem {
  id: string;
  title: string;
  subtitle: string;
  meal: MealType;
  calories: number;
  protein: number;
  fiber: number;
  type: 'habitual' | 'yesterday' | 'saved' | 'recent';
}

export interface PantryDeductionProposal {
  pantryId: string;
  pantryName: string;
  currentEstimatedServings: number;
  servingsToDeduct: number;
  newEstimatedServings: number;
  gramsEstimatedUsed: number;
}

export interface WeeklyPlanRecipe {
  id: string;
  title: string;
  calories: number;
  prepMinutes: number;
  pricePerServing: number;
  pantryCoveredPercent: number;
  proteinGrams: number;
  fiberGrams: number;
  ingredients: { name: string; availableInPantry: boolean; priceIfMissing: number }[];
}

export interface WeeklyMealPlanDay {
  dayIndex: number; // 0 = Lunes .. 6 = Domingo
  dayName: string;
  almuerzo: WeeklyPlanRecipe;
  cena: WeeklyPlanRecipe;
}

export interface WeeklyMealPlan {
  id: string;
  mode: 'cenas' | 'comidas_cenas' | 'completa';
  numPersons: number;
  budgetCapEuro?: number;
  days: WeeklyMealPlanDay[];
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantityNeeded: string;
  category: 'frescos' | 'legumbres' | 'cereales' | 'despensa' | 'condimentos';
  status: 'have' | 'missing' | 'optional';
  priceEuro: number;
  catalogSlug?: string;
  checked?: boolean;
}

export interface WeightRecord {
  id: string;
  dateStr: string;
  weightKg: number;
  smoothedTrendKg: number;
}

export interface TelemetryEvent {
  eventName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// 10 Objetivos de Salud Personalizados
export const NUTRITIONAL_GOALS_CATALOG = [
  { id: 'equilibrio', title: 'Comer más equilibrado (Plato Harvard)', cals: 2050, prot: 85, carbs: 240, fats: 65, fiber: 32 },
  { id: 'fibra', title: 'Aumentar fibra dietética y microbiota', cals: 1950, prot: 80, carbs: 230, fats: 60, fiber: 38 },
  { id: 'proteina', title: 'Aumentar proteína vegetal y vitalidad', cals: 2150, prot: 115, carbs: 220, fats: 65, fiber: 30 },
  { id: 'despensa', title: 'Aprovechar mi despensa y cocinar más', cals: 2000, prot: 80, carbs: 230, fats: 65, fiber: 28 },
  { id: 'presupuesto', title: 'Optimizar presupuesto y nutrición por euro', cals: 2000, prot: 80, carbs: 230, fats: 65, fiber: 28 },
  { id: 'mantener', title: 'Mantener mi peso con energía estable', cals: 2100, prot: 85, carbs: 245, fats: 68, fiber: 30 },
  { id: 'musculo', title: 'Ganar masa muscular y fuerza', cals: 2450, prot: 135, carbs: 280, fats: 75, fiber: 32 },
  { id: 'perder', title: 'Pérdida de peso gradual y saciante', cals: 1750, prot: 95, carbs: 175, fats: 55, fiber: 32 },
  { id: 'organizar', title: 'Organizar mis comidas sin estrés', cals: 2000, prot: 80, carbs: 230, fats: 65, fiber: 28 },
  { id: 'ecologico', title: '100% Ecológico y de temporada', cals: 2050, prot: 85, carbs: 240, fats: 65, fiber: 30 },
];

class DailyNutritionStore {
  private readonly MEAL_LOGS_KEY = 'ecoland-meal-logs-v2';
  private readonly HABITUAL_KEY = 'ecoland-habituals-v2';
  private readonly PANTRY_KEY = 'ecoland-pantry-v2';
  private readonly GOALS_KEY = 'ecoland-goals-v2';
  private readonly WATER_KEY = 'ecoland-water-glasses';
  private readonly SAVED_MEALS_KEY = 'ecoland-saved-meals-v2';
  private readonly YESTERDAY_LOGS_KEY = 'ecoland-yesterday-logs-v2';
  private readonly WEEKLY_PLAN_KEY = 'ecoland-weekly-plan-v2';
  private readonly SHOPPING_LIST_KEY = 'ecoland-shopping-list-v2';
  private readonly WEIGHT_RECORDS_KEY = 'ecoland-weight-records-v2';
  private readonly WEIGHT_ENABLED_KEY = 'ecoland-weight-enabled-v2';
  private readonly TELEMETRY_KEY = 'ecoland-daily-telemetry-v2';

  /**
   * Obtiene los registros del día actual
   */
  public getTodayLogs(): DailyMealEntry[] {
    try {
      const raw = localStorage.getItem(this.MEAL_LOGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const initial: DailyMealEntry[] = [
      {
        id: 'init_1',
        name: 'Kéfir bio con copos de avena integral, nueces y semillas de chía',
        meal: 'desayuno',
        calories: 465,
        protein: 18.5,
        carbs: 52,
        fats: 16,
        fiber: 8.5,
        timeString: '08:30',
        isHabitual: true,
        source: 'habitual'
      },
      {
        id: 'init_2',
        name: 'Guiso suave de lentejas pardinas bio con zanahoria y calabacín',
        meal: 'comida',
        calories: 520,
        protein: 26,
        carbs: 68,
        fats: 9,
        fiber: 14.5,
        timeString: '14:15',
        source: 'manual'
      }
    ];

    this.saveLogs(initial);
    return initial;
  }

  public saveLogs(logs: DailyMealEntry[]) {
    try {
      localStorage.setItem(this.MEAL_LOGS_KEY, JSON.stringify(logs));
    } catch {}
  }

  public addMealLog(entry: Omit<DailyMealEntry, 'id' | 'timeString'>): DailyMealEntry {
    const logs = this.getTodayLogs();
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEntry: DailyMealEntry = {
      ...entry,
      id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timeString
    };

    const updated = [newEntry, ...logs];
    this.saveLogs(updated);
    this.trackEvent('log_food_completed', { meal: entry.meal, calories: entry.calories });
    return newEntry;
  }

  public removeMealLog(id: string): DailyMealEntry[] {
    const logs = this.getTodayLogs().filter(m => m.id !== id);
    this.saveLogs(logs);
    return logs;
  }

  /**
   * Comidas habituales preconfiguradas para registrar en 1 solo toque
   */
  public getHabitualMeals(): HabitualMeal[] {
    try {
      const raw = localStorage.getItem(this.HABITUAL_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaults: HabitualMeal[] = [
      {
        id: 'hab_desayuno_kefir',
        title: 'Tu desayuno habitual',
        meal: 'desayuno',
        description: 'Kéfir bio + Avena integral + Nueces + Plátano',
        calories: 486,
        protein: 19,
        carbs: 55,
        fats: 16.5,
        fiber: 8.5,
        timesLogged: 14,
        lastLoggedDate: 'Ayer'
      },
      {
        id: 'hab_tostadas_aceite',
        title: 'Desayuno mediterráneo clásico',
        meal: 'desayuno',
        description: 'Pan de masa madre tostado con tomate fresco y AOVE',
        calories: 320,
        protein: 8,
        carbs: 42,
        fats: 12,
        fiber: 5,
        timesLogged: 8,
        lastLoggedDate: 'Hace 3 días'
      },
      {
        id: 'hab_comida_lunes',
        title: 'Comida de cuchara rápida',
        meal: 'comida',
        description: 'Garbanzos cocidos bio con salteado de espinacas y arroz',
        calories: 510,
        protein: 21,
        carbs: 72,
        fats: 11,
        fiber: 13.5,
        timesLogged: 9,
        lastLoggedDate: 'Lunes'
      },
      {
        id: 'hab_cena_ligera',
        title: 'Cena digestiva de ayer',
        meal: 'cena',
        description: 'Tortilla de 2 huevos de corral con ensalada verde y semillas',
        calories: 340,
        protein: 16,
        carbs: 8,
        fats: 24,
        fiber: 4,
        timesLogged: 11,
        lastLoggedDate: 'Ayer'
      },
      {
        id: 'hab_snack_tarde',
        title: 'Snack saciante de media tarde',
        meal: 'snacks',
        description: 'Manzana fuji crujiente + 5 nueces castellanas bio',
        calories: 195,
        protein: 3.5,
        carbs: 24,
        fats: 9.5,
        fiber: 4.8,
        timesLogged: 16,
        lastLoggedDate: 'Hoy'
      }
    ];

    try {
      localStorage.setItem(this.HABITUAL_KEY, JSON.stringify(defaults));
    } catch {}
    return defaults;
  }

  public logHabitualMeal(habitualId: string): DailyMealEntry | null {
    const habituals = this.getHabitualMeals();
    const target = habituals.find(h => h.id === habitualId);
    if (!target) return null;

    const entry = this.addMealLog({
      name: `${target.description} (Ración habitual)`,
      meal: target.meal,
      calories: target.calories,
      protein: target.protein,
      carbs: target.carbs,
      fats: target.fats,
      fiber: target.fiber,
      isHabitual: true,
      source: 'habitual'
    });

    target.timesLogged += 1;
    target.lastLoggedDate = 'Hoy';
    try {
      localStorage.setItem(this.HABITUAL_KEY, JSON.stringify(habituals));
    } catch {}

    this.trackEvent('habitual_meal_logged', { id: habitualId });
    return entry;
  }

  // ==========================================
  // P1-A: COMIDAS GUARDADAS ("Guardar como comida")
  // ==========================================
  public getSavedMeals(): SavedMeal[] {
    try {
      const raw = localStorage.getItem(this.SAVED_MEALS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaults: SavedMeal[] = [
      {
        id: 'saved_1',
        name: 'Mi Desayuno Antiox Bio',
        meal: 'desayuno',
        description: 'Kéfir de cabra, copos de avena finos, nueces y semillas de chía',
        servings: 1,
        calories: 470,
        protein: 18,
        carbs: 52,
        fats: 16,
        fiber: 8.5,
        timesLogged: 5,
        createdAt: '2026-10-20'
      },
      {
        id: 'saved_2',
        name: 'Poke Bowl de Quinoa y Tofu',
        meal: 'comida',
        description: 'Quinoa real bio con dados de tofu marinados, espinacas y AOVE',
        servings: 1,
        calories: 520,
        protein: 24,
        carbs: 62,
        fats: 15,
        fiber: 10,
        timesLogged: 3,
        createdAt: '2026-10-22'
      },
      {
        id: 'saved_3',
        name: 'Cena Ligera de Tortilla Campesina',
        meal: 'cena',
        description: 'Dos huevos bio, calabacín salteado y ensalada con semillas',
        servings: 1,
        calories: 330,
        protein: 17,
        carbs: 9,
        fats: 22,
        fiber: 4.5,
        timesLogged: 7,
        createdAt: '2026-10-25'
      }
    ];

    try {
      localStorage.setItem(this.SAVED_MEALS_KEY, JSON.stringify(defaults));
    } catch {}
    return defaults;
  }

  public saveAsMeal(mealData: Omit<SavedMeal, 'id' | 'timesLogged' | 'createdAt'>): SavedMeal {
    const saved = this.getSavedMeals();
    const newMeal: SavedMeal = {
      ...mealData,
      id: `saved_${Date.now()}`,
      timesLogged: 1,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newMeal, ...saved];
    try {
      localStorage.setItem(this.SAVED_MEALS_KEY, JSON.stringify(updated));
    } catch {}
    this.trackEvent('meal_saved_as_preset', { name: newMeal.name });
    return newMeal;
  }

  public deleteSavedMeal(id: string): void {
    const saved = this.getSavedMeals().filter(s => s.id !== id);
    try {
      localStorage.setItem(this.SAVED_MEALS_KEY, JSON.stringify(saved));
    } catch {}
  }

  public logSavedMeal(id: string, targetMeal?: MealType): DailyMealEntry | null {
    const saved = this.getSavedMeals();
    const target = saved.find(s => s.id === id);
    if (!target) return null;

    const entry = this.addMealLog({
      name: `${target.name} (${target.description})`,
      meal: targetMeal || target.meal,
      calories: target.calories,
      protein: target.protein,
      carbs: target.carbs,
      fats: target.fats,
      fiber: target.fiber,
      source: 'saved_meal'
    });

    target.timesLogged += 1;
    try {
      localStorage.setItem(this.SAVED_MEALS_KEY, JSON.stringify(saved));
    } catch {}

    return entry;
  }

  // ==========================================
  // P1-A: REPETIR AYER & COPIAR COMIDAS
  // ==========================================
  public getYesterdayLogs(): DailyMealEntry[] {
    try {
      const raw = localStorage.getItem(this.YESTERDAY_LOGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaults: DailyMealEntry[] = [
      {
        id: 'yest_1',
        name: 'Tostadas de pan de espelta con aguacate y café',
        meal: 'desayuno',
        calories: 395,
        protein: 10.5,
        carbs: 46,
        fats: 18,
        fiber: 11.2,
        timeString: '08:45',
        source: 'manual'
      },
      {
        id: 'yest_2',
        name: 'Plato combinado de garbanzos cocidos con espinacas y arroz',
        meal: 'comida',
        calories: 540,
        protein: 22,
        carbs: 76,
        fats: 12,
        fiber: 14,
        timeString: '14:20',
        source: 'manual'
      },
      {
        id: 'yest_3',
        name: 'Crema templada de calabacín con avena y aceite virgen extra',
        meal: 'cena',
        calories: 290,
        protein: 10,
        carbs: 35,
        fats: 11,
        fiber: 7.5,
        timeString: '21:15',
        source: 'recipe_ai'
      }
    ];

    try {
      localStorage.setItem(this.YESTERDAY_LOGS_KEY, JSON.stringify(defaults));
    } catch {}
    return defaults;
  }

  public repeatMealFromYesterday(meal: MealType): DailyMealEntry[] {
    const yesterday = this.getYesterdayLogs();
    const matches = yesterday.filter(m => m.meal === meal);
    const addedEntries: DailyMealEntry[] = [];

    for (const m of matches) {
      const added = this.addMealLog({
        name: `${m.name} (Repetido de ayer)`,
        meal: m.meal,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fats,
        fiber: m.fiber,
        source: 'manual'
      });
      addedEntries.push(added);
    }

    this.trackEvent('repeat_yesterday_meal', { meal, count: addedEntries.length });
    return addedEntries;
  }

  public copyYesterdayEntirely(): DailyMealEntry[] {
    const yesterday = this.getYesterdayLogs();
    const addedEntries: DailyMealEntry[] = [];

    for (const m of yesterday) {
      const added = this.addMealLog({
        name: `${m.name} (Copiado de ayer)`,
        meal: m.meal,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fats,
        fiber: m.fiber,
        source: 'manual'
      });
      addedEntries.push(added);
    }

    this.trackEvent('copy_yesterday_entirely', { count: addedEntries.length });
    return addedEntries;
  }

  // ==========================================
  // P1-A: REGISTRO PREDICTIVO POR CONTEXTO (HORA Y HÁBITO)
  // ==========================================
  public getPredictiveSuggestions(currentHour?: number): {
    timeSlot: 'desayuno' | 'comida' | 'tarde' | 'cena';
    recommendedMealType: MealType;
    suggestions: PredictiveItem[];
  } {
    const hour = currentHour !== undefined ? currentHour : new Date().getHours();
    let timeSlot: 'desayuno' | 'comida' | 'tarde' | 'cena' = 'desayuno';
    let recommendedMealType: MealType = 'desayuno';

    if (hour >= 5 && hour < 12) {
      timeSlot = 'desayuno';
      recommendedMealType = 'desayuno';
    } else if (hour >= 12 && hour < 16) {
      timeSlot = 'comida';
      recommendedMealType = 'comida';
    } else if (hour >= 16 && hour < 20) {
      timeSlot = 'tarde';
      recommendedMealType = 'snacks';
    } else {
      timeSlot = 'cena';
      recommendedMealType = 'cena';
    }

    const habituals = this.getHabitualMeals();
    const yesterday = this.getYesterdayLogs();
    const saved = this.getSavedMeals();

    const suggestions: PredictiveItem[] = [];

    // 1. Lo que suelo tomar a esta hora (habitual del meal slot)
    const matchingHabitual = habituals.find(h => h.meal === recommendedMealType);
    if (matchingHabitual) {
      suggestions.push({
        id: `pred_hab_${matchingHabitual.id}`,
        title: matchingHabitual.title,
        subtitle: matchingHabitual.description,
        meal: matchingHabitual.meal,
        calories: matchingHabitual.calories,
        protein: matchingHabitual.protein,
        fiber: matchingHabitual.fiber,
        type: 'habitual'
      });
    }

    // 2. Lo que tomé ayer a esta hora
    const matchingYesterday = yesterday.find(y => y.meal === recommendedMealType);
    if (matchingYesterday) {
      suggestions.push({
        id: `pred_yest_${matchingYesterday.id}`,
        title: `Lo que comiste ayer (${recommendedMealType})`,
        subtitle: matchingYesterday.name,
        meal: matchingYesterday.meal,
        calories: matchingYesterday.calories,
        protein: matchingYesterday.protein,
        fiber: matchingYesterday.fiber,
        type: 'yesterday'
      });
    }

    // 3. Comidas guardadas que encajen
    const matchingSaved = saved.find(s => s.meal === recommendedMealType);
    if (matchingSaved) {
      suggestions.push({
        id: `pred_saved_${matchingSaved.id}`,
        title: `Comida guardada: ${matchingSaved.name}`,
        subtitle: matchingSaved.description,
        meal: matchingSaved.meal,
        calories: matchingSaved.calories,
        protein: matchingSaved.protein,
        fiber: matchingSaved.fiber,
        type: 'saved'
      });
    }

    return { timeSlot, recommendedMealType, suggestions };
  }

  // ==========================================
  // P1-B: DESPENSA INTELIGENTE & "ÚSALO PRONTO"
  // ==========================================
  public getPantryItems(): PantryItem[] {
    try {
      const raw = localStorage.getItem(this.PANTRY_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaults: PantryItem[] = [
      { id: 'p1', name: 'Quinoa Real Bio (Paquete 500g)', slug: 'el-granero-integral-quinoa-bio-500gr-granero', category: 'cereales', estimatedRemainingServings: 6, totalServings: 8, daysToConsumeBeforePreferred: 60, status: 'ok', price: 4.20 },
      { id: 'p2', name: 'Aceite de Oliva Virgen Extra 5L', slug: 'general-multimarca-aceite-de-oliva-virgen-extra-5l-lagar-de', category: 'aceites', estimatedRemainingServings: 75, totalServings: 100, daysToConsumeBeforePreferred: 180, status: 'ok', price: 62.50 },
      { id: 'p3', name: 'Garbanzos Cocidos Extra Bio Gumendi', slug: 'gumendi-garbanzo-cocido-660gr', category: 'legumbres', estimatedRemainingServings: 1, totalServings: 3, daysToConsumeBeforePreferred: 3, status: 'expiring', price: 3.10 },
      { id: 'p4', name: 'Copos de Avena Suaves Bio Ecosana', slug: 'ecosana-copos-de-avena-500gr', category: 'desayunos', estimatedRemainingServings: 4, totalServings: 10, daysToConsumeBeforePreferred: 25, status: 'ok', price: 1.80 },
      { id: 'p5', name: 'Espinacas Frescas Bio de Huerta', category: 'hortalizas', estimatedRemainingServings: 1, totalServings: 2, daysToConsumeBeforePreferred: 2, status: 'expiring', price: 2.15 },
    ];

    try {
      localStorage.setItem(this.PANTRY_KEY, JSON.stringify(defaults));
    } catch {}
    return defaults;
  }

  public savePantryItems(items: PantryItem[]): void {
    try {
      localStorage.setItem(this.PANTRY_KEY, JSON.stringify(items));
    } catch {}
  }

  /**
   * Obtiene ingredientes que están próximos a su consumo preferente para priorizarlos
   */
  public getExpiringPantryItems(): PantryItem[] {
    const pantry = this.getPantryItems();
    return pantry.filter(p => p.status === 'expiring' || p.daysToConsumeBeforePreferred <= 4);
  }

  // ==========================================
  // P1-C: DESPENSA ↔ DIARIO (Deducción transparente)
  // ==========================================
  public checkPantryDeductionSuggestions(entry: DailyMealEntry): PantryDeductionProposal | null {
    const pantry = this.getPantryItems();
    const entryLower = entry.name.toLowerCase();

    for (const item of pantry) {
      const keyWord = item.name.toLowerCase().split(' ')[0]; // e.g. "quinoa", "copos", "garbanzos", "espinacas"
      if (entryLower.includes(keyWord) || (item.slug && entryLower.includes(item.slug.split('-')[0]))) {
        if (item.estimatedRemainingServings > 0) {
          return {
            pantryId: item.id,
            pantryName: item.name,
            currentEstimatedServings: item.estimatedRemainingServings,
            servingsToDeduct: 1,
            newEstimatedServings: Math.max(0, item.estimatedRemainingServings - 1),
            gramsEstimatedUsed: 60
          };
        }
      }
    }
    return null;
  }

  public confirmPantryDeduction(pantryId: string, servingsDeducted = 1): void {
    const pantry = this.getPantryItems();
    const item = pantry.find(p => p.id === pantryId);
    if (!item) return;

    item.estimatedRemainingServings = Math.max(0, item.estimatedRemainingServings - servingsDeducted);
    if (item.estimatedRemainingServings === 0) {
      item.status = 'low';
    }
    this.savePantryItems(pantry);
    this.trackEvent('pantry_used', { pantryId, servingsRemaining: item.estimatedRemainingServings });
  }

  // ==========================================
  // P1-C: PEDIDOS → DESPENSA (Añadir tras comprar)
  // ==========================================
  public addOrderItemsToPantry(items: { name: string; slug?: string; category: string; servings: number; price?: number; daysPreferred?: number }[]): PantryItem[] {
    const current = this.getPantryItems();
    const newItems: PantryItem[] = [];

    for (const it of items) {
      // Si ya existe en despensa, sumamos raciones
      const existing = current.find(p => (it.slug && p.slug === it.slug) || p.name.toLowerCase() === it.name.toLowerCase());
      if (existing) {
        existing.estimatedRemainingServings += it.servings;
        existing.totalServings += it.servings;
        existing.status = 'ok';
      } else {
        const newItem: PantryItem = {
          id: `pantry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: it.name,
          slug: it.slug,
          category: it.category || 'despensa',
          estimatedRemainingServings: it.servings,
          totalServings: it.servings,
          daysToConsumeBeforePreferred: it.daysPreferred || 45,
          status: 'ok',
          price: it.price
        };
        current.push(newItem);
        newItems.push(newItem);
      }
    }

    this.savePantryItems(current);
    this.trackEvent('order_added_to_pantry', { itemsCount: items.length });
    return current;
  }

  // ==========================================
  // P1-B: COMPLETA MI DÍA 2.0 (Despensa primero, efecto antes/después)
  // ==========================================
  public getCompleteMyDaySuggestions(): { summaryNote: string; suggestions: CompleteMyDaySuggestion[] } {
    const logs = this.getTodayLogs();
    const goals = this.getGoals();
    const pantry = this.getPantryItems();

    const currentCalories = logs.reduce((acc, it) => acc + it.calories, 0);
    const currentProtein = logs.reduce((acc, it) => acc + it.protein, 0);
    const currentFiber = logs.reduce((acc, it) => acc + it.fiber, 0);

    const remainingFiber = Math.max(0, goals.targetFiberGrams - currentFiber);
    const remainingProtein = Math.max(0, goals.targetProteinGrams - currentProtein);

    let summaryNote = "Llevas un día muy constante. Te proponemos cenas ligeras priorizando lo que ya tienes en casa.";
    if (remainingFiber > 10 && remainingProtein > 15) {
      summaryNote = "Hoy te vendría bien un aporte suave de proteína vegetal y fibra para completar tu objetivo.";
    }

    const hasQuinoa = pantry.some(p => p.name.toLowerCase().includes('quinoa') && p.estimatedRemainingServings > 0);
    const hasGarbanzos = pantry.some(p => p.name.toLowerCase().includes('garbanzo') && p.estimatedRemainingServings > 0);
    const hasAove = pantry.some(p => p.name.toLowerCase().includes('aceite') && p.estimatedRemainingServings > 0);
    const hasAvena = pantry.some(p => p.name.toLowerCase().includes('avena') && p.estimatedRemainingServings > 0);

    const rawSuggestions: CompleteMyDaySuggestion[] = [
      {
        id: 'sug_pantry_full',
        title: 'Crema reconfortante de calabacín y avena con semillas',
        reason: 'Aprovecha lo que ya tienes en despensa. Cena suave, saciante y de digestión ligera.',
        timeMinutes: 12,
        calories: 280,
        protein: 10,
        fiber: 7.2,
        effectBefore: { protein: currentProtein, fiber: currentFiber },
        effectAfter: { protein: Math.round((currentProtein + 10) * 10) / 10, fiber: Math.round((currentFiber + 7.2) * 10) / 10 },
        pantryMatches: [
          { name: 'Copos de avena bio', available: hasAvena },
          { name: 'Aceite de Oliva Virgen Extra', available: hasAove }
        ],
        missingCost: 0.00,
        missingProducts: [],
        recipeSteps: [
          'Cocer a fuego suave calabacín con 2 cucharadas de copos de avena.',
          'Triturar con un hilo de AOVE hasta obtener una textura aterciopelada.'
        ],
        allPantryAvailable: true
      },
      {
        id: 'sug_pantry_quinoa',
        title: 'Ensalada templada de quinoa, garbanzos y espinacas bio',
        reason: 'Rica en fibra y proteína vegetal. Aprovecha las espinacas frescas que debes consumir pronto.',
        timeMinutes: 15,
        calories: 395,
        protein: 19,
        fiber: 11.5,
        effectBefore: { protein: currentProtein, fiber: currentFiber },
        effectAfter: { protein: Math.round((currentProtein + 19) * 10) / 10, fiber: Math.round((currentFiber + 11.5) * 10) / 10 },
        pantryMatches: [
          { name: 'Quinoa Real Bio', available: hasQuinoa },
          { name: 'Garbanzos cocidos bio', available: hasGarbanzos, isLow: true },
          { name: 'Aceite de Oliva Virgen Extra', available: hasAove },
          { name: 'Espinacas frescas bio', available: false }
        ],
        missingCost: 2.15,
        missingProducts: [
          { name: 'Espinacas Frescas de Huerta Bio (300g)', price: 2.15, slug: 'gumendi-espinaca-hoja-bio' }
        ],
        recipeSteps: [
          'Enjuagar y saltear los garbanzos con una pizca de comino en AOVE durante 3 minutos.',
          'Añadir la quinoa templada y las espinacas para que caigan con el vapor residual.'
        ],
        allPantryAvailable: false
      },
      {
        id: 'sug_crispy_chickpeas',
        title: 'Bowl de garbanzos crujientes al horno con ensalada verde',
        reason: 'Rico en fibra saciante y bajo en grasas saturadas para un descanso reparador.',
        timeMinutes: 20,
        calories: 340,
        protein: 16,
        fiber: 9.8,
        effectBefore: { protein: currentProtein, fiber: currentFiber },
        effectAfter: { protein: Math.round((currentProtein + 16) * 10) / 10, fiber: Math.round((currentFiber + 9.8) * 10) / 10 },
        pantryMatches: [
          { name: 'Garbanzos cocidos bio', available: hasGarbanzos },
          { name: 'Aceite de Oliva Virgen Extra', available: hasAove },
          { name: 'Tomate de rama bio', available: false }
        ],
        missingCost: 1.80,
        missingProducts: [
          { name: 'Tomate de rama ecológico (500g)', price: 1.80, slug: 'tomate-rama-bio' }
        ],
        recipeSteps: [
          'Tostar los garbanzos en sartén con pimentón de la Vera.',
          'Servir sobre base verde con aliño ligero.'
        ],
        allPantryAvailable: false
      }
    ];

    // Orden estricto: Primero lo que ya tienes 100% en despensa
    const suggestions = rawSuggestions.sort((a, b) => {
      if (a.allPantryAvailable && !b.allPantryAvailable) return -1;
      if (!a.allPantryAvailable && b.allPantryAvailable) return 1;
      return a.missingCost - b.missingCost;
    });

    return { summaryNote, suggestions };
  }

  // ==========================================
  // P1-D: PLAN SEMANAL ("MI SEMANA" /semana)
  // ==========================================
  public getWeeklyPlan(): WeeklyMealPlan {
    try {
      const raw = localStorage.getItem(this.WEEKLY_PLAN_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const sampleRecipes: WeeklyPlanRecipe[] = [
      {
        id: 'rec_lentejas',
        title: 'Lentejas pardinas estofadas con verduras',
        calories: 480,
        prepMinutes: 25,
        pricePerServing: 1.85,
        pantryCoveredPercent: 80,
        proteinGrams: 24,
        fiberGrams: 14,
        ingredients: [
          { name: 'Lentejas pardinas bio', availableInPantry: true, priceIfMissing: 0 },
          { name: 'Zanahoria y puerro', availableInPantry: true, priceIfMissing: 0 },
          { name: 'Pimentón dulce bio', availableInPantry: true, priceIfMissing: 0 },
          { name: 'AOVE ecológico', availableInPantry: true, priceIfMissing: 0 }
        ]
      },
      {
        id: 'rec_quinoa_tofu',
        title: 'Bowl templado de quinoa, tofu y espinacas',
        calories: 430,
        prepMinutes: 18,
        pricePerServing: 2.40,
        pantryCoveredPercent: 70,
        proteinGrams: 22,
        fiberGrams: 9,
        ingredients: [
          { name: 'Quinoa real bio', availableInPantry: true, priceIfMissing: 0 },
          { name: 'Tofu natural ecológico', availableInPantry: false, priceIfMissing: 2.10 },
          { name: 'Espinacas frescas', availableInPantry: true, priceIfMissing: 0 }
        ]
      },
      {
        id: 'rec_crema_avena',
        title: 'Crema aterciopelada de calabacín y avena',
        calories: 280,
        prepMinutes: 15,
        pricePerServing: 1.20,
        pantryCoveredPercent: 100,
        proteinGrams: 10,
        fiberGrams: 8,
        ingredients: [
          { name: 'Copos de avena bio', availableInPantry: true, priceIfMissing: 0 },
          { name: 'Calabacín bio', availableInPantry: true, priceIfMissing: 0 },
          { name: 'AOVE', availableInPantry: true, priceIfMissing: 0 }
        ]
      },
      {
        id: 'rec_garbanzos_curry',
        title: 'Curry suave de garbanzos con arroz basmati',
        calories: 510,
        prepMinutes: 20,
        pricePerServing: 2.10,
        pantryCoveredPercent: 75,
        proteinGrams: 19,
        fiberGrams: 12,
        ingredients: [
          { name: 'Garbanzos cocidos bio', availableInPantry: true, priceIfMissing: 0 },
          { name: 'Leche de coco bio', availableInPantry: false, priceIfMissing: 1.95 },
          { name: 'Arroz basmati integral', availableInPantry: true, priceIfMissing: 0 }
        ]
      }
    ];

    const days: WeeklyMealPlanDay[] = dayNames.map((name, idx) => ({
      dayIndex: idx,
      dayName: name,
      almuerzo: sampleRecipes[idx % sampleRecipes.length],
      cena: sampleRecipes[(idx + 2) % sampleRecipes.length]
    }));

    const defaultPlan: WeeklyMealPlan = {
      id: 'plan_current',
      mode: 'comidas_cenas',
      numPersons: 2,
      budgetCapEuro: 45,
      days
    };

    try {
      localStorage.setItem(this.WEEKLY_PLAN_KEY, JSON.stringify(defaultPlan));
    } catch {}
    return defaultPlan;
  }

  public saveWeeklyPlan(plan: WeeklyMealPlan): void {
    try {
      localStorage.setItem(this.WEEKLY_PLAN_KEY, JSON.stringify(plan));
    } catch {}
    this.trackEvent('weekly_plan_saved', { mode: plan.mode, numPersons: plan.numPersons });
  }

  // ==========================================
  // P1-E: SEMANA → LISTA DE COMPRA INTELIGENTE
  // ==========================================
  public generateShoppingListFromPlan(): ShoppingListItem[] {
    const plan = this.getWeeklyPlan();
    const pantry = this.getPantryItems();

    const items: ShoppingListItem[] = [
      {
        id: 'shop_1',
        name: 'Tofu natural bio en bloque (250g)',
        quantityNeeded: `${2 * plan.numPersons} paquetes`,
        category: 'frescos',
        status: 'missing',
        priceEuro: 2.10,
        catalogSlug: 'tofu-natural-bio',
        checked: false
      },
      {
        id: 'shop_2',
        name: 'Leche de coco ecológica sin azúcar (400ml)',
        quantityNeeded: '2 latas',
        category: 'despensa',
        status: 'missing',
        priceEuro: 1.95,
        catalogSlug: 'leche-coco-bio',
        checked: false
      },
      {
        id: 'shop_3',
        name: 'Quinoa Real Ecológica (500g)',
        quantityNeeded: '1 paquete',
        category: 'cereales',
        status: 'have', // Ya en despensa
        priceEuro: 4.20,
        catalogSlug: 'el-granero-integral-quinoa-bio-500gr-granero',
        checked: true
      },
      {
        id: 'shop_4',
        name: 'Garbanzos Cocidos Extra Bio (660g)',
        quantityNeeded: '2 frascos',
        category: 'legumbres',
        status: 'have', // Ya en despensa
        priceEuro: 3.10,
        catalogSlug: 'gumendi-garbanzo-cocido-660gr',
        checked: true
      },
      {
        id: 'shop_5',
        name: 'Semillas de chía crudas bio (250g)',
        quantityNeeded: '1 bolsa',
        category: 'condimentos',
        status: 'optional',
        priceEuro: 2.80,
        checked: false
      }
    ];

    try {
      localStorage.setItem(this.SHOPPING_LIST_KEY, JSON.stringify(items));
    } catch {}
    this.trackEvent('shopping_list_created', { count: items.length });
    return items;
  }

  public getShoppingList(): ShoppingListItem[] {
    try {
      const raw = localStorage.getItem(this.SHOPPING_LIST_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return this.generateShoppingListFromPlan();
  }

  public toggleShoppingListItem(id: string): ShoppingListItem[] {
    const list = this.getShoppingList();
    const item = list.find(it => it.id === id);
    if (item) {
      item.checked = !item.checked;
      try {
        localStorage.setItem(this.SHOPPING_LIST_KEY, JSON.stringify(list));
      } catch {}
    }
    return list;
  }

  public updateShoppingList(list: ShoppingListItem[]): void {
    try {
      localStorage.setItem(this.SHOPPING_LIST_KEY, JSON.stringify(list));
    } catch {}
  }

  // ==========================================
  // P1-F: REGISTRO OPCIONAL DE PESO (TENDENCIA SUAVIZADA)
  // ==========================================
  public isWeightTrackingEnabled(): boolean {
    return localStorage.getItem(this.WEIGHT_ENABLED_KEY) === 'true';
  }

  public toggleWeightTracking(enabled: boolean): void {
    try {
      localStorage.setItem(this.WEIGHT_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch {}
  }

  public getWeightHistory(): WeightRecord[] {
    try {
      const raw = localStorage.getItem(this.WEIGHT_RECORDS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaults: WeightRecord[] = [
      { id: 'w1', dateStr: '2026-10-14', weightKg: 70.4, smoothedTrendKg: 70.4 },
      { id: 'w2', dateStr: '2026-10-18', weightKg: 70.1, smoothedTrendKg: 70.2 },
      { id: 'w3', dateStr: '2026-10-21', weightKg: 70.5, smoothedTrendKg: 70.2 },
      { id: 'w4', dateStr: '2026-10-25', weightKg: 69.8, smoothedTrendKg: 70.0 },
      { id: 'w5', dateStr: '2026-10-28', weightKg: 69.7, smoothedTrendKg: 69.9 },
    ];

    try {
      localStorage.setItem(this.WEIGHT_RECORDS_KEY, JSON.stringify(defaults));
    } catch {}
    return defaults;
  }

  public addWeightEntry(weightKg: number, dateStr?: string): WeightRecord {
    const history = this.getWeightHistory();
    const date = dateStr || new Date().toISOString().split('T')[0];
    
    // Media móvil exponencial simple con los 3 anteriores para no sobre-reaccionar al agua
    const lastSmoothed = history.length > 0 ? history[history.length - 1].smoothedTrendKg : weightKg;
    const smoothedTrendKg = Math.round((lastSmoothed * 0.7 + weightKg * 0.3) * 10) / 10;

    const newRecord: WeightRecord = {
      id: `w_${Date.now()}`,
      dateStr: date,
      weightKg: Math.round(weightKg * 10) / 10,
      smoothedTrendKg
    };

    const updated = [...history, newRecord];
    try {
      localStorage.setItem(this.WEIGHT_RECORDS_KEY, JSON.stringify(updated));
    } catch {}
    this.trackEvent('weight_logged', { weightKg });
    return newRecord;
  }

  // ==========================================
  // P1-F: TELEMETRÍA ÉTICA Y MEDICIÓN DE FRICCIÓN
  // ==========================================
  public trackEvent(eventName: string, metadata?: Record<string, any>): void {
    try {
      const raw = localStorage.getItem(this.TELEMETRY_KEY);
      const list: TelemetryEvent[] = raw ? JSON.parse(raw) : [];
      list.push({
        eventName,
        timestamp: new Date().toISOString(),
        metadata
      });
      // Mantener solo los últimos 100 eventos
      const trimmed = list.slice(-100);
      localStorage.setItem(this.TELEMETRY_KEY, JSON.stringify(trimmed));
    } catch {}
  }

  public getRecentTelemetryEvents(): TelemetryEvent[] {
    try {
      const raw = localStorage.getItem(this.TELEMETRY_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  // ==========================================
  // MÉTODOS DE BASE
  // ==========================================
  public getGoals(): DailyGoals {
    try {
      const raw = localStorage.getItem(this.GOALS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    return {
      activeGoalId: 'equilibrio',
      goalTitle: 'Comer más equilibrado (Plato Harvard)',
      targetCalories: 2050,
      targetProteinGrams: 85,
      targetCarbsGrams: 240,
      targetFatsGrams: 65,
      targetFiberGrams: 32,
      targetWaterGlasses: 8
    };
  }

  public setGoal(goalId: string): DailyGoals {
    const found = NUTRITIONAL_GOALS_CATALOG.find(g => g.id === goalId) || NUTRITIONAL_GOALS_CATALOG[0];
    const newGoals: DailyGoals = {
      activeGoalId: found.id,
      goalTitle: found.title,
      targetCalories: found.cals,
      targetProteinGrams: found.prot,
      targetCarbsGrams: found.carbs,
      targetFatsGrams: found.fats,
      targetFiberGrams: found.fiber,
      targetWaterGlasses: 8
    };

    try {
      localStorage.setItem(this.GOALS_KEY, JSON.stringify(newGoals));
      localStorage.setItem('ecoland-target-calories', found.cals.toString());
    } catch {}
    return newGoals;
  }

  public getWaterGlasses(): number {
    try {
      return Number(localStorage.getItem(this.WATER_KEY) || 5);
    } catch {
      return 5;
    }
  }

  public updateWaterGlasses(delta: number): number {
    const current = this.getWaterGlasses();
    const next = Math.max(0, Math.min(14, current + delta));
    try {
      localStorage.setItem(this.WATER_KEY, next.toString());
    } catch {}
    return next;
  }

  public logRecipeToDiary(
    recipeTitle: string,
    servings: number,
    baseCalories: number,
    baseProtein: number,
    meal: MealType = 'comida'
  ): DailyMealEntry {
    const cals = Math.round(baseCalories * servings);
    const prot = Math.round(baseProtein * servings * 10) / 10;
    const carbs = Math.round(cals * 0.50 / 4);
    const fats = Math.round(cals * 0.25 / 9);
    const fiber = Math.round(servings * 7);

    return this.addMealLog({
      name: `${recipeTitle} (${servings === 1 ? '1 ración' : servings + ' raciones'})`,
      meal,
      calories: cals,
      protein: prot,
      carbs,
      fats,
      fiber,
      source: 'recipe_ai'
    });
  }

  public getWeeklySummary(): WeeklyTrendSummary {
    return {
      daysLogged: 5,
      totalDays: 7,
      averageCalories: 1940,
      averageProtein: 82,
      averageFiber: 29.5,
      plantDiversityCount: 24, // 24 plantas diferentes (frutas, verduras, legumbres, semillas)
      waterAverageGlasses: 6.8,
      pantryMealsCooked: 4,
      estimatedEuroSavedAntiWaste: 14.80,
      previousWeekAverageFiber: 26.2,
      previousWeekAverageProtein: 78.0,
      friendlyMessage: "Has registrado tus comidas 5 de los últimos 7 días. ¡Excelente consistencia! Esta semana preparaste 4 comidas aprovechando lo que ya tenías en la despensa, ahorrando aproximadamente 14,80€ en desperdicio."
    };
  }
}

export const dailyNutritionStore = new DailyNutritionStore();
