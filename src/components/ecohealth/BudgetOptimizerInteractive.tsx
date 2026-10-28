import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Sparkles, ShoppingBag, Users, Calendar, Filter, 
  RefreshCw, Check, ArrowRight, ShieldCheck, Apple, Flame, Dumbbell 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { generateSmartBudgetBasket, BudgetConfig, GeneratedBasketItem } from '@/lib/budgetOptimizer';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const BudgetOptimizerInteractive = () => {
  const { addCatalogProduct, setIsOpen } = useCart();
  const { toast } = useToast();

  const [budgetAmount, setBudgetAmount] = useState<number>(50);
  const [persons, setPersons] = useState<number>(2);
  const [days, setDays] = useState<number>(7);
  const [diet, setDiet] = useState<'todas' | 'vegano' | 'sin-gluten' | 'proteina'>('vegano');

  // Generate dynamic basket
  const basket = useMemo(() => {
    return generateSmartBudgetBasket({
      budgetAmount,
      persons,
      days,
      diet
    });
  }, [budgetAmount, persons, days, diet]);

  const [basketItems, setBasketItems] = useState<GeneratedBasketItem[]>([]);

  // Keep local basket items in sync with generated basket, allowing user edits
  useMemo(() => {
    setBasketItems(basket.items);
  }, [basket]);

  const totalCost = basketItems.reduce((acc, it) => acc + (it.product.price * it.quantity), 0);

  const removeItem = (slug: string) => {
    setBasketItems(prev => prev.filter(x => x.product.slug !== slug));
  };

  const handleAddAllToCart = () => {
    basketItems.forEach(it => {
      for (let i = 0; i < it.quantity; i++) {
        addCatalogProduct(it.product);
      }
    });
    setIsOpen(true);
    toast({
      title: "¡Compra semanal añadida con éxito!",
      description: `Se han añadido ${basketItems.length} productos ecológicos por un total de ${totalCost.toFixed(2)}€.`,
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            💶 Optimizador Inteligente de Menú & Presupuesto
          </span>
          <h2 className="text-2xl md:text-4xl font-display font-black tracking-tight">
            Máxima Nutrición Ecológica por cada Euro
          </h2>
          <p className="text-emerald-100 text-xs md:text-sm leading-relaxed">
            Selecciona tu presupuesto y comensales. Nuestro algoritmo calcula una cesta semanal completa con <strong>alimentos biológicos reales y stock en tienda</strong> (legumbres, cereales enteros, hortalizas y desayunos) para comer toda la semana sin salirte de tu presupuesto.
          </p>
        </div>
      </div>

      {/* Control Panel: Configurator */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs space-y-6">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Filter className="h-5 w-5 text-emerald-700" />
          Configura tu Semana
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          
          {/* Budget Presets & Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-bold text-slate-800">
              <span>Presupuesto objetivo:</span>
              <strong className="text-emerald-800 font-mono text-base">{budgetAmount}€</strong>
            </div>
            <input 
              type="range" 
              min={20} 
              max={150} 
              step={5}
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(Number(e.target.value))}
              className="w-full accent-emerald-700"
            />
            <div className="flex gap-1.5 flex-wrap pt-1">
              {[30, 50, 75, 100].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBudgetAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] transition-all ${
                    budgetAmount === amt ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {amt}€
                </button>
              ))}
            </div>
          </div>

          {/* Persons */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block">Comensales en casa:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: 1, label: '1 pers.' },
                { val: 2, label: '2 pers.' },
                { val: 4, label: 'Familia (4)' },
              ].map(p => (
                <button
                  key={p.val}
                  onClick={() => setPersons(p.val)}
                  className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                    persons === p.val ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block">Días planificados:</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: 3, label: '3 días' },
                { val: 5, label: '5 días' },
                { val: 7, label: '7 días' },
              ].map(d => (
                <button
                  key={d.val}
                  onClick={() => setDays(d.val)}
                  className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                    days === d.val ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diet Filter */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block">Filtro dietético:</span>
            <select
              value={diet}
              onChange={(e: any) => setDiet(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs text-slate-800"
            >
              <option value="todas">✨ Todos los alimentos bio</option>
              <option value="vegano">🌱 100% Vegano</option>
              <option value="sin-gluten">🌾 Sin Gluten (Celíacos)</option>
              <option value="proteina">💪 Alta Proteína Vegetal</option>
            </select>
          </div>

        </div>
      </div>

      {/* Generated Basket Results */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs space-y-6">
        
        {/* KPI Banner */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px]">
                {basketItems.length} Alimentos Bio Seleccionados
              </Badge>
              <Badge className="bg-teal-500/20 text-teal-300 border-0 text-[10px]">
                {basket.estimatedMeals} Comidas Estimadas
              </Badge>
            </div>
            <h3 className="font-display text-xl font-bold">Cesta Semanal Completa y Equilibrada</h3>
            <p className="text-xs text-slate-400">
              Aporte estimado: ~{basket.totalCalories} kcal • {basket.totalProtein}g proteína • {basket.totalFiber}g fibra prebiótica
            </p>
          </div>

          <div className="flex items-center gap-6 self-end md:self-auto">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total compra real:</span>
              <span className="text-3xl font-display font-black text-emerald-400 font-mono">
                {totalCost.toFixed(2)}€
              </span>
              <span className="text-[10px] text-slate-400 block">
                Presupuesto: {budgetAmount}€ ({totalCost <= budgetAmount ? `Ahorras ${(budgetAmount - totalCost).toFixed(2)}€` : 'Ajustado'})
              </span>
            </div>

            <Button
              onClick={handleAddAllToCart}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-6 px-6 text-sm rounded-2xl shadow-lg gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Añadir toda la cesta al carrito
            </Button>
          </div>
        </div>

        {/* Breakdown of Products in the Basket (8 to 15 real items) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-500 border-b pb-2">
            <span className="font-bold uppercase tracking-wider text-slate-700">Productos incluidos en tu plan semanal:</span>
            <span>Puedes eliminar o ajustar cantidades</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {basketItems.map((item, idx) => (
              <div 
                key={`${item.product.slug}-${idx}`}
                className="p-3.5 rounded-2xl border bg-slate-50/70 hover:bg-slate-50 transition-all flex items-start gap-3 relative group"
              >
                <div className="w-14 h-14 rounded-xl bg-white p-1 border shrink-0 flex items-center justify-center">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.categoryRole === 'desayuno' ? '🌅 Desayuno' : item.categoryRole === 'legumbre' ? '🫘 Legumbre' : item.categoryRole === 'cereal' ? '🌾 Cereal' : item.categoryRole === 'verdura' ? '🥦 Hortaliza' : '🫒 Esencial'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">{item.product.brand}</span>
                  </div>

                  <Link to={`/tienda/producto/${item.product.slug}`} className="block text-xs font-bold text-slate-900 truncate hover:text-emerald-800">
                    {item.product.name.split('–')[0]}
                  </Link>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <strong className="text-emerald-800 font-mono font-bold">{item.product.price.toFixed(2)}€</strong>
                    <button 
                      onClick={() => removeItem(item.product.slug)}
                      className="text-slate-400 hover:text-red-600 transition-colors text-[10px]"
                      title="Quitar de la cesta"
                    >
                      Quitar ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>Todos los productos son <strong>100% Ecológicos Certificados (Euro-hoja)</strong> con stock directo en nuestra tienda física.</span>
          </div>
          <Button 
            onClick={handleAddAllToCart} 
            size="sm"
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold shrink-0 text-xs"
          >
            Añadir los {basketItems.length} productos ahora ➔
          </Button>
        </div>

      </div>

    </div>
  );
};
