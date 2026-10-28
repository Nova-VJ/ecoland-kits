import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Plus, Droplet, Clock, Flame, Apple, Heart, 
  Utensils, ChevronRight, Barcode, Camera, Mic, Keyboard, 
  Calendar, ArrowRight, ShieldCheck, Trash2, CheckCircle2,
  SlidersHorizontal, ChevronDown, BookOpen, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  dailyNutritionStore, 
  DailyMealEntry, 
  MealType, 
  NUTRITIONAL_GOALS_CATALOG,
  DailyGoals
} from '@/services/dailyNutritionStore';
import { FastFoodModal } from '@/components/daily/FastFoodModal';
import { HabitualMealsRow } from '@/components/daily/HabitualMealsRow';
import { CompleteMyDayCard } from '@/components/daily/CompleteMyDayCard';
import { WeeklyTrendDialog } from '@/components/daily/WeeklyTrendDialog';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const EcolandHoy = () => {
  const { toast } = useToast();

  // Estados de reactividad local
  const [logs, setLogs] = useState<DailyMealEntry[]>(() => dailyNutritionStore.getTodayLogs());
  const [goals, setGoals] = useState<DailyGoals>(() => dailyNutritionStore.getGoals());
  const [waterGlasses, setWaterGlasses] = useState<number>(() => dailyNutritionStore.getWaterGlasses());

  // Diálogos modales
  const [isFastModalOpen, setIsFastModalOpen] = useState(false);
  const [fastModalMeal, setFastModalMeal] = useState<MealType>('desayuno');
  const [isWeeklyTrendOpen, setIsWeeklyTrendOpen] = useState(false);
  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false);

  // Saludo según la hora del día
  const currentHour = new Date().getHours();
  let greetingTime = 'Buenos días';
  if (currentHour >= 13 && currentHour < 20) greetingTime = 'Buenas tardes';
  else if (currentHour >= 20 || currentHour < 6) greetingTime = 'Buenas noches';

  const userName = 'Carlos';

  // Recálculo de totales
  const totalCalories = logs.reduce((acc, it) => acc + it.calories, 0);
  const totalProtein = Math.round(logs.reduce((acc, it) => acc + it.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(logs.reduce((acc, it) => acc + it.carbs, 0) * 10) / 10;
  const totalFats = Math.round(logs.reduce((acc, it) => acc + it.fats, 0) * 10) / 10;
  const totalFiber = Math.round(logs.reduce((acc, it) => acc + it.fiber, 0) * 10) / 10;

  const remainingCalories = Math.max(0, goals.targetCalories - totalCalories);
  const caloriePercent = Math.min(100, Math.round((totalCalories / goals.targetCalories) * 100));

  const refreshData = () => {
    setLogs(dailyNutritionStore.getTodayLogs());
    setGoals(dailyNutritionStore.getGoals());
    setWaterGlasses(dailyNutritionStore.getWaterGlasses());
  };

  const handleOpenAddModal = (meal: MealType) => {
    setFastModalMeal(meal);
    setIsFastModalOpen(true);
  };

  const handleRemoveLog = (id: string) => {
    const updated = dailyNutritionStore.removeMealLog(id);
    setLogs(updated);
    toast({ title: "Registro eliminado de tu día" });
  };

  const handleWaterClick = (delta: number) => {
    const updated = dailyNutritionStore.updateWaterGlasses(delta);
    setWaterGlasses(updated);
  };

  const handleSelectGoal = (goalId: string) => {
    const updated = dailyNutritionStore.setGoal(goalId);
    setGoals(updated);
    setIsGoalSelectorOpen(false);
    toast({
      title: "Objetivo actualizado",
      description: `Meta activa: ${updated.goalTitle} (${updated.targetCalories} kcal).`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 pt-4 sm:pt-6">
      <div className="container-eco max-w-4xl space-y-6">

        {/* 1. CABECERA: SALUDO & SELECTOR DE OBJETIVOS AMABLES */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <span>•</span>
              <span className="text-emerald-800 font-bold">Ecoland Hoy</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {greetingTime}, <span className="text-emerald-800">{userName}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tu espacio diario para comer equilibrado, aprovechar tu despensa y cuidar tu salud bio.
            </p>
          </div>

          {/* Selector de Objetivo Personalizado */}
          <div className="relative">
            <button
              onClick={() => setIsGoalSelectorOpen(!isGoalSelectorOpen)}
              className="flex items-center gap-2 p-2.5 sm:p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 text-left transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Tu Objetivo Activo</span>
                <span className="text-xs font-bold text-slate-800 truncate block max-w-[190px]">
                  {goals.goalTitle}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 ml-1 shrink-0" />
            </button>

            {/* Dropdown de 10 Objetivos */}
            <AnimatePresence>
              {isGoalSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl border shadow-2xl p-3 z-30 space-y-1 text-xs"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                    Elige lo que quieres conseguir:
                  </span>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {NUTRITIONAL_GOALS_CATALOG.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelectGoal(g.id)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                          goals.activeGoalId === g.id
                            ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-2">{g.title}</span>
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                          {g.cals} kcal
                        </Badge>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 2. TARJETA PRINCIPAL: BALANCE ENERGÉTICO & MACRONUTRIENTES */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <span className="text-xs text-slate-500 font-medium">Calorías de hoy</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900">
                  {totalCalories}
                </span>
                <span className="text-slate-400 text-sm font-semibold">
                  / {goals.targetCalories} kcal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Te quedan</span>
                <span className="font-mono text-lg font-bold text-emerald-800">
                  {remainingCalories} kcal
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center font-bold text-emerald-900 text-sm font-mono border border-emerald-200">
                {caloriePercent}%
              </div>
            </div>
          </div>

          {/* Barra de progreso visual */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${caloriePercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="bg-gradient-to-r from-emerald-800 to-emerald-600 h-full rounded-full"
            />
          </div>

          {/* Cuadrante de Macronutrientes y Fibra */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Proteína</span>
              <div className="flex items-baseline justify-between">
                <strong className="font-mono text-base text-slate-900 font-bold">{totalProtein}g</strong>
                <span className="text-[10px] text-slate-400 font-mono">/ {goals.targetProteinGrams}g</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-800 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (totalProtein / goals.targetProteinGrams) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Hidratos</span>
              <div className="flex items-baseline justify-between">
                <strong className="font-mono text-base text-slate-900 font-bold">{totalCarbs}g</strong>
                <span className="text-[10px] text-slate-400 font-mono">/ {goals.targetCarbsGrams}g</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-600 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (totalCarbs / goals.targetCarbsGrams) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Grasas Saludables</span>
              <div className="flex items-baseline justify-between">
                <strong className="font-mono text-base text-slate-900 font-bold">{totalFats}g</strong>
                <span className="text-[10px] text-slate-400 font-mono">/ {goals.targetFatsGrams}g</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-slate-600 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (totalFats / goals.targetFatsGrams) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">Fibra Prebiótica</span>
                <span className="text-[9px] bg-emerald-200/80 text-emerald-950 px-1.5 py-0.2 rounded-md font-bold">Clave</span>
              </div>
              <div className="flex items-baseline justify-between">
                <strong className="font-mono text-base text-emerald-950 font-bold">{totalFiber}g</strong>
                <span className="text-[10px] text-emerald-700 font-mono">/ {goals.targetFiberGrams}g</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-700 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (totalFiber / goals.targetFiberGrams) * 100)}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Control de Agua en 1 toque */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Droplet className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-slate-900 text-xs block">Hidratación Diaria</strong>
                <span className="text-[11px] text-slate-500 font-mono">
                  {waterGlasses} de {goals.targetWaterGlasses} vasos (~{(waterGlasses * 0.25).toFixed(1)} L)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleWaterClick(-1)}
                className="w-8 h-8 rounded-xl border bg-white hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center transition-colors"
                title="Quitar vaso"
              >
                -
              </button>
              <button
                onClick={() => handleWaterClick(1)}
                className="px-3 h-8 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                title="Añadir vaso"
              >
                <Plus className="h-3 w-3" />
                <span>Vaso</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. LANZADOR DE REGISTRO RÁPIDO */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-emerald-900 text-white p-4 rounded-3xl shadow-lg">
          <Button
            onClick={() => handleOpenAddModal('desayuno')}
            className="w-full sm:w-auto flex-1 bg-white hover:bg-slate-100 text-emerald-950 font-black py-6 rounded-2xl text-xs sm:text-sm gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4 text-emerald-800" />
            <span>+ Registrar lo que has comido</span>
          </Button>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-around">
            <button
              onClick={() => { setFastModalMeal('desayuno'); setIsFastModalOpen(true); }}
              className="flex-1 sm:flex-none p-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Camera className="h-3.5 w-3.5 text-emerald-300" />
              <span>Foto</span>
            </button>
            <button
              onClick={() => { setFastModalMeal('comida'); setIsFastModalOpen(true); }}
              className="flex-1 sm:flex-none p-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Mic className="h-3.5 w-3.5 text-emerald-300" />
              <span>Voz</span>
            </button>
            <button
              onClick={() => { setFastModalMeal('cena'); setIsFastModalOpen(true); }}
              className="flex-1 sm:flex-none p-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Barcode className="h-3.5 w-3.5 text-emerald-300" />
              <span>Código</span>
            </button>
          </div>
        </div>

        {/* 4. COMIDAS HABITUALES EN 1 TOQUE */}
        <HabitualMealsRow onLogged={refreshData} />

        {/* 5. TIMELINE DIARIO: DESAYUNO, COMIDA, CENA Y SNACKS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Tus Comidas de Hoy</span>
            <span className="text-[10px] text-slate-400">{logs.length} alimentos anotados</span>
          </div>

          {(['desayuno', 'comida', 'cena', 'snacks'] as MealType[]).map((mealKey) => {
            const mealItems = logs.filter(l => l.meal === mealKey);
            const mealCals = mealItems.reduce((acc, it) => acc + it.calories, 0);

            return (
              <div 
                key={mealKey}
                className="bg-white rounded-3xl p-4 sm:p-5 border shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between border-b pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider capitalize">
                      {mealKey}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono font-medium">
                      {mealCals > 0 ? `${mealCals} kcal` : 'Sin registros'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenAddModal(mealKey)}
                    className="text-[11px] text-emerald-800 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Añadir</span>
                  </button>
                </div>

                {/* Lista de alimentos en esta comida */}
                {mealItems.length > 0 ? (
                  <div className="space-y-2">
                    {mealItems.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-50 border flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-3">
                          <strong className="block text-slate-900 text-xs truncate">{item.name}</strong>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{item.timeString}</span>
                            <span>•</span>
                            <span>P: {item.protein}g</span>
                            <span>•</span>
                            <span>F: {item.fiber}g</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {item.calories} kcal
                          </span>
                          <button
                            onClick={() => handleRemoveLog(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200 text-center text-[11px] text-slate-400">
                    Aún no has anotado nada en tu {mealKey}. Pulsa en «Añadir» para registrar en segundos.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 6. COMPLETA MI DÍA — RECOMENDACIÓN CONTEXTUAL CON DESPENSA */}
        <CompleteMyDayCard onRecipeCooked={refreshData} />

        {/* 7. BOTÓN RESUMEN SEMANAL AMABLE Y ACCESOS A OTRAS HERRAMIENTAS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => setIsWeeklyTrendOpen(true)}
            variant="outline"
            className="flex-1 py-6 rounded-2xl border-slate-300 hover:bg-emerald-50 hover:border-emerald-500 font-bold text-xs text-slate-800 gap-2 shadow-2xs"
          >
            <Calendar className="h-4 w-4 text-emerald-800" />
            <span>📊 Ver Mi Semana en Ecoland (Tendencias)</span>
          </Button>

          <Button
            asChild
            className="flex-1 py-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-2 shadow-2xs"
          >
            <Link to="/ecohealth">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Plato Harvard & Calculadora TDEE ➔</span>
            </Link>
          </Button>
        </div>

      </div>

      {/* Modales Interactivos */}
      <FastFoodModal
        isOpen={isFastModalOpen}
        onClose={() => setIsFastModalOpen(false)}
        defaultMeal={fastModalMeal}
        onLoggedSuccess={refreshData}
      />

      <WeeklyTrendDialog
        isOpen={isWeeklyTrendOpen}
        onClose={() => setIsWeeklyTrendOpen(false)}
      />
    </div>
  );
};

export default EcolandHoy;
