import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ShoppingBag, CheckCircle2, RotateCcw, AlertCircle, 
  HelpCircle, ChevronRight, Check, Trash2, ArrowRight, Search,
  Activity, ShieldCheck, Heart, Flame, Scale, Plus
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
  grams: number; // 250, 500, 1000
  emoji: string;
  displayName: string;
}

// Limpiador estético del nombre del producto para que muestre el alimento real y no solo la marca
function cleanProductName(name: string): string {
  const parts = name.split('–');
  if (parts.length > 1) {
    let clean = parts[1].trim();
    clean = clean.replace(/""/g, '').replace(/Formato estándar/gi, '').trim();
    clean = clean.split('“')[0].split('"')[0].trim();
    return clean.length > 35 ? clean.substring(0, 35) + '…' : clean;
  }
  return name.length > 35 ? name.substring(0, 35) + '…' : name;
}

// Definición de alimentos universales representativos (con su emoji y categoría)
interface UniversalFood {
  id: string;
  category: 'vegetales' | 'granos' | 'proteinas' | 'grasas';
  emoji: string;
  label: string;
  defaultGrams: number;
  keywords: string[];
}

const UNIVERSAL_FOODS: UniversalFood[] = [
  // 50% Vegetales y Frutas
  { id: 'u-lechuga', category: 'vegetales', emoji: '🥬', label: 'Hortaliza / Hoja Verde', defaultGrams: 500, keywords: ['verdura', 'espinaca', 'menestra', 'gazpacho', 'hortaliza'] },
  { id: 'u-tomate', category: 'vegetales', emoji: '🍅', label: 'Tomate / Salsa Bio', defaultGrams: 500, keywords: ['tomate', 'gazpacho', 'salsa', 'pimiento'] },
  { id: 'u-brocoli', category: 'vegetales', emoji: '🥦', label: 'Brócoli / Menestra al Vapor', defaultGrams: 500, keywords: ['menestra', 'esparrago', 'verduras', 'alcachofa'] },
  { id: 'u-acai', category: 'vegetales', emoji: '🫐', label: 'Frutos Rojos / Açaí Bio', defaultGrams: 250, keywords: ['acai', 'arándano', 'fruta', 'frambuesa', 'superfoods'] },
  
  // 25% Granos Integrales
  { id: 'u-avena', category: 'granos', emoji: '🥣', label: 'Copos de Avena Integral', defaultGrams: 250, keywords: ['avena', 'copos', 'muesli', 'porridge'] },
  { id: 'u-quinoa', category: 'granos', emoji: '🌾', label: 'Quinoa Real / Espelta', defaultGrams: 250, keywords: ['quinoa', 'espelta', 'trigo', 'cebada', 'sarraceno'] },
  { id: 'u-arroz', category: 'granos', emoji: '🍚', label: 'Arroz o Tortas de Cereal', defaultGrams: 250, keywords: ['arroz', 'torta', 'tortitas'] },

  // 25% Proteínas Limpias
  { id: 'u-garbanzo', category: 'proteinas', emoji: '🫘', label: 'Garbanzos Cocidos Bio', defaultGrams: 250, keywords: ['garbanzo', 'hummus'] },
  { id: 'u-lenteja', category: 'proteinas', emoji: '🍲', label: 'Lentejas con Verduras Bio', defaultGrams: 250, keywords: ['lenteja', 'lentejas'] },
  { id: 'u-tofu', category: 'proteinas', emoji: '🧈', label: 'Tofu / Proteína Vegetal', defaultGrams: 250, keywords: ['tofu', 'proteina', 'protein', 'alubia'] },
  { id: 'u-semillas', category: 'proteinas', emoji: '🥜', label: 'Semillas Chía / Frutos Secos', defaultGrams: 250, keywords: ['chia', 'semillas', 'nuez', 'almendra', 'lino'] },

  // Centro: Aceite Noble
  { id: 'u-aove', category: 'grasas', emoji: '🫒', label: 'Aceite de Oliva Virgen Extra', defaultGrams: 100, keywords: ['aceite', 'oliva', 'aove', 'virgen'] },
];

export const HarvardPlateInteractive = ({ onGoToStore }: HarvardPlateProps) => {
  const { addCatalogProduct, setIsOpen } = useCart();
  const { toast } = useToast();

  // Test Rápido de Perfil State
  const [hasCompletedTest, setHasCompletedTest] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ecoland-plate-test-done') === 'true';
    } catch { return false; }
  });

  const [dietType, setDietType] = useState<string>(() => {
    try { return localStorage.getItem('ecoland-user-diet-type') || 'vegano'; } catch { return 'vegano'; }
  });
  const [householdSize, setHouseholdSize] = useState<string>('2');
  const [isTestModalOpen, setIsTestModalOpen] = useState(!hasCompletedTest);

  // Buscadores específicos por sección
  const [searchVeg, setSearchVeg] = useState<string>('');
  const [searchGrains, setSearchGrains] = useState<string>('');
  const [searchProt, setSearchProt] = useState<string>('');

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
      title: "¡Perfil personalizado guardado!",
      description: "Los alimentos de tu plato se han filtrado según tu preferencia nutricional.",
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

  // Catálogos específicos para cada facción
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

  // Plate Items in State con valores iniciales equilibrados
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
        grams: 500,
        emoji: '🥬',
        displayName: cleanProductName(initVeg.name)
      },
      {
        id: 'init-grain',
        category: 'granos',
        product: initGrain,
        grams: 250,
        emoji: '🥣',
        displayName: cleanProductName(initGrain.name)
      },
      {
        id: 'init-prot',
        category: 'proteinas',
        product: initProt,
        grams: 250,
        emoji: '🫘',
        displayName: cleanProductName(initProt.name)
      },
      {
        id: 'init-oil',
        category: 'grasas',
        product: initOil,
        grams: 100,
        emoji: '🫒',
        displayName: cleanProductName(initOil.name)
      }
    ];
  });

  // Función para agregar o lanzar producto al plato
  const addFoodToPlate = (product: CatalogProduct, category: 'vegetales' | 'granos' | 'proteinas' | 'grasas', grams = 250, emoji = '🥗') => {
    const newItem: PlateFoodItem = {
      id: `${product.slug}-${Date.now()}-${Math.random()}`,
      category,
      product,
      grams,
      emoji,
      displayName: cleanProductName(product.name)
    };

    setPlateItems(prev => [...prev, newItem]);

    toast({
      title: `${emoji} ¡Añadido al plato!`,
      description: `Se agregó ${newItem.displayName} (${grams}g).`,
    });
  };

  // Lanzar un alimento universal representativo (selecciona uno real aleatorio/óptimo)
  const addUniversalFood = (universal: UniversalFood) => {
    let pool: CatalogProduct[] = [];
    if (universal.category === 'vegetales') pool = vegCatalog;
    else if (universal.category === 'granos') pool = grainCatalog;
    else if (universal.category === 'proteinas') pool = protCatalog;
    else pool = oilCatalog;

    if (pool.length === 0) pool = filteredCatalog;

    // Buscar coincidencia por palabras clave
    let matched = pool.filter(p => {
      const txt = (p.name + ' ' + p.description).toLowerCase();
      return universal.keywords.some(k => txt.includes(k));
    });

    if (matched.length === 0) matched = pool;

    // Tomar uno aleatorio de los coincidentes
    const selectedProduct = matched[Math.floor(Math.random() * matched.length)] || pool[0];

    addFoodToPlate(selectedProduct, universal.category, universal.defaultGrams, universal.emoji);
  };

  const removePlateItem = (id: string) => {
    setPlateItems(prev => prev.filter(x => x.id !== id));
  };

  const updateItemGrams = (id: string, newGrams: number) => {
    setPlateItems(prev => prev.map(x => x.id === id ? { ...x, grams: newGrams } : x));
  };

  // Manejo de Drag and Drop HTML5 nativo
  const handleDragStart = (e: React.DragEvent, slug: string, category: string, emoji: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ slug, category, emoji }));
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
        addFoodToPlate(foundProduct, targetCategory, targetCategory === 'vegetales' ? 500 : 250, data.emoji || '🌱');
      }
    } catch (err) {
      console.error('Error handling drop', err);
    }
  };

  // ==========================================
  // CÁLCULOS NUTRICIONALES COMPLETOS
  // ==========================================
  const totalGrams = plateItems.reduce((acc, it) => acc + it.grams, 0) || 1;
  const vegGrams = plateItems.filter(it => it.category === 'vegetales').reduce((acc, it) => acc + it.grams, 0);
  const grainGrams = plateItems.filter(it => it.category === 'granos').reduce((acc, it) => acc + it.grams, 0);
  const protGrams = plateItems.filter(it => it.category === 'proteinas').reduce((acc, it) => acc + it.grams, 0);
  const oilGrams = plateItems.filter(it => it.category === 'grasas').reduce((acc, it) => acc + it.grams, 0);

  const vegPercent = Math.round((vegGrams / totalGrams) * 100);
  const grainPercent = Math.round((grainGrams / totalGrams) * 100);
  const protPercent = Math.round((protGrams / totalGrams) * 100);

  // Estimación de Calorías y Macronutrientes por 100g de cada grupo
  const totalCalories = Math.round(
    (vegGrams * 0.45) + // ~45 kcal por 100g de verduras/hortalizas cocidas
    (grainGrams * 1.30) + // ~130 kcal por 100g de cereales/granos cocidos
    (protGrams * 1.40) + // ~140 kcal por 100g de legumbres cocidas
    (oilGrams * 8.84)   // ~884 kcal por 100g de AOVE
  );

  const totalProteinGrams = Math.round(
    (vegGrams * 0.02) + 
    (grainGrams * 0.045) + 
    (protGrams * 0.09)
  );

  const totalFiberGrams = Math.round(
    (vegGrams * 0.035) + 
    (grainGrams * 0.04) + 
    (protGrams * 0.065)
  );

  const totalPrice = plateItems.reduce((acc, it) => acc + it.product.price, 0);

  // Vitaminas y Minerales detectados dinámicamente según lo que hay en el plato
  const hasVitC = vegGrams >= 250;
  const hasIron = protGrams >= 250 || grainGrams >= 250;
  const hasCalcium = protGrams >= 250 || vegGrams >= 250;
  const hasMagnesium = grainGrams >= 250;
  const hasPolyphenols = oilGrams > 0 || vegGrams >= 300;

  // Feedback Inteligente de Proporciones Harvard
  let feedback = {
    isOptimal: false,
    title: 'Ajustando equilibrio...',
    text: '',
    color: 'bg-emerald-50 text-emerald-950 border-emerald-300'
  };

  if (vegPercent >= 45 && vegPercent <= 55 && grainPercent >= 20 && grainPercent <= 30 && protPercent >= 20 && protPercent <= 30) {
    feedback = {
      isOptimal: true,
      title: '¡Proporción Científicamente Perfecta!',
      text: '🎉 ¡Bien! Llegaste a tu objetivo de plato balanceado Harvard (50% vegetales, 25% granos, 25% proteína limpia).',
      color: 'bg-emerald-100 text-emerald-950 border-emerald-400'
    };
  } else if (grainPercent > 32 || totalCalories > 850) {
    feedback = {
      isOptimal: false,
      title: 'Exceso de carbohidratos o calorías',
      text: '🥦 Ya tienes muchas calorías y granos; arroja algo de verdura a tus alimentos para tener una dieta más balanceada.',
      color: 'bg-amber-100 text-amber-950 border-amber-400'
    };
  } else if (vegPercent < 42) {
    feedback = {
      isOptimal: false,
      title: 'Faltan vegetales y fibra viva',
      text: `🥦 Tu plato necesita más vegetales. Te sugerimos lanzar medio kilo (+½k) de hortalizas o verduras para alcanzar el 50% de Harvard.`,
      color: 'bg-emerald-50 text-emerald-900 border-emerald-300'
    };
  } else if (protPercent < 20) {
    feedback = {
      isOptimal: false,
      title: 'Proteína insuficiente',
      text: '💪 Te falta proteína saludable; agrega legumbres bio (garbanzos, lentejas) o semillas para alcanzar el 25%.',
      color: 'bg-blue-50 text-blue-950 border-blue-300'
    };
  } else {
    feedback = {
      isOptimal: true,
      title: '¡Casi en el punto perfecto!',
      text: 'Tu plato tiene una gran armonía nutricional. Puedes añadir un hilo de AOVE o ajustar las porciones a tu gusto.',
      color: 'bg-teal-50 text-teal-950 border-teal-300'
    };
  }

  // Comprar todo el plato
  const handleAddPlateToCart = () => {
    // Añadimos productos únicos
    const uniqueProducts = Array.from(new Set(plateItems.map(p => p.product.id)))
      .map(id => plateItems.find(p => p.product.id === id)?.product)
      .filter(Boolean) as CatalogProduct[];

    uniqueProducts.forEach(prod => {
      addCatalogProduct(prod);
    });

    setIsOpen(true);
    toast({
      title: "🛒 ¡Plato Harvard añadido al carrito!",
      description: `Se han añadido ${uniqueProducts.length} alimentos bio por un total de ${totalPrice.toFixed(2)}€.`,
    });
  };

  // Filtrado de búsquedas
  const displayVeg = useMemo(() => {
    if (!searchVeg.trim()) return vegCatalog.slice(0, 6);
    const q = searchVeg.toLowerCase();
    return vegCatalog.filter(p => (p.name + ' ' + p.brand + ' ' + p.description).toLowerCase().includes(q)).slice(0, 8);
  }, [vegCatalog, searchVeg]);

  const displayGrains = useMemo(() => {
    if (!searchGrains.trim()) return grainCatalog.slice(0, 6);
    const q = searchGrains.toLowerCase();
    return grainCatalog.filter(p => (p.name + ' ' + p.brand + ' ' + p.description).toLowerCase().includes(q)).slice(0, 8);
  }, [grainCatalog, searchGrains]);

  const displayProt = useMemo(() => {
    if (!searchProt.trim()) return protCatalog.slice(0, 6);
    const q = searchProt.toLowerCase();
    return protCatalog.filter(p => (p.name + ' ' + p.brand + ' ' + p.description).toLowerCase().includes(q)).slice(0, 8);
  }, [protCatalog, searchProt]);

  return (
    <div className="space-y-8">
      
      {/* Test Modal (si no lo ha hecho o quiere cambiar) */}
      <AnimatePresence>
        {isTestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="text-3xl">🌿</span>
                <h3 className="font-display text-2xl font-black text-slate-900">
                  Test Rápido de Perfil Nutricional
                </h3>
                <p className="text-xs text-slate-500">
                  Para que los alimentos que rodean tu plato encajen al 100% con tu salud y necesidades.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">1. ¿Qué tipo de alimentación sigues?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'vegano', label: '🌱 Vegano' },
                      { id: 'celiaco', label: '🌾 Sin Gluten' },
                      { id: 'omnivoro', label: '✨ Bio Variado' },
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDietType(d.id)}
                        className={`p-3 rounded-2xl border font-bold text-center transition-all ${
                          dietType === d.id ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">2. ¿Para cuántas personas cocinas habitualmente?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1', label: '👤 1 persona' },
                      { id: '2', label: '👥 2 personas' },
                      { id: '4', label: '👨‍👩‍👧 Familia (4)' },
                    ].map(h => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setHouseholdSize(h.id)}
                        className={`p-3 rounded-2xl border font-bold text-center transition-all ${
                          householdSize === h.id ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
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
                className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-black py-6 text-sm rounded-2xl shadow-md gap-2"
              >
                <span>¡Empezar a armar mi plato equilibrado!</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Banner Creativo */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              🍽️ ¡Otra forma creativa de hacer tus compras!
            </span>
            <h2 className="text-2xl md:text-4xl font-display font-black tracking-tight">
              Te ayudamos a tener en balance tu dieta.
            </h2>
            <p className="text-emerald-100 text-xs md:text-sm leading-relaxed">
              Elige o arrastra hortalizas, legumbres o cereales al plato. El sistema calcula en vivo las calorías, macronutrientes y vitaminas necesarias, avisándote si te faltan verduras o proteínas para una proporción 100% equilibrada.
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsTestModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs shrink-0"
          >
            Ajustar perfil ({dietType === 'vegano' ? 'Vegano' : dietType === 'celiaco' ? 'Sin gluten' : 'Bio variado'})
          </Button>
        </div>
      </div>

      {/* Feedback Bar & Semáforo Harvard */}
      <div className={`p-5 rounded-3xl border text-xs shadow-xs transition-all ${feedback.color}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <strong className="block text-sm font-black">{feedback.title}</strong>
            <p className="text-xs leading-relaxed mt-0.5">{feedback.text}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono text-base font-black">{totalGrams}g</span>
            <span className="block text-[11px] opacity-75">{totalCalories} kcal estimadas</span>
          </div>
        </div>
        
        {/* Barras de porcentaje Harvard */}
        <div className="grid grid-cols-3 gap-3 pt-4 text-[11px]">
          <div>
            <div className="flex justify-between mb-1 font-bold">
              <span>🥦 Vegetales: <strong>{vegPercent}%</strong></span>
              <span className="text-slate-500">Meta: 50%</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (vegPercent / 50) * 100)}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 font-bold">
              <span>🌾 Granos: <strong>{grainPercent}%</strong></span>
              <span className="text-slate-500">Meta: 25%</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (grainPercent / 25) * 100)}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 font-bold">
              <span>🫘 Proteína: <strong>{protPercent}%</strong></span>
              <span className="text-slate-500">Meta: 25%</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (protPercent / 25) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Nutrición y Micronutrientes (Vitaminas y Minerales) */}
      <div className="bg-emerald-950 text-white rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Perfil Nutricional Completo del Plato</span>
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Macronutrientes & Micronutrientes Esenciales
            </h4>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-emerald-400 block text-[10px] uppercase font-sans">Energía</span>
              <strong className="text-base text-white">{totalCalories} kcal</strong>
            </div>
            <div className="border-l border-emerald-800 pl-4">
              <span className="text-emerald-400 block text-[10px] uppercase font-sans">Proteína</span>
              <strong className="text-base text-white">{totalProteinGrams}g</strong>
            </div>
            <div className="border-l border-emerald-800 pl-4">
              <span className="text-emerald-400 block text-[10px] uppercase font-sans">Fibra Viva</span>
              <strong className="text-base text-white">{totalFiberGrams}g</strong>
            </div>
          </div>
        </div>

        {/* Micronutrientes: Vitaminas y Minerales */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 text-xs">
          <div className={`p-2.5 rounded-2xl border transition-all ${hasVitC ? 'bg-emerald-900/60 border-emerald-600 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
            <span className="text-sm block">🍊 Vitamina C</span>
            <span className="text-[10px] font-bold mt-0.5 block">{hasVitC ? '✓ Aporte Óptimo' : 'Faltan vegetales'}</span>
          </div>
          <div className={`p-2.5 rounded-2xl border transition-all ${hasIron ? 'bg-emerald-900/60 border-emerald-600 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
            <span className="text-sm block">🩸 Hierro Bio</span>
            <span className="text-[10px] font-bold mt-0.5 block">{hasIron ? '✓ Cubierto (Legumbres)' : 'Falta legumbre'}</span>
          </div>
          <div className={`p-2.5 rounded-2xl border transition-all ${hasCalcium ? 'bg-emerald-900/60 border-emerald-600 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
            <span className="text-sm block">🦴 Calcio Vegetal</span>
            <span className="text-[10px] font-bold mt-0.5 block">{hasCalcium ? '✓ Cubierto' : 'Bajo aporte'}</span>
          </div>
          <div className={`p-2.5 rounded-2xl border transition-all ${hasMagnesium ? 'bg-emerald-900/60 border-emerald-600 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
            <span className="text-sm block">⚡ Magnesio</span>
            <span className="text-[10px] font-bold mt-0.5 block">{hasMagnesium ? '✓ Granos enteros' : 'Faltan cereales'}</span>
          </div>
          <div className={`p-2.5 rounded-2xl border transition-all ${hasPolyphenols ? 'bg-emerald-900/60 border-emerald-600 text-emerald-200' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
            <span className="text-sm block">🛡️ Polifenoles / AOVE</span>
            <span className="text-[10px] font-bold mt-0.5 block">{hasPolyphenols ? '✓ Grasas Nobles' : 'Añade AOVE'}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Plato Circular Central + Alrededor los Alimentos */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Plato Circular Interactivo (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6">
            
            <div className="text-center">
              <h3 className="font-display font-black text-slate-900 text-xl">Tu Plato Harvard Interactivo</h3>
              <p className="text-xs text-slate-500">Arrastra alimentos o pulsa +½k / +1k para lanzarlos a su facción.</p>
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
                  🥦 50% Vegetales & Frutas ({vegGrams}g)
                </span>
                
                {/* Lista de alimentos en esta facción */}
                <div className="flex flex-wrap gap-1 justify-center max-h-24 overflow-y-auto mt-1 p-1">
                  {plateItems.filter(x => x.category === 'vegetales').map(it => (
                    <span key={it.id} className="text-[10px] bg-white text-emerald-950 px-2 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 font-bold">
                      <span>{it.emoji} {it.displayName}</span>
                      <span className="text-emerald-700 font-mono text-[9px]">({it.grams >= 1000 ? `${it.grams/1000}kg` : `${it.grams}g`})</span>
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
                    🌾 25% Granos ({grainGrams}g)
                  </span>
                  <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto mt-1 p-0.5">
                    {plateItems.filter(x => x.category === 'granos').map(it => (
                      <span key={it.id} className="text-[9px] bg-white text-amber-950 px-1.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 font-bold">
                        <span>{it.emoji} {it.displayName}</span>
                        <span className="text-amber-700 font-mono text-[8px]">({it.grams >= 1000 ? `${it.grams/1000}kg` : `${it.grams}g`})</span>
                        <button onClick={() => removePlateItem(it.id)} className="text-red-500 hover:text-red-700 ml-0.5">×</button>
                      </span>
                    ))}
                    {plateItems.filter(x => x.category === 'granos').length === 0 && (
                      <span className="text-[9px] text-amber-800/70 italic">Suelta cereales</span>
                    )}
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
                    🫘 25% Proteína ({protGrams}g)
                  </span>
                  <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto mt-1 p-0.5">
                    {plateItems.filter(x => x.category === 'proteinas').map(it => (
                      <span key={it.id} className="text-[9px] bg-white text-blue-950 px-1.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 font-bold">
                        <span>{it.emoji} {it.displayName}</span>
                        <span className="text-blue-700 font-mono text-[8px]">({it.grams >= 1000 ? `${it.grams/1000}kg` : `${it.grams}g`})</span>
                        <button onClick={() => removePlateItem(it.id)} className="text-red-500 hover:text-red-700 ml-0.5">×</button>
                      </span>
                    ))}
                    {plateItems.filter(x => x.category === 'proteinas').length === 0 && (
                      <span className="text-[9px] text-blue-800/70 italic">Suelta legumbres</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Centro: Aceites y Grasas Nobles */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOverZone('grasas'); }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropOnZone(e, 'grasas')}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-amber-400 border-4 border-white shadow-lg flex flex-col items-center justify-center text-amber-950 text-center cursor-pointer hover:scale-105 transition-transform"
                title="Grasas Nobles: Aceite de Oliva Virgen Extra (AOVE)"
              >
                <span className="text-lg">🫒</span>
                <span className="text-[8px] font-black uppercase">AOVE</span>
              </div>

            </div>

            {/* Total y Botón de Compra Directa */}
            <div className="w-full max-w-[380px] p-5 rounded-2xl bg-slate-50 border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Total compra de tu plato:</span>
                <strong className="text-2xl font-black font-mono text-slate-900">{totalPrice.toFixed(2)}€</strong>
              </div>
              <Button 
                onClick={handleAddPlateToCart}
                className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-black py-6 rounded-2xl shadow-md gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Añadir todos los ingredientes al carrito</span>
              </Button>
            </div>

          </div>

          {/* Columna Derecha: Catálogo de Alimentos Orbitando + Comodines con Emojis + Buscadores (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* SECCIÓN 1: VEGETALES Y HORTALIZAS (50%) */}
            <div className="space-y-3 p-4 rounded-3xl bg-emerald-50/40 border border-emerald-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥦</span>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">Para el 50% Vegetales & Frutas</h4>
                    <p className="text-[11px] text-emerald-800">Fibra viva, antioxidantes y micronutrientes esenciales</p>
                  </div>
                </div>
                {/* Buscador específico */}
                <div className="relative w-full sm:w-48">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    value={searchVeg}
                    onChange={(e) => setSearchVeg(e.target.value)}
                    placeholder="Buscar verdura bio..."
                    className="h-8 pl-8 text-xs bg-white border-emerald-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Alimentos Universales Representativos (Comodines Rápidos con Emoji) */}
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1.5">
                  ✨ Opciones Universales Representativas (Pulsa para lanzar):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {UNIVERSAL_FOODS.filter(u => u.category === 'vegetales').map(u => (
                    <button
                      key={u.id}
                      onClick={() => addUniversalFood(u)}
                      className="p-2 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-200 text-left transition-all hover:scale-[1.02] shadow-2xs flex items-center gap-2"
                    >
                      <span className="text-xl">{u.emoji}</span>
                      <div className="truncate">
                        <span className="block text-[10px] font-bold text-slate-800 truncate">{u.label}</span>
                        <span className="text-[9px] text-emerald-700 font-mono">+½ kg</span>
                      </div>
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
                    onDragStart={(e) => handleDragStart(e, p.slug, 'vegetales', '🥬')}
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
                          onClick={() => addFoodToPlate(p, 'vegetales', 250, '🥬')}
                          className="px-2 py-0.5 rounded bg-emerald-700 text-white font-bold hover:bg-emerald-600 transition-colors"
                          title="Añadir 250g"
                        >
                          +½k
                        </button>
                        <button 
                          onClick={() => addFoodToPlate(p, 'vegetales', 500, '🥦')}
                          className="px-2 py-0.5 rounded bg-emerald-900 text-white font-bold hover:bg-emerald-800 transition-colors"
                          title="Añadir 500g"
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
                  <span className="text-xl">🌾</span>
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm">Para el 25% Granos Integrales</h4>
                    <p className="text-[11px] text-amber-800">Carbohidratos complejos de absorción lenta y magnesio</p>
                  </div>
                </div>
                {/* Buscador específico */}
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

              {/* Alimentos Universales Representativos */}
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1.5">
                  ✨ Opciones Universales Representativas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {UNIVERSAL_FOODS.filter(u => u.category === 'granos').map(u => (
                    <button
                      key={u.id}
                      onClick={() => addUniversalFood(u)}
                      className="p-2 rounded-xl bg-white hover:bg-amber-100 border border-amber-200 text-left transition-all hover:scale-[1.02] shadow-2xs flex items-center gap-2"
                    >
                      <span className="text-xl">{u.emoji}</span>
                      <div className="truncate">
                        <span className="block text-[10px] font-bold text-slate-800 truncate">{u.label}</span>
                        <span className="text-[9px] text-amber-700 font-mono">+250g</span>
                      </div>
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
                    onDragStart={(e) => handleDragStart(e, p.slug, 'granos', '🌾')}
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
                          onClick={() => addFoodToPlate(p, 'granos', 250, '🌾')}
                          className="px-2 py-0.5 rounded bg-amber-700 text-white font-bold hover:bg-amber-600 transition-colors"
                          title="Añadir 250g"
                        >
                          +½k
                        </button>
                        <button 
                          onClick={() => addFoodToPlate(p, 'granos', 500, '🥣')}
                          className="px-2 py-0.5 rounded bg-amber-900 text-white font-bold hover:bg-amber-800 transition-colors"
                          title="Añadir 500g"
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
                  <span className="text-xl">🫘</span>
                  <div>
                    <h4 className="font-bold text-blue-950 text-sm">Para el 25% Proteínas Limpias</h4>
                    <p className="text-[11px] text-blue-800">Legumbres bio, semillas y aminoácidos esenciales con hierro</p>
                  </div>
                </div>
                {/* Buscador específico */}
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

              {/* Alimentos Universales Representativos */}
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1.5">
                  ✨ Opciones Universales Representativas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {UNIVERSAL_FOODS.filter(u => u.category === 'proteinas').map(u => (
                    <button
                      key={u.id}
                      onClick={() => addUniversalFood(u)}
                      className="p-2 rounded-xl bg-white hover:bg-blue-100 border border-blue-200 text-left transition-all hover:scale-[1.02] shadow-2xs flex items-center gap-2"
                    >
                      <span className="text-xl">{u.emoji}</span>
                      <div className="truncate">
                        <span className="block text-[10px] font-bold text-slate-800 truncate">{u.label}</span>
                        <span className="text-[9px] text-blue-700 font-mono">+250g</span>
                      </div>
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
                    onDragStart={(e) => handleDragStart(e, p.slug, 'proteinas', '🫘')}
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
                          onClick={() => addFoodToPlate(p, 'proteinas', 250, '🫘')}
                          className="px-2 py-0.5 rounded bg-blue-700 text-white font-bold hover:bg-blue-600 transition-colors"
                          title="Añadir 250g"
                        >
                          +½k
                        </button>
                        <button 
                          onClick={() => addFoodToPlate(p, 'proteinas', 500, '🍲')}
                          className="px-2 py-0.5 rounded bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors"
                          title="Añadir 500g"
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
