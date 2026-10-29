import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Plus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { dailyNutritionStore, HabitualMeal } from '@/services/dailyNutritionStore';
import { useToast } from '@/hooks/use-toast';

interface HabitualMealsRowProps {
  onLogged: () => void;
}

export const HabitualMealsRow = ({ onLogged }: HabitualMealsRowProps) => {
  const { toast } = useToast();
  const [habituals, setHabituals] = useState<HabitualMeal[]>(() => dailyNutritionStore.getHabitualMeals());
  const [lastLoggedId, setLastLoggedId] = useState<string | null>(null);

  const handleQuickLog = (item: HabitualMeal) => {
    const entry = dailyNutritionStore.logHabitualMeal(item.id);
    if (entry) {
      setLastLoggedId(item.id);
      setTimeout(() => setLastLoggedId(null), 2500);

      toast({
        title: "¡Desayuno habitual registrado en 1 toque!",
        description: `Añadido: ${item.description} (${item.calories} kcal).`,
      });

      setHabituals(dailyNutritionStore.getHabitualMeals());
      onLogged();
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Clock className="h-4 w-4 text-emerald-800" />
          <span>Tus Comidas Habituales (1 Toque)</span>
        </div>
        <span className="text-xs text-slate-500">Repite sin buscar</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
        {habituals.map((hab) => {
          const isJustLogged = lastLoggedId === hab.id;
          return (
            <motion.div
              key={hab.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleQuickLog(hab)}
              className={`min-w-[240px] max-w-[270px] p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between shrink-0 select-none ${
                isJustLogged
                  ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'bg-white hover:bg-emerald-50/50 hover:border-emerald-300 border-slate-200 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="text-xs capitalize text-emerald-800 border-emerald-300 font-bold">
                    {hab.meal}
                  </Badge>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {hab.timesLogged} veces
                  </span>
                </div>
                <strong className="block text-slate-900 text-xs font-bold truncate">
                  {hab.title}
                </strong>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                  {hab.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-[11px]">
                <span className="tabular-nums font-bold text-emerald-950">
                  {hab.calories} kcal
                </span>
                <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-lg ${
                  isJustLogged
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                }`}>
                  {isJustLogged ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>¡Añadido!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      <span>Repetir</span>
                    </>
                  )}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
