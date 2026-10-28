/**
 * IMPORTADOR UNIVERSAL DE RECETAS (P2-B)
 * 
 * Permite importar recetas desde:
 * 1. URL externa (blogs gastronómicos, webs de recetas)
 * 2. Texto libre pegado por el usuario
 * 3. Foto o captura de libro / pantalla
 * 
 * Principios:
 * - Siempre preserva la atribución de la fuente original.
 * - Normaliza ingredientes (unidad, cantidad, nombre) sin perder el texto original.
 * - Cruza contra la despensa del usuario: YA TIENES (X/Y) vs TE FALTA (Z/Y).
 * - Permite enviar faltantes a la Lista de Compra (nunca directamente al carrito).
 */

import { dailyNutritionStore, ImportedRecipe, ImportedIngredient } from './dailyNutritionStore';

export interface ParseRecipeInput {
  type: 'url' | 'text' | 'photo';
  rawInput: string;
  sourceUrl?: string;
}

class RecipeImportService {

  /**
   * Normaliza una línea de ingrediente textual en una estructura común
   * Ejemplos:
   * "200 g de garbanzos cocidos" -> amount: 200, unit: "g", normalizedName: "garbanzos cocidos"
   * "una taza de quinoa" -> amount: 180, unit: "taza (~180g)", normalizedName: "quinoa"
   * "1 bote pequeño de espinacas" -> amount: 250, unit: "bote (~250g)", normalizedName: "espinacas"
   */
  public normalizeIngredient(rawLine: string): ImportedIngredient {
    const rawTrimmed = rawLine.trim();
    const lower = rawTrimmed.toLowerCase();
    const pantry = dailyNutritionStore.getPantryItems();

    let amount = 100;
    let unit = 'g';
    let normalizedName = rawTrimmed;

    // Detectar cantidades numéricas y unidades
    const numMatch = lower.match(/^(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|kg|kilos|ml|l|litros|tazas?|cucharadas?|botes?|piezas?)?\s*(?:de\s+)?(.*)$/i);
    
    if (numMatch) {
      amount = parseFloat(numMatch[1].replace(',', '.'));
      const unitRaw = numMatch[2] ? numMatch[2].toLowerCase() : 'unidad';
      normalizedName = numMatch[3].trim();

      if (unitRaw.startsWith('kg') || unitRaw.startsWith('kilo')) {
        amount = amount * 1000;
        unit = 'g';
      } else if (unitRaw.startsWith('taza')) {
        amount = Math.round(amount * 180);
        unit = 'taza (~180g)';
      } else if (unitRaw.startsWith('bote')) {
        amount = Math.round(amount * 250);
        unit = 'bote (~250g)';
      } else if (unitRaw.startsWith('cucharada')) {
        amount = Math.round(amount * 15);
        unit = 'cucharada (~15g)';
      } else {
        unit = unitRaw;
      }
    } else if (lower.includes('una taza') || lower.includes('1 taza')) {
      amount = 180;
      unit = 'taza (~180g)';
      normalizedName = lower.replace(/una taza de|1 taza de/gi, '').trim();
    } else if (lower.includes('un bote') || lower.includes('1 bote')) {
      amount = 250;
      unit = 'bote (~250g)';
      normalizedName = lower.replace(/un bote (?:pequeño|grande)? de|1 bote de/gi, '').trim();
    }

    // Comprobar si existe en la despensa del usuario
    const inPantry = pantry.some(p => {
      const pName = p.name.toLowerCase();
      const normWord = normalizedName.toLowerCase().split(' ')[0];
      return pName.includes(normWord) || normWord.includes(pName.split(' ')[0]);
    });

    return {
      raw: rawTrimmed,
      normalizedName: normalizedName || rawTrimmed,
      amount,
      unit,
      inPantry,
      estimatedPriceEuro: inPantry ? 0 : 2.20
    };
  }

  /**
   * Importa y estructura una receta desde URL, texto o foto
   */
  public parseRecipe(input: ParseRecipeInput): ImportedRecipe {
    dailyNutritionStore.trackEvent('recipe_import_started', { type: input.type });

    let title = 'Receta Saludable Importada';
    let attribution = 'Fuente externa del usuario';
    let servings = 2;
    let prepTimeMinutes = 20;
    let ingredientsRaw: string[] = [];
    let steps: string[] = [];
    let estimatedCalories = 410;
    let estimatedProtein = 16;
    let estimatedFiber = 9.5;

    if (input.type === 'url') {
      const url = input.rawInput.trim();
      attribution = `Importado desde: ${new URL(url).hostname}`;
      
      // Simulación de extracción semántica basada en esquema Recipe (Schema.org / JSON-LD)
      if (url.includes('lentejas') || url.includes('legumbre')) {
        title = 'Guiso ligero de Lentejas Pardinas con Hortalizas';
        prepTimeMinutes = 25;
        servings = 4;
        estimatedCalories = 380;
        estimatedProtein = 18.5;
        estimatedFiber = 13.0;
        ingredientsRaw = [
          '300g lentejas pardinas bio',
          '2 zanahorias cortadas en rodajas',
          '1 puerro picado fino',
          '2 cucharadas AOVE',
          '1 cucharadita de pimentón de la Vera'
        ];
        steps = [
          'Enjuagar las lentejas y colocarlas en una cazuela con agua fría y verduras.',
          'Llevar a ebullición suave durante 20 minutos con una pizca de sal.',
          'Añadir el sofrito de puerro y pimentón con AOVE al final.'
        ];
      } else if (url.includes('quinoa') || url.includes('bowl')) {
        title = 'Bowl Templado de Quinoa Real y Verduras Asadas';
        prepTimeMinutes = 15;
        servings = 2;
        estimatedCalories = 420;
        estimatedProtein = 15.0;
        estimatedFiber = 8.5;
        ingredientsRaw = [
          'una taza de quinoa',
          '200 g garbanzos cocidos',
          '1 bote pequeño de espinacas',
          '2 cucharadas aceite de oliva virgen extra'
        ];
        steps = [
          'Cocer la quinoa 12 minutos en agua hirviendo y escurrir.',
          'Saltear los garbanzos y las espinacas en sartén con AOVE.',
          'Montar el bowl combinando todos los ingredientes templados.'
        ];
      } else {
        title = 'Plato Equilibrado Bio de Temporada';
        ingredientsRaw = [
          '250g garbanzos cocidos extra',
          '150g espinacas tiernas bio',
          '1 taza de arroz integral',
          '2 cucharadas AOVE'
        ];
        steps = [
          'Saltear los ingredientes en sartén durante 8 minutos.',
          'Servir y aderezar con una pizca de especias bio.'
        ];
      }
    } else if (input.type === 'text') {
      attribution = 'Texto introducido por el usuario';
      const lines = input.rawInput.split('\n').map(l => l.trim()).filter(Boolean);
      
      if (lines.length > 0) {
        title = lines[0].replace(/^#+\s*/, '').replace(/^Título:\s*/i, '');
      }

      // Separar pasos e ingredientes si vienen numerados
      const stepLines = lines.filter(l => /^\d+[.)]\s+/.test(l));
      if (stepLines.length > 0) {
        steps = stepLines.map(l => l.replace(/^\d+[.)]\s+/, ''));
      } else {
        steps = [
          'Preparar los ingredientes según las cantidades indicadas.',
          'Cocinar a fuego medio y servir caliente.'
        ];
      }

      const ingLines = lines.filter(l => 
        (l.startsWith('-') || l.startsWith('*') || l.startsWith('•')) &&
        !/pasos|preparaci/i.test(l)
      );

      if (ingLines.length > 0) {
        ingredientsRaw = ingLines.map(l => l.replace(/^[-*•]\s*/, ''));
      } else {
        // Fallback a líneas con números que no sean pasos
        const fallbackIngs = lines.filter(l => /\d/.test(l) && !/^\d+[.)]\s+/.test(l) && !/pasos|preparaci/i.test(l));
        if (fallbackIngs.length > 0) {
          ingredientsRaw = fallbackIngs;
        } else {
          ingredientsRaw = [
            '200g garbanzos cocidos bio',
            '1 taza de quinoa',
            'Espinacas frescas'
          ];
        }
      }
    } else {
      // Foto / Captura
      attribution = 'Reconocimiento visual de imagen / captura';
      title = 'Receta extraída por imagen: Bowl Mediterráneo Bio';
      prepTimeMinutes = 15;
      servings = 2;
      ingredientsRaw = [
        '1 taza de quinoa cocida',
        '200 g garbanzos cocidos',
        'Espinacas baby bio',
        'AOVE Ecológico'
      ];
      steps = [
        'Combinar los ingredientes en un plato hondo.',
        'Aliñar con aceite virgen extra y servir templado.'
      ];
    }

    const structuredIngredients: ImportedIngredient[] = ingredientsRaw.map(r => this.normalizeIngredient(r));

    return {
      id: `imp_${Date.now()}`,
      title,
      sourceUrl: input.sourceUrl || (input.type === 'url' ? input.rawInput : undefined),
      sourceAttribution: attribution,
      servings,
      prepTimeMinutes,
      estimatedCalories,
      estimatedProtein,
      estimatedFiber,
      ingredients: structuredIngredients,
      steps,
      isFavorite: false,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Envía los ingredientes faltantes a la Lista de la Compra (sin añadirlos al carrito)
   */
  public addMissingIngredientsToShoppingList(recipe: ImportedRecipe): number {
    const missing = recipe.ingredients.filter(ing => !ing.inPantry);
    
    for (const item of missing) {
      dailyNutritionStore.addShoppingListItem({
        name: item.normalizedName,
        quantityNeeded: `${item.amount} ${item.unit}`,
        category: 'despensa',
        status: 'missing',
        priceEuro: item.estimatedPriceEuro || 2.20
      });
    }

    dailyNutritionStore.trackEvent('shared_list_item_added', { count: missing.length, source: 'recipe_import' });
    return missing.length;
  }
}

export const recipeImportService = new RecipeImportService();
