import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ChefHat, ShoppingBag, Clock, Check, AlertTriangle, 
  X, ArrowRight, Utensils, Heart, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dailyNutritionStore, CompleteMyDaySuggestion } from '@/services/dailyNutritionStore';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { useToast } from '@/hooks/use-toast';

interface CompleteMyDayCardProps {
  onRecipeCooked: () => void;
}

export const CompleteMyDayCard = ({ onRecipeCooked }: CompleteMyDayCardProps) => {
  const { addCatalogProduct, setIsOpen } = useCart();
  const { toast } = useToast();

  const data = dailyNutritionStore.getCompleteMyDaySuggestions();
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [showCookingSteps, setShowCookingSteps] = useState(false);
  const [servings, setServings] = useState(1);

  const activeSuggestion = data.suggestions[selectedSuggestionIndex] || data.suggestions[0];

  const handleAddMissingToCart = () => {
    if (!activeSuggestion || activeSuggestion.missingProducts.length === 0) return;

    for (const item of activeSuggestion.missingProducts) {
      const prod = allCatalogProducts.find(p => p.slug === item.slug) || allCatalogProducts[0];
      addCatalogProduct(prod);
    }

    toast({
      title: "Ingredientes añadidos a tu cesta",
      description: `Se han añadido los alimentos faltantes (${activeSuggestion.missingCost.toFixed(2)}€).`,
    });
    setIsOpen(true);
  };

  const handleLogCookedRecipe = () => {
    dailyNutritionStore.logRecipeToDiary(
      activeSuggestion.title,
      servings,
      activeSuggestion.calories,
      activeSuggestion.protein,
      'cena'
    );

    toast({
      title: "¡Receta registrada en tu cena!",
      description: `Añadido "${activeSuggestion.title}" (${Math.round(activeSuggestion.calories * servings)} kcal).`,
    });

    setShowCookingSteps(false);
    onRecipeCooked();
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Cabecera con tono amable y constructivo */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-[10px] font-bold">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span>COMPLETA TU DÍA 2.0 · DESPENSA PRIMERO</span>
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold">
            ¿Qué te apetece cenar hoy?
          </h3>
          <p className="text-xs text-emerald-200/90 leading-relaxed max-w-xl">
            {data.summaryNote}
          </p>
        </div>
      </div>

      {/* Selector de sugerencias contextuales ordenadas: Despensa primero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {data.suggestions.map((sug, idx) => {
          const isSelected = selectedSuggestionIndex === idx;
          const isOptionA = idx === 0 && sug.allPantryAvailable;
          return (
            <button
              key={sug.id}
              type="button"
              onClick={() => {
                setSelectedSuggestionIndex(idx);
                setShowCookingSteps(false);
              }}
              className={`p-3 rounded-2xl text-left transition-all border ${
                isSelected
                  ? 'bg-emerald-800/90 border-emerald-400 ring-2 ring-emerald-400/20 shadow-md'
                  : 'bg-emerald-950/60 border-emerald-800/60 hover:bg-emerald-900/60 text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-emerald-300 font-medium mb-1">
                <span className="font-bold uppercase tracking-wider text-[9px] text-emerald-300">
                  {isOptionA ? '⭐ Opción A (Tienes todo)' : `Opción ${String.fromCharCode(65 + idx)}`}
                </span>
                <span>⏱ {sug.timeMinutes} min</span>
              </div>
              <strong className="block text-white text-xs font-bold leading-tight line-clamp-2">
                {sug.title}
              </strong>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-emerald-800/60 text-[10px]">
                <span className="font-mono text-emerald-300">{sug.calories} kcal</span>
                {sug.allPantryAvailable ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> 0€ a comprar
                  </span>
                ) : (
                  <span className="text-amber-300 font-mono">Falta {sug.missingCost.toFixed(2)}€</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tarjeta Detallada de la Receta Seleccionada */}
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800/80 space-y-3.5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-bold text-white text-sm">
                {activeSuggestion.title}
              </h4>
              {activeSuggestion.allPantryAvailable && (
                <Badge className="bg-emerald-500 text-emerald-950 text-[9px] font-black">
                  TIENES TODO
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-emerald-200">
              {activeSuggestion.reason}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge className="bg-emerald-800 text-emerald-100 text-[10px]">
              Proteína: {activeSuggestion.protein}g
            </Badge>
            <Badge className="bg-amber-800/80 text-amber-200 text-[10px]">
              Fibra: {activeSuggestion.fiber}g
            </Badge>
          </div>
        </div>

        {/* EFECTO ESTIMADO ANTES VS DESPUÉS (Requisito Punto 7) */}
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="text-[10px] uppercase font-bold text-slate-400">Impacto estimado en tu día:</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Antes:</span>
              <span>Prot {activeSuggestion.effectBefore?.protein || 0}g</span>
              <span>·</span>
              <span>Fibra {activeSuggestion.effectBefore?.fiber || 0}g</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <span className="text-emerald-400">Después:</span>
              <span>Prot ~{activeSuggestion.effectAfter?.protein || 0}g</span>
              <span>·</span>
              <span>Fibra ~{activeSuggestion.effectAfter?.fiber || 0}g</span>
            </div>
          </div>
        </div>

        {/* Estado en Despensa (Cruce inteligente) */}
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block mb-2">
            Ingredientes en tu Despensa:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            {activeSuggestion.pantryMatches.map((item, i) => (
              <div 
                key={i} 
                className={`p-2 rounded-xl flex items-center justify-between ${
                  item.available 
                    ? item.isLow ? 'bg-amber-950/40 text-amber-200 border border-amber-800/60' : 'bg-emerald-950/60 text-emerald-100 border border-emerald-800/60' 
                    : 'bg-rose-950/30 text-rose-200 border border-rose-900/50'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {item.available ? (
                    item.isLow ? <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" /> : <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="text-[10px] font-medium shrink-0 ml-1">
                  {item.available ? (item.isLow ? 'Queda poco' : 'En despensa') : 'Te falta'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de Acción de Alto Valor */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={() => setShowCookingSteps(!showCookingSteps)}
            className="flex-1 bg-white hover:bg-slate-100 text-emerald-950 font-bold py-5 rounded-xl text-xs gap-1.5 shadow-sm"
          >
            <ChefHat className="h-4 w-4 text-emerald-800" />
            <span>{showCookingSteps ? 'Ocultar pasos' : 'Cocinar con lo que tengo'}</span>
            {showCookingSteps ? <ChevronUp className="h-3.5 w-3.5 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
          </Button>

          <Button
            onClick={handleLogCookedRecipe}
            className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-5 rounded-xl text-xs gap-1.5 shadow-sm border border-emerald-600"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Registrar en mi cena</span>
          </Button>

          {activeSuggestion.missingProducts.length > 0 && (
            <Button
              onClick={handleAddMissingToCart}
              variant="outline"
              className="flex-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 hover:text-white font-bold py-5 rounded-xl text-xs gap-1.5 shadow-sm border border-emerald-700"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Añadir faltante ({activeSuggestion.missingCost.toFixed(2)}€)</span>
            </Button>
          )}
        </div>

        {/* Pasos de Cocina desplegables */}
        <AnimatePresence>
          {showCookingSteps && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-emerald-800/80 space-y-3"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Pasos de preparación ({activeSuggestion.timeMinutes} min):
                </span>
                <ol className="space-y-1.5 list-decimal list-inside text-[11px] text-emerald-100">
                  {activeSuggestion.recipeSteps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="text-white">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Selector de raciones */}
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-200">Raciones preparadas:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setServings(n)}
                        className={`w-6 h-6 rounded-lg text-xs font-bold transition-all ${
                          servings === n ? 'bg-white text-emerald-950' : 'bg-emerald-900 text-emerald-300'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleLogCookedRecipe}
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs rounded-xl shadow-xs"
                >
                  Confirmar y Guardar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
