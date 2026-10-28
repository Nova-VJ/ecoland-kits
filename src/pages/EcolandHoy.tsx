import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Calendar, Clock, Plus, Flame, Droplet, 
  ChevronDown, Check, SlidersHorizontal, Trash2, Camera, Mic,
  Repeat, ArrowRight, Bookmark, AlertTriangle, ChefHat, Scale,
  CheckCircle2, ArrowUpDown, ShieldCheck, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  dailyNutritionStore, 
  DailyMealEntry, 
  DailyGoals, 
  MealType, 
  NUTRITIONAL_GOALS_CATALOG,
  PantryItem,
  SavedMeal,
  PantryDeductionProposal,
  WeightRecord
} from '@/services/dailyNutritionStore';
import { FastFoodModal } from '@/components/daily/FastFoodModal';
import { SmartFoodLoggerModal } from '@/components/daily/SmartFoodLoggerModal';
import { HabitualMealsRow } from '@/components/daily/HabitualMealsRow';
import { CompleteMyDayCard } from '@/components/daily/CompleteMyDayCard';
import { WeeklyTrendDialog } from '@/components/daily/WeeklyTrendDialog';
import { IncompleteDayBanner } from '@/components/daily/IncompleteDayBanner';
import { WhatCanIDoNowModal } from '@/components/daily/WhatCanIDoNowModal';
import { HouseholdSettingsModal } from '@/components/household/HouseholdSettingsModal';
import { ExperienceMode } from '@/services/dailyNutritionStore';
import { Bot, Users, HelpCircle, Package } from 'lucide-react';
import { OfflineIndicatorBar } from '@/components/offline/OfflineIndicatorBar';
import { ZeroFrictionPantryModal } from '@/components/pantry/ZeroFrictionPantryModal';
import { RecipeInboxModal } from '@/components/recipes/RecipeInboxModal';
import { CommandPaletteModal } from '@/components/common/CommandPaletteModal';
import { HouseholdBudgetModal } from '@/components/budget/HouseholdBudgetModal';
import { NutritionalExportModal } from '@/components/export/NutritionalExportModal';
import { Wallet, FileSpreadsheet, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const EcolandHoy = () => {
  const { toast } = useToast();

  // Estados de reactividad local
  const [logs, setLogs] = useState<DailyMealEntry[]>(() => dailyNutritionStore.getTodayLogs());
  const [goals, setGoals] = useState<DailyGoals>(() => dailyNutritionStore.getGoals());
  const [waterGlasses, setWaterGlasses] = useState<number>(() => dailyNutritionStore.getWaterGlasses());
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() => dailyNutritionStore.getSavedMeals());
  const [expiringPantry, setExpiringPantry] = useState<PantryItem[]>(() => dailyNutritionStore.getExpiringPantryItems());

  // Modo de Experiencia P2-F (Simple vs Nutrición)
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>(() => dailyNutritionStore.getExperienceMode());
  const [isWhatCanIDoOpen, setIsWhatCanIDoOpen] = useState(false);
  const [isHouseholdModalOpen, setIsHouseholdModalOpen] = useState(false);
  const [isPantryModalOpen, setIsPantryModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Diálogos modales
  const [isFastModalOpen, setIsFastModalOpen] = useState(false);
  const [isSmartLoggerOpen, setIsSmartLoggerOpen] = useState(false);
  const [fastModalMeal, setFastModalMeal] = useState<MealType>('desayuno');
  const [isWeeklyTrendOpen, setIsWeeklyTrendOpen] = useState(false);
  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false);
  const [activePantryProposal, setActivePantryProposal] = useState<PantryDeductionProposal | null>(null);

  // Registro opcional de peso (P1-F Punto 17)
  const [isWeightEnabled, setIsWeightEnabled] = useState<boolean>(() => dailyNutritionStore.isWeightTrackingEnabled());
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>(() => dailyNutritionStore.getWeightHistory());
  const [newWeightInput, setNewWeightInput] = useState<string>('');

  // Saludo contextual según la hora del día (P1-A Punto 1)
  const currentHour = new Date().getHours();
  let timeSlot: 'desayuno' | 'comida' | 'tarde' | 'cena' = 'desayuno';
  let greetingTime = 'Buenos días';
  let contextTip = 'Prioriza un desayuno equilibrado e hidrátate bien para empezar con energía.';

  if (currentHour >= 5 && currentHour < 12) {
    timeSlot = 'desayuno';
    greetingTime = 'Buenos días';
    contextTip = 'Momento del desayuno: anota tu primera comida o repite tu hábito habitual en 1 clic.';
  } else if (currentHour >= 12 && currentHour < 16) {
    timeSlot = 'comida';
    greetingTime = 'Buenas tardes';
    contextTip = 'Mediodía: registra tu comida del almuerzo para ver el balance de tu día.';
  } else if (currentHour >= 16 && currentHour < 20) {
    timeSlot = 'tarde';
    greetingTime = 'Buenas tardes';
    contextTip = 'Media tarde: balance provisional. Prevé una cena ligera basada en tu despensa.';
  } else {
    timeSlot = 'cena';
    greetingTime = 'Buenas noches';
    contextTip = 'Noche: completa tu día de forma suave aprovechando lo que ya tienes en casa.';
  }

    useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const userName = 'Patricia';

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
    setSavedMeals(dailyNutritionStore.getSavedMeals());
    setExpiringPantry(dailyNutritionStore.getExpiringPantryItems());
    setWeightHistory(dailyNutritionStore.getWeightHistory());
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

  // Acciones de Repetición (P1-A Punto 4)
  const handleRepeatYesterday = (meal: MealType) => {
    const added = dailyNutritionStore.repeatMealFromYesterday(meal);
    if (added.length > 0) {
      refreshData();
      toast({
        title: `¡${meal.charAt(0).toUpperCase() + meal.slice(1)} de ayer repetido!`,
        description: `Se han anotado ${added.length} alimentos en tu día. Puedes editarlos en cualquier momento.`,
      });
    } else {
      toast({
        title: "Sin registros previos",
        description: `No había registros de ${meal} en el día de ayer.`,
      });
    }
  };

  const handleCopyYesterdayEntirely = () => {
    const added = dailyNutritionStore.copyYesterdayEntirely();
    if (added.length > 0) {
      refreshData();
      toast({
        title: "¡Día anterior copiado al completo!",
        description: `Se han transferido ${added.length} platos a tu día de hoy.`,
      });
    }
  };

  // Confirmación de Deducción Despensa ↔ Diario (P1-C Punto 9)
  const handleConfirmPantryProposal = () => {
    if (!activePantryProposal) return;
    dailyNutritionStore.confirmPantryDeduction(activePantryProposal.pantryId, activePantryProposal.servingsToDeduct);
    toast({
      title: "Despensa actualizada",
      description: `Se han restado las raciones de ${activePantryProposal.pantryName}.`,
    });
    setActivePantryProposal(null);
    refreshData();
  };

  // Registro de peso opcional (P1-F Punto 17)
  const handleAddWeight = () => {
    const num = parseFloat(newWeightInput.replace(',', '.'));
    if (isNaN(num) || num < 30 || num > 300) {
      toast({ title: "Introduce un peso válido en kg (ej: 69.8)", variant: "destructive" });
      return;
    }
    dailyNutritionStore.addWeightEntry(num);
    setNewWeightInput('');
    setWeightHistory(dailyNutritionStore.getWeightHistory());
    toast({
      title: "Peso anotado",
      description: `Tendencia suavizada actualizada a ${dailyNutritionStore.getWeightHistory().slice(-1)[0].smoothedTrendKg} kg.`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 pt-4 sm:pt-6">
      <div className="container-eco max-w-4xl space-y-6">

        {/* BANNER DE DÍA INCOMPLETO (P2-C) */}
        <IncompleteDayBanner 
          onCompleteYesterday={() => {
            setFastModalMeal('comida');
            setIsFastModalOpen(true);
          }}
          onStatusUpdated={refreshData}
        />

        {/* BARRA DE HERRAMIENTAS INTELIGENTES P2 (EcoCoach, Qué puedo hacer, Hogar, Modo Simple) */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white rounded-2xl border shadow-2xs text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              onClick={() => setIsWhatCanIDoOpen(true)}
              className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-8 px-3 gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>¿Qué puedo hacer ahora?</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setIsSmartLoggerOpen(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl h-8 px-3 gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Smart Food Logger 3.0</span>
            </Button>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-emerald-300 text-emerald-900 hover:bg-emerald-50 font-bold text-xs rounded-xl h-8 px-3 gap-1.5"
            >
              <Link to="/coach">
                <Bot className="w-3.5 h-3.5 text-emerald-800" />
                <span>EcoCoach</span>
              </Link>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsHouseholdModalOpen(true)}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-xl h-8 px-3 gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Hogar Ecoland</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPantryModalOpen(true)}
              className="border-emerald-300 text-emerald-900 bg-emerald-50/50 hover:bg-emerald-100 font-semibold text-xs rounded-xl h-8 px-3 gap-1.5"
            >
              <Package className="w-3.5 h-3.5 text-emerald-800" />
              <span>Mi Despensa</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRecipeModalOpen(true)}
              className="border-emerald-300 text-emerald-900 bg-emerald-50/50 hover:bg-emerald-100 font-semibold text-xs rounded-xl h-8 px-3 gap-1.5"
            >
              <ChefHat className="w-3.5 h-3.5 text-emerald-800" />
              <span>Recetas & Cocina</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBudgetModalOpen(true)}
              className="border-amber-300 text-amber-900 bg-amber-50/50 hover:bg-amber-100 font-semibold text-xs rounded-xl h-8 px-3 gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-800" />
              <span>Presupuesto</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
              className="border-blue-300 text-blue-900 bg-blue-50/50 hover:bg-blue-100 font-semibold text-xs rounded-xl h-8 px-3 gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-800" />
              <span>Exportar Informe</span>
            </Button>

            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl text-slate-600 text-xs font-medium transition-colors shadow-2xs"
              title="Comando universal (Ctrl+K o Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Buscar o comando</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-300 rounded shadow-2xs font-mono text-slate-500 font-bold">⌘K</kbd>
            </button>
          </div>

          <OfflineIndicatorBar />

          {/* Toggle Modo Simple vs Nutrición (P2-F) */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={() => {
                setExperienceMode('simple');
                dailyNutritionStore.setExperienceMode('simple');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                experienceMode === 'simple'
                  ? 'bg-white text-emerald-950 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Modo Simple
            </button>
            <button
              onClick={() => {
                setExperienceMode('nutrition');
                dailyNutritionStore.setExperienceMode('nutrition');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                experienceMode === 'nutrition'
                  ? 'bg-white text-emerald-950 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Modo Nutrición
            </button>
          </div>
        </div>

        {/* 1. CABECERA CONTEXTUAL ADAPTADA POR HORARIO (P1-A Punto 1) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                <span>•</span>
                <span className="text-emerald-800 font-bold">Ecoland Hoy</span>
                <Badge variant="outline" className="text-[10px] font-bold border-emerald-300 text-emerald-800 capitalize">
                  {timeSlot === 'desayuno' ? '🌅 Mañana' : timeSlot === 'comida' ? '☀️ Mediodía' : timeSlot === 'tarde' ? '🌤️ Tarde' : '🌙 Noche'}
                </Badge>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {greetingTime}, <span className="text-emerald-800">{userName}</span>
              </h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {contextTip}
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
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border shadow-xl p-2 z-30 space-y-1"
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 block">
                      Elige tu enfoque de salud:
                    </span>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {NUTRITIONAL_GOALS_CATALOG.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => handleSelectGoal(g.id)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between ${
                            goals.activeGoalId === g.id
                              ? 'bg-emerald-800 text-white font-bold'
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
        </div>

        {/* 2. BARRA DE ACCIONES RÁPIDAS: REPETIR AYER & COPIAR DÍA (P1-A Punto 4) */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
            <Repeat className="w-3.5 h-3.5 text-emerald-800" />
            <span>Repetir con 1 toque:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleRepeatYesterday('desayuno')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-xl text-slate-700 hover:text-emerald-950 text-[11px] font-semibold transition-colors shadow-2xs"
            >
              Desayuno de ayer
            </button>
            <button
              onClick={() => handleRepeatYesterday('comida')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-xl text-slate-700 hover:text-emerald-950 text-[11px] font-semibold transition-colors shadow-2xs"
            >
              Comida de ayer
            </button>
            <button
              onClick={() => handleRepeatYesterday('cena')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-xl text-slate-700 hover:text-emerald-950 text-[11px] font-semibold transition-colors shadow-2xs"
            >
              Cena de ayer
            </button>
            <button
              onClick={handleCopyYesterdayEntirely}
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-[11px] font-bold transition-colors shadow-2xs"
            >
              Copiar día completo
            </button>
          </div>
        </div>

        {/* 3. PROPUESTA DE ACTUALIZACIÓN DESPENSA ↔ DIARIO (P1-C Punto 9) */}
        <AnimatePresence>
          {activePantryProposal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                  📦
                </div>
                <div>
                  <strong className="text-xs block">
                    {activePantryProposal.pantryName}: ¿actualizar cantidad en tu despensa?
                  </strong>
                  <span className="text-[11px] text-amber-800">
                    Tenías {activePantryProposal.currentEstimatedServings} raciones. Has registrado una comida: nueva estimación ~{activePantryProposal.newEstimatedServings} raciones.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleConfirmPantryProposal}
                  size="sm"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl"
                >
                  Actualizar despensa
                </Button>
                <Button
                  onClick={() => setActivePantryProposal(null)}
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-xl"
                >
                  No cambiar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. TARJETA DESPENSA: "ÚSALO PRONTO / QUÉ CONSUMIR PRIMERO" (P1-B Punto 8) */}
        {expiringPantry.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                  Evita Desperdicio · Úsalo Pronto
                </span>
                <span className="text-xs text-slate-800 font-bold block">
                  {expiringPantry.map(p => `${p.name} (~${p.daysToConsumeBeforePreferred} días)`).join(', ')}
                </span>
              </div>
            </div>

            <Button
              asChild
              size="sm"
              className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold rounded-xl gap-1.5 shrink-0"
            >
              <Link to="/blog">
                <ChefHat className="w-3.5 h-3.5" />
                <span>Dame ideas con estos alimentos</span>
              </Link>
            </Button>
          </div>
        )}

        {/* 5. TARJETA PRINCIPAL: BALANCE ENERGÉTICO & MACRONUTRIENTES (FIBRA LIMPIA) */}
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

          {/* Cuadrante de Macronutrientes y Fibra o Foco Simple según Modo de Experiencia (P2-F) */}
          {experienceMode === 'simple' ? (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <strong className="block font-bold text-sm text-emerald-950 mb-0.5">Foco del día:</strong>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  {caloriePercent >= 90 
                    ? '¡Excelente jornada! Has alcanzado un equilibrio nutritivo completo sin complicaciones.' 
                    : `Llevas ${totalCalories} kcal registradas. Te quedan ~${remainingCalories} kcal para tu equilibrio diario saludable.`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Avance:</span>
                <span className="font-mono font-black text-emerald-950 text-base">{caloriePercent}%</span>
              </div>
            </div>
          ) : (
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
                <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">Fibra</span>
                <span className="text-[9px] bg-emerald-200/80 text-emerald-950 px-1.5 py-0.2 rounded-md font-bold">Digestiva</span>
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
          )}

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

        {/* 6. LANZADOR DE REGISTRO RÁPIDO */}
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
              <span>Cena</span>
            </button>
          </div>
        </div>

        {/* 7. COMIDAS HABITUALES EN 1 SOLO CLIC */}
        <HabitualMealsRow onLogged={refreshData} />

        {/* 8. COMIDAS GUARDADAS FAVORITAS (P1-A Punto 5) */}
        {savedMeals.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
                Tus Comidas Guardadas ({savedMeals.length})
              </span>
              <span className="text-[10px] text-slate-400">Tus platos personalizados</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-2">
              {savedMeals.map((saved) => (
                <div
                  key={saved.id}
                  className="p-3 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl flex flex-col justify-between shadow-2xs transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <Badge variant="outline" className="capitalize text-emerald-800 border-emerald-300 text-[9px]">
                        {saved.meal}
                      </Badge>
                      <span className="font-mono font-bold text-slate-700">{saved.calories} kcal</span>
                    </div>
                    <strong className="text-xs text-slate-900 block truncate">{saved.name}</strong>
                    <span className="text-[10px] text-slate-500 block line-clamp-1">{saved.description}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400">P: {saved.protein}g · F: {saved.fiber}g</span>
                    <Button
                      onClick={() => {
                        dailyNutritionStore.logSavedMeal(saved.id);
                        refreshData();
                        toast({ title: "Comida guardada registrada en tu día" });
                      }}
                      size="sm"
                      className="h-6 px-2.5 text-[10px] bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold"
                    >
                      + Anotar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. LÍNEA TEMPORAL DE COMIDAS REGISTRADAS HOY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Lo que llevas anotado hoy:
            </h4>
            <span className="text-xs font-mono text-slate-400">
              {logs.length} {logs.length === 1 ? 'plato' : 'platos'}
            </span>
          </div>

          {(['desayuno', 'comida', 'cena', 'snacks'] as MealType[]).map((mealKey) => {
            const mealEntries = logs.filter(l => l.meal === mealKey);
            const mealCals = mealEntries.reduce((acc, it) => acc + it.calories, 0);

            return (
              <div key={mealKey} className="bg-white rounded-2xl border p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs capitalize text-slate-800">{mealKey}</span>
                    {mealEntries.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({mealCals} kcal)
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => handleOpenAddModal(mealKey)}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg gap-1 font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Añadir</span>
                  </Button>
                </div>

                {mealEntries.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-1">
                    Nada registrado todavía en {mealKey}.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {mealEntries.map((entry) => (
                      <div
                        key={entry.id}
                        data-testid="meal-entry"
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-semibold text-slate-800 truncate block">{entry.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {entry.timeString} • {entry.protein}g prot • {entry.fiber}g fibra
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {entry.calories} kcal
                          </span>
                          <button
                            onClick={() => handleRemoveLog(entry.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Eliminar plato"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 10. COMPLETA MI DÍA 2.0 (Despensa primero, efecto antes/después) */}
        <CompleteMyDayCard onRecipeCooked={refreshData} />

        {/* 11. REGISTRO OPCIONAL DE PESO CON TENDENCIA SUAVIZADA (P1-F Punto 17) */}
        <div className="bg-white rounded-3xl p-5 border shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Scale className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <strong className="text-xs text-slate-900 block">Evolución y Tendencia de Peso (Opcional)</strong>
                <span className="text-[10px] text-slate-500">Tendencia suavizada que ignora las fluctuaciones diarias de líquidos</span>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !isWeightEnabled;
                setIsWeightEnabled(next);
                dailyNutritionStore.toggleWeightTracking(next);
              }}
              className="text-[11px] font-bold text-emerald-800 hover:underline"
            >
              {isWeightEnabled ? 'Desactivar' : 'Activar registro'}
            </button>
          </div>

          {isWeightEnabled && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2 max-w-sm">
                <Input
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  placeholder="Peso de hoy en kg (ej: 69.8)"
                  className="rounded-xl h-9 text-xs"
                />
                <Button
                  onClick={handleAddWeight}
                  size="sm"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
                >
                  Anotar
                </Button>
              </div>

              {weightHistory.length > 0 && (
                <div className="flex items-center gap-4 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Último peso:</span>
                    <strong className="text-slate-900">{weightHistory.slice(-1)[0].weightKg} kg</strong>
                  </div>
                  <div className="border-l pl-4">
                    <span className="text-[10px] text-slate-400 block uppercase">Tendencia suavizada:</span>
                    <strong className="text-emerald-800">{weightHistory.slice(-1)[0].smoothedTrendKg} kg</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 12. ACCESOS CLAVE: MI SEMANA (PLANIFICADOR) & RESUMEN SEMANAL */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            asChild
            className="flex-1 py-6 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs gap-2 shadow-xs"
          >
            <Link to="/semana">
              <Calendar className="h-4 w-4 text-emerald-300" />
              <span>📅 Planificar "Mi Semana" & Lista de Compra ➔</span>
            </Link>
          </Button>

          <Button
            onClick={() => setIsWeeklyTrendOpen(true)}
            variant="outline"
            className="flex-1 py-6 rounded-2xl border-slate-300 hover:bg-emerald-50 hover:border-emerald-500 font-bold text-xs text-slate-800 gap-2 shadow-2xs"
          >
            <Sparkles className="h-4 w-4 text-emerald-800" />
            <span>📊 Ver Mi Semana en Ecoland (Tendencias)</span>
          </Button>
        </div>

      </div>

      {/* Modales Interactivos */}
      <SmartFoodLoggerModal
        isOpen={isSmartLoggerOpen}
        onClose={() => setIsSmartLoggerOpen(false)}
        defaultMeal={fastModalMeal}
        onLoggedSuccess={refreshData}
      />

      <FastFoodModal
        isOpen={isFastModalOpen}
        onClose={() => setIsFastModalOpen(false)}
        defaultMeal={fastModalMeal}
        onLoggedSuccess={refreshData}
        onPantryProposalTriggered={(prop) => setActivePantryProposal(prop)}
      />

      <WeeklyTrendDialog
        isOpen={isWeeklyTrendOpen}
        onClose={() => setIsWeeklyTrendOpen(false)}
      />

      <WhatCanIDoNowModal
        isOpen={isWhatCanIDoOpen}
        onClose={() => setIsWhatCanIDoOpen(false)}
        onTriggerLog={() => {
          setFastModalMeal('comida');
          setIsFastModalOpen(true);
        }}
        onAddWater={() => handleWaterClick(1)}
      />

      <HouseholdSettingsModal
        isOpen={isHouseholdModalOpen}
        onClose={() => setIsHouseholdModalOpen(false)}
      />

      <ZeroFrictionPantryModal
        isOpen={isPantryModalOpen}
        onClose={() => setIsPantryModalOpen(false)}
        onItemConsumedToDaily={() => refreshData()}
      />

      <RecipeInboxModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        onCookRecipeSuccess={() => refreshData()}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenSmartLogger={() => setIsSmartLoggerOpen(true)}
        onOpenPantry={() => setIsPantryModalOpen(true)}
        onOpenRecipes={() => setIsRecipeModalOpen(true)}
        onOpenBudget={() => setIsBudgetModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenHousehold={() => setIsHouseholdModalOpen(true)}
        onOpenWhatCanIDo={() => setIsWhatCanIDoOpen(true)}
      />

      <HouseholdBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      <NutritionalExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default EcolandHoy;
