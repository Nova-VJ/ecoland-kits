import { dailyNutritionStore, PantryItem } from './dailyNutritionStore';
import { foodVisionEngine, IdentifiedFoodResult } from '@/lib/foodVisionEngine';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';

export interface DynamicCoachSuggestion {
  title: string;
  timeMinutes: number;
  calories: number;
  protein: number;
  fiber: number;
  description: string;
  pantryIngredients: string[];
  missingIngredients: string[];
  steps: string[];
  associatedProduct?: CatalogProduct;
}

export class CoachKnowledgeEngine {
  private static RECIPES_CATALOG: DynamicCoachSuggestion[] = [
    {
      title: "Tostada crujiente integral con aguacate y semillas bio",
      timeMinutes: 4,
      calories: 230,
      protein: 6.5,
      fiber: 5.5,
      description: "Desayuno o cena ultra veloz en 4 minutos con grasas cardiosaludables.",
      pantryIngredients: ["Pan integral biológico", "Aguacate maduro", "Semillas de chía y lino", "AOVE"],
      missingIngredients: [],
      steps: [
        "Tostar una rebanada de pan integral 2 minutos.",
        "Chafar medio aguacate con tenedor, sal marina y unas gotas de limón.",
        "Untar sobre la tostada y coronar con semillas y AOVE en crudo."
      ]
    },
    {
      title: "Ensalada exprés de tomate bio con garbanzos y orégano",
      timeMinutes: 5,
      calories: 260,
      protein: 11,
      fiber: 7,
      description: "Sin encender fuegos, nutritiva y lista en solo 5 minutos.",
      pantryIngredients: ["Garbanzos cocidos bio", "Tomate fresco de temporada", "Orégano silvestre", "AOVE"],
      missingIngredients: [],
      steps: [
        "Enjuagar medio tarro de garbanzos cocidos ecológicos.",
        "Trocear 1 tomate maduro en dados.",
        "Mezclar con garbanzos, generoso orégano, sal marina y AOVE virgen extra."
      ]
    },
    {
      title: "Tortilla francesa esponjosa con hojas verdes y AOVE",
      timeMinutes: 7,
      calories: 220,
      protein: 14,
      fiber: 2,
      description: "Cena ultrarrápida, saciante y rica en colina y proteína limpia.",
      pantryIngredients: ["Huevos ecológicos", "Aceite de Oliva Virgen Extra", "Espinacas bio"],
      missingIngredients: [],
      steps: [
        "Batir dos huevos ecológicos con una pizca de sal marina.",
        "Cuajar en sartén con un hilo de AOVE a fuego medio durante 3 minutos.",
        "Doblar con cuidado y servir con brotes verdes frescos de la huerta."
      ]
    },
    {
      title: "Salteado exprés de garbanzos con pimentón y espinacas",
      timeMinutes: 10,
      calories: 320,
      protein: 15,
      fiber: 9,
      description: "Plato templado completo usando legumbre en conserva de cristal sin aditivos.",
      pantryIngredients: ["Garbanzos cocidos extra bio", "Espinacas frescas", "Pimentón dulce", "AOVE"],
      missingIngredients: [],
      steps: [
        "Dorar un diente de ajo laminado en AOVE (2 min).",
        "Añadir las espinacas hasta que reduzcan de volumen (3 min).",
        "Incorporar los garbanzos escurridos con pimentón y saltear enérgicamente (5 min)."
      ]
    },
    {
      title: "Tostada crujiente de masa madre con hummus y semillas de chía",
      timeMinutes: 5,
      calories: 290,
      protein: 11,
      fiber: 7,
      description: "Cero cocción: energía limpia y grasas cardiosaludables en 5 minutos.",
      pantryIngredients: ["Pan de masa madre integral", "Hummus bio", "Semillas de chía bio"],
      missingIngredients: [],
      steps: [
        "Tostar una rebanada gruesa de pan integral de masa madre.",
        "Untar generosamente con hummus ecológico.",
        "Espolvorear semillas de chía y unas gotas de zumo de limón fresco."
      ]
    },
    {
      title: "Bowl templado de quinoa real con salteado de calabacín y tomate",
      timeMinutes: 12,
      calories: 340,
      protein: 12,
      fiber: 8,
      description: "Aminograma completo con digestión ligera para un descanso reparador.",
      pantryIngredients: ["Quinoa real cocida", "Calabacín de huerta", "Tomate fresco", "AOVE"],
      missingIngredients: [],
      steps: [
        "Saltear dados de calabacín y tomate en sartén antiadherente con AOVE (6 min).",
        "Añadir la quinoa cocida y saltear todo junto para que se impregne de aromas (4 min).",
        "Rectificar con orégano silvestre y sal marina sin refinar."
      ]
    },
    {
      title: "Crema reconfortante de calabacín y avena con semillas",
      timeMinutes: 12,
      calories: 280,
      protein: 10,
      fiber: 7.2,
      description: "Aprovecha los copos de avena para ligar la crema de forma natural y sedosa.",
      pantryIngredients: ["Calabacín bio", "Copos de avena integrales", "AOVE Ecológico"],
      missingIngredients: [],
      steps: [
        "Cocer a fuego suave calabacín troceado con 2 cucharadas de copos de avena y agua justa.",
        "Triturar con un hilo de AOVE hasta lograr una emulsión cremosa aterciopelada.",
        "Coronar con semillas tostadas antes de servir."
      ]
    },
    {
      title: "Ensalada tibia de lentejas con dados de manzana y vinagre de manzana",
      timeMinutes: 8,
      calories: 310,
      protein: 16,
      fiber: 10,
      description: "Fibra prebiótica y toque crujiente agridulce que sienta de maravilla.",
      pantryIngredients: ["Lentejas cocidas al natural", "Manzana bio", "Vinagre de manzana sin filtrar"],
      missingIngredients: [],
      steps: [
        "Enjuagar y escurrir las lentejas cocidas.",
        "Cortar media manzana en dados pequeños y mezclar con las lentejas.",
        "Aliñar con AOVE, vinagre de manzana bio y pimienta recién molida."
      ]
    }
  ];

  public static getRecommendations(timeRequestedMinutes: number, userPreference = '', avoidAllergens: string[] = []): DynamicCoachSuggestion[] {
    const pref = userPreference.toLowerCase();
    
    // Filtro estricto de alérgenos declarados por el usuario
    let pool = this.RECIPES_CATALOG;
    if (avoidAllergens.includes('gluten')) {
      pool = pool.filter(r => !r.title.toLowerCase().includes('pan') && !r.title.toLowerCase().includes('tostada') && !r.pantryIngredients.some(i => i.toLowerCase().includes('trigo') || i.toLowerCase().includes('pan')));
    }
    if (avoidAllergens.includes('huevos') || avoidAllergens.includes('huevo')) {
      pool = pool.filter(r => !r.title.toLowerCase().includes('tortilla') && !r.pantryIngredients.some(i => i.toLowerCase().includes('huevo')));
    }
    if (avoidAllergens.includes('lacteos') || avoidAllergens.includes('leche')) {
      pool = pool.filter(r => !r.pantryIngredients.some(i => i.toLowerCase().includes('queso') || i.toLowerCase().includes('leche') || i.toLowerCase().includes('yogur')));
    }

    // Si todos los platos se filtraran, mantenemos los seguros
    if (pool.length === 0) {
      pool = this.RECIPES_CATALOG.filter(r => r.title.toLowerCase().includes('garbanzos') || r.title.toLowerCase().includes('quinoa'));
    }

    // Filtro por tiempo disponible real (priorizar recetas que no superen el tiempo)
    let strictMatches = pool.filter(r => r.timeMinutes <= timeRequestedMinutes);
    let matches = strictMatches.length > 0 
      ? strictMatches 
      : pool.filter(r => r.timeMinutes <= timeRequestedMinutes + 2);
    if (matches.length === 0) {
      matches = pool;
    }

    if (pref.includes('dulce') || pref.includes('avena')) {
      const sweet = this.RECIPES_CATALOG.find(r => r.title.toLowerCase().includes('avena'));
      if (sweet) matches.unshift(sweet);
    } else if (pref.includes('ensalada') || pref.includes('frío') || pref.includes('frio')) {
      const cold = this.RECIPES_CATALOG.filter(r => r.title.toLowerCase().includes('ensalada') || r.title.toLowerCase().includes('tostada'));
      if (cold.length > 0) matches = cold;
    }

    // Asociar productos de Ecoland
    return matches.map(m => {
      const prod = allCatalogProducts.find(p => 
        p.name.toLowerCase().includes(m.pantryIngredients[0]?.toLowerCase().split(' ')[0] || '')
      ) || allCatalogProducts[0];
      return {
        ...m,
        associatedProduct: prod
      };
    });
  }
}
