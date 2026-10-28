import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ShoppingBag, CheckCircle2, RotateCcw, AlertCircle, 
  HelpCircle, ChevronRight, Check, Trash2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { useToast } from '@/hooks/use-toast';

export interface HarvardPlateProps {
  onGoToStore?: () => void;
}

interface PlateItem {
  id: string;
  category: 'vegetales' | 'granos' | 'proteinas';
  product: CatalogProduct;
  grams: number; // 250, 500, 1000
}

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
  const [healthObjective, setHealthObjective] = useState<string>('salud');
  const [isTestModalOpen, setIsTestModalOpen] = useState(!hasCompletedTest);

  const saveQuickTest = () => {
    try {
      localStorage.setItem('ecoland-plate-test-done', 'true');
      localStorage.setItem('ecoland-user-diet-type', dietType);
      // update diet tags
      const tags = dietType === 'vegano' ? ['vegano', 'bio'] : dietType === 'celiaco' ? ['sin-gluten', 'bio'] : ['bio'];
      localStorage.setItem('ecoland-diet-tags', JSON.stringify(tags));
    } catch {}
    setHasCompletedTest(true);
    setIsTestModalOpen(false);
    toast({
      title: "¡Perfil personalizado guardado!",
      description: "Los alimentos alrededor de tu plato se han adaptado a tu dieta.",
    });
  };

  // Filter available products around plate according to diet
  const availableAround = useMemo(() => {
    let pool = allCatalogProducts.filter(p => p.price > 0 && p.inStock);
    if (dietType === 'vegano') {
      pool = pool.filter(p => p.tags.includes('vegano'));
    } else if (dietType === 'celiaco') {
      pool = pool.filter(p => p.tags.includes('sin-gluten'));
    }

    return {
      vegetales: [
        pool.find(p => p.slug.includes('lentejas-con-verduras')) || pool[0],
        pool.find(p => p.slug.includes('gazpacho')) || pool[1],
        pool.find(p => p.slug.includes('esparrago') || p.slug.includes('tomate')) || pool[2],
        pool.find(p => p.slug.includes('acai') || p.slug.includes('verdura')) || pool[3],
      ].filter(Boolean) as CatalogProduct[],
      granos: [
        pool.find(p => p.slug.includes('copos-de-avena-sin-gluten') || p.slug.includes('avena')) || pool[4],
        pool.find(p => p.slug.includes('quinoa-bio') || p.slug.includes('quinoa')) || pool[5],
        pool.find(p => p.slug.includes('tortas-quinoa') || p.slug.includes('arroz')) || pool[6],
      ].filter(Boolean) as CatalogProduct[],
      proteinas: [
        pool.find(p => p.slug.includes('garbanzo-cocido') || p.slug.includes('garbanzo')) || pool[7],
        pool.find(p => p.slug.includes('super-vegan-protein') || p.slug.includes('protein')) || pool[8],
        pool.find(p => p.slug.includes('tofu') || p.slug.includes('alubia') || p.slug.includes('sardina')) || pool[9],
      ].filter(Boolean) as CatalogProduct[],
    };
  }, [dietType]);

  // Plate Items in State
  const [plateItems, setPlateItems] = useState<PlateItem[]>([
    {
      id: 'init-veg',
      category: 'vegetales',
      product: availableAround.vegetales[0],
      grams: 500
    },
    {
      id: 'init-grain',
      category: 'granos',
      product: availableAround.granos[0],
      grams: 250
    },
    {
      id: 'init-prot',
      category: 'proteinas',
      product: availableAround.proteinas[0],
      grams: 250
    }
  ]);

  // Handle Drag & Drop / Throw into plate
  const [throwingItem, setThrowingItem] = useState<string | null>(null);

  const throwProductToPlate = (product: CatalogProduct, category: 'vegetales' | 'granos' | 'proteinas', defaultGrams = 250) => {
    setThrowingItem(product.slug);
    setTimeout(() => {
      setPlateItems(prev => [
        ...prev,
        {
          id: `${product.slug}-${Date.now()}`,
          category,
          product,
          grams: defaultGrams
        }
      ]);
      setThrowingItem(null);
      toast({
        title: "¡Lanzado al plato!",
        description: `Se añadió ${product.name.split('–')[0]} (${defaultGrams}g) a tu plato.`,
      });
    }, 400);
  };

  const removePlateItem = (id: string) => {
    setPlateItems(prev => prev.filter(x => x.id !== id));
  };

  const updateItemGrams = (id: string, newGrams: number) => {
    setPlateItems(prev => prev.map(x => x.id === id ? { ...x, grams: newGrams } : x));
  };

  // Calculations
  const totalGrams = plateItems.reduce((acc, it) => acc + it.grams, 0) || 1;
  const vegGrams = plateItems.filter(it => it.category === 'vegetales').reduce((acc, it) => acc + it.grams, 0);
  const grainGrams = plateItems.filter(it => it.category === 'granos').reduce((acc, it) => acc + it.grams, 0);
  const protGrams = plateItems.filter(it => it.category === 'proteinas').reduce((acc, it) => acc + it.grams, 0);

  const vegPercent = Math.round((vegGrams / totalGrams) * 100);
  const grainPercent = Math.round((grainGrams / totalGrams) * 100);
  const protPercent = Math.round((protGrams / totalGrams) * 100);

  const totalPrice = plateItems.reduce((acc, it) => acc + it.product.price, 0);

  // Dynamic Feedback based on user's exact specification:
  // "arroja algo de verdura a tus alimentos para tener una dieta mas balanceada"
  let feedback = {
    isOptimal: false,
    text: '',
    color: 'bg-emerald-50 text-emerald-950 border-emerald-300'
  };

  if (vegPercent >= 45 && vegPercent <= 55 && grainPercent >= 20 && grainPercent <= 30 && protPercent >= 20 && protPercent <= 30) {
    feedback = {
      isOptimal: true,
      text: '🎉 ¡Bien! Llegaste a tu objetivo de proporción excelente según el Plato de Harvard (50% vegetal, 25% granos, 25% proteína).',
      color: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-extrabold'
    };
  } else if (vegPercent < 40) {
    feedback = {
      isOptimal: false,
      text: '🥦 Ya tienes muchas calorías/granos; arroja algo de verdura a tus alimentos para tener una dieta más balanceada y llegar al 50%.',
      color: 'bg-orange-50 text-orange-950 border-orange-300'
    };
  } else if (grainPercent > 35) {
    feedback = {
      isOptimal: false,
      text: '🌾 Tienes demasiada proporción de granos/cereales. Reduce a 25% o suma legumbres frescas.',
      color: 'bg-amber-50 text-amber-950 border-amber-300'
    };
  } else if (protPercent > 35) {
    feedback = {
      isOptimal: false,
      text: '💪 Excelente aporte de proteína, pero arroja más verduras para mantener el balance celular.',
      color: 'bg-blue-50 text-blue-950 border-blue-300'
    };
  } else {
    feedback = {
      isOptimal: false,
      text: 'Ajustando equilibrio: Tu plato promedio debe ser 50% Vegetales, 25% Granos integrales y 25% Proteína.',
      color: 'bg-slate-50 text-slate-800 border-slate-200'
    };
  }

  const handleBuyPlate = () => {
    plateItems.forEach(it => addCatalogProduct(it.product));
    setIsOpen(true);
    toast({
      title: "¡Plato Harvard comprado en 1 clic!",
      description: `Se han añadido ${plateItems.length} alimentos bio por ${totalPrice.toFixed(2)}€.`,
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Test Modal (if user hasn't completed or wants to update) */}
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
                  Test Rápido de Perfil
                </h3>
                <p className="text-xs text-slate-500">
                  Para que los productos que rodeen tu plato encajen al 100% con tu salud y filosofía.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">1. ¿Cuál es tu alimentación?</label>
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
                  <label className="block font-bold text-slate-800 mb-1.5">2. ¿Para cuántas personas cocinas?</label>
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
                <span>¡Empezar a armar mi plato!</span>
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
              Toma cualquier alimento alrededor del plato y <strong>lánzalo con el ratón o tu dedo al plato</strong>. El sistema te avisa si necesitas medio kilo o un kilo para que tu proporción sea científicamente excelente.
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsTestModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs shrink-0"
          >
            Modificar test ({dietType})
          </Button>
        </div>
      </div>

      {/* Feedback Bar */}
      <div className={`p-4 rounded-2xl border text-xs shadow-xs transition-all ${feedback.color}`}>
        <div className="flex items-center justify-between font-bold">
          <span>{feedback.text}</span>
          <span className="font-mono text-sm">{totalGrams}g total</span>
        </div>
        
        {/* Progress bars for Harvard sections */}
        <div className="grid grid-cols-3 gap-3 pt-3 text-[11px]">
          <div>
            <div className="flex justify-between mb-1">
              <span>🥦 Vegetales: <strong>{vegPercent}%</strong></span>
              <span className="text-slate-400">Objetivo 50%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (vegPercent / 50) * 100)}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>🌾 Granos: <strong>{grainPercent}%</strong></span>
              <span className="text-slate-400">Objetivo 25%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (grainPercent / 25) * 100)}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>🫘 Proteína: <strong>{protPercent}%</strong></span>
              <span className="text-slate-400">Objetivo 25%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (protPercent / 25) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Plato Central Rodeado de Alimentos */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border shadow-xs">
        
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Visual Plate Circle (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            {/* The Plate Container */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              className="relative w-full max-w-[420px] aspect-square rounded-full p-4 bg-slate-100 border-8 border-slate-200/90 shadow-2xl flex flex-col justify-between overflow-hidden group"
            >
              {/* Top Half: 50% Vegetales y Frutas */}
              <div className="h-1/2 w-full bg-emerald-500/20 border-b-2 border-dashed border-emerald-600/40 rounded-t-full p-4 flex flex-col justify-center items-center text-center relative transition-colors hover:bg-emerald-500/25">
                <span className="text-[11px] font-black text-emerald-950 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full mb-1 shadow-2xs">
                  🥦 50% Vegetales & Frutas ({vegGrams}g)
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto mt-1 p-1">
                  {plateItems.filter(x => x.category === 'vegetales').map(it => (
                    <span key={it.id} className="text-[10px] bg-white text-emerald-950 px-2.5 py-1 rounded-full border shadow-xs flex items-center gap-1.5 font-bold">
                      <span>{it.product.name.split('–')[0]}</span>
                      <span className="text-emerald-700 font-mono">({it.grams >= 1000 ? `${it.grams/1000}kg` : `${it.grams}g`})</span>
                      <button onClick={() => removePlateItem(it.id)} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Half: 25% Granos Integrales + 25% Proteínas Saludables */}
              <div className="h-1/2 w-full flex">
                
                {/* Bottom-Left: 25% Granos */}
                <div className="w-1/2 h-full bg-amber-500/20 border-r border-dashed border-amber-600/40 rounded-bl-full p-3 flex flex-col justify-center items-center text-center hover:bg-amber-500/25 transition-colors">
                  <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-full mb-1">
                    🌾 25% Granos ({grainGrams}g)
                  </span>
                  <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto mt-1 p-1">
                    {plateItems.filter(x => x.category === 'granos').map(it => (
                      <span key={it.id} className="text-[9px] bg-white text-amber-950 px-2 py-0.5 rounded-full border shadow-xs flex items-center gap-1 font-bold">
                        <span>{it.product.name.split('–')[0]}</span>
                        <span className="text-amber-700 font-mono">({it.grams >= 1000 ? `${it.grams/1000}kg` : `${it.grams}g`})</span>
                        <button onClick={() => removePlateItem(it.id)} className="text-red-500 hover:text-red-700 font-bold ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom-Right: 25% Proteína */}
                <div className="w-1/2 h-full bg-blue-500/20 rounded-br-full p-3 flex flex-col justify-center items-center text-center hover:bg-blue-500/25 transition-colors">
                  <span className="text-[10px] font-black text-blue-950 uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded-full mb-1">
                    🫘 25% Proteína ({protGrams}g)
                  </span>
                  <div className="flex flex-wrap gap-1 justify-center max-h-20 overflow-y-auto mt-1 p-1">
                    {plateItems.filter(x => x.category === 'proteinas').map(it => (
                      <span key={it.id} className="text-[9px] bg-white text-blue-950 px-2 py-0.5 rounded-full border shadow-xs flex items-center gap-1 font-bold">
                        <span>{it.product.name.split('–')[0]}</span>
                        <span className="text-blue-700 font-mono">({it.grams >= 1000 ? `${it.grams/1000}kg` : `${it.grams}g`})</span>
                        <button onClick={() => removePlateItem(it.id)} className="text-red-500 hover:text-red-700 font-bold ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Center Noble Oil Drop */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-yellow-400/90 border-2 border-white shadow-md flex items-center justify-center text-lg" title="Aceite de Oliva Virgen Extra en crudo & Agua">
                🫒
              </div>
            </div>

            {/* Total and Checkout CTA */}
            <div className="mt-6 text-center space-y-3 w-full max-w-md">
              <div className="flex justify-between items-center px-4 py-2 rounded-2xl bg-slate-50 border">
                <span className="text-xs text-slate-500">Total compra de tu plato:</span>
                <span className="text-2xl font-display font-black text-emerald-900">{totalPrice.toFixed(2)}€</span>
              </div>
              <Button 
                onClick={handleBuyPlate}
                className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-black py-6 text-base rounded-2xl shadow-lg gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                Añadir todos los ingredientes al carrito
              </Button>
            </div>

          </div>

          {/* Alimentos Alrededor del Plato (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Alimentos Bio Disponibles</h4>
                <p className="text-[11px] text-slate-500">Haz clic o arrastra para lanzarlos a su facción del plato</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px]">
                Stock en tiempo real
              </Badge>
            </div>

            {/* Section 1: Hortalizas y Verduras */}
            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                🥦 Para el 50% Vegetal:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {availableAround.vegetales.map(p => (
                  <div 
                    key={p.slug}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', p.slug)}
                    className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:border-emerald-300 transition-all cursor-grab active:cursor-grabbing text-left space-y-1.5 shadow-2xs group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white p-1 border mx-auto">
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="block text-[11px] font-bold text-slate-800 truncate text-center">{p.name.split('–')[0]}</span>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-emerald-100">
                      <strong className="text-emerald-800">{p.price.toFixed(2)}€</strong>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => throwProductToPlate(p, 'vegetales', 250)}
                          className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-bold hover:bg-emerald-600"
                          title="Lanzar 250g al plato"
                        >
                          +½k
                        </button>
                        <button 
                          onClick={() => throwProductToPlate(p, 'vegetales', 500)}
                          className="px-1.5 py-0.5 rounded bg-emerald-800 text-white font-bold hover:bg-emerald-700"
                          title="Lanzar 500g al plato"
                        >
                          +1k
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Granos Integrales */}
            <div className="space-y-2">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                🌾 Para el 25% Granos Integrales:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {availableAround.granos.map(p => (
                  <div 
                    key={p.slug}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', p.slug)}
                    className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100 hover:border-amber-300 transition-all cursor-grab active:cursor-grabbing text-left space-y-1.5 shadow-2xs group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white p-1 border mx-auto">
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="block text-[11px] font-bold text-slate-800 truncate text-center">{p.name.split('–')[0]}</span>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-amber-100">
                      <strong className="text-amber-800">{p.price.toFixed(2)}€</strong>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => throwProductToPlate(p, 'granos', 250)}
                          className="px-1.5 py-0.5 rounded bg-amber-700 text-white font-bold hover:bg-amber-600"
                          title="Lanzar 250g al plato"
                        >
                          +½k
                        </button>
                        <button 
                          onClick={() => throwProductToPlate(p, 'granos', 500)}
                          className="px-1.5 py-0.5 rounded bg-amber-800 text-white font-bold hover:bg-amber-700"
                          title="Lanzar 500g al plato"
                        >
                          +1k
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Proteínas Saludables */}
            <div className="space-y-2">
              <span className="text-xs font-black text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                🫘 Para el 25% Proteínas Limpias:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {availableAround.proteinas.map(p => (
                  <div 
                    key={p.slug}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', p.slug)}
                    className="p-2.5 rounded-2xl bg-blue-50/60 border border-blue-100 hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing text-left space-y-1.5 shadow-2xs group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white p-1 border mx-auto">
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="block text-[11px] font-bold text-slate-800 truncate text-center">{p.name.split('–')[0]}</span>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-blue-100">
                      <strong className="text-blue-800">{p.price.toFixed(2)}€</strong>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => throwProductToPlate(p, 'proteinas', 250)}
                          className="px-1.5 py-0.5 rounded bg-blue-700 text-white font-bold hover:bg-blue-600"
                          title="Lanzar 250g al plato"
                        >
                          +½k
                        </button>
                        <button 
                          onClick={() => throwProductToPlate(p, 'proteinas', 500)}
                          className="px-1.5 py-0.5 rounded bg-blue-800 text-white font-bold hover:bg-blue-700"
                          title="Lanzar 500g al plato"
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
