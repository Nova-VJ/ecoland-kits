import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, RotateCcw, Search, Plus, Minus, X, Droplet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { cleanProductName } from '@/lib/utils';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { getProductFacts } from '@/data/catalog/productFacts';
import { useToast } from '@/hooks/use-toast';

export interface HarvardPlateProps {
  onGoToStore?: () => void;
}

export type PlateGroup = 'vegetales' | 'granos' | 'proteinas' | 'grasas';

export interface PlateFoodItem {
  id: string;
  category: PlateGroup;
  subcategoryKey: string;
  product: CatalogProduct;
  grams: number;
  displayName: string;
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Horizontes temporales
export type TimeHorizon = '1-semana' | '1-mes' | '1.5-meses' | '2-meses' | '3-meses' | '6-meses' | '1-ano';

interface HorizonConfig {
  id: TimeHorizon;
  label: string;
  days: number;
  mealsPerPerson: number;
}

const HORIZONS: HorizonConfig[] = [
  { id: '1-semana', label: '1 semana', days: 7, mealsPerPerson: 14 },
  { id: '1-mes', label: '1 mes', days: 30, mealsPerPerson: 60 },
  { id: '1.5-meses', label: '1 mes y medio', days: 45, mealsPerPerson: 90 },
  { id: '2-meses', label: '2 meses', days: 60, mealsPerPerson: 120 },
  { id: '3-meses', label: '3 meses', days: 90, mealsPerPerson: 180 },
  { id: '6-meses', label: '6 meses', days: 180, mealsPerPerson: 360 },
  { id: '1-ano', label: '1 año', days: 365, mealsPerPerson: 730 },
];

const DIETS = [
  { id: 'omnivoro', label: 'Omnívora' },
  { id: 'vegano', label: 'Vegana' },
  { id: 'celiaco', label: 'Sin gluten' },
];

// Grupos del plato: proporción Harvard, gramos orientativos por comida y colores
const GROUPS: Record<PlateGroup, {
  title: string;
  share: string;
  tip: string;
  gramsPerMeal: number;
  color: string;
  tint: string;
  text: string;
}> = {
  vegetales: {
    title: 'Vegetales y frutas', share: '50%', gramsPerMeal: 250,
    tip: 'La mitad del plato. Color y variedad: hojas verdes, raíces, huerta y fruta entera.',
    color: '#3f8f46', tint: '#e6f2e3', text: '#1f5226',
  },
  granos: {
    title: 'Granos integrales', share: '25%', gramsPerMeal: 125,
    tip: 'Un cuarto del plato. Granos enteros: avena, arroz integral, quinoa, espelta.',
    color: '#c98a1c', tint: '#fbf0d9', text: '#7a4f06',
  },
  proteinas: {
    title: 'Proteína saludable', share: '25%', gramsPerMeal: 125,
    tip: 'Un cuarto del plato. Legumbres, tofu, pescado azul y huevos camperos.',
    color: '#b4553b', tint: '#f8e6e0', text: '#7a2f1c',
  },
  grasas: {
    title: 'Grasas saludables', share: 'Toque', gramsPerMeal: 15,
    tip: 'Con moderación: aceite de oliva virgen extra, frutos secos, semillas y aguacate.',
    color: '#7f8a24', tint: '#f0f2d8', text: '#474e0c',
  },
};

const GROUP_ORDER: PlateGroup[] = ['vegetales', 'granos', 'proteinas', 'grasas'];

// Estructura de Subcategoría Genérica para el Plato de Harvard
export interface FoodSubcategory {
  id: string;
  category: PlateGroup;
  name: string;
  subtitle: string;
  emoji: string;
  defaultGrams: number;
  keywords: string[];
  harvardRecommendation: string;
  animal?: boolean;
}

// LAS 16 SUBCATEGORÍAS DETALLADAS (MÍNIMO 4 POR CADA CUADRANTE DE HARVARD)
export const HARVARD_SUBCATEGORIES: FoodSubcategory[] = [
  // 1. VEGETALES, HORTALIZAS Y FRUTAS (50%)
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

  // 2. GRANOS Y CEREALES INTEGRALES (25%)
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

  // 3. PROTEÍNAS SALUDABLES (25%)
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
    harvardRecommendation: 'Origen ecológico de gallinas libres. Moderar quesos grasos.',
    animal: true
  },
  {
    id: 'sub-pescados-conservas',
    category: 'proteinas',
    name: 'Pescados Azules & Conservas Nobles',
    subtitle: 'Bonito del norte en AOVE, atún claro al natural, filetes de caballa',
    emoji: '🐟',
    defaultGrams: 250,
    keywords: ['bonito', 'atun', 'caballa'],
    harvardRecommendation: 'Ácidos grasos Omega-3 de pescados pequeños y limpios.',
    animal: true
  },

  // 4. GRASAS SALUDABLES & ADEREZOS (CENTRO)
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

// Clasificación de cada producto del catálogo en un grupo del plato (por su nombre).
// El orden importa: "bonito en aceite de oliva" es proteína, "semillas de calabaza" es grasa.
const GROUP_KEYWORDS: [PlateGroup, string[]][] = [
  ['proteinas', ['garbanzo', 'lenteja', 'alubia', 'judia', 'tofu', 'tempeh', 'seitan', 'huevo', 'bonito', 'atun', 'caballa', 'sardina', 'proteina', 'soja texturizada', 'hummus']],
  ['granos', ['avena', 'arroz', 'quinoa', 'quinua', 'espelta', 'trigo', 'cereal', 'pasta', 'macarron', 'espagueti', 'mijo', 'cebada', 'centeno', 'muesli', 'tortita', 'cuscus', 'sarraceno']],
  ['grasas', ['aceite', 'oliva', 'aove', 'almendra', 'nuez', 'nueces', 'avellana', 'anacardo', 'pistacho', 'macadamia', 'chia', 'lino', 'sesamo', 'semilla', 'aguacate', 'coco']],
  ['vegetales', ['verdura', 'tomate', 'zanahoria', 'lechuga', 'espinaca', 'brocoli', 'acelga', 'calabacin', 'calabaza', 'pimiento', 'alcachofa', 'menestra', 'gazpacho', 'remolacha', 'puerro', 'fruta', 'manzana', 'platano', 'arandano', 'frambuesa', 'fresa', 'acai', 'compota', 'pera', 'naranja', 'seta', 'champinon', 'esparrago', 'guisante', 'berenjena', 'kale']],
];

const CATEGORY_FALLBACK: Record<string, PlateGroup> = {
  legumbres: 'proteinas',
  desayunos: 'granos',
  aceites: 'grasas',
};

function classifyProduct(p: CatalogProduct): PlateGroup | null {
  // Solo alimentos: ni cosmética, ni suplementos, ni artículos del hogar, ni alcohol
  if (getProductFacts(p.id).kind !== 'alimento') return null;
  const name = normalize(p.name);
  for (const [group, words] of GROUP_KEYWORDS) {
    if (words.some(w => name.includes(w))) return group;
  }
  return CATEGORY_FALLBACK[p.category] ?? null;
}

const CLASSIFIED_CATALOG = allCatalogProducts
  .map(product => ({ product, group: classifyProduct(product), search: normalize(product.name + ' ' + product.brand) }))
  .filter((x): x is { product: CatalogProduct; group: PlateGroup; search: string } => x.group !== null);

function filterByDiet(diet: string) {
  if (diet === 'vegano') {
    return CLASSIFIED_CATALOG.filter(x => getProductFacts(x.product.id).vegano === true);
  }
  if (diet === 'celiaco') {
    // Para celíacos solo cuenta lo declarado sin gluten o lo que no lleva gluten por naturaleza
    return CLASSIFIED_CATALOG.filter(x => {
      const { glutenFuente } = getProductFacts(x.product.id);
      return glutenFuente === 'declarado' || glutenFuente === 'naturalmente-sin-gluten';
    });
  }
  return CLASSIFIED_CATALOG;
}

// Elige un producto real para la subcategoría, priorizando los que aún no están en el plato
function pickProduct(sub: FoodSubcategory, pool: typeof CLASSIFIED_CATALOG, usedIds: Set<string>): CatalogProduct | null {
  const inGroup = pool.filter(x => x.group === sub.category);
  const matched = inGroup.filter(x => sub.keywords.some(k => x.search.includes(normalize(k))));
  const candidates = (matched.length ? matched : inGroup)
    .map(x => x.product)
    .sort((a, b) => Number(b.inStock) - Number(a.inStock));
  return candidates.find(p => !usedIds.has(p.id)) ?? candidates[0] ?? null;
}

// Gramos por unidad de venta del producto (500 g si el formato no lo indica)
function unitGrams(p: CatalogProduct): number {
  const m = `${p.weight ?? ''} ${p.name}`.match(/(\d+(?:[.,]\d+)?)\s*(kg|gr|g|l|ml|cl)\b/i);
  if (!m) return 500;
  const value = parseFloat(m[1].replace(',', '.'));
  const unit = m[2].toLowerCase();
  const grams = unit === 'kg' || unit === 'l' ? value * 1000 : unit === 'cl' ? value * 10 : value;
  return grams > 0 ? grams : 500;
}

const unitsFor = (item: PlateFoodItem) => Math.max(1, Math.ceil(item.grams / unitGrams(item.product)));

const formatWeight = (g: number) =>
  g < 1000 ? `${Math.round(g)} g` : `${(g / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 })} kg`;

const formatPrice = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const GRAMS_STEP = 250;

// Geometría del plato (SVG)
const C = 160;
const R = 128;

function sectorPath(group: Exclude<PlateGroup, 'grasas'>, r: number) {
  if (group === 'vegetales') return `M${C},${C} L${C - r},${C} A${r},${r} 0 0 1 ${C + r},${C} Z`;
  if (group === 'granos') return `M${C},${C} L${C},${C + r} A${r},${r} 0 0 1 ${C - r},${C} Z`;
  return `M${C},${C} L${C + r},${C} A${r},${r} 0 0 1 ${C},${C + r} Z`;
}

const scrollToGroup = (group: PlateGroup) =>
  document.getElementById(`harvard-${group}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export const HarvardPlateInteractive = (_props: HarvardPlateProps) => {
  const { addCatalogProduct, setIsOpen } = useCart();
  const { toast } = useToast();

  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizon>('1-semana');
  const [householdSize, setHouseholdSize] = useState<number>(2);
  const [dietType, setDietType] = useState<string>(() => {
    try {
      return localStorage.getItem('ecoland-harvard-diet') || 'omnivoro';
    } catch {
      return 'omnivoro';
    }
  });
  const [search, setSearch] = useState('');
  const [pulse, setPulse] = useState(0);

  const pool = useMemo(() => filterByDiet(dietType), [dietType]);

  // Plato inicial de ejemplo, con productos reales del catálogo
  const [plateItems, setPlateItems] = useState<PlateFoodItem[]>(() => {
    const used = new Set<string>();
    return ['sub-hojas-verdes', 'sub-cruciferas-huerta', 'sub-copos-avena', 'sub-legumbres', 'sub-aove'].flatMap(key => {
      const sub = HARVARD_SUBCATEGORIES.find(s => s.id === key)!;
      const product = pickProduct(sub, filterByDiet(dietType), used);
      if (!product) return [];
      used.add(product.id);
      return [{ id: product.id, category: sub.category, subcategoryKey: sub.id, product, grams: sub.defaultGrams, displayName: cleanProductName(product.name, 40) }];
    });
  });

  const horizon = HORIZONS.find(h => h.id === selectedHorizon) || HORIZONS[0];
  const totalMeals = horizon.mealsPerPerson * householdSize;

  const stats = useMemo(() => {
    const result = {} as Record<PlateGroup, { grams: number; target: number; progress: number }>;
    for (const g of GROUP_ORDER) {
      const grams = plateItems.filter(it => it.category === g).reduce((acc, it) => acc + it.grams, 0);
      const target = totalMeals * GROUPS[g].gramsPerMeal;
      result[g] = { grams, target, progress: target ? grams / target : 0 };
    }
    return result;
  }, [plateItems, totalMeals]);

  const totalUnits = plateItems.reduce((acc, it) => acc + unitsFor(it), 0);
  const totalPrice = plateItems.reduce((acc, it) => acc + unitsFor(it) * it.product.price, 0);

  // El grupo que más falta para completar el plato
  const nextGroup = GROUP_ORDER
    .filter(g => stats[g].progress < 1)
    .sort((a, b) => stats[a].progress - stats[b].progress)[0];

  const changeDiet = (id: string) => {
    setDietType(id);
    try {
      localStorage.setItem('ecoland-harvard-diet', id);
    } catch {
      // sin almacenamiento disponible: la preferencia solo dura esta visita
    }
  };

  const addProductToPlate = (product: CatalogProduct, category: PlateGroup, grams: number, subcategoryKey = '') => {
    const displayName = cleanProductName(product.name, 40);
    setPlateItems(prev => {
      const existing = prev.find(it => it.id === product.id);
      if (existing) {
        return prev.map(it => it.id === product.id ? { ...it, grams: it.grams + grams } : it);
      }
      return [...prev, { id: product.id, category, subcategoryKey, product, grams, displayName }];
    });
    setPulse(p => p + 1);

    // En escritorio el plato está siempre a la vista; en móvil confirmamos con un aviso
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      toast({ title: 'Añadido a tu plato', description: `${displayName} · ${formatWeight(grams)}` });
    }
  };

  const addSubcategory = (sub: FoodSubcategory) => {
    const product = pickProduct(sub, pool, new Set(plateItems.map(it => it.id)));
    if (!product) {
      toast({ title: 'Sin productos disponibles', description: 'Ahora mismo no tenemos productos de este tipo para tu dieta.' });
      return;
    }
    const grams = horizon.days >= 30 ? sub.defaultGrams * 2 : sub.defaultGrams;
    addProductToPlate(product, sub.category, grams, sub.id);
  };

  const changeGrams = (id: string, delta: number) =>
    setPlateItems(prev => prev.map(it => it.id === id ? { ...it, grams: Math.max(GRAMS_STEP, it.grams + delta) } : it));

  const removePlateItem = (id: string) => setPlateItems(prev => prev.filter(x => x.id !== id));

  const handleAddPlateToCart = () => {
    plateItems.forEach(it => {
      for (let i = 0; i < unitsFor(it); i++) addCatalogProduct(it.product);
    });
    setIsOpen(true);
    toast({
      title: 'Plan añadido a la cesta',
      description: `${totalUnits} unidades de ${plateItems.length} productos para ${horizon.label}.`,
    });
  };

  const searchResults = useMemo(() => {
    const q = normalize(search.trim());
    if (q.length < 2) return [];
    return pool.filter(x => x.search.includes(q)).slice(0, 8);
  }, [pool, search]);

  const visibleSubcategories = HARVARD_SUBCATEGORIES.filter(s => !(dietType === 'vegano' && s.animal));

  return (
    <div className="space-y-6">

      {/* 1. CABECERA: PERSONAS, PERIODO Y DIETA */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Método del Plato de Harvard</p>
            <h2 className="text-2xl sm:text-3xl text-slate-900 mt-1">Diseña tu compra equilibrada</h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Dinos para cuántas personas y cuánto tiempo. Te indicamos cuánto necesitas de cada grupo y lo llevas a la cesta en un clic.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-slate-500">Personas</span>
              <div className="flex items-center h-10 rounded-xl border border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setHouseholdSize(n => Math.max(1, n - 1))}
                  disabled={householdSize <= 1}
                  aria-label="Una persona menos"
                  className="w-10 h-full grid place-items-center text-slate-600 hover:text-emerald-900 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-slate-900 tabular-nums" aria-live="polite">{householdSize}</span>
                <button
                  type="button"
                  onClick={() => setHouseholdSize(n => Math.min(8, n + 1))}
                  disabled={householdSize >= 8}
                  aria-label="Una persona más"
                  className="w-10 h-full grid place-items-center text-slate-600 hover:text-emerald-900 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-slate-500">Periodo</span>
              <Select value={selectedHorizon} onValueChange={v => setSelectedHorizon(v as TimeHorizon)}>
                <SelectTrigger className="h-10 w-40 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium" aria-label="Periodo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HORIZONS.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-slate-500">Dieta</span>
              <div className="flex h-10 p-1 rounded-xl border border-slate-200 bg-slate-50" role="radiogroup" aria-label="Dieta">
                {DIETS.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    role="radio"
                    aria-checked={dietType === d.id}
                    onClick={() => changeDiet(d.id)}
                    className={`px-3 rounded-lg text-sm font-medium transition-colors ${
                      dietType === d.id ? 'bg-emerald-900 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-900'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* 2. COLUMNA IZQUIERDA: PLATO + RESUMEN (FIJA AL HACER SCROLL EN ESCRITORIO) */}
        <aside className="[scrollbar-width:thin] lg:col-span-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl text-slate-900">Tu plato equilibrado</h3>
              <span className="text-xs text-slate-500">{householdSize} {householdSize === 1 ? 'persona' : 'personas'} · {horizon.label}</span>
            </div>

            {/* El plato: cada zona se llena según lo que llevas respecto a lo recomendado */}
            <motion.div
              key={pulse}
              animate={pulse ? { scale: [1, 1.02, 1] } : undefined}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-[300px] mx-auto aspect-square"
            >
              <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-[0_14px_24px_rgba(15,40,20,0.12)]" role="img" aria-label="Plato de Harvard">
                <circle cx={C} cy={C} r={156} fill="#ffffff" stroke="#e2e8f0" />
                <circle cx={C} cy={C} r={140} fill="#fbfbf8" stroke="#eef0eb" />
                {(['vegetales', 'granos', 'proteinas'] as const).map(g => (
                  <g
                    key={g}
                    onClick={() => scrollToGroup(g)}
                    className="cursor-pointer [&:hover>path:first-child]:opacity-80"
                  >
                    <path d={sectorPath(g, R)} fill={GROUPS[g].tint} stroke="#ffffff" strokeWidth={4} />
                    {stats[g].progress > 0 && (
                      <path
                        d={sectorPath(g, R * Math.sqrt(Math.min(1, stats[g].progress)))}
                        fill={GROUPS[g].color}
                        fillOpacity={0.85}
                        stroke="#ffffff"
                        strokeWidth={4}
                        className="transition-all duration-500"
                      />
                    )}
                  </g>
                ))}
                <g onClick={() => scrollToGroup('grasas')} className="cursor-pointer">
                  <circle cx={C} cy={C} r={36} fill="#ffffff" />
                  <circle cx={C} cy={C} r={31} fill={GROUPS.grasas.tint} />
                  {stats.grasas.progress > 0 && (
                    <circle cx={C} cy={C} r={31 * Math.sqrt(Math.min(1, stats.grasas.progress))} fill={GROUPS.grasas.color} fillOpacity={0.85} className="transition-all duration-500" />
                  )}
                </g>
              </svg>

              {/* Etiquetas legibles encima del plato */}
              {([
                ['vegetales', 'top-[22%] left-1/2 -translate-x-1/2'],
                ['granos', 'top-[64%] left-[31%] -translate-x-1/2'],
                ['proteinas', 'top-[64%] left-[69%] -translate-x-1/2'],
              ] as const).map(([g, pos]) => (
                <span
                  key={g}
                  className={`pointer-events-none absolute ${pos} rounded-full bg-white/95 px-2.5 py-1 text-center shadow-xs`}
                >
                  <span className="block text-[11px] font-semibold leading-tight" style={{ color: GROUPS[g].text }}>
                    {GROUPS[g].share} {GROUPS[g].title.split(' ')[0]}
                  </span>
                </span>
              ))}
              <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold shadow-xs" style={{ color: GROUPS.grasas.text }}>
                Grasas
              </span>
            </motion.div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Droplet className="w-3.5 h-3.5 text-sky-600" />
              Para beber: agua, infusiones o café sin azúcar.
            </p>

            {/* Progreso por grupo respecto a lo recomendado */}
            <ul className="space-y-2.5">
              {GROUP_ORDER.map(g => (
                <li key={g}>
                  <button type="button" onClick={() => scrollToGroup(g)} className="w-full text-left group">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-slate-800 group-hover:text-emerald-900">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: GROUPS[g].color }} />
                        {GROUPS[g].title}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums">
                        {formatWeight(stats[g].grams)} <span className="text-slate-500">/ {formatWeight(stats[g].target)}</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, stats[g].progress * 100)}%`, background: GROUPS[g].color }}
                      />
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {/* Siguiente paso recomendado */}
            {nextGroup ? (
              <button
                type="button"
                onClick={() => scrollToGroup(nextGroup)}
                className="w-full flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-left hover:bg-emerald-100/70 transition-colors"
              >
                <span className="text-sm text-emerald-950">
                  <strong className="font-semibold">Siguiente paso:</strong> añade {GROUPS[nextGroup].title.toLowerCase()}.
                  Te faltan {formatWeight(stats[nextGroup].target - stats[nextGroup].grams)}.
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-800 shrink-0" />
              </button>
            ) : (
              <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                Plato completo para {householdSize} {householdSize === 1 ? 'persona' : 'personas'} durante {horizon.label}.
              </p>
            )}
          </div>

          {/* Lista editable de alimentos */}
          <div className="border-t border-slate-100 px-5 sm:px-6 py-4">
            <h4 className="text-sm font-semibold text-slate-900 font-sans">
              En tu plato <span className="font-normal text-slate-500">({plateItems.length})</span>
            </h4>
            {plateItems.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Tu plato está vacío. Elige alimentos en las categorías para empezar.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {plateItems.map(it => (
                  <li key={it.id} className="flex items-center gap-3 py-2.5">
                    <span className="w-1 self-stretch rounded-full" style={{ background: GROUPS[it.category].color }} />
                    <img src={it.product.image} alt="" loading="lazy" className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{it.displayName}</p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {unitsFor(it)} ud. · {formatPrice(unitsFor(it) * it.product.price)}
                      </p>
                    </div>
                    <div className="flex items-center rounded-full border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => changeGrams(it.id, -GRAMS_STEP)}
                        disabled={it.grams <= GRAMS_STEP}
                        aria-label={`Menos cantidad de ${it.displayName}`}
                        className="w-8 h-8 grid place-items-center text-slate-500 hover:text-emerald-900 disabled:opacity-30"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-[3.25rem] text-center text-xs font-medium text-slate-700 tabular-nums">{formatWeight(it.grams)}</span>
                      <button
                        type="button"
                        onClick={() => changeGrams(it.id, GRAMS_STEP)}
                        aria-label={`Más cantidad de ${it.displayName}`}
                        className="w-8 h-8 grid place-items-center text-slate-500 hover:text-emerald-900"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePlateItem(it.id)}
                      aria-label={`Quitar ${it.displayName}`}
                      className="w-8 h-8 grid place-items-center rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Total y compra */}
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 sm:px-6 py-4 space-y-3 rounded-b-3xl">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-600">Total estimado · {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'}</span>
              <strong className="text-2xl font-semibold text-slate-900 tabular-nums">{formatPrice(totalPrice)}</strong>
            </div>
            <Button
              onClick={handleAddPlateToCart}
              disabled={plateItems.length === 0}
              className="w-full h-12 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-semibold gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Añadir todo el plan a la cesta
            </Button>
            {plateItems.length > 0 && (
              <button
                type="button"
                onClick={() => setPlateItems([])}
                className="mx-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600"
              >
                <RotateCcw className="w-3 h-3" />
                Vaciar plato
              </button>
            )}
          </div>
        </aside>

        {/* 3. COLUMNA DERECHA: BUSCADOR + LOS 4 GRUPOS */}
        <div className="lg:col-span-7 space-y-6">

          <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar un producto concreto (lentejas, quinoa, nueces…)"
                aria-label="Buscar en el catálogo"
                className="h-11 pl-10 rounded-xl bg-slate-50 border-slate-200 text-sm"
              />
            </div>

            {search.trim().length >= 2 && (
              searchResults.length === 0 ? (
                <p className="text-sm text-slate-500 px-1">No encontramos productos para «{search.trim()}».</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {searchResults.map(({ product, group }) => (
                    <li key={product.id} className="flex items-center gap-3 py-2.5">
                      <img src={product.image} alt="" loading="lazy" className="w-11 h-11 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{cleanProductName(product.name, 40)}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {product.brand} · <span style={{ color: GROUPS[group].text }}>{GROUPS[group].title}</span>
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">{formatPrice(product.price)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addProductToPlate(product, group, Math.max(GRAMS_STEP, unitGrams(product)))}
                        className="rounded-xl border-emerald-200 text-emerald-900 hover:bg-emerald-50 hover:text-emerald-900 gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir
                      </Button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </section>

          {GROUP_ORDER.map(g => (
            <section
              key={g}
              id={`harvard-${g}`}
              className="scroll-mt-28 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs"
            >
              <header className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span
                    className="shrink-0 min-w-[3rem] h-8 px-2 rounded-lg grid place-items-center text-xs font-semibold"
                    style={{ background: GROUPS[g].tint, color: GROUPS[g].text }}
                  >
                    {GROUPS[g].share}
                  </span>
                  <div>
                    <h3 className="text-lg text-slate-900 leading-tight">{GROUPS[g].title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{GROUPS[g].tip}</p>
                  </div>
                </div>
                {stats[g].progress >= 1 && (
                  <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completo
                  </span>
                )}
              </header>

              <div className="grid sm:grid-cols-2 gap-3">
                {visibleSubcategories.filter(s => s.category === g).map(sub => {
                  const count = plateItems.filter(it => it.subcategoryKey === sub.id).length;
                  const grams = horizon.days >= 30 ? sub.defaultGrams * 2 : sub.defaultGrams;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => addSubcategory(sub)}
                      title={sub.harvardRecommendation}
                      className="group flex items-start gap-3 text-left rounded-2xl border border-slate-200 bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                    >
                      <span className="w-11 h-11 rounded-xl grid place-items-center text-2xl shrink-0" style={{ background: GROUPS[g].tint }}>
                        {sub.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900 leading-snug">{sub.name}</span>
                        <span className="block text-xs text-slate-500 mt-0.5 line-clamp-2">{sub.subtitle}</span>
                        <span className="mt-2 flex items-center gap-2 text-xs">
                          <span className="font-medium tabular-nums" style={{ color: GROUPS[g].text }}>+{formatWeight(grams)}</span>
                          {count > 0 && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800">
                              {count} en tu plato
                            </span>
                          )}
                        </span>
                      </span>
                      <span
                        className="w-8 h-8 rounded-full grid place-items-center text-white shrink-0 transition-transform group-hover:scale-110"
                        style={{ background: GROUPS[g].color }}
                        aria-hidden
                      >
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HarvardPlateInteractive;
