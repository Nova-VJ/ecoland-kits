/**
 * ALMACÉN CENTRAL DE NUTRICIÓN DIARIA, DESPENSA Y RETENCIÓN (ECOLAND DAILY)
 * Almacenamiento local reactivo para soporte offline y privacidad total
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
  source?: 'manual' | 'habitual' | 'recipe_ai' | 'photo' | 'voice' | 'barcode';
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
  pantryMatches: { name: string; available: boolean; isLow?: boolean }[];
  missingCost: number;
  missingProducts: { name: string; price: number; slug: string }[];
  recipeSteps: string[];
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

  /**
   * Obtiene los registros del día actual
   */
  public getTodayLogs(): DailyMealEntry[] {
    try {
      const raw = localStorage.getItem(this.MEAL_LOGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    // Datos iniciales de demostración realistas y equilibrados
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

  /**
   * Repite una comida habitual con 1 toque
   */
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

    // Actualizar contador
    target.timesLogged += 1;
    target.lastLoggedDate = 'Hoy';
    try {
      localStorage.setItem(this.HABITUAL_KEY, JSON.stringify(habituals));
    } catch {}

    return entry;
  }

  /**
   * Gestión de la Despensa Inteligente
   */
  public getPantryItems(): PantryItem[] {
    try {
      const raw = localStorage.getItem(this.PANTRY_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    const defaults: PantryItem[] = [
      { id: 'p1', name: 'Quinoa Real Bio (Paquete 500g)', slug: 'el-granero-integral-quinoa-bio-500gr-granero', category: 'cereales', estimatedRemainingServings: 6, totalServings: 8, daysToConsumeBeforePreferred: 60, status: 'ok', price: 4.20 },
      { id: 'p2', name: 'Aceite de Oliva Virgen Extra 5L', slug: 'general-multimarca-aceite-de-oliva-virgen-extra-5l-lagar-de', category: 'aceites', estimatedRemainingServings: 75, totalServings: 100, daysToConsumeBeforePreferred: 180, status: 'ok', price: 62.50 },
      { id: 'p3', name: 'Garbanzos Cocidos Extra Bio Gumendi', slug: 'gumendi-garbanzo-cocido-660gr', category: 'legumbres', estimatedRemainingServings: 1, totalServings: 3, daysToConsumeBeforePreferred: 5, status: 'low', price: 3.10 },
      { id: 'p4', name: 'Copos de Avena Suaves Bio Ecosana', slug: 'ecosana-copos-de-avena-500gr', category: 'desayunos', estimatedRemainingServings: 4, totalServings: 10, daysToConsumeBeforePreferred: 25, status: 'ok', price: 1.80 },
      { id: 'p5', name: 'Espinacas Frescas Bio de Huerta', category: 'hortalizas', estimatedRemainingServings: 0, totalServings: 2, daysToConsumeBeforePreferred: 2, status: 'expiring', price: 2.15 },
    ];

    try {
      localStorage.setItem(this.PANTRY_KEY, JSON.stringify(defaults));
    } catch {}
    return defaults;
  }

  /**
   * Objetivos Nutricionales y de Estilo de Vida
   */
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

  /**
   * Hidratación (vasos de agua)
   */
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

  /**
   * COMPLETA MI DÍA — Lógica proactiva según nutrientes restantes y despensa
   */
  public getCompleteMyDaySuggestions(): { summaryNote: string; suggestions: CompleteMyDaySuggestion[] } {
    const logs = this.getTodayLogs();
    const goals = this.getGoals();
    const pantry = this.getPantryItems();

    const currentCalories = logs.reduce((acc, it) => acc + it.calories, 0);
    const currentProtein = logs.reduce((acc, it) => acc + it.protein, 0);
    const currentFiber = logs.reduce((acc, it) => acc + it.fiber, 0);

    const remainingCalories = Math.max(0, goals.targetCalories - currentCalories);
    const remainingProtein = Math.max(0, goals.targetProteinGrams - currentProtein);
    const remainingFiber = Math.max(0, goals.targetFiberGrams - currentFiber);

    let summaryNote = "Llevas un día muy constante. Te proponemos opciones ligeras para cerrar la noche.";
    if (remainingFiber > 10 && remainingProtein > 15) {
      summaryNote = "Hoy llevas algo menos de fibra y proteína vegetal de lo habitual. Estas cenas te ayudan a redondear el día de forma natural y ligera.";
    } else if (remainingFiber > 10) {
      summaryNote = "Tu consumo de fibra ha sido más bajo hoy. Añadir hortalizas o legumbres a la cena favorecerá tu descanso y digestión.";
    } else if (remainingProtein > 20) {
      summaryNote = "Te falta un aporte de proteína para completar tu objetivo. Estas propuestas combinan legumbres y cereales integrales.";
    }

    const hasQuinoa = pantry.some(p => p.name.toLowerCase().includes('quinoa') && p.estimatedRemainingServings > 0);
    const hasGarbanzos = pantry.some(p => p.name.toLowerCase().includes('garbanzo') && p.estimatedRemainingServings > 0);
    const hasAove = pantry.some(p => p.name.toLowerCase().includes('aceite') && p.estimatedRemainingServings > 0);

    const suggestions: CompleteMyDaySuggestion[] = [
      {
        id: 'sug_1',
        title: 'Ensalada templada de quinoa, garbanzos y espinacas',
        reason: 'Aporta 11g de fibra prebiótica y 19g de proteína vegetal completa.',
        timeMinutes: 15,
        calories: 395,
        protein: 19,
        fiber: 11.5,
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
          'Añadir la quinoa cocida templada y un puñado de espinacas para que caigan con el vapor residual.',
          'Aliñar con zumo de limón y semillas de cáñamo tostadas.'
        ]
      },
      {
        id: 'sug_2',
        title: 'Bowl de garbanzos crujientes al horno con ensalada verde',
        reason: 'Rico en fibra saciante y bajo en grasas saturadas para un descanso profundo.',
        timeMinutes: 20,
        calories: 340,
        protein: 16,
        fiber: 9.8,
        pantryMatches: [
          { name: 'Garbanzos cocidos bio', available: hasGarbanzos, isLow: true },
          { name: 'Aceite de Oliva Virgen Extra', available: hasAove },
          { name: 'Tomate de huerta', available: false }
        ],
        missingCost: 1.80,
        missingProducts: [
          { name: 'Tomate de rama ecológico (500g)', price: 1.80, slug: 'tomate-rama-bio' }
        ],
        recipeSteps: [
          'Secar los garbanzos y tostarlos en sartén o airfryer con pimentón de la Vera.',
          'Servir sobre base fresca con aliño ligero de aceite y orégano silvestre.'
        ]
      },
      {
        id: 'sug_3',
        title: 'Crema reconfortante de calabacín y avena con semillas',
        reason: 'Cena rápida de fácil asimilación, suave para el estómago y con fibra soluble.',
        timeMinutes: 12,
        calories: 280,
        protein: 10,
        fiber: 7.2,
        pantryMatches: [
          { name: 'Copos de avena bio', available: true },
          { name: 'Aceite de Oliva Virgen Extra', available: hasAove }
        ],
        missingCost: 0.00,
        missingProducts: [],
        recipeSteps: [
          'Cocer a fuego suave calabacín con 2 cucharadas de copos de avena.',
          'Triturar con un hilo de AOVE hasta obtener una textura aterciopelada.'
        ]
      }
    ];

    return { summaryNote, suggestions };
  }

  /**
   * Registra una receta completa de Chef IA en el diario
   */
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

  /**
   * Resumen Semanal Amable ("Tu Semana en Ecoland")
   */
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
      friendlyMessage: "Has registrado tus comidas 5 de los últimos 7 días. ¡Excelente consistencia! Esta semana preparaste 4 comidas aprovechando lo que ya tenías en la despensa, ahorrando aproximadamente 14,80€ en desperdicio."
    };
  }
}

export const dailyNutritionStore = new DailyNutritionStore();
