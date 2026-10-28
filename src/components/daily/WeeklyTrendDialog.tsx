import { motion } from 'framer-motion';
import { 
  X, Sparkles, Calendar, TrendingUp, Apple, Droplet, 
  ChefHat, Heart, Award, ShieldCheck, ArrowRight, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dailyNutritionStore, WeeklyTrendSummary } from '@/services/dailyNutritionStore';

interface WeeklyTrendDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyTrendDialog = ({ isOpen, onClose }: WeeklyTrendDialogProps) => {
  if (!isOpen) return null;

  const summary = dailyNutritionStore.getWeeklySummary();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white rounded-3xl max-w-lg w-full border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Cabecera */}
        <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-emerald-950 to-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-800 flex items-center justify-center text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base">Tu Semana en Ecoland</h3>
              <p className="text-[11px] text-emerald-300">Tendencias amables sin presión ni culpas</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-300 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Mensaje de Consistencia Amable */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              <span>Consistencia Saludable</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-900">
              {summary.friendlyMessage}
            </p>
          </div>

          {/* RESUMEN SEMANAL 2.0: 3 PREGUNTAS CLAVE (P1-F Punto 18) */}
          <div className="space-y-2.5">
            <div className="p-3 bg-slate-50 rounded-2xl border space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">
                1. ¿Qué hiciste esta semana?
              </span>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Registraste tus comidas {summary.daysLogged} días y preparaste {summary.pantryMealsCooked} platos aprovechando ingredientes de tu despensa, ahorrando ~{summary.estimatedEuroSavedAntiWaste.toFixed(2)}€ en comida no desperdiciada.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border space-y-1">
              <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block">
                2. ¿Qué cambió respecto a tu propia media?
              </span>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Tu ingesta de fibra subió a <strong>{summary.averageFiber}g/día</strong> (frente a tus {summary.previousWeekAverageFiber}g anteriores). Probaste <strong>{summary.plantDiversityCount} plantas diferentes</strong> entre frutas, verduras, legumbres y cereales integrales.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-black text-emerald-900 tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                3. ¿Qué puedes probar la próxima semana?
              </span>
              <p className="text-[11px] text-emerald-950 leading-relaxed">
                Una idea sencilla: añade una ración de legumbres bio (lentejas o garbanzos) en dos comidas de mediodía para consolidar tu energía de la tarde.
              </p>
            </div>
          </div>

          {/* Grid de Métricas Clave */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border space-y-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-800" />
                Días Registrados
              </span>
              <strong className="block text-xl font-black text-slate-900">
                {summary.daysLogged} / {summary.totalDays}
              </strong>
              <span className="text-[10px] text-emerald-800 font-semibold block">Hábito muy positivo</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border space-y-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Apple className="h-3.5 w-3.5 text-emerald-800" />
                Variedad vegetal esta semana
              </span>
              <strong className="block text-xl font-black text-slate-900">
                {summary.plantDiversityCount} plantas observadas
              </strong>
              <span className="text-[10px] text-slate-500 block">Meta orientativa personal (no médica)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border space-y-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-800" />
                Fibra Promedio
              </span>
              <strong className="block text-xl font-black text-slate-900">
                {summary.averageFiber}g <span className="text-xs font-normal text-slate-400">/día</span>
              </strong>
              <span className="text-[10px] text-emerald-800 font-semibold block">Óptima para digestión</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border space-y-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ChefHat className="h-3.5 w-3.5 text-emerald-800" />
                Cocinado en Casa
              </span>
              <strong className="block text-xl font-black text-slate-900">
                {summary.pantryMealsCooked} platos
              </strong>
              <span className="text-[10px] text-emerald-800 font-semibold block">Ahorro: ~{summary.estimatedEuroSavedAntiWaste.toFixed(2)}€</span>
            </div>
          </div>

          {/* Filosofía */}
          <div className="p-3.5 rounded-2xl bg-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <Heart className="h-4 w-4 text-emerald-800 shrink-0" />
            <span>Un día incompleto no borra tu progreso. La salud es un hábito constante a largo plazo.</span>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-5 rounded-2xl text-xs"
          >
            Volver a mi día
          </Button>

        </div>
      </motion.div>
    </div>
  );
};
