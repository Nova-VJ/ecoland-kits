import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, CheckCircle2, RotateCcw, AlertCircle, 
  HelpCircle, ChevronRight, Check, Trash2, ArrowRight, Search,
  Activity, ShieldCheck, Heart, Flame, Scale, Plus, Calendar,
  Filter, Sparkles, X, ChevronDown, CheckCircle
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
  product: CatalogProduct;
  grams: number; // 250, 500, 1000, 2000, etc.
  iconLabel: string;
  displayName: string;
}

// Limpiador estético del nombre del producto
function cleanProductName(name: string): string {
  const parts = name.split('–');
  if (parts.length > 1) {
    let clean = parts[1].trim();
    clean = clean.replace(/""/g, '').replace(/Formato estándar/gi, '').trim();
    clean = clean.split('“')[0].split('"')[0].trim();
    return clean.length > 36 ? clean.substring(0, 36) + '…' : clean;
  }
  return name.length > 36 ? name.substring(0, 36) + '…' : name;
}

// Opciones de horizonte temporal según solicitud del usuario
export type TimeHorizon = '1-semana' | '1-mes' | '1.5-meses' | '2-meses' | '3-meses' | '6-meses' | '1-ano';

interface HorizonConfig {
  id: TimeHorizon;
  label: string;
  days: number;
  mealsPerPerson: number; // Almuerzos + Cenas
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

// Alimentos universales representativos con estilo minimalista
interface UniversalFood {
  id: string;
  category: 'vegetales' | 'granos' | 'proteinas' | 'grasas';
  iconType: 'leaf' | 'tomato' | 'broccoli' | 'berry' | 'bowl' | 'wheat' | 'rice' | 'bean' | 'lentil' | 'tofu' | 'seed' | 'oil';
  label: string;
  iconLabel: string;
  defaultGrams: number;
  keywords: string[];
}

const UNIVERSAL_FOODS: UniversalFood[] = [
  // 50% Vegetales y Frutas
  { id: 'u-lechuga', category: 'vegetales', iconType: 'leaf', label: 'Hortaliza / Hoja Verde', iconLabel: 'HOJA VERDE', defaultGrams: 500, keywords: ['verdura', 'espinaca', 'menestra', 'gazpacho', 'hortaliza'] },
  { id: 'u-tomate', category: 'vegetales', iconType: 'tomato', label: 'Tomate / Huerta Bio', iconLabel: 'TOMATE BIO', defaultGrams: 500, keywords: ['tomate', 'gazpacho', 'salsa', 'pimiento'] },
  { id: 'u-brocoli', category: 'vegetales', iconType: 'broccoli', label: 'Menestra / Verdura Vapor', iconLabel: 'MENESTRA', defaultGrams: 500, keywords: ['menestra', 'esparrago', 'verduras', 'alcachofa'] },
  { id: 'u-acai', category: 'vegetales', iconType: 'berry', label: 'Frutos Silvestres / Açaí', iconLabel: 'FRUTA ANTIOX', defaultGrams: 250, keywords: ['acai', 'arándano', 'fruta', 'frambuesa', 'superfoods'] },
  
  // 25% Granos Integrales
  { id: 'u-avena', category: 'granos', iconType: 'bowl', label: 'Copos de Avena Integral', iconLabel: 'AVENA PURA', defaultGrams: 500, keywords: ['avena', 'copos', 'muesli', 'porridge'] },
  { id: 'u-quinoa', category: 'granos', iconType: 'wheat', label: 'Quinoa Real / Espelta', iconLabel: 'QUINOA REAL', defaultGrams: 500, keywords: ['quinoa', 'espelta', 'trigo', 'cebada', 'sarraceno'] },
  { id: 'u-arroz', category: 'granos', iconType: 'rice', label: 'Arroz Integral / Tortas', iconLabel: 'ARROZ BIO', defaultGrams: 500, keywords: ['arroz', 'torta', 'tortitas'] },

  // 25% Proteínas Limpias
  { id: 'u-garbanzo', category: 'proteinas', iconType: 'bean', label: 'Garbanzos Castellanos', iconLabel: 'GARBANZO BIO', defaultGrams: 500, keywords: ['garbanzo', 'hummus'] },
  { id: 'u-lenteja', category: 'proteinas', iconType: 'lentil', label: 'Lentejas con Verduras', iconLabel: 'LENTEJA BIO', defaultGrams: 500, keywords: ['lenteja', 'lentejas'] },
  { id: 'u-tofu', category: 'proteinas', iconType: 'tofu', label: 'Tofu / Proteína Vegetal', iconLabel: 'PROTEÍNA BIO', defaultGrams: 500, keywords: ['tofu', 'proteina', 'protein', 'alubia'] },
  { id: 'u-semillas', category: 'proteinas', iconType: 'seed', label: 'Semillas Chía / Frutos Secos', iconLabel: 'SEMILLAS', defaultGrams: 250, keywords: ['chia', 'semillas', 'nuez', 'almendra', 'lino'] },

  // Centro: Aceite Noble
  { id: 'u-aove', category: 'grasas', iconType: 'oil', label: 'AOVE Ecológico Extra', iconLabel: 'AOVE 100% BIO', defaultGrams: 250, keywords: ['aceite', 'oliva', 'aove', 'virgen'] },
];

export const HarvardPlateInteractive = ({ onGoToStore }: HarvardPlateProps) => {
  const { addCatalogProduct, setIsOpen } = useCart();
  const { toast } = useToast();

  // 1. HORIZONTE TEMPORAL SELECCIONADO (Semana a 1 año)
  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizon>('1-semana');
  const [householdSize, setHouseholdSize] = useState<number>(2);

  // 2. TEST DE PERFIL DIETÉTICO (No se abre automáticamente al entrar)
  const [hasCompletedTest, setHasCompletedTest] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ecoland-plate-test-done') === 'true';
    } catch { return false; }
  });

  const [dietType, setDietType] = useState<string>(() => {
    try { return localStorage.getItem('ecoland-user-diet-type') || 'vegano'; } catch { return 'vegano'; }
  });
  
  // El modal NUNCA sale de una, solo si el usuario pulsa en iniciarlo
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Buscadores específicos por sección
  const [searchVeg, setSearchVeg] = useState<string>('');
  const [searchGrains, setSearchGrains] = useState<string>('');
  const [searchProt, setSearchProt] = useState<string>('');

  // Explorador General de Todo el Catálogo (+1.000 productos)
  const [isCatalogExplorerOpen, setIsCatalogExplorerOpen] = useState(false);
  const [explorerCategory, setExplorerCategory] = useState<'todos' | 'vegetales' | 'granos' | 'proteinas' | 'aceites'>('todos');
  const [explorerSearch, setExplorerSearch] = useState('');

  // Drop hover state
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  const saveQuickTest = () => {
    try {
      localStorage.setItem('ecoland-plate-test-done', 'true');
      localStorage.setItem('ecoland-user-diet-type', dietType);
      const tags = dietType === 'vegano' ? ['vegano', 'bio'] : dietType === 'celiaco' ? ['sin-gluten', 'bio'] : ['bio'];
      localStorage.setItem('ecoland-diet-tags', JSON.stringify(tags));
    } catch {}
    setHasCompletedTest(true);
    setIsTestModalOpen(false);
    toast({
      title: "✓ Perfil dietético configurado",
      description: "Los cálculos de raciones y recomendaciones se han ajustado a tu dieta y hogar.",
    });
  };

  // Filtrado de productos disponibles por dieta
  const filteredCatalog = useMemo(() => {
    let pool = allCatalogProducts.filter(p => p.price > 0 && p.inStock);
    if (dietType === 'vegano') {
      pool = pool.filter(p => p.tags.includes('vegano'));
    } else if (dietType === 'celiaco') {
      pool = pool.filter(p => p.tags.includes('sin-gluten'));
    }
    return pool;
  }, [dietType]);

  // Catálogos específicos
  const vegCatalog = useMemo(() => {
    return filteredCatalog.filter(p => {
      const matchCat = p.category === 'legumbres' || p.category === 'salsas' || p.category === 'superfoods';
      const text = (p.name + ' ' + p.description).toLowerCase();
      const matchWord = text.includes('verdura') || text.includes('tomate') || text.includes('gazpacho') || text.includes('esparrago') || text.includes('acai');
      return matchCat || matchWord;
    });
  }, [filteredCatalog]);

  const grainCatalog = useMemo(() => {
    return filteredCatalog.filter(p => {
      const matchCat = p.category === 'desayunos';
      const text = (p.name + ' ' + p.description).toLowerCase();
      const matchWord = text.includes('avena') || text.includes('quinoa') || text.includes('arroz') || text.includes('copos') || text.includes('espelta') || text.includes('cebada');
      return matchCat || matchWord;
    });
  }, [filteredCatalog]);

  const protCatalog = useMemo(() => {
    return filteredCatalog.filter(p => {
      const matchCat = p.category === 'legumbres' || p.category === 'superfoods';
      const text = (p.name + ' ' + p.description).toLowerCase();
      const matchWord = text.includes('garbanzo') || text.includes('lenteja') || text.includes('alubia') || text.includes('protein') || text.includes('tofu') || text.includes('chia');
      return matchCat || matchWord;
    });
  }, [filteredCatalog]);

  const oilCatalog = useMemo(() => {
    return filteredCatalog.filter(p => p.category === 'aceites' || p.name.toLowerCase().includes('aceite'));
  }, [filteredCatalog]);

  // Plate Items in State con valores iniciales
  const [plateItems, setPlateItems] = useState<PlateFoodItem[]>(() => {
    const initVeg = vegCatalog.find(p => p.slug.includes('lentejas-con-verduras')) || vegCatalog[0] || allCatalogProducts[0];
    const initGrain = grainCatalog.find(p => p.slug.includes('avena')) || grainCatalog[0] || allCatalogProducts[1];
    const initProt = protCatalog.find(p => p.slug.includes('garbanzo')) || protCatalog[0] || allCatalogProducts[2];
    const initOil = oilCatalog[0] || allCatalogProducts[3];

    return [
      {
        id: 'init-veg',
        category: 'vegetales',
        product: initVeg,
        grams: 1000,
        iconLabel: 'HORTALIZA BIO',
        displayName: cleanProductName(initVeg.name)
      },
      {
        id: 'init-grain',
        category: 'granos',
        product: initGrain,
        grams: 500,
        iconLabel: 'AVENA BIO',
        displayName: cleanProductName(initGrain.name)
      },
      {
        id: 'init-prot',
        category: 'proteinas',
        product: initProt,
        grams: 500,
        iconLabel: 'LEGUMBRE BIO',
        displayName: cleanProductName(initProt.name)
      },
      {
        id: 'init-oil',
        category: 'grasas',
        product: initOil,
        grams: 250,
        iconLabel: 'AOVE BIO',
        displayName: cleanProductName(initOil.name)
      }
    ];
  });

  // METAS SEGÚN HORIZONTE TEMPORAL SELECCIONADO
  const currentHorizonConfig = HORIZONS.find(h => h.id === selectedHorizon) || HORIZONS[0];
  const totalMealsTarget = currentHorizonConfig.mealsPerPerson * householdSize;

  // Requerimientos recomendados según Harvard por persona por comida:
  // - 250g vegetales/frutas
  // - 125g granos integrales
  // - 125g proteína limpia
  // - ~20g aceite noble
  const targetVegGrams = Math.round(totalMealsTarget * 250);
  const targetGrainGrams = Math.round(totalMealsTarget * 125);
  const targetProtGrams = Math.round(totalMealsTarget * 125);
  const targetTotalGrams = targetVegGrams + targetGrainGrams + targetProtGrams;

  // Añadir alimento al plato
  const addFoodToPlate = (product: CatalogProduct, category: 'vegetales' | 'granos' | 'proteinas' | 'grasas', grams = 500, iconLabel = 'ALIMENTO BIO') => {
    const newItem: PlateFoodItem = {
      id: `${product.slug}-${Date.now()}-${Math.random()}`,
      category,
      product,
      grams,
      iconLabel,
      displayName: cleanProductName(product.name)
    };

    setPlateItems(prev => [...prev, newItem]);

    toast({
      title: "✓ Añadido al planificador",
      description: `${newItem.displayName} (+${grams >= 1000 ? `${(grams/1000).toFixed(1)}kg` : `${grams}g`}) sumado a tu despensa.`,
    });
  };

  // Añadir alimento universal representativo
  const addUniversalFood = (universal: UniversalFood) => {
    let pool: CatalogProduct[] = [];
    if (universal.category === 'vegetales') pool = vegCatalog;
    else if (universal.category === 'granos') pool = grainCatalog;
    else if (universal.category === 'proteinas') pool = protCatalog;
    else pool = oilCatalog;

    if (pool.length === 0) pool = filteredCatalog;

    let matched = pool.filter(p => {
      const txt = (p.name + ' ' + p.description).toLowerCase();
      return universal.keywords.some(k => txt.includes(k));
    });

    if (matched.length === 0) matched = pool;
    const selectedProduct = matched[Math.floor(Math.random() * matched.length)] || pool[0];

    // Si el horizonte es de 1 mes o más, incrementamos la ración para abastecimiento real
    const scaledGrams = currentHorizonConfig.days >= 30 ? universal.defaultGrams * 2 : universal.defaultGrams;

    addFoodToPlate(selectedProduct, universal.category, scaledGrams, universal.iconLabel);
  };

  const removePlateItem = (id: string) => {
    setPlateItems(prev => prev.filter(x => x.id !== id));
  };

  // Manejo de Drag and Drop
  const handleDragStart = (e: React.DragEvent, slug: string, category: string, iconLabel: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ slug, category, iconLabel }));
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
        addFoodToPlate(foundProduct, targetCategory, grams, data.iconLabel || 'ALIMENTO');
      }
    } catch (err) {
      console.error('Error in drop handler', err);
    }
  };

  // ==========================================
  // CÁLCULOS NUTRICIONALES Y DE HORIZONTE
  // ==========================================
  const currentTotalGrams = plateItems.reduce((acc, it) => acc + it.grams, 0) || 1;
  const currentVegGrams = plateItems.filter(it => it.category === 'vegetales').reduce((acc, it) => acc + it.grams, 0);
  const currentGrainGrams = plateItems.filter(it => it.category === 'granos').reduce((acc, it) => acc + it.grams, 0);
  const currentProtGrams = plateItems.filter(it => it.category === 'proteinas').reduce((acc, it) => acc + it.grams, 0);
  const currentOilGrams = plateItems.filter(it => it.category === 'grasas').reduce((acc, it) => acc + it.grams, 0);

  // Porcentajes de proporción interna del plato
  const vegPercent = Math.round((currentVegGrams / currentTotalGrams) * 100);
  const grainPercent = Math.round((currentGrainGrams / currentTotalGrams) * 100);
  const protPercent = Math.round((currentProtGrams / currentTotalGrams) * 100);

  // Porcentaje de cumplimiento del OBJETIVO TEMPORAL (Barra de progreso hacia la meta)
  const targetCoveragePercent = Math.min(100, Math.round((currentTotalGrams / targetTotalGrams) * 100));

  // Estimación de nutrientes totales acumulados
  const totalCalories = Math.round(
    (currentVegGrams * 0.45) + 
    (currentGrainGrams * 1.30) + 
    (currentProtGrams * 1.40) + 
    (currentOilGrams * 8.84)
  );

  const totalProteinGrams = Math.round(
    (currentVegGrams * 0.02) + 
    (currentGrainGrams * 0.045) + 
    (currentProtGrams * 0.09)
  );

  const totalFiberGrams = Math.round(
    (currentVegGrams * 0.035) + 
    (currentGrainGrams * 0.04) + 
    (currentProtGrams * 0.065)
  );

  const totalPrice = plateItems.reduce((acc, it) => acc + it.product.price, 0);

  // Micronutrientes
  const hasVitC = currentVegGrams >= 1000;
  const hasIron = currentProtGrams >= 1000 || currentGrainGrams >= 1000;
  const hasCalcium = currentProtGrams >= 1000 || currentVegGrams >= 1500;
  const hasMagnesium = currentGrainGrams >= 1000;
  const hasPolyphenols = currentOilGrams > 0;

  // Feedback Inteligente Dinámico
  let feedback = {
    isOptimal: false,
    title: 'Ajustando equilibrio...',
    text: '',
    color: 'bg-emerald-50/80 text-emerald-950 border-emerald-200'
  };

  if (targetCoveragePercent >= 90 && vegPercent >= 45 && vegPercent <= 55 && grainPercent >= 20 && grainPercent <= 30 && protPercent >= 20 && protPercent <= 30) {
    feedback = {
      isOptimal: true,
      title: `¡Meta de ${currentHorizonConfig.label} 100% Alcanzada!`,
      text: `Excelente planificación. Has cubierto las ${totalMealsTarget} comidas de tu hogar con la proporción exacta recomendada por la Escuela de Salud Pública de Harvard.`,
      color: 'bg-emerald-100 text-emerald-950 border-emerald-300'
    };
  } else if (grainPercent > 32) {
    feedback = {
      isOptimal: false,
      title: 'Proporción con exceso de granos/cereales',
      text: '🥦 Ya tienes suficientes carbohidratos en tu plan; arroja hortalizas o verduras a tu plato para equilibrar la densidad nutricional.',
      color: 'bg-amber-50 text-amber-950 border-amber-300'
    };
  } else if (vegPercent < 42) {
    const diffKg = ((targetVegGrams - currentVegGrams) / 1000).toFixed(1);
    feedback = {
      isOptimal: false,
      title: 'Faltan vegetales y hortalizas frescas',
      text: `Tu objetivo de ${currentHorizonConfig.label} requiere más vegetales para llegar al 50%. Te sugerimos arrojar unos ${Math.max(1, parseFloat(diffKg))} kg de verduras bio.`,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200'
    };
  } else if (protPercent < 20) {
    feedback = {
      isOptimal: false,
      title: 'Aporte de proteína incompleto',
      text: '💪 Te falta proteína limpia para el 25%; suma garbanzos, lentejas bio o semillas a tu planificador.',
      color: 'bg-blue-50 text-blue-950 border-blue-200'
    };
  } else {
    feedback = {
      isOptimal: true,
      title: `Plan en progreso (${targetCoveragePercent}% completado)`,
      text: `Llevas ${(currentTotalGrams/1000).toFixed(1)} kg de alimentos biológicos de los ${(targetTotalGrams/1000).toFixed(1)} kg previstos para ${currentHorizonConfig.label}.`,
      color: 'bg-teal-50 text-teal-950 border-teal-200'
    };
  }

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

  // Filtrado de búsquedas
  const displayVeg = useMemo(() => {
    if (!searchVeg.trim()) return vegCatalog.slice(0, 6);
    const q = searchVeg.toLowerCase();
    return vegCatalog.filter(p => (p.name + ' ' + p.brand + ' ' + p.description).toLowerCase().includes(q)).slice(0, 10);
  }, [vegCatalog, searchVeg]);

  const displayGrains = useMemo(() => {
    if (!searchGrains.trim()) return grainCatalog.slice(0, 6);
    const q = searchGrains.toLowerCase();
    return grainCatalog.filter(p => (p.name + ' ' + p.brand + ' ' + p.description).toLowerCase().includes(q)).slice(0, 10);
  }, [grainCatalog, searchGrains]);

  const displayProt = useMemo(() => {
    if (!searchProt.trim()) return protCatalog.slice(0, 6);
    const q = searchProt.toLowerCase();
    return protCatalog.filter(p => (p.name + ' ' + p.brand + ' ' + p.description).toLowerCase().includes(q)).slice(0, 10);
  }, [protCatalog, searchProt]);

  // Explorador General de productos
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
    return pool.slice(0, 36);
  }, [filteredCatalog, explorerCategory, explorerSearch, vegCatalog, grainCatalog, protCatalog, oilCatalog]);

  return (
    <div className="space-y-8">
      
      {/* 1. BANNER ELEGANTE DE PERFIL NUTRICIONAL (Sugerencia no intrusiva con beneficios) */}
      {!hasCompletedTest ? (
        <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 text-white rounded-3xl p-6 border border-emerald-500/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Experiencia Personalizada
              </span>
              <span className="text-xs text-emerald-200">Test opcional de 30 segundos</span>
            </div>
            <h3 className="text-lg md:text-xl font-display font-bold">
              ¿Quieres adaptar las proporciones a tu dieta e intolerancias?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Configura si tu hogar es vegano, celíaco o variado para que el plato solo ofrezca alimentos 100% compatibles, calcule raciones exactas y evite compras innecesarias.
            </p>
          </div>
          <Button 
            onClick={() => setIsTestModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs py-5 px-5 rounded-2xl shrink-0 shadow-sm gap-2"
          >
            <span>Configurar mi perfil</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>Perfil activo: <strong>{dietType === 'vegano' ? 'Vegano Estricto' : dietType === 'celiaco' ? 'Sin Gluten / Celíaco' : 'Bio Variado'}</strong> ({householdSize} personas)</span>
          </div>
          <button 
            onClick={() => setIsTestModalOpen(true)}
            className="text-emerald-700 font-bold hover:underline text-[11px]"
          >
            Modificar perfil
          </button>
        </div>
      )}

      {/* Modal de Test (Se abre SOLO si el usuario pulsa en Configurar) */}
      <AnimatePresence>
        {isTestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border space-y-6 relative"
            >
              <button 
                onClick={() => setIsTestModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1.5">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700">Ajuste Nutricional</span>
                <h3 className="font-display text-2xl font-black text-slate-900">
                  Perfil de Alimentación y Hogar
                </h3>
                <p className="text-xs text-slate-500">
                  Adaptaremos los alimentos disponibles y los volúmenes del plato según tus necesidades.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-2">1. ¿Qué pauta nutricional sigues?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'vegano', label: '🌱 Vegana 100%' },
                      { id: 'celiaco', label: '🌾 Sin Gluten' },
                      { id: 'omnivoro', label: '✨ Bio Variada' },
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDietType(d.id)}
                        className={`p-3 rounded-2xl border font-bold text-center transition-all ${
                          dietType === d.id ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-2">2. ¿Para cuántas personas planificas la compra?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 1, label: '👤 1 persona' },
                      { id: 2, label: '👥 2 personas' },
                      { id: 4, label: '👨‍👩‍👧 Familia (4)' },
                    ].map(h => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setHouseholdSize(h.id)}
                        className={`p-3 rounded-2xl border font-bold text-center transition-all ${
                          householdSize === h.id ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={saveQuickTest}
                className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-6 text-sm rounded-2xl shadow-md gap-2"
              >
                <span>Guardar y aplicar a mi plato</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SELECTOR DE HORIZONTE TEMPORAL (1 semana hasta 1 año) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-700" />
              <h3 className="font-display font-black text-slate-900 text-lg md:text-xl">
                Objetivo Temporal de Abastecimiento Saludable
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Selecciona el periodo que deseas calcular. El plato dimensionará los kilos y raciones que tu hogar necesita para estar 100% cubierto.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border text-xs font-bold text-slate-700 shrink-0">
            <span>Comensales:</span>
            {[1, 2, 4].map(n => (
              <button
                key={n}
                onClick={() => setHouseholdSize(n)}
                className={`px-2.5 py-1 rounded-xl transition-all ${householdSize === n ? 'bg-emerald-800 text-white shadow-2xs' : 'hover:bg-slate-200'}`}
              >
                {n} {n === 1 ? 'pers.' : 'pers.'}
              </button>
            ))}
          </div>
        </div>

        {/* Botones de horizonte temporal: 1 semana, 1 mes, 1.5 meses, 2 meses, 3 meses, 6 meses, 1 año */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 text-xs font-bold">
          {HORIZONS.map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedHorizon(h.id)}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-center items-center gap-0.5 ${
                selectedHorizon === h.id 
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-500/30' 
                  : 'bg-slate-50/70 text-slate-700 hover:bg-slate-100 border-slate-200/70'
              }`}
            >
              <span className="font-bold">{h.label}</span>
              <span className={`text-[10px] font-normal ${selectedHorizon === h.id ? 'text-emerald-300' : 'text-slate-400'}`}>
                {h.days * householdSize * 2} comidas
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. BARRA DE CUMPLIMIENTO DEL OBJETIVO TEMPORAL */}
      <div className={`p-6 rounded-3xl border shadow-xs transition-all ${feedback.color} space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-800 bg-white/70 px-2.5 py-1 rounded-full border border-emerald-300 inline-block mb-1.5">
              🎯 Meta para {currentHorizonConfig.label} ({totalMealsTarget} comidas calculadas para {householdSize} {householdSize === 1 ? 'persona' : 'personas'})
            </span>
            <h4 className="text-base md:text-lg font-black">{feedback.title}</h4>
            <p className="text-xs leading-relaxed mt-0.5 max-w-3xl opacity-90">{feedback.text}</p>
          </div>
          
          <div className="text-left md:text-right shrink-0 bg-white/80 p-3.5 rounded-2xl border border-emerald-200">
            <span className="text-xs text-slate-500 block">Progreso hacia tu meta</span>
            <strong className="text-2xl font-black font-display text-emerald-950">{targetCoveragePercent}%</strong>
            <span className="block text-[11px] text-slate-500 font-mono">{(currentTotalGrams/1000).toFixed(1)} kg de {(targetTotalGrams/1000).toFixed(1)} kg</span>
          </div>
        </div>

        {/* Barra de progreso global del periodo */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-200/80 rounded-full h-3.5 overflow-hidden p-0.5 border border-emerald-200">
            <div 
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 h-full rounded-full transition-all duration-500 shadow-inner" 
              style={{ width: `${targetCoveragePercent}%` }} 
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0 kg</span>
            <span>Objetivo Despensa: {(targetTotalGrams/1000).toFixed(1)} kg</span>
          </div>
        </div>

        {/* Desglose de proporciones Harvard alcanzadas */}
        <div className="grid grid-cols-3 gap-3 pt-2 text-[11px] border-t border-emerald-200/60">
          <div>
            <div className="flex justify-between mb-1 font-bold text-slate-800">
              <span>🥦 Vegetales: <strong>{vegPercent}%</strong></span>
              <span className="text-slate-500">Meta: 50%</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (vegPercent / 50) * 100)}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 font-bold text-slate-800">
              <span>🌾 Granos: <strong>{grainPercent}%</strong></span>
              <span className="text-slate-500">Meta: 25%</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (grainPercent / 25) * 100)}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 font-bold text-slate-800">
              <span>🫘 Proteína: <strong>{protPercent}%</strong></span>
              <span className="text-slate-500">Meta: 25%</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (protPercent / 25) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. PANEL DE MICRONUTRIENTES Y VALORES GLOBALES */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Aporte Nutricional Completo</span>
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Nutrientes y Micronutrientes Esenciales
            </h4>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Energía Total</span>
              <strong className="text-base text-white">{totalCalories} kcal</strong>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Proteína Bio</span>
              <strong className="text-base text-white">{totalProteinGrams}g</strong>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Fibra Prebiótica</span>
              <strong className="text-base text-white">{totalFiberGrams}g</strong>
            </div>
          </div>
        </div>

        {/* Badges de Micronutrientes estilo Ametller Origen (minimalistas con borde limpio) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 text-xs">
          <div className={`p-2.5 rounded-2xl border transition-all ${hasVitC ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
            <span className="text-xs font-bold block">VITAMINA C</span>
            <span className="text-[10px] mt-0.5 block">{hasVitC ? '✓ Aporte Óptimo' : 'Faltan hortalizas'}</span>
          </div>
          <div className={`p-2.5 rounded-2xl border transition-all ${hasIron ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
            <span className="text-xs font-bold block">HIERRO VEGETAL</span>
            <span className="text-[10px] mt-0.5 block">{hasIron ? '✓ Cubierto (Legumbres)' : 'Faltan legumbres'}</span>
          </div>
          <div className={`p-2.5 rounded-2xl border transition-all ${hasCalcium ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
            <span className="text-xs font-bold block">CALCIO BIODISPONIBLE</span>
            <span className="text-[10px] mt-0.5 block">{hasCalcium ? '✓ Cubierto' : 'Bajo aporte'}</span>
          </div>
          <div className={`p-2.5 rounded-2xl border transition-all ${hasMagnesium ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
            <span className="text-xs font-bold block">MAGNESIO Y POTASIO</span>
            <span className="text-[10px] mt-0.5 block">{hasMagnesium ? '✓ Granos enteros' : 'Faltan cereales'}</span>
          </div>
          <div className={`p-2.5 rounded-2xl border transition-all ${hasPolyphenols ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
            <span className="text-xs font-bold block">POLIFENOLES / AOVE</span>
            <span className="text-[10px] mt-0.5 block">{hasPolyphenols ? '✓ Grasas Nobles' : 'Añadir AOVE'}</span>
          </div>
        </div>
      </div>

      {/* 5. ÁREA INTERACTIVA: EL PLATO CENTRAL + PRODUCTOS ALREDEDOR */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs space-y-8">
        
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: EL PLATO CIRCULAR INTERACTIVO (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6">
            
            <div className="text-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Plato Harvard Interactivo
              </span>
              <h3 className="font-display font-black text-slate-900 text-xl mt-1">
                Tu Despensa Equilibrada
              </h3>
              <p className="text-xs text-slate-500">Arrastra alimentos o pulsa los botones de añadir para lanzarlos a su sección.</p>
            </div>

            {/* El Plato Circular Drop Zone */}
            <div className="relative w-full max-w-[380px] aspect-square rounded-full p-3 bg-slate-100 border-[10px] border-slate-200 shadow-xl flex flex-col justify-between overflow-hidden">
              
              {/* Mitad Superior: 50% Vegetales y Frutas */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOverZone('vegetales'); }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropOnZone(e, 'vegetales')}
                className={`h-1/2 w-full rounded-t-full p-3 flex flex-col justify-center items-center text-center relative transition-all ${
                  dragOverZone === 'vegetales' ? 'bg-emerald-400/40 ring-4 ring-emerald-500' : 'bg-emerald-500/20 hover:bg-emerald-500/30'
                } border-b-2 border-dashed border-emerald-600/40`}
              >
                <span className="text-[10px] font-black text-emerald-950 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full mb-1 shadow-2xs">
                  50% Vegetales & Frutas ({(currentVegGrams/1000).toFixed(1)} kg)
                </span>
                
                <div className="flex flex-wrap gap-1 justify-center max-h-24 overflow-y-auto mt-1 p-1">
                  {plateItems.filter(x => x.category === 'vegetales').map(it => (
                    <span key={it.id} className="text-[10px] bg-white text-emerald-950 px-2 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 font-bold">
                      <span>{it.displayName}</span>
                      <span className="text-emerald-700 font-mono text-[9px]">({it.grams >= 1000 ? `${(it.grams/1000).toFixed(1)}kg` : `${it.grams}g`})</span>
                      <button onClick={() => removePlateItem(it.id)} className="text-red-500 hover:text-red-700 ml-0.5">×</button>
                    </span>
                  ))}
                  {plateItems.filter(x => x.category === 'vegetales').length === 0 && (
                    <span className="text-[10px] text-emerald-800/70 italic">Suelta aquí verduras u hortalizas</span>
                  )}
                </div>
              </div>

              {/* Mitad Inferior: 25% Granos Integrales + 25% Proteínas */}
              <div className="h-1/2 w-full flex">
                
                {/* Cuadrante Inferior Izquierdo: 25% Granos */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragOverZone('granos'); }}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => handleDropOnZone(e, 'granos')}
                  className={`w-1/2 h-full rounded-bl-full p-2.5 flex flex-col justify-center items-center text-center transition-all border-r border-dashed border-amber-600/40 ${
                    dragOverZone === 'granos' ? 'bg-amber-400/40 ring-4 ring-amber-500' : 'bg-amber-500/20 hover:bg-amber-500/30'
                  }`}
                >
                  <span className="text-[9px] font-black text-amber-950 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-full mb-1">
                    25% Granos ({(currentGrainGrams/1000).toFixed(1)} kg)
                  </span>
                  <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto mt-1 p-0.5">
                    {plateItems.filter(x => x.category === 'granos').map(it => (
                      <span key={it.id} className="text-[9px] bg-white text-amber-950 px-1.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 font-bold">
                        <span>{it.displayName}</span>
                        <span className="text-amber-700 font-mono text-[8px]">({it.grams >= 1000 ? `${(it.grams/1000).toFixed(1)}kg` : `${it.grams}g`})</span>
                        <button onClick={() => removePlateItem(it.id)} className="text-red-500 hover:text-red-700 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cuadrante Inferior Derecho: 25% Proteínas */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragOverZone('proteinas'); }}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => handleDropOnZone(e, 'proteinas')}
                  className={`w-1/2 h-full rounded-br-full p-2.5 flex flex-col justify-center items-center text-center transition-all ${
                    dragOverZone === 'proteinas' ? 'bg-blue-400/40 ring-4 ring-blue-500' : 'bg-blue-500/20 hover:bg-blue-500/30'
                  }`}
                >
                  <span className="text-[9px] font-black text-blue-950 uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded-full mb-1">
                    25% Proteína ({(currentProtGrams/1000).toFixed(1)} kg)
                  </span>
                  <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto mt-1 p-0.5">
                    {plateItems.filter(x => x.category === 'proteinas').map(it => (
                      <span key={it.id} className="text-[9px] bg-white text-blue-950 px-1.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 font-bold">
                        <span>{it.displayName}</span>
                        <span className="text-blue-700 font-mono text-[8px]">({it.grams >= 1000 ? `${(it.grams/1000).toFixed(1)}kg` : `${it.grams}g`})</span>
                        <button onClick={() => removePlateItem(it.id)} className="text-red-500 hover:text-red-700 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Centro: Aceite Noble */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOverZone('grasas'); }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropOnZone(e, 'grasas')}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-amber-400 border-4 border-white shadow-lg flex flex-col items-center justify-center text-amber-950 text-center cursor-pointer hover:scale-105 transition-transform"
                title="Grasas Nobles: Aceite de Oliva Virgen Extra (AOVE)"
              >
                <span className="text-[9px] font-black uppercase">AOVE</span>
                <span className="text-[8px] font-mono">{(currentOilGrams/1000).toFixed(2)}L</span>
              </div>

            </div>

            {/* Total y Botón de Compra */}
            <div className="w-full max-w-[380px] p-5 rounded-2xl bg-slate-50 border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Total de tu plan ({currentHorizonConfig.label}):</span>
                <strong className="text-2xl font-black font-mono text-slate-900">{totalPrice.toFixed(2)}€</strong>
              </div>
              <Button 
                onClick={handleAddPlateToCart}
                className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-black py-6 rounded-2xl shadow-md gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Añadir todo el plan a la cesta ({totalPrice.toFixed(2)}€)</span>
              </Button>
            </div>

          </div>

          {/* COLUMNA DERECHA: ALIMENTOS UNIVERSALES + SECCIONES CON BUSCADOR + ACCESO AL CATÁLOGO COMPLETO (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* BOTÓN DESTACADO PARA ABRIR TODO EL CATÁLOGO (+1.000 PRODUCTOS) */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <strong className="text-xs font-bold text-emerald-950 block">¿Buscas un producto específico entre todo el catálogo?</strong>
                <span className="text-[11px] text-emerald-800">Explora las más de 1.000 referencias biológicas de Ecoland y arrástralas al plato.</span>
              </div>
              <Button 
                onClick={() => setIsCatalogExplorerOpen(prev => !prev)}
                variant="outline"
                size="sm"
                className="bg-white border-emerald-300 text-emerald-900 font-bold text-xs shrink-0 gap-1.5"
              >
                <span>{isCatalogExplorerOpen ? 'Ocultar catálogo' : 'Abrir todo el catálogo (+1.000)'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isCatalogExplorerOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* EXPLORADOR COMPLETO DESPLEGABLE */}
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
                        className="p-2 rounded-xl border bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all text-left flex flex-col justify-between cursor-grab active:cursor-grabbing shadow-2xs group"
                      >
                        <div className="flex items-center gap-2">
                          <img src={p.image} alt={p.name} className="w-8 h-8 object-contain rounded bg-white p-0.5 border shrink-0" />
                          <div className="truncate flex-1">
                            <span className="block text-[10px] font-bold text-slate-900 truncate">{cleanProductName(p.name)}</span>
                            <span className="block text-[8px] text-slate-400">{p.brand}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[9px] pt-1.5 mt-1 border-t border-slate-100">
                          <strong className="text-emerald-800 font-mono">{p.price.toFixed(2)}€</strong>
                          <button
                            onClick={() => {
                              const targetCat = p.category === 'desayunos' ? 'granos' : p.category === 'aceites' ? 'grasas' : p.category === 'legumbres' ? 'proteinas' : 'vegetales';
                              addFoodToPlate(p, targetCat, 500, 'BIO');
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-800 text-white font-bold hover:bg-emerald-700"
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

            {/* SECCIÓN 1: VEGETALES Y HORTALIZAS (50%) */}
            <div className="space-y-3 p-4 rounded-3xl bg-emerald-50/40 border border-emerald-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center">50%</div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">Vegetales, Frutas y Hortalizas</h4>
                    <p className="text-[11px] text-emerald-800">50% del volumen del plato (Fibra viva y antioxidantes)</p>
                  </div>
                </div>
                
                <div className="relative w-full sm:w-48">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    value={searchVeg}
                    onChange={(e) => setSearchVeg(e.target.value)}
                    placeholder="Buscar verdura o fruta..."
                    className="h-8 pl-8 text-xs bg-white border-emerald-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Opciones Universales Minimalistas */}
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1.5">
                  ✨ Opciones representativas (Pulsa para lanzar):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {UNIVERSAL_FOODS.filter(u => u.category === 'vegetales').map(u => (
                    <button
                      key={u.id}
                      onClick={() => addUniversalFood(u)}
                      className="p-2 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-200 text-left transition-all hover:scale-[1.02] shadow-2xs flex items-center justify-between"
                    >
                      <div className="truncate">
                        <span className="block text-[10px] font-bold text-slate-800 truncate">{u.label}</span>
                        <span className="text-[9px] text-emerald-700 font-mono">+{u.defaultGrams >= 1000 ? `${(u.defaultGrams/1000).toFixed(1)}kg` : `${u.defaultGrams}g`}</span>
                      </div>
                      <Plus className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Productos reales coincidentes */}
              <div className="grid sm:grid-cols-2 gap-2 pt-1">
                {displayVeg.map(p => (
                  <div 
                    key={p.slug}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.slug, 'vegetales', 'HORTALIZA')}
                    className="p-2.5 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 transition-all cursor-grab active:cursor-grabbing text-left space-y-1.5 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 p-1 border mx-auto shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="truncate flex-1">
                        <span className="block text-[11px] font-bold text-slate-900 truncate">{cleanProductName(p.name)}</span>
                        <span className="block text-[9px] text-slate-400 font-medium">{p.brand}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                      <strong className="text-emerald-800 font-mono text-xs">{p.price.toFixed(2)}€</strong>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => addFoodToPlate(p, 'vegetales', 500, 'HORTALIZA')}
                          className="px-2 py-0.5 rounded bg-emerald-700 text-white font-bold hover:bg-emerald-600 transition-colors"
                          title="Añadir 500g"
                        >
                          +½k
                        </button>
                        <button 
                          onClick={() => addFoodToPlate(p, 'vegetales', 1000, 'HORTALIZA')}
                          className="px-2 py-0.5 rounded bg-emerald-900 text-white font-bold hover:bg-emerald-800 transition-colors"
                          title="Añadir 1kg"
                        >
                          +1k
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 2: GRANOS INTEGRALES (25%) */}
            <div className="space-y-3 p-4 rounded-3xl bg-amber-50/40 border border-amber-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-black text-xs flex items-center justify-center">25%</div>
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm">Granos y Cereales Integrales</h4>
                    <p className="text-[11px] text-amber-800">25% del plato (Energía lenta y magnesio)</p>
                  </div>
                </div>
                
                <div className="relative w-full sm:w-48">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    value={searchGrains}
                    onChange={(e) => setSearchGrains(e.target.value)}
                    placeholder="Buscar avena, quinoa..."
                    className="h-8 pl-8 text-xs bg-white border-amber-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Opciones Universales */}
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1.5">
                  ✨ Opciones representativas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {UNIVERSAL_FOODS.filter(u => u.category === 'granos').map(u => (
                    <button
                      key={u.id}
                      onClick={() => addUniversalFood(u)}
                      className="p-2 rounded-xl bg-white hover:bg-amber-100/70 border border-amber-200 text-left transition-all hover:scale-[1.02] shadow-2xs flex items-center justify-between"
                    >
                      <div className="truncate">
                        <span className="block text-[10px] font-bold text-slate-800 truncate">{u.label}</span>
                        <span className="text-[9px] text-amber-700 font-mono">+{u.defaultGrams >= 1000 ? `${(u.defaultGrams/1000).toFixed(1)}kg` : `${u.defaultGrams}g`}</span>
                      </div>
                      <Plus className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Productos reales coincidentes */}
              <div className="grid sm:grid-cols-2 gap-2 pt-1">
                {displayGrains.map(p => (
                  <div 
                    key={p.slug}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.slug, 'granos', 'CEREAL')}
                    className="p-2.5 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 transition-all cursor-grab active:cursor-grabbing text-left space-y-1.5 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 p-1 border mx-auto shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="truncate flex-1">
                        <span className="block text-[11px] font-bold text-slate-900 truncate">{cleanProductName(p.name)}</span>
                        <span className="block text-[9px] text-slate-400 font-medium">{p.brand}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                      <strong className="text-amber-800 font-mono text-xs">{p.price.toFixed(2)}€</strong>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => addFoodToPlate(p, 'granos', 500, 'CEREAL')}
                          className="px-2 py-0.5 rounded bg-amber-700 text-white font-bold hover:bg-amber-600 transition-colors"
                          title="Añadir 500g"
                        >
                          +½k
                        </button>
                        <button 
                          onClick={() => addFoodToPlate(p, 'granos', 1000, 'CEREAL')}
                          className="px-2 py-0.5 rounded bg-amber-900 text-white font-bold hover:bg-amber-800 transition-colors"
                          title="Añadir 1kg"
                        >
                          +1k
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 3: PROTEÍNAS SALUDABLES (25%) */}
            <div className="space-y-3 p-4 rounded-3xl bg-blue-50/40 border border-blue-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-900 font-black text-xs flex items-center justify-center">25%</div>
                  <div>
                    <h4 className="font-bold text-blue-950 text-sm">Proteínas Limpias y Saludables</h4>
                    <p className="text-[11px] text-blue-800">25% del plato (Legumbres, semillas y aminoácidos)</p>
                  </div>
                </div>
                
                <div className="relative w-full sm:w-48">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    value={searchProt}
                    onChange={(e) => setSearchProt(e.target.value)}
                    placeholder="Buscar garbanzo, tofu..."
                    className="h-8 pl-8 text-xs bg-white border-blue-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Opciones Universales */}
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1.5">
                  ✨ Opciones representativas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {UNIVERSAL_FOODS.filter(u => u.category === 'proteinas').map(u => (
                    <button
                      key={u.id}
                      onClick={() => addUniversalFood(u)}
                      className="p-2 rounded-xl bg-white hover:bg-blue-100/70 border border-blue-200 text-left transition-all hover:scale-[1.02] shadow-2xs flex items-center justify-between"
                    >
                      <div className="truncate">
                        <span className="block text-[10px] font-bold text-slate-800 truncate">{u.label}</span>
                        <span className="text-[9px] text-blue-700 font-mono">+{u.defaultGrams >= 1000 ? `${(u.defaultGrams/1000).toFixed(1)}kg` : `${u.defaultGrams}g`}</span>
                      </div>
                      <Plus className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Productos reales coincidentes */}
              <div className="grid sm:grid-cols-2 gap-2 pt-1">
                {displayProt.map(p => (
                  <div 
                    key={p.slug}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.slug, 'proteinas', 'PROTEÍNA')}
                    className="p-2.5 rounded-2xl bg-white border border-blue-100 hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing text-left space-y-1.5 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 p-1 border mx-auto shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="truncate flex-1">
                        <span className="block text-[11px] font-bold text-slate-900 truncate">{cleanProductName(p.name)}</span>
                        <span className="block text-[9px] text-slate-400 font-medium">{p.brand}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                      <strong className="text-blue-800 font-mono text-xs">{p.price.toFixed(2)}€</strong>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => addFoodToPlate(p, 'proteinas', 500, 'PROTEÍNA')}
                          className="px-2 py-0.5 rounded bg-blue-700 text-white font-bold hover:bg-blue-600 transition-colors"
                          title="Añadir 500g"
                        >
                          +½k
                        </button>
                        <button 
                          onClick={() => addFoodToPlate(p, 'proteinas', 1000, 'PROTEÍNA')}
                          className="px-2 py-0.5 rounded bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors"
                          title="Añadir 1kg"
                        >
                          +1k
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
