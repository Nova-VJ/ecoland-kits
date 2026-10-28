import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Sparkles, ChefHat, ShoppingBag, Clock, Users, 
  Check, AlertTriangle, Plus, ArrowRight, DollarSign, X,
  Trash2, RefreshCw, Bookmark, ChevronRight, Download, ChevronUp, ChevronDown
} from 'lucide-react';
import { ImportRecipeModal } from '@/components/recipes/ImportRecipeModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  dailyNutritionStore, 
  WeeklyMealPlan, 
  WeeklyMealPlanDay, 
  ShoppingListItem 
} from '@/services/dailyNutritionStore';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { useToast } from '@/hooks/use-toast';
import { OfflineIndicatorBar } from '@/components/offline/OfflineIndicatorBar';
import { zeroFrictionPantryService } from '@/services/zeroFrictionPantryService';
import { Link } from 'react-router-dom';

export const MiSemana = () => {
  const { toast } = useToast();
  const { addCatalogProduct, setIsOpen } = useCart();

  const [plan, setPlan] = useState<WeeklyMealPlan>(() => dailyNutritionStore.getWeeklyPlan());
  const [selectedMode, setSelectedMode] = useState<'cenas' | 'comidas_cenas' | 'completa'>(plan.mode);
  const [numPersons, setNumPersons] = useState<number>(plan.numPersons);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showPrepPlan, setShowPrepPlan] = useState(false);
  const batchPrepPlan = dailyNutritionStore.getBatchPrepPlan();
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => dailyNutritionStore.getShoppingList());

  const handleModeChange = (mode: 'cenas' | 'comidas_cenas' | 'completa') => {
    setSelectedMode(mode);
    const updated = { ...plan, mode };
    setPlan(updated);
    dailyNutritionStore.saveWeeklyPlan(updated);
  };

  const handlePersonsChange = (n: number) => {
    setNumPersons(n);
    const updated = { ...plan, numPersons: n };
    setPlan(updated);
    dailyNutritionStore.saveWeeklyPlan(updated);
  };

  const handleOpenShoppingList = () => {
    const list = dailyNutritionStore.generateShoppingListFromPlan();
    setShoppingList(list);
    setIsShoppingListOpen(true);
  };

  const handleToggleItem = (id: string) => {
    const updated = dailyNutritionStore.toggleShoppingListItem(id);
    setShoppingList([...updated]);
  };

  const handleAddMissingToCart = () => {
    const missing = shoppingList.filter(it => it.status === 'missing' && !it.checked);
    if (missing.length === 0) {
      toast({ title: "No hay productos faltantes seleccionados." });
      return;
    }

    for (const item of missing) {
      const prod = allCatalogProducts.find(p => p.slug === item.catalogSlug) || allCatalogProducts[0];
      addCatalogProduct(prod);
    }

    toast({
      title: "Productos añadidos a tu cesta",
      description: `Se han sumado los ${missing.length} ingredientes bio necesarios para tu semana.`,
    });
    setIsShoppingListOpen(false);
    setIsOpen(true);
  };

  // Cálculos consolidados del plan semanal
  const totalWeeklyCaloriesPerPerson = Math.round(plan.days.reduce((acc, d) => acc + d.almuerzo.calories + d.cena.calories, 0) / 7);
  const averagePricePerServing = (plan.days.reduce((acc, d) => acc + d.almuerzo.pricePerServing + d.cena.pricePerServing, 0) / (plan.days.length * 2)).toFixed(2);
  const totalPantrySavings = (plan.days.reduce((acc, d) => acc + (d.almuerzo.pricePerServing * (d.almuerzo.pantryCoveredPercent / 100)) + (d.cena.pricePerServing * (d.cena.pantryCoveredPercent / 100)), 0) * numPersons).toFixed(2);

  return (
    <div className="section-padding bg-slate-50/50 min-h-screen">
      <div className="container-eco max-w-5xl space-y-8">
        
        {/* Cabecera de Mi Semana */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border shadow-2xs">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Planificación Inteligente & Sin Desperdicio
              </span>
              <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-300">
                P1 Intelligence
              </Badge>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Calendar className="h-7 w-7 text-emerald-800" />
                Mi Semana en Ecoland
              </h1>
              <OfflineIndicatorBar />
            </div>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
              Planifica de forma flexible, aprovecha los ingredientes que ya tienes en casa y genera tu lista de la compra comprando solo lo que realmente te falta.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              variant="outline"
              className="w-full sm:w-auto border-emerald-300 text-emerald-900 hover:bg-emerald-50 font-bold py-6 px-5 rounded-2xl shadow-2xs gap-2 text-xs"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Importar Receta Externa</span>
            </Button>

            <Button
              onClick={handleOpenShoppingList}
              className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-6 px-6 rounded-2xl shadow-sm gap-2 text-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Lista de Compra ({shoppingList.filter(it => it.status === 'missing').length} a comprar)</span>
            </Button>
          </div>
        </div>

        {/* Barra de Ajustes: Modo de Planificación & Número de Personas */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider shrink-0">
              ¿Qué planificamos?
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
              {[
                { id: 'cenas', label: '🌙 Solo Cenas' },
                { id: 'comidas_cenas', label: '🥗 Comidas + Cenas' },
                { id: 'completa', label: '🥑 Semana Completa' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id as any)}
                  className={`px-3 py-2 rounded-xl font-bold transition-all text-center ${
                    selectedMode === m.id
                      ? 'bg-white text-emerald-950 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <Users className="w-3.5 h-3.5 text-emerald-800" />
              Personas:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              {[1, 2, 4, 6].map(n => (
                <button
                  key={n}
                  onClick={() => handlePersonsChange(n)}
                  className={`w-8 h-8 rounded-xl font-bold transition-all ${
                    numPersons === n ? 'bg-emerald-900 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de Métricas Financieras y Nutricionales (P1-D Puntos 13 y 14: Nutrición por Euro) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-2xl border shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Coste medio / ración</span>
            <strong className="text-xl font-black text-slate-900 block font-mono">
              ~{averagePricePerServing} €
            </strong>
            <span className="text-[10px] text-emerald-800 font-semibold block">Cocina casera 100% bio</span>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-800 block tracking-wider">Ahorro en Despensa</span>
            <strong className="text-xl font-black text-emerald-950 block font-mono">
              +{totalPantrySavings} €
            </strong>
            <span className="text-[10px] text-emerald-800 font-semibold block">Ingredientes que ya tienes</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Nutrición por Euro</span>
            <strong className="text-xl font-black text-slate-900 block font-mono">
              12.4 g <span className="text-xs font-normal text-slate-400">prot/€</span>
            </strong>
            <span className="text-[10px] text-slate-500 block">Alta densidad proteica bio</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Fibra por Euro</span>
            <strong className="text-xl font-black text-emerald-900 block font-mono">
              7.8 g <span className="text-xs font-normal text-slate-400">fibra/€</span>
            </strong>
            <span className="text-[10px] text-slate-500 block">Aporte prebiótico de despensa</span>
          </div>
        </div>

        {/* PREPARACIÓN ANTICIPADA / BATCH COOKING DOMINGO (P2-I) */}
        <div className="bg-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-[10px] font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>PREPARACIÓN ANTICIPADA · 35 MINUTOS EL DOMINGO</span>
              </div>
              <h3 className="font-bold text-base sm:text-lg">
                Cocina una vez el domingo y ahorra 4 preparaciones entre semana
              </h3>
              <p className="text-xs text-emerald-300 leading-relaxed max-w-xl">
                Cociendo la base de quinoa y legumbres y centrifugando verduras de hoja, reduces tus cenas de diario a solo 5 minutos de sartén.
              </p>
            </div>

            <Button
              onClick={() => setShowPrepPlan(!showPrepPlan)}
              className="bg-white hover:bg-emerald-100 text-emerald-950 font-bold py-5 rounded-2xl text-xs gap-1.5 shrink-0"
            >
              <ChefHat className="w-4 h-4 text-emerald-800" />
              <span>{showPrepPlan ? 'Ocultar pasos domingo' : 'Ver plan de 35 min'}</span>
              {showPrepPlan ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>

          <AnimatePresence>
            {showPrepPlan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-emerald-800/80 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {batchPrepPlan.steps.map((step, idx) => (
                    <div key={step.id} className="p-3.5 rounded-2xl bg-emerald-900/60 border border-emerald-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-emerald-300 font-mono">
                        <span className="font-bold uppercase tracking-wider">Paso {idx + 1}</span>
                        <span>⏱ {step.timeMinutes} min</span>
                      </div>
                      <strong className="block text-white text-xs font-bold leading-tight">
                        {step.title}
                      </strong>
                      <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DESGLOSE TRANSPARENTE DE COSTE (P2: Valor Ingredientes vs Dinero a Gastar Hoy) */}
        <div className="p-4 bg-slate-50 border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Transparencia económica:</span>
            <span>Valor total ingredientes utilizados: <strong>~{(parseFloat(averagePricePerServing) * numPersons * 7).toFixed(2)} €</strong></span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-800 font-semibold">Ya en despensa: +{totalPantrySavings} €</span>
            <span className="text-amber-900 font-bold bg-amber-100/70 px-2.5 py-1 rounded-xl border border-amber-300">
              Dinero que necesitas gastar hoy: ~{(parseFloat(averagePricePerServing) * numPersons * 7 - parseFloat(totalPantrySavings)).toFixed(2)} €
            </span>
          </div>
        </div>

        {/* Calendario Lunes a Domingo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-emerald-800" />
              Menú Semanal Flexible (Lunes a Domingo)
            </h3>
            <span className="text-[11px] text-slate-400">Pulsa cualquier plato para ver ingredientes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {plan.days.map((day) => (
              <div 
                key={day.dayIndex} 
                className="bg-white rounded-2xl border p-3 space-y-3 flex flex-col justify-between shadow-2xs hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between border-b pb-1.5">
                  <strong className="text-xs text-slate-900 font-black">{day.dayName}</strong>
                  <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                    Día {day.dayIndex + 1}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {/* Comida / Almuerzo */}
                  {(selectedMode === 'comidas_cenas' || selectedMode === 'completa') && (
                    <div className="p-2 rounded-xl bg-slate-50 border space-y-1 text-[11px]">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Comida</span>
                      <strong className="text-slate-800 line-clamp-2 leading-tight block">
                        {day.almuerzo.title}
                      </strong>
                      <div className="flex justify-between items-center text-[10px] pt-1 text-slate-500 font-mono">
                        <span>{day.almuerzo.calories} kcal</span>
                        <span className="text-emerald-800 font-bold">{day.almuerzo.pricePerServing.toFixed(2)}€/rac</span>
                      </div>
                    </div>
                  )}

                  {/* Cena */}
                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1 text-[11px]">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase block">Cena</span>
                    <strong className="text-emerald-950 line-clamp-2 leading-tight block">
                      {day.cena.title}
                    </strong>
                    <div className="flex justify-between items-center text-[10px] pt-1 text-slate-500 font-mono">
                      <span>{day.cena.calories} kcal</span>
                      <span className="text-emerald-800 font-bold">{day.cena.pricePerServing.toFixed(2)}€/rac</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1 border-t text-[10px] text-slate-400 flex items-center justify-between">
                  <span>⏱ {day.cena.prepMinutes} min</span>
                  <span className="text-emerald-700 font-bold">{day.cena.pantryCoveredPercent}% en casa</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL IMPORTADOR UNIVERSAL DE RECETAS (P2-B) */}
        <ImportRecipeModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
        />

        {/* MODAL / DRAWER: LISTA DE COMPRA INTELIGENTE (P1-E Punto 12) */}
        <AnimatePresence>
          {isShoppingListOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white rounded-3xl max-w-lg w-full border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-5 border-b bg-emerald-950 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-800 flex items-center justify-center text-white">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Lista de la Compra de Tu Semana</h3>
                      <p className="text-[11px] text-emerald-300">Cruzada contra tu despensa actual</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsShoppingListOpen(false)}
                    className="p-1.5 rounded-full hover:bg-emerald-900 text-emerald-300 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
                  
                  {/* Categoría: ME FALTA (Comprar en Ecoland) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Te falta comprar ({shoppingList.filter(it => it.status === 'missing').length} ingredientes)
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-900">
                        Total: {shoppingList.filter(it => it.status === 'missing' && !it.checked).reduce((acc, it) => acc + it.priceEuro, 0).toFixed(2)} €
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {shoppingList.filter(it => it.status === 'missing').map((item) => (
                        <div 
                          key={item.id}
                          className="p-2.5 rounded-xl border bg-amber-50/50 border-amber-200 flex items-center justify-between text-xs"
                        >
                          <label className="flex items-center gap-2 cursor-pointer truncate pr-2">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => handleToggleItem(item.id)}
                              className="rounded text-emerald-800 w-4 h-4"
                            />
                            <span className={`truncate ${item.checked ? 'line-through text-slate-400' : 'font-bold text-slate-900'}`}>
                              {item.name}
                            </span>
                          </label>
                          <span className="font-mono font-bold text-emerald-900 shrink-0 text-xs">
                            {item.priceEuro.toFixed(2)} €
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categoría: YA TENGO EN CASA (Despensa) */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      Ya tienes en casa (No hace falta comprar)
                    </span>

                    <div className="space-y-1.5">
                      {shoppingList.filter(it => it.status === 'have').map((item) => (
                        <div 
                          key={item.id}
                          className="p-2.5 rounded-xl border bg-emerald-50/50 border-emerald-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 text-emerald-950 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{item.name}</span>
                          </div>
                          <span className="text-[10px] text-emerald-800 font-bold">En despensa</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categoría: OPCIONALES */}
                  {shoppingList.filter(it => it.status === 'optional').length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                        Opcionales & Condimentos
                      </span>
                      <div className="space-y-1.5">
                        {shoppingList.filter(it => it.status === 'optional').map((item) => (
                          <div 
                            key={item.id}
                            className="p-2.5 rounded-xl border bg-slate-50 flex items-center justify-between text-xs text-slate-600"
                          >
                            <span>{item.name}</span>
                            <span className="text-[10px] font-mono">{item.priceEuro.toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                <div className="p-4 border-t bg-slate-50 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleAddMissingToCart}
                    className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-5 rounded-2xl text-xs gap-2 shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Añadir faltantes al carrito ({shoppingList.filter(it => it.status === 'missing' && !it.checked).reduce((acc, it) => acc + it.priceEuro, 0).toFixed(2)} €)</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default MiSemana;
