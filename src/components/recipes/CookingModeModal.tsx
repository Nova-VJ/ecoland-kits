import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagedRecipe, recipeQueueService } from '@/services/recipeQueueService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChefHat,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Utensils,
  Package,
  Layers,
  Heart
} from 'lucide-react';

interface CookingModeModalProps {
  recipe: ManagedRecipe | null;
  isOpen: boolean;
  onClose: () => void;
  onRecipeCompleted?: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onRecipeCompleted
}) => {
  const [phase, setPhase] = useState<'mise_en_place' | 'cooking' | 'completed'>('mise_en_place');
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Temporizadores
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  // Opciones de finalización
  const [deductPantry, setDeductPantry] = useState(true);
  const [logDiary, setLogDiary] = useState(true);
  const [leftoverPortions, setLeftoverPortions] = useState(0);

  // WakeLock para mantener pantalla encendida
  useEffect(() => {
    let wakeLockSentinel: any = null;
    if (isOpen && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      (navigator as any).wakeLock
        .request('screen')
        .then((sentinel: any) => {
          wakeLockSentinel = sentinel;
        })
        .catch(() => {});
    }

    return () => {
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (recipe) {
      setPhase('mise_en_place');
      setCheckedIngredients({});
      setCurrentStepIdx(0);
      setTimerSecondsLeft(null);
      setIsTimerRunning(false);
      setLeftoverPortions(Math.max(0, recipe.servings - 1));
    }
  }, [recipe]);

  // Manejo de temporizador
  useEffect(() => {
    if (isTimerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev !== null && prev > 1) return prev - 1;
          setIsTimerRunning(false);
          return 0;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  if (!isOpen || !recipe) return null;

  const currentStepText = recipe.steps[currentStepIdx] || '';
  const detectedTimer = recipeQueueService.extractTimerFromStep(currentStepText);

  const startStepTimer = (minutes: number) => {
    const totalSec = minutes * 60;
    setTimerTotalSeconds(totalSec);
    setTimerSecondsLeft(totalSec);
    setIsTimerRunning(true);
  };

  const handleNextStep = () => {
    if (currentStepIdx + 1 < recipe.steps.length) {
      setCurrentStepIdx(currentStepIdx + 1);
      setTimerSecondsLeft(null);
      setIsTimerRunning(false);
    } else {
      setPhase('completed');
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      setTimerSecondsLeft(null);
      setIsTimerRunning(false);
    }
  };

  const handleConfirmFinish = () => {
    recipeQueueService.finishCookingRecipe({
      recipeId: recipe.id,
      portionsCooked: recipe.servings,
      portionsLeftoverToSave: leftoverPortions > 0 ? leftoverPortions : undefined,
      deductPantryIngredients: deductPantry,
      syncToTodayDiary: logDiary,
      mealType: 'almuerzo'
    });

    if (onRecipeCompleted) onRecipeCompleted();
    onClose();
  };

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden text-slate-900"
        >
          {/* Header Superior Encimera */}
          <div className="p-4 sm:p-5 border-b bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-sm">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                    {recipe.title}
                  </h2>
                  <Badge className="bg-emerald-100 text-emerald-900 border-none text-[10px] font-bold">
                    Modo Cocina 2.0
                  </Badge>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {recipe.prepTimeMinutes} min · {recipe.servings} raciones · Pantalla siempre encendida
                </span>
              </div>
            </div>

            <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full w-8 h-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* FASE 1: MISE EN PLACE (CHECKLIST ANTES DE EMPEZAR) */}
          {phase === 'mise_en_place' && (
            <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <Utensils className="w-4 h-4 text-emerald-800" />
                  <span>Mise en Place: Prepara los ingredientes en tu encimera</span>
                </div>
                <p className="text-emerald-800">
                  Tener todo lavado, medido y picado antes de encender el fuego reduce el estrés y evita que se quemen los alimentos.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ingredientes ({recipe.ingredients.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recipe.ingredients.map((ing, idx) => (
                    <label
                      key={idx}
                      className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                        checkedIngredients[idx]
                          ? 'bg-emerald-50/50 border-emerald-400 text-slate-800'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedIngredients[idx]}
                        onChange={e => setCheckedIngredients({ ...checkedIngredients, [idx]: e.target.checked })}
                        className="mt-0.5 rounded text-emerald-800 w-4 h-4 focus:ring-emerald-700"
                      />
                      <div className="text-xs leading-tight">
                        <strong className="font-bold block text-slate-900">{ing.name}</strong>
                        <span className="text-slate-500">{ing.originalText}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {Object.values(checkedIngredients).filter(Boolean).length} de {recipe.ingredients.length} listos en encimera
                </span>
                <Button
                  onClick={() => setPhase('cooking')}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-2xl px-6 py-5 text-sm gap-2"
                >
                  <span>Encender el fuego</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* FASE 2: COCINADO PASO A PASO CON LETRA GRANDE Y TIMERS */}
          {phase === 'cooking' && (
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between overflow-y-auto space-y-6">
              {/* Barra de Progreso de Pasos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Paso {currentStepIdx + 1} de {recipe.steps.length}</span>
                  <span>{Math.round(((currentStepIdx + 1) / recipe.steps.length) * 100)}% completado</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentStepIdx + 1) / recipe.steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Texto Gigante del Paso (Legible a 1.5 metros) */}
              <div className="p-6 sm:p-8 bg-slate-50 border border-slate-200/80 rounded-3xl space-y-4">
                <p className="text-xl sm:text-2xl font-medium text-slate-900 leading-relaxed font-sans">
                  {currentStepText}
                </p>

                {/* Detección de Temporizador Interactivo */}
                {detectedTimer.hasTimer && (
                  <div className="p-4 bg-white border border-emerald-300 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-800" />
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">
                          Temporizador detectado: {detectedTimer.label}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {isTimerRunning ? 'Cuenta atrás activa' : 'Pulsa para arrancar el tiempo'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {timerSecondsLeft !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-mono font-black text-emerald-900 px-3 py-1 bg-emerald-50 rounded-xl border border-emerald-200">
                            {formatTimerTime(timerSecondsLeft)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className="rounded-xl h-9"
                          >
                            {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startStepTimer(detectedTimer.minutes || 5)}
                            className="rounded-xl h-9 text-slate-500"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => startStepTimer(detectedTimer.minutes || 5)}
                          className="bg-emerald-800 text-white font-bold rounded-xl text-xs px-4 h-9 gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Iniciar {detectedTimer.label}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones Grandes de Navegación (Manos Libres) */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStepIdx === 0}
                  className="rounded-2xl py-6 text-sm font-bold gap-2 border-slate-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Paso Anterior</span>
                </Button>

                <Button
                  size="lg"
                  onClick={handleNextStep}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl py-6 text-sm font-bold gap-2"
                >
                  <span>{currentStepIdx + 1 === recipe.steps.length ? 'Finalizar Cocinado' : 'Siguiente Paso'}</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* FASE 3: PLATO TERMINADO & LEFTOVER REMIX */}
          {phase === 'completed' && (
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between overflow-y-auto space-y-6 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-800 mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  ¡Plato terminado con éxito!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Has cocinado <strong>{recipe.title}</strong> (~{recipe.estimatedCalories} kcal, {recipe.estimatedProtein}g proteína, {recipe.estimatedFiber}g fibra).
                </p>
              </div>

              {/* Opciones de Integración Automática */}
              <div className="bg-slate-50 p-5 rounded-3xl border text-left space-y-3 max-w-lg mx-auto w-full text-xs">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deductPantry}
                    onChange={e => setDeductPantry(e.target.checked)}
                    className="rounded text-emerald-800 w-4 h-4 focus:ring-emerald-700"
                  />
                  <div>
                    <strong className="text-slate-900 block">Descontar ingredientes usados de mi despensa</strong>
                    <span className="text-[11px] text-slate-500">Resta automáticamente las cantidades cocinadas.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={logDiary}
                    onChange={e => setLogDiary(e.target.checked)}
                    className="rounded text-emerald-800 w-4 h-4 focus:ring-emerald-700"
                  />
                  <div>
                    <strong className="text-slate-900 block">Registrar en mi diario nutricional de hoy</strong>
                    <span className="text-[11px] text-slate-500">Suma calorías, fibra y nutrientes sin esfuerzo.</span>
                  </div>
                </label>

                {/* Guardar raciones sobrantes como Tupper */}
                <div className="pt-2 border-t space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">¿Han sobrado raciones para mañana?</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <button
                        onClick={() => setLeftoverPortions(Math.max(0, leftoverPortions - 1))}
                        className="w-6 h-6 rounded-lg bg-white border font-bold text-slate-700"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-emerald-950">{leftoverPortions}</span>
                      <button
                        onClick={() => setLeftoverPortions(leftoverPortions + 1)}
                        className="w-6 h-6 rounded-lg bg-white border font-bold text-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {leftoverPortions > 0 && (
                    <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <p>
                        Se guardarán <strong>{leftoverPortions} raciones</strong> como Tupper en tu despensa. EcoCoach las priorizará mañana para evitar desperdicio.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  onClick={handleConfirmFinish}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-2xl px-8 py-5 text-sm"
                >
                  Confirmar y Guardar
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CookingModeModal;
