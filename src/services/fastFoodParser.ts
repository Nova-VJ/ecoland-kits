/**
 * SERVICIO INTELIGENTE DE PARSEO RÁPIDO DE ALIMENTOS
 * Ecoland Daily — Registro en segundos sin fricción
 * 
 * Permite interpretar lenguaje natural, dictado por voz y estimación visual fotográfica
 * devolviendo ingredientes, gramos estimados, calorías y macronutrientes editables.
 */

export interface ParsedFoodItem {
  id: string;
  name: string;
  quantityDescription: string;
  weightGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  confidence?: 'high' | 'medium' | 'low';
  confidenceReason?: string;
  isOrganic?: boolean;
}

export interface FoodParseResult {
  rawInput: string;
  source: 'text' | 'voice' | 'photo' | 'barcode' | 'catalog';
  confidenceNotice: string;
  overallConfidence: 'high' | 'medium' | 'low';
  requiresReview: boolean;
  totalEstimatedCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  items: ParsedFoodItem[];
}

// Diccionario semántico de ingredientes cotidianos con sus macros por 100g
const INGREDIENT_KNOWLEDGE_BASE: Record<string, { cals100g: number; prot100g: number; carbs100g: number; fats100g: number; fiber100g: number; defaultWeight: number }> = {
  'tostada': { cals100g: 260, prot100g: 9, carbs100g: 48, fats100g: 3, fiber100g: 6, defaultWeight: 40 },
  'pan': { cals100g: 260, prot100g: 9, carbs100g: 48, fats100g: 3, fiber100g: 6, defaultWeight: 50 },
  'pan integral': { cals100g: 245, prot100g: 10, carbs100g: 44, fats100g: 3, fiber100g: 7, defaultWeight: 50 },
  'aguacate': { cals100g: 160, prot100g: 2, carbs100g: 8, fats100g: 15, fiber100g: 7, defaultWeight: 60 },
  'cafe': { cals100g: 2, prot100g: 0.1, carbs100g: 0.3, fats100g: 0, fiber100g: 0, defaultWeight: 100 },
  'cafe con leche': { cals100g: 45, prot100g: 2.5, carbs100g: 3.8, fats100g: 2, fiber100g: 0, defaultWeight: 150 },
  'leche': { cals100g: 48, prot100g: 3.2, carbs100g: 4.8, fats100g: 1.8, fiber100g: 0, defaultWeight: 200 },
  'avena': { cals100g: 365, prot100g: 13.5, carbs100g: 58, fats100g: 7, fiber100g: 10, defaultWeight: 50 },
  'kefir': { cals100g: 55, prot100g: 3.5, carbs100g: 4, fats100g: 2.8, fiber100g: 0, defaultWeight: 150 },
  'platano': { cals100g: 89, prot100g: 1.1, carbs100g: 23, fats100g: 0.3, fiber100g: 2.6, defaultWeight: 100 },
  'manzana': { cals100g: 52, prot100g: 0.3, carbs100g: 14, fats100g: 0.2, fiber100g: 2.4, defaultWeight: 150 },
  'huevos': { cals100g: 143, prot100g: 12.6, carbs100g: 0.7, fats100g: 9.5, fiber100g: 0, defaultWeight: 60 },
  'huevo': { cals100g: 143, prot100g: 12.6, carbs100g: 0.7, fats100g: 9.5, fiber100g: 0, defaultWeight: 60 },
  'tortilla': { cals100g: 150, prot100g: 11, carbs100g: 1.5, fats100g: 11, fiber100g: 0, defaultWeight: 120 },
  'lentejas': { cals100g: 116, prot100g: 9, carbs100g: 20, fats100g: 0.4, fiber100g: 8, defaultWeight: 200 },
  'garbanzos': { cals100g: 130, prot100g: 8.5, carbs100g: 22, fats100g: 2.5, fiber100g: 7, defaultWeight: 200 },
  'arroz': { cals100g: 130, prot100g: 2.7, carbs100g: 28, fats100g: 0.3, fiber100g: 0.4, defaultWeight: 180 },
  'arroz integral': { cals100g: 111, prot100g: 2.6, carbs100g: 23, fats100g: 0.9, fiber100g: 1.8, defaultWeight: 180 },
  'quinoa': { cals100g: 120, prot100g: 4.4, carbs100g: 21, fats100g: 1.9, fiber100g: 2.8, defaultWeight: 180 },
  'pollo': { cals100g: 165, prot100g: 31, carbs100g: 0, fats100g: 3.6, fiber100g: 0, defaultWeight: 150 },
  'tofu': { cals100g: 83, prot100g: 10, carbs100g: 1.2, fats100g: 5, fiber100g: 1.2, defaultWeight: 125 },
  'ensalada': { cals100g: 25, prot100g: 1.5, carbs100g: 3.5, fats100g: 0.3, fiber100g: 2.5, defaultWeight: 150 },
  'espinacas': { cals100g: 23, prot100g: 2.9, carbs100g: 3.6, fats100g: 0.4, fiber100g: 2.2, defaultWeight: 100 },
  'tomate': { cals100g: 18, prot100g: 0.9, carbs100g: 3.9, fats100g: 0.2, fiber100g: 1.2, defaultWeight: 120 },
  'nueces': { cals100g: 654, prot100g: 15, carbs100g: 14, fats100g: 65, fiber100g: 6.7, defaultWeight: 25 },
  'almendras': { cals100g: 579, prot100g: 21, carbs100g: 22, fats100g: 50, fiber100g: 12.5, defaultWeight: 25 },
  'aceite de oliva': { cals100g: 884, prot100g: 0, carbs100g: 0, fats100g: 100, fiber100g: 0, defaultWeight: 10 },
  'yogur': { cals100g: 60, prot100g: 3.5, carbs100g: 4.7, fats100g: 3.2, fiber100g: 0, defaultWeight: 125 },
};

export class FastFoodParser {
  /**
   * Parsea texto natural escrito o dictado por voz
   * Ejemplo: "2 tostadas integrales con aguacate y un café con leche"
   */
  public parseNaturalText(input: string, source: FoodParseResult['source'] = 'text'): FoodParseResult {
    const clean = input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[.,;]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const matchedItems: ParsedFoodItem[] = [];

    // Extracción de multiplicadores ("2 tostadas", "300g de arroz", etc.)
    const words = clean.split(' ');
    
    // Buscar en la base de conocimiento
    for (const [key, info] of Object.entries(INGREDIENT_KNOWLEDGE_BASE)) {
      const normKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const hasPlural = clean.includes(normKey + 's') || clean.includes(normKey + 'es');
      
      if (clean.includes(normKey) || hasPlural) {
        // Detectar si hay cantidad previa (ej. "2 tostadas" o "150g lentejas")
        let multiplier = 1;
        let explicitGrams: number | null = null;

        // Búsqueda de patrones numéricos cercanos
        const regexGrams = new RegExp(`(\\d+)\\s*(g|gr|gramos)\\s*(de)?\\s*${normKey}(s|es)?`);
        const matchGrams = clean.match(regexGrams);
        if (matchGrams) {
          explicitGrams = parseInt(matchGrams[1], 10);
        } else {
          const regexCount = new RegExp(`(\\d+)\\s*${normKey}(s|es)?`);
          const matchCount = clean.match(regexCount);
          if (matchCount) {
            multiplier = parseInt(matchCount[1], 10);
          } else if (clean.includes(`un ${normKey}`) || clean.includes(`una ${normKey}`)) {
            multiplier = 1;
          } else if (clean.includes(`dos ${normKey}`) || clean.includes(`dos ${normKey}s`) || clean.includes(`dos ${normKey}es`)) {
            multiplier = 2;
          } else if (clean.includes(`tres ${normKey}`) || clean.includes(`tres ${normKey}s`) || clean.includes(`tres ${normKey}es`)) {
            multiplier = 3;
          }
        }

        const weight = explicitGrams !== null ? explicitGrams : info.defaultWeight * multiplier;
        const ratio = weight / 100;
        const isOilOrSauce = normKey.includes('aceite') || normKey.includes('salsa');
        const itemConfidence: 'high' | 'medium' | 'low' = explicitGrams !== null 
          ? 'high' 
          : isOilOrSauce 
            ? 'medium' 
            : 'high';
        const confidenceReason = isOilOrSauce && explicitGrams === null
          ? 'Cantidad orientativa para grasa o aliño. Revísala antes de guardar.'
          : undefined;

        matchedItems.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          quantityDescription: explicitGrams ? `${explicitGrams}g` : `${multiplier > 1 ? multiplier + ' raciones' : '1 ración'} (~${weight}g)`,
          weightGrams: weight,
          calories: Math.round(info.cals100g * ratio),
          protein: Math.round(info.prot100g * ratio * 10) / 10,
          carbs: Math.round(info.carbs100g * ratio * 10) / 10,
          fats: Math.round(info.fats100g * ratio * 10) / 10,
          fiber: Math.round(info.fiber100g * ratio * 10) / 10,
          confidence: itemConfidence,
          confidenceReason,
          isOrganic: true
        });
      }
    }

    // Si no reconoció nada específico, crear un item genérico con estimación razonable
    if (matchedItems.length === 0) {
      matchedItems.push({
        id: `gen_${Date.now()}`,
        name: input.trim().length > 0 ? input.trim() : 'Comida casera equilibrada',
        quantityDescription: '1 ración estándar (~250g)',
        weightGrams: 250,
        calories: 320,
        protein: 12,
        carbs: 40,
        fats: 10,
        fiber: 5,
        confidence: 'low',
        confidenceReason: 'Plato interpretado de forma genérica. Te recomendamos ajustar los ingredientes y cantidades.',
        isOrganic: true
      });
    }

    const totalEstimatedCalories = matchedItems.reduce((acc, it) => acc + it.calories, 0);
    const totalProtein = Math.round(matchedItems.reduce((acc, it) => acc + it.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(matchedItems.reduce((acc, it) => acc + it.carbs, 0) * 10) / 10;
    const totalFats = Math.round(matchedItems.reduce((acc, it) => acc + it.fats, 0) * 10) / 10;
    const totalFiber = Math.round(matchedItems.reduce((acc, it) => acc + it.fiber, 0) * 10) / 10;

    const hasLow = matchedItems.some(i => i.confidence === 'low');
    const hasMed = matchedItems.some(i => i.confidence === 'medium');
    const overallConfidence: 'high' | 'medium' | 'low' = hasLow ? 'low' : hasMed ? 'medium' : 'high';
    const requiresReview = hasLow || hasMed;

    return {
      rawInput: input,
      source,
      confidenceNotice: requiresReview 
        ? 'Hemos detectado ingredientes con cantidades estimadas. Revísalo antes de registrar para mayor exactitud.' 
        : 'Estimación calculada con alta confianza a partir de ingredientes conocidos.',
      overallConfidence,
      requiresReview,
      totalEstimatedCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      totalFiber,
      items: matchedItems
    };
  }

  /**
   * Simula reconocimiento fotográfico de plato (Visión artificial saludable)
   */
  public parsePhotoMeal(presetType: 'ensalada_quinoa' | 'bowl_avena' | 'guiso_lentejas' | 'tostadas_aguacate'): FoodParseResult {
    switch (presetType) {
      case 'ensalada_quinoa':
        return {
          rawInput: 'Fotografía: Bowl templado de quinoa, garbanzos y verduras',
          source: 'photo',
          confidenceNotice: 'Estimación visual por foto: detectados 4 ingredientes. La cantidad exacta de aliño (aceite) requiere tu comprobación.',
          overallConfidence: 'medium',
          requiresReview: true,
          totalEstimatedCalories: 430,
          totalProtein: 16.5,
          totalCarbs: 58,
          totalFats: 13,
          totalFiber: 9.5,
          items: [
            { id: 'f1', name: 'Quinoa cocida bio', quantityDescription: '1 taza (~150g)', weightGrams: 150, calories: 180, protein: 6.5, carbs: 32, fats: 2.8, fiber: 4.2, confidence: 'high' },
            { id: 'f2', name: 'Garbanzos cocidos', quantityDescription: '1/2 taza (~100g)', weightGrams: 100, calories: 130, protein: 8.5, carbs: 22, fats: 2.5, fiber: 7, confidence: 'high' },
            { id: 'f3', name: 'Espinacas baby frescas', quantityDescription: 'Puñado generoso (~60g)', weightGrams: 60, calories: 14, protein: 1.7, carbs: 2.2, fats: 0.2, fiber: 1.3, confidence: 'high' },
            { id: 'f4', name: 'AOVE Ecológico (Aliño)', quantityDescription: '1 cucharada sopera (~12g)', weightGrams: 12, calories: 106, protein: 0, carbs: 0, fats: 12, fiber: 0, confidence: 'medium', confidenceReason: 'Cantidad de grasa/aceite estimada visualmente. Ajusta si echaste más o menos.' }
          ]
        };

      case 'bowl_avena':
        return {
          rawInput: 'Fotografía: Porridge matutino de avena con frutos secos',
          source: 'photo',
          confidenceNotice: 'Estimación visual por foto: cereales integrales y frutos secos detectados con alta precisión.',
          overallConfidence: 'high',
          requiresReview: false,
          totalEstimatedCalories: 385,
          totalProtein: 14,
          totalCarbs: 48,
          totalFats: 14.5,
          totalFiber: 8.5,
          items: [
            { id: 'f5', name: 'Copos de avena integral bio', quantityDescription: 'Porción (~50g)', weightGrams: 50, calories: 182, protein: 6.8, carbs: 29, fats: 3.5, fiber: 5, confidence: 'high' },
            { id: 'f6', name: 'Bebida vegetal de avena', quantityDescription: 'Vaso (~180ml)', weightGrams: 180, calories: 85, protein: 2.5, carbs: 12, fats: 2.5, fiber: 1.2, confidence: 'high' },
            { id: 'f7', name: 'Nueces y almendras bio', quantityDescription: 'Topping (~18g)', weightGrams: 18, calories: 118, protein: 3.5, carbs: 3.5, fats: 11, fiber: 1.8, confidence: 'medium', confidenceReason: 'Cantidad de frutos secos estimada por superficie visible.' }
          ]
        };

      case 'tostadas_aguacate':
      default:
        return {
          rawInput: 'Fotografía: Dos tostadas integrales con aguacate y semillas',
          source: 'photo',
          confidenceNotice: 'Estimación visual por foto: pan integral de masa madre y aguacate en láminas reconocidos.',
          overallConfidence: 'high',
          requiresReview: false,
          totalEstimatedCalories: 395,
          totalProtein: 10.5,
          totalCarbs: 46,
          totalFats: 18,
          totalFiber: 11.2,
          items: [
            { id: 'f8', name: 'Pan integral de espelta bio', quantityDescription: '2 rebanadas (~80g)', weightGrams: 80, calories: 196, protein: 8, carbs: 35, fats: 2.4, fiber: 5.6, confidence: 'high' },
            { id: 'f9', name: 'Aguacate hass en láminas', quantityDescription: 'Medio aguacate (~70g)', weightGrams: 70, calories: 112, protein: 1.4, carbs: 5.6, fats: 10.5, fiber: 4.9, confidence: 'high' },
            { id: 'f10', name: 'Semillas de lino y sésamo', quantityDescription: '1 cucharadita (~10g)', weightGrams: 10, calories: 55, protein: 2, carbs: 2.5, fats: 4.5, fiber: 2.5, confidence: 'medium' },
            { id: 'f11', name: 'Café solo bio', quantityDescription: '1 taza (~100ml)', weightGrams: 100, calories: 2, protein: 0.1, carbs: 0.3, fats: 0, fiber: 0, confidence: 'high' }
          ]
        };
    }
  }
}

export const fastFoodParser = new FastFoodParser();
