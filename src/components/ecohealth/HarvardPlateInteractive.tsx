import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, CheckCircle2, RotateCcw, AlertCircle, 
  HelpCircle, ChevronRight, Check, Trash2, ArrowRight, Search,
  Activity, ShieldCheck, Heart, Flame, Scale, Plus, Calendar,
  Filter, Sparkles, X, ChevronDown, CheckCircle, Droplet, Utensils, Info, Sparkle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { useToast } from '@/hooks/use-toast';

export interface HarvardPlateProps {
  onGoToStore?: () => void;
}

export interface PlateFoodItem {
  id: string;
  category: 'vegetales' | 'granos' | 'proteinas' | 'grasas';
  subcategoryKey: string;
  product: CatalogProduct;
  grams: number;
  iconLabel: string;
  displayName: string;
  emoji: string;
}

// Limpiador estético del nombre del producto
function cleanProductName(name: string): string {
  const parts = name.split('–');
  if (parts.length > 1) {
    let clean = parts[1].trim();
    clean = clean.replace(/""/g, '').replace(/Formato estándar/gi, '').trim();
    clean = clean.split('“')[0].split('"')[0].trim();
    return clean.length > 32 ? clean.substring(0, 32) + '…' : clean;
  }
  return name.length > 32 ? name.substring(0, 32) + '…' : name;
}

// Horizontes temporales
export type TimeHorizon = '1-semana' | '1-mes' | '1.5-meses' | '2-meses' | '3-meses' | '6-meses' | '1-ano';

interface HorizonConfig {
  id: TimeHorizon;
  label: string;
  days: number;
  mealsPerPerson: number;
}

const HORIZONS: HorizonConfig[] = [
  { id: '1-semana', label: '1 Semana', days: 7, mealsPerPerson: 14 },
  { id: '1-mes', label: '1 Mes', days: 30, mealsPerPerson: 60 },
  { id: '1.5-meses', label: '1 Mes y medio', days: 45, mealsPerPerson: 90 },
  { id: '2-meses', label: '2 Meses', days: 60, mealsPerPerson: 120 },
  { id: '3-meses', label: '3 Meses (Trimestre)', days: 90, mealsPerPerson: 180 },
  { id: '6-meses', label: '6 Meses', days: 180, mealsPerPerson: 360 },
  { id: '1-ano', label: '1 Año Completo', days: 365, mealsPerPerson: 730 },
];

// Estructura de Subcategoría Genérica para el Plato de Harvard
export interface FoodSubcategory {
  id: string;
  category: 'vegetales' | 'granos' | 'proteinas' | 'grasas';
  name: string;
  subtitle: string;
  emoji: string;
  defaultGrams: number;
  keywords: string[];
  harvardRecommendation: string;
}

// LAS 16 SUBCATEGORÍAS DETALLADAS (MÍNIMO 4 POR CADA CUADRANTE DE HARVARD)
export const HARVARD_SUBCATEGORIES: FoodSubcategory[] = [
  // ==========================================
  // 1. VEGETALES, HORTALIZAS Y FRUTAS (50%)
  // ==========================================
  {
    id: 'sub-hojas-verdes',
    category: 'vegetales',
    name: 'Hojas Verdes & Ensaladas',
    subtitle: 'Lechuga batavia bio, espinacas tiernas, acelgas, rúcula',
    emoji: '🥬',
    defaultGrams: 500,
    keywords: ['lechuga', 'espinaca', 'acelga', 'brotes', 'rucula', 'ensalada'],
    harvardRecommendation: 'Base rica en folatos, clorofila y fibra viva.'
  },
  {
    id: 'sub-hortalizas-raiz',
    category: 'vegetales',
    name: 'Hortalizas de Raíz & Tubérculos Bio',
    subtitle: 'Zanahorias dulces de huerta, remolacha, puerros, rábanos',
    emoji: '🥕',
    defaultGrams: 500,
    keywords: ['zanahoria', 'remolacha', 'puerro', 'rabano', 'nabo'],
    harvardRecommendation: 'Carotenos protectores y minerales del suelo fértil.'
  },
  {
    id: 'sub-cruciferas-huerta',
    category: 'vegetales',
    name: 'Crucíferas & Verduras de Huerta',
    subtitle: 'Brócoli al vapor, coliflor, calabacín, tomate bio, pimiento',
    emoji: '🥦',
    defaultGrams: 500,
    keywords: ['brocoli', 'coliflor', 'calabacin', 'tomate', 'pimiento', 'menestra', 'alcachofa'],
    harvardRecommendation: 'Sulforafano antioxidante y vitamina C sin procesar.'
  },
  {
    id: 'sub-frutas-bayas',
    category: 'vegetales',
    name: 'Frutas Frescas & Frutos Rojos',
    subtitle: 'Manzanas bio, plátano ecológico, arándanos, compota pura',
    emoji: '🍎',
    defaultGrams: 250,
    keywords: ['manzana', 'platano', 'arandano', 'acai', 'frambuesa', 'compota', 'fruta'],
    harvardRecommendation: 'Fruta entera de todos los colores. Evitar zumos industriales.'
  },

  // ==========================================
  // 2. GRANOS Y CEREALES INTEGRALES (25%)
  // ==========================================
  {
    id: 'sub-copos-avena',
    category: 'granos',
    name: 'Copos & Avena para Desayuno',
    subtitle: 'Copos de avena integral finos y gruesos, muesli de frutas',
    emoji: '🥣',
    defaultGrams: 500,
    keywords: ['avena', 'copos de avena', 'muesli', 'porridge'],
    harvardRecommendation: 'Betaglucanos para el colesterol y energía matutina sostenida.'
  },
  {
    id: 'sub-arroces-integrales',
    category: 'granos',
    name: 'Arroces Integrales & Salvajes',
    subtitle: 'Arroz integral redondo, arroz basmati bio, arroz con miso genmai',
    emoji: '🍚',
    defaultGrams: 500,
    keywords: ['arroz', 'basmati', 'genmai'],
    harvardRecommendation: 'El grano completo preserva el germen y el salvado nutritivo.'
  },
  {
    id: 'sub-pseudocereales',
    category: 'granos',
    name: 'Pseudocereales & Granos Ancestrales',
    subtitle: 'Quinoa real bio de los Andes, trigo sarraceno, copos de espelta',
    emoji: '🌾',
    defaultGrams: 500,
    keywords: ['quinoa', 'sarraceno', 'espelta', 'cebada', 'mijo'],
    harvardRecommendation: 'Ricos en magnesio y aminoácidos esenciales sin picos de glucosa.'
  },
  {
    id: 'sub-pastas-panes',
    category: 'granos',
    name: 'Pastas & Panes 100% Integrales',
    subtitle: 'Macarrones de espelta integral, espaguetis bio, tortas crujientes',
    emoji: '🥖',
    defaultGrams: 500,
    keywords: ['macarron', 'espelta', 'pasta', 'torta', 'tortitas'],
    harvardRecommendation: 'Harina de molienda integral completa en lugar de grano refinado.'
  },

  // ==========================================
  // 3. PROTEÍNAS SALUDABLES (25%)
  // ==========================================
  {
    id: 'sub-legumbres',
    category: 'proteinas',
    name: 'Legumbres Castellanas & Guisos',
    subtitle: 'Garbanzos cocidos castellanos, lentejas pardinas bio, alubias',
    emoji: '🫘',
    defaultGrams: 500,
    keywords: ['garbanzo', 'lenteja', 'alubia'],
    harvardRecommendation: 'La mejor fuente proteica: fibra, hierro y cero grasas saturadas.'
  },
  {
    id: 'sub-proteina-vegetal',
    category: 'proteinas',
    name: 'Proteína Vegetal, Tofu & Tempeh',
    subtitle: 'Tofu fresco bio, vegenuggets bio, tempeh clásico ecológico',
    emoji: '🧊',
    defaultGrams: 250,
    keywords: ['tofu', 'tempeh', 'proteina'],
    harvardRecommendation: 'Proteína vegetal de alta digestibilidad y sostenibilidad.'
  },
  {
    id: 'sub-huevos-lacteos',
    category: 'proteinas',
    name: 'Huevos Camperos & Lácteos Bio',
    subtitle: 'Huevos ecológicos camperos, kéfir artesano, yogur bio de cabra',
    emoji: '🥚',
    defaultGrams: 500,
    keywords: ['huevo', 'huevos', 'colageno'],
    harvardRecommendation: 'Origen ecológico de gallinas libres. Moderar quesos grasos.'
  },
  {
    id: 'sub-pescados-conservas',
    category: 'proteinas',
    name: 'Pescados Azules & Conservas Nobles',
    subtitle: 'Bonito del norte en AOVE, atún claro al natural, filetes de caballa',
    emoji: '🐟',
    defaultGrams: 250,
    keywords: ['bonito', 'atun', 'caballa'],
    harvardRecommendation: 'Ácidos grasos Omega-3 de pescados pequeños y limpios.'
  },

  // ==========================================
  // 4. GRASAS SALUDABLES & ADEREZOS (CENTRO)
  // ==========================================
  {
    id: 'sub-aove',
    category: 'grasas',
    name: 'Aceite de Oliva Virgen Extra (AOVE)',
    subtitle: 'AOVE ecológico de primera presión en frío, oro líquido de olivares',
    emoji: '🫒',
    defaultGrams: 250,
    keywords: ['oliva', 'aceite de oliva', 'virgen extra'],
    harvardRecommendation: 'Grasa monoinsaturada principal. Usar en crudo y cocina suave.'
  },
  {
    id: 'sub-frutos-secos',
    category: 'grasas',
    name: 'Frutos Secos Crudos & Tostados',
    subtitle: 'Almendras crudas con piel bio, nueces de Castilla, macadamias',
    emoji: '🥜',
    defaultGrams: 250,
    keywords: ['almendra', 'nuez', 'macadamia'],
    harvardRecommendation: 'Grasas cardioprotectoras, vitamina E y efecto saciante.'
  },
  {
    id: 'sub-semillas-omega',
    category: 'grasas',
    name: 'Semillas Bio & Omega-3',
    subtitle: 'Semillas de chía bio, lino dorado molido, semillas de calabaza',
    emoji: '🌻',
    defaultGrams: 250,
    keywords: ['chia', 'lino', 'sesamo', 'semillas'],
    harvardRecommendation: 'Ácido alfa-linolénico (ALA) y fibra mucilaginosa para el colon.'
  },
  {
    id: 'sub-aguacate-especiales',
    category: 'grasas',
    name: 'Aguacate Bio & Aceites Nobles',
    subtitle: 'Aguacate fresco ecológico en su punto, aceite de aguacate y coco',
    emoji: '🥑',
    defaultGrams: 250,
    keywords: ['aguacate', 'coco'],
    harvardRecommendation: 'Ácido oleico natural y cremosidad vegetal sin grasas trans.'
  }
];

export const HarvardPlateInteractive = ({ onGoToStore }: HarvardPlateProps) => {
  const { addCatalogProduct, setIsOpen } = useCart();
  const { toast } = useToast();

  // Horizonte temporal & Hogar
  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizon>('1-semana');
  const [householdSize, setHouseholdSize] = useState<number>(2);

  // Perfil dietético (vegano, celíaco, omnívoro)
  const [dietType, setDietType] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ecoland-harvard-diet');
      return saved || 'omnivoro';
    } catch {
      return 'omnivoro';
    }
  });

  const [hasCompletedTest, setHasCompletedTest] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('ecoland-harvard-diet'));
    } catch {
      return false;
    }
  });

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Buscadores individuales por categoría
  const [searchVeg, setSearchVeg] = useState('');
  const [searchGrains, setSearchGrains] = useState('');
  const [searchProt, setSearchProt] = useState('');
  const [searchOils, setSearchOils] = useState('');

  // Explorador general de todo el catálogo (+1.000)
  const [isCatalogExplorerOpen, setIsCatalogExplorerOpen] = useState(false);
  const [explorerCategory, setExplorerCategory] = useState<'todos' | 'vegetales' | 'granos' | 'proteinas' | 'aceites'>('todos');
  const [explorerSearch, setExplorerSearch] = useState('');

  // Drag and drop & animación de pulso
  const [dragOverZone, setDragOverZone] = useState<'vegetales' | 'granos' | 'proteinas' | 'grasas' | null>(null);
  const [lastAddedZone, setLastAddedZone] = useState<string | null>(null);

  // Alimentos colocados en el plato (arranque equilibrado por defecto)
  const [plateItems, setPlateItems] = useState<PlateFoodItem[]>(() => [
    {
      id: 'default-1',
      category: 'vegetales',
      subcategoryKey: 'sub-cruciferas-huerta',
      product: allCatalogProducts.find(p => p.slug.includes('lentejas-con-verduras') || p.slug.includes('tomate')) || allCatalogProducts[0],
      grams: 500,
      iconLabel: 'HUERTA BIO',
      displayName: 'Zanahoria & Hortalizas de Huerta',
      emoji: '🥕'
    },
    {
      id: 'default-2',
      category: 'vegetales',
      subcategoryKey: 'sub-hojas-verdes',
      product: allCatalogProducts.find(p => p.slug.includes('lechuga') || p.slug.includes('espinaca')) || allCatalogProducts[1],
      grams: 500,
      iconLabel: 'HOJA VERDE',
      displayName: 'Lechuga Batavia Ecológica',
      emoji: '🥬'
    },
    {
      id: 'default-3',
      category: 'granos',
      subcategoryKey: 'sub-copos-avena',
      product: allCatalogProducts.find(p => p.slug.includes('copos-de-avena')) || allCatalogProducts[2],
      grams: 500,
      iconLabel: 'AVENA BIO',
      displayName: 'Copos de Avena Integral Suaves',
      emoji: '🥣'
    },
    {
      id: 'default-4',
      category: 'proteinas',
      subcategoryKey: 'sub-legumbres',
      product: allCatalogProducts.find(p => p.slug.includes('garbanzo')) || allCatalogProducts[3],
      grams: 660,
      iconLabel: 'GARBANZO BIO',
      displayName: 'Garbanzos Cocidos Castellanos',
      emoji: '🫘'
    },
    {
      id: 'default-5',
      category: 'grasas',
      subcategoryKey: 'sub-aove',
      product: allCatalogProducts.find(p => p.slug.includes('aceite-de-oliva') || p.slug.includes('oliva')) || allCatalogProducts[4],
      grams: 250,
      iconLabel: 'AOVE BIO',
      displayName: 'Aceite Oliva Virgen Extra Ecológico',
      emoji: '🫒'
    }
  ]);

  // Filtrado de catálogo según perfil
  const filteredCatalog = useMemo(() => {
    let prods = allCatalogProducts;
    if (dietType === 'vegano') {
      prods = prods.filter(p => p.tags.includes('vegano') || p.category === 'legumbres' || p.category === 'desayunos' || p.category === 'aceites');
    } else if (dietType === 'celiaco') {
      prods = prods.filter(p => p.tags.includes('sin-gluten') || p.category === 'aceites');
    }
    return prods;
  }, [dietType]);

  // Catálogos específicos por grupo
  const vegCatalog = useMemo(() => {
    return filteredCatalog.filter(p => {
      const name = (p.name + ' ' + p.description).toLowerCase();
      return name.includes('verdura') || name.includes('tomate') || name.includes('zanahoria') || 
             name.includes('lechuga') || name.includes('espinaca') || name.includes('brocoli') ||
             name.includes('arandano') || name.includes('fruta') || name.includes('acai') ||
             name.includes('manzana') || name.includes('gazpacho') || name.includes('alcachofa') ||
             name.includes('pimiento') || name.includes('menestra');
    });
  }, [filteredCatalog]);

  const grainCatalog = useMemo(() => {
    return filteredCatalog.filter(p => {
      const name = (p.name + ' ' + p.description).toLowerCase();
      return p.category === 'desayunos' || name.includes('avena') || name.includes('arroz') || 
             name.includes('quinoa') || name.includes('espelta') || name.includes('trigo') || 
             name.includes('cereal') || name.includes('pasta') || name.includes('macarron');
    });
  }, [filteredCatalog]);

  const protCatalog = useMemo(() => {
    return filteredCatalog.filter(p => {
      const name = (p.name + ' ' + p.description).toLowerCase();
      return p.category === 'legumbres' || name.includes('garbanzo') || name.includes('lenteja') || 
             name.includes('alubia') || name.includes('tofu') || name.includes('tempeh') || 
             name.includes('huevo') || name.includes('bonito') || name.includes('atun') ||
             name.includes('proteina') || name.includes('seitan');
    });
  }, [filteredCatalog]);

  const oilCatalog = useMemo(() => {
    return filteredCatalog.filter(p => {
      const name = (p.name + ' ' + p.description).toLowerCase();
      return p.category === 'aceites' || name.includes('aceite') || name.includes('oliva') || 
             name.includes('aove') || name.includes('almendra') || name.includes('nuez') ||
             name.includes('chia') || name.includes('aguacate');
    });
  }, [filteredCatalog]);

  // Metas según horizonte temporal seleccionado
  const currentHorizonConfig = HORIZONS.find(h => h.id === selectedHorizon) || HORIZONS[0];
  const totalMealsTarget = currentHorizonConfig.mealsPerPerson * householdSize;

  const targetVegGrams = Math.round(totalMealsTarget * 250);
  const targetGrainGrams = Math.round(totalMealsTarget * 125);
  const targetProtGrams = Math.round(totalMealsTarget * 125);
  const targetTotalGrams = targetVegGrams + targetGrainGrams + targetProtGrams;

  // Añadir alimento al plato
  const addFoodToPlate = (
    product: CatalogProduct, 
    category: 'vegetales' | 'granos' | 'proteinas' | 'grasas', 
    grams = 500, 
    iconLabel = 'ALIMENTO BIO',
    emoji = '🥗',
    subcategoryKey = ''
  ) => {
    const newItem: PlateFoodItem = {
      id: `${product.slug}-${Date.now()}-${Math.random()}`,
      category,
      subcategoryKey,
      product,
      grams,
      iconLabel,
      displayName: cleanProductName(product.name),
      emoji
    };

    setPlateItems(prev => [...prev, newItem]);
    setLastAddedZone(category);
    setTimeout(() => setLastAddedZone(null), 800);

    toast({
      title: `${emoji} ¡Lanzado al plato!`,
      description: `${newItem.displayName} (+${grams >= 1000 ? `${(grams/1000).toFixed(1)}kg` : `${grams}g`}) sumado a tu despensa.`,
    });
  };

  // LANZAMIENTO GENÉRICO POR SUBCATEGORÍA (LA PERSONA NO TIENE QUE BUSCAR ENTRE 1.000 PRODUCTOS)
  const addGenericSubcategoryToPlate = (sub: FoodSubcategory) => {
    let pool: CatalogProduct[] = [];
    if (sub.category === 'vegetales') pool = vegCatalog;
    else if (sub.category === 'granos') pool = grainCatalog;
    else if (sub.category === 'proteinas') pool = protCatalog;
    else pool = oilCatalog;

    if (pool.length === 0) pool = filteredCatalog;

    // Buscar coincidencia exacta por palabras clave
    let matched = pool.filter(p => {
      const txt = (p.name + ' ' + p.description).toLowerCase();
      return sub.keywords.some(k => txt.includes(k));
    });

    if (matched.length === 0) matched = pool;
    // Seleccionar producto real representativo
    const selectedProduct = matched[Math.floor(Math.random() * matched.length)] || pool[0];

    // Escalar ración si el horizonte es mayor de 1 mes
    const scaledGrams = currentHorizonConfig.days >= 30 ? sub.defaultGrams * 2 : sub.defaultGrams;

    addFoodToPlate(selectedProduct, sub.category, scaledGrams, sub.name.toUpperCase(), sub.emoji, sub.id);
  };

  const removePlateItem = (id: string) => {
    setPlateItems(prev => prev.filter(x => x.id !== id));
  };

  // Manejo de Drag and Drop
  const handleDragStart = (e: React.DragEvent, slug: string, category: string, iconLabel: string, emoji = '🥗') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ slug, category, iconLabel, emoji }));
  };

  const handleDropOnZone = (e: React.DragEvent, targetCategory: 'vegetales' | 'granos' | 'proteinas' | 'grasas') => {
    e.preventDefault();
    setDragOverZone(null);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      
      const foundProduct = allCatalogProducts.find(p => p.slug === data.slug);
      if (foundProduct) {
        const grams = targetCategory === 'vegetales' ? 1000 : 500;
        addFoodToPlate(foundProduct, targetCategory, grams, data.iconLabel || 'ALIMENTO', data.emoji || '🥗');
      }
    } catch (err) {
      console.error('Error in drop handler', err);
    }
  };

  // Cálculos nutricionales del plato
  const currentTotalGrams = plateItems.reduce((acc, it) => acc + it.grams, 0) || 1;
  const currentVegGrams = plateItems.filter(it => it.category === 'vegetales').reduce((acc, it) => acc + it.grams, 0);
  const currentGrainGrams = plateItems.filter(it => it.category === 'granos').reduce((acc, it) => acc + it.grams, 0);
  const currentProtGrams = plateItems.filter(it => it.category === 'proteinas').reduce((acc, it) => acc + it.grams, 0);
  const currentOilGrams = plateItems.filter(it => it.category === 'grasas').reduce((acc, it) => acc + it.grams, 0);

  // Porcentajes reales en el plato
  const vegPct = Math.round((currentVegGrams / currentTotalGrams) * 100) || 0;
  const grainPct = Math.round((currentGrainGrams / currentTotalGrams) * 100) || 0;
  const protPct = Math.round((currentProtGrams / currentTotalGrams) * 100) || 0;

  // Precio total del lote
  const totalPrice = plateItems.reduce((acc, it) => {
    const factor = it.grams / 500;
    return acc + (it.product.price * Math.max(1, factor));
  }, 0);

  // Comprar todo el plan
  const handleAddPlateToCart = () => {
    const uniqueProducts = Array.from(new Set(plateItems.map(p => p.product.id)))
      .map(id => plateItems.find(p => p.product.id === id)?.product)
      .filter(Boolean) as CatalogProduct[];

    uniqueProducts.forEach(prod => {
      addCatalogProduct(prod);
    });

    setIsOpen(true);
    toast({
      title: "🛒 ¡Plan de alimentación añadido a la cesta!",
      description: `Se han añadido ${uniqueProducts.length} productos biológicos para cubrir tu meta de ${currentHorizonConfig.label}.`,
    });
  };

  // Explorador General de productos (+1.000)
  const explorerProducts = useMemo(() => {
    let pool = filteredCatalog;
    if (explorerCategory === 'vegetales') pool = vegCatalog;
    else if (explorerCategory === 'granos') pool = grainCatalog;
    else if (explorerCategory === 'proteinas') pool = protCatalog;
    else if (explorerCategory === 'aceites') pool = oilCatalog;

    if (explorerSearch.trim()) {
      const q = explorerSearch.toLowerCase();
      pool = pool.filter(p => (p.name + ' ' + p.brand + ' ' + p.description).toLowerCase().includes(q));
    }
    return pool.slice(0, 24);
  }, [filteredCatalog, explorerCategory, explorerSearch, vegCatalog, grainCatalog, protCatalog, oilCatalog]);

  return (
    <div className="space-y-8">
      
      {/* 1. SELECTOR DE HORIZONTE Y HOGAR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Planificación Inteligente Harvard
              </span>
              <span className="text-xs text-slate-500">Sin contar calorías · Proporción real de alimentos</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Diseña tu Alimentación Equilibrada
            </h2>
            <p className="text-xs text-slate-500">
              50% Vegetales y frutas, 25% granos integrales, 25% proteína saludable y grasas nobles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Personas en el hogar */}
            <div className="flex items-center gap-2 bg-slate-50 border rounded-2xl px-3 py-2 text-xs">
              <span className="text-slate-500 font-medium">Hogar:</span>
              <div className="flex gap-1">
                {[1, 2, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setHouseholdSize(n)}
                    className={`w-7 h-7 rounded-xl font-bold transition-all text-xs ${
                      householdSize === n 
                        ? 'bg-emerald-900 text-white shadow-2xs' 
                        : 'bg-white text-slate-700 hover:bg-slate-200 border'
                    }`}
                  >
                    {n}p
                  </button>
                ))}
              </div>
            </div>

            {/* Horizonte temporal */}
            <div className="flex items-center gap-2 bg-slate-50 border rounded-2xl px-3 py-2 text-xs">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <select
                value={selectedHorizon}
                onChange={e => setSelectedHorizon(e.target.value as TimeHorizon)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                {HORIZONS.map(h => (
                  <option key={h.id} value={h.id}>{h.label} ({h.days} días)</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Barra de progreso de equilibrio Harvard */}
        <div className="pt-2 border-t space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-700" />
              <span>Equilibrio de tu plato:</span>
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className={vegPct >= 45 && vegPct <= 55 ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                🥬 Veg: {vegPct}% (Meta 50%)
              </span>
              <span className={grainPct >= 20 && grainPct <= 30 ? 'text-amber-700 font-bold' : 'text-slate-500'}>
                🥣 Granos: {grainPct}% (Meta 25%)
              </span>
              <span className={protPct >= 20 && protPct <= 30 ? 'text-blue-700 font-bold' : 'text-slate-500'}>
                🫘 Prot: {protPct}% (Meta 25%)
              </span>
            </div>
          </div>

          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div style={{ width: `${Math.min(100, vegPct)}%` }} className="bg-emerald-500 transition-all duration-300" title={`Vegetales: ${vegPct}%`} />
            <div style={{ width: `${Math.min(100, grainPct)}%` }} className="bg-amber-400 transition-all duration-300" title={`Granos: ${grainPct}%`} />
            <div style={{ width: `${Math.min(100, protPct)}%` }} className="bg-blue-500 transition-all duration-300" title={`Proteína: ${protPct}%`} />
          </div>
        </div>
      </div>

      {/* 2. ÁREA PRINCIPAL: PLATO FLOTANTE A LA IZQUIERDA + CATÁLOGO A LA DERECHA */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* ============================================================== */}
        {/* COLUMNA IZQUIERDA: EL PLATO DE HARVARD REALISTA (STICKY FLOTANTE) */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 self-start space-y-4">
          
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4 text-center">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="text-left">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Harvard Healthy Eating Plate
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  Tu Plato Realista
                </h3>
              </div>

              {/* Acompañamiento oficial Harvard: Agua saludable */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-50 border border-cyan-200 rounded-xl text-[10px] text-cyan-950 font-bold" title="Harvard: Prioriza agua mineral, infusiones o café sin azúcar">
                <Droplet className="w-3.5 h-3.5 text-cyan-600 fill-cyan-500" />
                <span>Agua pura</span>
              </div>
            </div>

            {/* PLATO CERÁMICO REALISTA 3D */}
            <div className="relative p-2">
              <motion.div 
                animate={lastAddedZone ? { scale: [1, 1.025, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-[370px] aspect-square mx-auto rounded-full p-4 bg-gradient-to-br from-slate-100 via-white to-slate-200 border-[16px] md:border-[18px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.16),0_6px_18px_rgba(0,0,0,0.08),inset_0_3px_6px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(0,0,0,0.08)] ring-1 ring-slate-300/80 flex flex-col justify-between overflow-hidden"
              >
                
                {/* Reflejo de brillo cerámico porcelana */}
                <div className="pointer-events-none absolute -top-16 -left-16 w-52 h-52 rounded-full bg-white/40 blur-2xl z-20" />

                {/* MITAD SUPERIOR: 50% VEGETALES Y FRUTAS (SUBDIVIDIDO EN VERDURAS + FRUTAS) */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragOverZone('vegetales'); }}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => handleDropOnZone(e, 'vegetales')}
                  className={`h-1/2 w-full rounded-t-full p-2.5 flex flex-col justify-between items-center text-center relative transition-all border-b-2 border-dashed border-emerald-600/30 ${
                    dragOverZone === 'vegetales' 
                      ? 'bg-emerald-300/40 ring-4 ring-emerald-500' 
                      : 'bg-emerald-500/15 hover:bg-emerald-500/20'
                  }`}
                >
                  <div className="w-full flex items-center justify-between px-3 pt-0.5">
                    <span className="text-[9px] font-black text-emerald-950 uppercase tracking-wider bg-white/90 border border-emerald-200 px-2 py-0.5 rounded-full shadow-2xs">
                      50% Vegetales & Frutas
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-800">
                      {(currentVegGrams/1000).toFixed(1)} kg
                    </span>
                  </div>

                  {/* Lista de alimentos lanzados en Vegetales */}
                  <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto w-full p-1 scrollbar-none">
                    {plateItems.filter(x => x.category === 'vegetales').map(it => (
                      <span 
                        key={it.id} 
                        className="text-[9px] bg-white text-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs flex items-center gap-1 font-bold group"
                      >
                        <span>{it.emoji}</span>
                        <span className="truncate max-w-[90px]">{it.displayName}</span>
                        <span className="text-emerald-700 font-mono text-[8px]">({it.grams >= 1000 ? `${(it.grams/1000).toFixed(1)}k` : `${it.grams}g`})</span>
                        <button onClick={() => removePlateItem(it.id)} className="text-red-400 hover:text-red-700 ml-0.5">×</button>
                      </span>
                    ))}
                    {plateItems.filter(x => x.category === 'vegetales').length === 0 && (
                      <span className="text-[10px] text-emerald-800/60 italic self-center">
                        🥬 Suelta o lanza hojas, huerta o frutas aquí
                      </span>
                    )}
                  </div>

                  <span className="text-[8px] text-emerald-800/80 font-medium pb-0.5">
                    Mayor variedad y color · Hortalizas de huerta y fruta entera
                  </span>
                </div>

                {/* MITAD INFERIOR: 25% GRANOS INTEGRALES + 25% PROTEÍNAS LIMPIAS */}
                <div className="h-1/2 w-full flex">
                  
                  {/* CUADRANTE INFERIOR IZQUIERDO: 25% GRANOS INTEGRALES */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragOverZone('granos'); }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => handleDropOnZone(e, 'granos')}
                    className={`w-1/2 h-full rounded-bl-full p-2 flex flex-col justify-between items-center text-center transition-all border-r border-dashed border-amber-600/30 ${
                      dragOverZone === 'granos' 
                        ? 'bg-amber-300/40 ring-4 ring-amber-500' 
                        : 'bg-amber-500/15 hover:bg-amber-500/20'
                    }`}
                  >
                    <div className="pt-1">
                      <span className="text-[8px] font-black text-amber-950 uppercase tracking-wider bg-white/90 border border-amber-200 px-1.5 py-0.5 rounded-full block">
                        25% Granos
                      </span>
                      <span className="text-[8px] font-mono text-amber-900 font-bold">
                        {(currentGrainGrams/1000).toFixed(1)} kg
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 justify-center max-h-16 overflow-y-auto w-full p-0.5">
                      {plateItems.filter(x => x.category === 'granos').map(it => (
                        <span 
                          key={it.id} 
                          className="text-[8px] bg-white text-amber-950 px-1.5 py-0.5 rounded-full border border-amber-200 shadow-2xs flex items-center gap-0.5 font-bold"
                        >
                          <span>{it.emoji}</span>
                          <span className="truncate max-w-[65px]">{it.displayName}</span>
                          <button onClick={() => removePlateItem(it.id)} className="text-red-400 hover:text-red-700">×</button>
                        </span>
                      ))}
                      {plateItems.filter(x => x.category === 'granos').length === 0 && (
                        <span className="text-[8px] text-amber-800/60 italic self-center">
                          🥣 Avena, arroz, quinoa...
                        </span>
                      )}
                    </div>

                    <span className="text-[7px] text-amber-800/80 font-medium">100% integrales</span>
                  </div>

                  {/* CUADRANTE INFERIOR DERECHO: 25% PROTEÍNAS SALUDABLES */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragOverZone('proteinas'); }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => handleDropOnZone(e, 'proteinas')}
                    className={`w-1/2 h-full rounded-br-full p-2 flex flex-col justify-between items-center text-center transition-all ${
                      dragOverZone === 'proteinas' 
                        ? 'bg-blue-300/40 ring-4 ring-blue-500' 
                        : 'bg-blue-500/15 hover:bg-blue-500/20'
                    }`}
                  >
                    <div className="pt-1">
                      <span className="text-[8px] font-black text-blue-950 uppercase tracking-wider bg-white/90 border border-blue-200 px-1.5 py-0.5 rounded-full block">
                        25% Proteína
                      </span>
                      <span className="text-[8px] font-mono text-blue-900 font-bold">
                        {(currentProtGrams/1000).toFixed(1)} kg
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 justify-center max-h-16 overflow-y-auto w-full p-0.5">
                      {plateItems.filter(x => x.category === 'proteinas').map(it => (
                        <span 
                          key={it.id} 
                          className="text-[8px] bg-white text-blue-950 px-1.5 py-0.5 rounded-full border border-blue-200 shadow-2xs flex items-center gap-0.5 font-bold"
                        >
                          <span>{it.emoji}</span>
                          <span className="truncate max-w-[65px]">{it.displayName}</span>
                          <button onClick={() => removePlateItem(it.id)} className="text-red-400 hover:text-red-700">×</button>
                        </span>
                      ))}
                      {plateItems.filter(x => x.category === 'proteinas').length === 0 && (
                        <span className="text-[8px] text-blue-800/60 italic self-center">
                          🫘 Legumbres, tofu, pescado...
                        </span>
                      )}
                    </div>

                    <span className="text-[7px] text-blue-800/80 font-medium">Legumbres y limpias</span>
                  </div>

                </div>

                {/* POCILLO CENTRAL DE PORCELANA: GRASAS SALUDABLES / AOVE */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragOverZone('grasas'); }}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => handleDropOnZone(e, 'grasas')}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border-4 border-white shadow-lg flex flex-col items-center justify-center text-amber-950 text-center cursor-pointer hover:scale-105 transition-transform z-10"
                  title="Aceite de Oliva Virgen Extra (AOVE) y grasas nobles saludables"
                >
                  <span className="text-xs">🫒</span>
                  <span className="text-[8px] font-black uppercase tracking-tight">AOVE</span>
                  <span className="text-[7px] font-mono">{(currentOilGrams/1000).toFixed(2)}L</span>
                </div>

              </motion.div>
            </div>

            {/* Total acumulado y botón de añadir a la cesta */}
            <div className="p-4 bg-slate-50 border rounded-2xl space-y-2.5 text-left">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">Total de tu plan ({currentHorizonConfig.label}):</span>
                <strong className="text-xl font-black font-mono text-emerald-950">{totalPrice.toFixed(2)} €</strong>
              </div>

              <Button 
                onClick={handleAddPlateToCart}
                className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-5 rounded-2xl shadow-md text-xs gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Añadir todo el plan a la cesta ({totalPrice.toFixed(2)} €)</span>
              </Button>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>{plateItems.length} alimentos en tu plato</span>
                <button 
                  onClick={() => setPlateItems([])}
                  className="text-red-500 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Vaciar plato</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* ============================================================== */}
        {/* COLUMNA DERECHA: LAS 4 CATEGORÍAS CON SUS 16 SUBCATEGORÍAS */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* BOTÓN EXPLORADOR DEL CATÁLOGO COMPLETO (+1.000 PRODUCTOS) */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <strong className="text-xs font-bold text-emerald-950 block">¿Buscas un producto específico entre todo el catálogo?</strong>
              <span className="text-[11px] text-emerald-800">Explora las más de 1.000 referencias biológicas de Ecoland o lanza los iconos genéricos rápidos.</span>
            </div>
            <Button 
              onClick={() => setIsCatalogExplorerOpen(prev => !prev)}
              variant="outline"
              size="sm"
              className="bg-white border-emerald-300 text-emerald-900 font-bold text-xs shrink-0 gap-1.5 shadow-2xs"
            >
              <span>{isCatalogExplorerOpen ? 'Ocultar catálogo' : 'Abrir catálogo (+1.000)'}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isCatalogExplorerOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* DESPLEGABLE EXPLORADOR COMPLETO */}
          <AnimatePresence>
            {isCatalogExplorerOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border border-emerald-200 rounded-3xl p-5 bg-white space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex gap-1.5 flex-wrap text-xs">
                    {[
                      { id: 'todos', label: 'Todos' },
                      { id: 'vegetales', label: 'Vegetales' },
                      { id: 'granos', label: 'Granos/Cereales' },
                      { id: 'proteinas', label: 'Legumbres/Proteína' },
                      { id: 'aceites', label: 'Aceites Nobles' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setExplorerCategory(cat.id as any)}
                        className={`px-3 py-1 rounded-xl font-bold transition-all ${
                          explorerCategory === cat.id ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                      value={explorerSearch}
                      onChange={(e) => setExplorerSearch(e.target.value)}
                      placeholder="Buscar entre +1.000 productos..."
                      className="h-8 pl-9 text-xs bg-slate-50 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                  {explorerProducts.map(p => (
                    <div
                      key={p.slug}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.slug, p.category === 'desayunos' ? 'granos' : p.category === 'aceites' ? 'grasas' : p.category === 'legumbres' ? 'proteinas' : 'vegetales', 'BIO')}
                      className="p-2.5 rounded-xl border bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all text-left flex flex-col justify-between cursor-grab active:cursor-grabbing shadow-2xs group"
                    >
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-9 h-9 object-contain rounded bg-white p-0.5 border shrink-0" />
                        <div className="truncate flex-1">
                          <span className="block text-[10px] font-bold text-slate-900 truncate">{cleanProductName(p.name)}</span>
                          <span className="block text-[8px] text-slate-400">{p.brand}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] pt-1.5 mt-1 border-t border-slate-100">
                        <strong className="text-emerald-800 font-mono font-bold">{p.price.toFixed(2)} €</strong>
                        <button
                          onClick={() => {
                            const targetCat = p.category === 'desayunos' ? 'granos' : p.category === 'aceites' ? 'grasas' : p.category === 'legumbres' ? 'proteinas' : 'vegetales';
                            addFoodToPlate(p, targetCat, 500, 'BIO');
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-800 text-white font-bold hover:bg-emerald-700"
                        >
                          +Lanzar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================== */}
          {/* CATEGORÍA 1: VEGETALES, HORTALIZAS Y FRUTAS (50% DEL PLATO) */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-900 font-black text-xs">
                  50%
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Vegetales, Hortalizas & Frutas Frescas</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
                      50% del plato
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Harvard: Color y variedad. Elige entre hojas verdes, raíces, huerta y fruta entera.
                  </p>
                </div>
              </div>
            </div>

            {/* LAS 4 SUBCATEGORÍAS GENÉRICAS DE VEGETALES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HARVARD_SUBCATEGORIES.filter(s => s.category === 'vegetales').map(sub => (
                <div
                  key={sub.id}
                  onClick={() => addGenericSubcategoryToPlate(sub)}
                  className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs border border-emerald-100 group-hover:scale-110 transition-transform">
                      {sub.emoji}
                    </span>
                    <div className="space-y-0.5">
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-emerald-950">
                        {sub.name}
                      </strong>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {sub.subtitle}
                      </p>
                      <span className="text-[9px] text-emerald-700 italic block">
                        {sub.harvardRecommendation}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-100/60">
                    <Badge variant="secondary" className="text-[9px] bg-white text-emerald-800 font-mono font-bold">
                      +{sub.defaultGrams}g ración
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-emerald-800 group-hover:bg-emerald-700 text-white font-bold text-[11px] h-7 px-3 rounded-xl gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Lanzar al plato</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* CATEGORÍA 2: GRANOS Y CEREALES INTEGRALES (25% DEL PLATO) */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900 font-black text-xs">
                  25%
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Granos & Cereales 100% Integrales</span>
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-900 border-amber-200">
                      25% del plato
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Harvard: Granos enteros intactos (avena, arroz integral, quinoa, espelta).
                  </p>
                </div>
              </div>
            </div>

            {/* LAS 4 SUBCATEGORÍAS GENÉRICAS DE GRANOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HARVARD_SUBCATEGORIES.filter(s => s.category === 'granos').map(sub => (
                <div
                  key={sub.id}
                  onClick={() => addGenericSubcategoryToPlate(sub)}
                  className="p-3.5 rounded-2xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 transition-all cursor-pointer shadow-2xs flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs border border-amber-100 group-hover:scale-110 transition-transform">
                      {sub.emoji}
                    </span>
                    <div className="space-y-0.5">
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-amber-950">
                        {sub.name}
                      </strong>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {sub.subtitle}
                      </p>
                      <span className="text-[9px] text-amber-800 italic block">
                        {sub.harvardRecommendation}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-amber-100/60">
                    <Badge variant="secondary" className="text-[9px] bg-white text-amber-900 font-mono font-bold">
                      +{sub.defaultGrams}g ración
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-amber-800 group-hover:bg-amber-700 text-white font-bold text-[11px] h-7 px-3 rounded-xl gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Lanzar al plato</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* CATEGORÍA 3: PROTEÍNAS SALUDABLES (25% DEL PLATO) */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-900 font-black text-xs">
                  25%
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Proteínas Limpias & Saludables</span>
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-900 border-blue-200">
                      25% del plato
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Harvard: Legumbres castellanas, tofu, pescados azules, huevos camperos.
                  </p>
                </div>
              </div>
            </div>

            {/* LAS 4 SUBCATEGORÍAS GENÉRICAS DE PROTEÍNA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HARVARD_SUBCATEGORIES.filter(s => s.category === 'proteinas').map(sub => (
                <div
                  key={sub.id}
                  onClick={() => addGenericSubcategoryToPlate(sub)}
                  className="p-3.5 rounded-2xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer shadow-2xs flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs border border-blue-100 group-hover:scale-110 transition-transform">
                      {sub.emoji}
                    </span>
                    <div className="space-y-0.5">
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-blue-950">
                        {sub.name}
                      </strong>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {sub.subtitle}
                      </p>
                      <span className="text-[9px] text-blue-800 italic block">
                        {sub.harvardRecommendation}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-blue-100/60">
                    <Badge variant="secondary" className="text-[9px] bg-white text-blue-900 font-mono font-bold">
                      +{sub.defaultGrams}g ración
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-blue-800 group-hover:bg-blue-700 text-white font-bold text-[11px] h-7 px-3 rounded-xl gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Lanzar al plato</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* CATEGORÍA 4: GRASAS SALUDABLES & ADEREZOS NOBLES (CENTRO) */}
          {/* ============================================================== */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-200 flex items-center justify-center text-amber-950 font-black text-xs">
                  🫒
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Grasas Saludables & Aderezos Nobles</span>
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-900 border-amber-300">
                      Toque de Oro
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Harvard: Aceite de oliva virgen extra, frutos secos, semillas y aguacate.
                  </p>
                </div>
              </div>
            </div>

            {/* LAS 4 SUBCATEGORÍAS GENÉRICAS DE GRASAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HARVARD_SUBCATEGORIES.filter(s => s.category === 'grasas').map(sub => (
                <div
                  key={sub.id}
                  onClick={() => addGenericSubcategoryToPlate(sub)}
                  className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/60 transition-all cursor-pointer shadow-2xs flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs border border-amber-200 group-hover:scale-110 transition-transform">
                      {sub.emoji}
                    </span>
                    <div className="space-y-0.5">
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-amber-950">
                        {sub.name}
                      </strong>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {sub.subtitle}
                      </p>
                      <span className="text-[9px] text-amber-900 italic block">
                        {sub.harvardRecommendation}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                    <Badge variant="secondary" className="text-[9px] bg-white text-amber-950 font-mono font-bold">
                      +{sub.defaultGrams}g ración
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-amber-900 group-hover:bg-amber-800 text-white font-bold text-[11px] h-7 px-3 rounded-xl gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Lanzar al plato</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default HarvardPlateInteractive;
