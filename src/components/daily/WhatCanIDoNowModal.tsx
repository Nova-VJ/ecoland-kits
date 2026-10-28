import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Utensils, ChefHat, Droplets, Calendar, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dailyNutritionStore, ContextualAction } from '@/services/dailyNutritionStore';
import { Link } from 'react-router-dom';

interface WhatCanIDoNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerLog: () => void;
  onAddWater: () => void;
}

export const WhatCanIDoNowModal = ({ isOpen, onClose, onTriggerLog, onAddWater }: WhatCanIDoNowModalProps) => {
  if (!isOpen) return null;

  const actions = dailyNutritionStore.getWhatCanIDoNow();

  const handleActionClick = (action: ContextualAction) => {
    if (action.actionType === 'log') {
      onClose();
      onTriggerLog();
    } else if (action.actionType === 'hydrate') {
      onAddWater();
      onClose();
    } else if (action.targetUrl) {
      onClose();
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'log': return <Utensils className="w-5 h-5 text-emerald-700" />;
      case 'cook_pantry':
      case 'check_expiring': return <ChefHat className="w-5 h-5 text-amber-700" />;
      case 'hydrate': return <Droplets className="w-5 h-5 text-cyan-700" />;
      case 'plan_tomorrow':
      default: return <Sparkles className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-lg w-full border shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">¿Qué puedo hacer ahora mismo?</h3>
              <p className="text-[11px] text-emerald-300">Tus 3 mejores opciones según la hora y tu despensa</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-900 text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {actions.map((act, index) => (
            <div
              key={act.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {getActionIcon(act.actionType)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-900 text-[9px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">
                      {act.title}
                    </strong>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {act.subtitle}
                  </p>
                </div>
              </div>

              {act.targetUrl ? (
                <Button
                  asChild
                  size="sm"
                  className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shrink-0"
                >
                  <Link to={act.targetUrl} onClick={onClose}>
                    <span>{act.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleActionClick(act)}
                  className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shrink-0"
                >
                  <span>{act.actionLabel}</span>
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="p-3.5 bg-slate-50 border-t flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Máximo 3 sugerencias para no abrumar tu toma de decisiones.
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900 font-bold"
          >
            Entendido
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
