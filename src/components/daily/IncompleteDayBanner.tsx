import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, X, PlusCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dailyNutritionStore } from '@/services/dailyNutritionStore';

interface IncompleteDayBannerProps {
  onCompleteYesterday: () => void;
  onStatusUpdated?: () => void;
}

export const IncompleteDayBanner = ({ onCompleteYesterday, onStatusUpdated }: IncompleteDayBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const check = dailyNutritionStore.checkYesterdayIncomplete();

  if (!check.isIncomplete || dismissed) return null;

  const yesterdayDateStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  const handleMarkIncomplete = () => {
    dailyNutritionStore.setDayCompleteness(yesterdayDateStr, 'INCOMPLETE');
    setDismissed(true);
    if (onStatusUpdated) onStatusUpdated();
  };

  const handleConfirmCorrect = () => {
    dailyNutritionStore.setDayCompleteness(yesterdayDateStr, 'USER_CONFIRMED');
    setDismissed(true);
    if (onStatusUpdated) onStatusUpdated();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="p-4 rounded-3xl bg-amber-50/90 border border-amber-300 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
            <HelpCircle className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <strong className="text-xs sm:text-sm font-bold block text-amber-950">
              Ayer parece haber quedado incompleto
            </strong>
            <p className="text-[11px] text-amber-800 leading-relaxed max-w-xl">
              Solo registraste {check.yesterdayCalories} kcal de tu objetivo habitual ({check.expectedCalories} kcal). Para no desvirtuar tus tendencias ni asumir que comiste menos, indícanos cómo gestionarlo:
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto shrink-0 justify-end pt-1 md:pt-0">
          <Button
            size="sm"
            onClick={onCompleteYesterday}
            className="bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs rounded-xl h-8 px-3 gap-1 shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Completar día</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkIncomplete}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs rounded-xl h-8 px-3"
          >
            Marcar incompleto
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleConfirmCorrect}
            className="text-amber-800 hover:bg-amber-100/60 font-semibold text-xs rounded-xl h-8 px-2.5"
          >
            Está correcto
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
