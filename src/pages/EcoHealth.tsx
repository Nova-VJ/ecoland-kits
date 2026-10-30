import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Sparkles, Scale, Apple, CheckCircle2, ShoppingBag, 
  ShieldCheck, ArrowRight, RefreshCw, AlertCircle, ChefHat, Wallet, MessageSquare,
  Droplet, Plus, Trash2, Search, Barcode, Camera, Layers, Check, ChevronRight, Sliders,
  UtensilsCrossed, Flame, BarChart3, Wheat, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { Link, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { HarvardPlateInteractive } from '@/components/ecohealth/HarvardPlateInteractive';
import { BudgetOptimizerInteractive } from '@/components/ecohealth/BudgetOptimizerInteractive';
import { formatPrice } from '@/lib/utils';


interface MealLogItem {
  id: string;
  name: string;
  meal: 'desayuno' | 'comida' | 'cena' | 'snacks';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  productSlug?: string;
}

export const EcoHealth = () => {
  const { addCatalogProduct, setIsOpen } = useCart();
  const { toast } = useToast();
  // ==========================================
  // CALCULADORA DE GASTO ENERGÉTICO & TDEE
  // ==========================================
  const [userGender, setUserGender] = useState<'hombre' | 'mujer'>('mujer');
  const [userAge, setUserAge] = useState<number>(32);
  const [userHeight, setUserHeight] = useState<number>(168);
  const [userWeight, setUserWeight] = useState<number>(64);
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // 1.2 sedentario, 1.375 ligero, 1.55 moderado, 1.725 activo
  const [fitnessGoal, setFitnessGoal] = useState<'perder' | 'mantener' | 'ganar'>('mantener');

  // Mifflin-St Jeor formula
  const bmr = userGender === 'hombre'
    ? Math.round(10 * userWeight + 6.25 * userHeight - 5 * userAge + 5)
    : Math.round(10 * userWeight + 6.25 * userHeight - 5 * userAge - 161);

  const tdee = Math.round(bmr * activityLevel);

  const targetCaloriesCalculated = fitnessGoal === 'perder'
    ? Math.round(tdee - 400)
    : fitnessGoal === 'ganar'
      ? Math.round(tdee + 350)
      : tdee;

  // Daily calorie goal (can be customized by calculator)
  const [calorieGoal, setCalorieGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ecoland-target-calories');
      return saved ? Number(saved) : 2000;
    } catch { return 2000; }
  });

  const applyCalculatedCalories = () => {
    setCalorieGoal(targetCaloriesCalculated);
    try { localStorage.setItem('ecoland-target-calories', targetCaloriesCalculated.toString()); } catch {}
    toast({
      title: "Objetivo calórico actualizado",
      description: `Tu nuevo objetivo es de ${targetCaloriesCalculated} kcal/día (quemas aprox. ${tdee} kcal diarias).`,
    });
  };

  // ==========================================
  // PLATO HARVARD INTERACTIVO & COMPRAS SALUDABLES
  // ==========================================
    // Active Tab
  type EcoHealthTab = 'harvard' | 'diario' | 'calculadora' | 'perfil' | 'escaner' | 'comparador' | 'despensa' | 'presupuesto';
  const ECOHEALTH_TABS: EcoHealthTab[] = ['harvard', 'diario', 'calculadora', 'perfil', 'escaner', 'comparador', 'despensa', 'presupuesto'];
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as EcoHealthTab | null;
  const [activeTab, setActiveTab] = useState<EcoHealthTab>(tabParam && ECOHEALTH_TABS.includes(tabParam) ? tabParam : 'harvard');
  useEffect(() => {
    if (tabParam && ECOHEALTH_TABS.includes(tabParam)) setActiveTab(tabParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // Diet Profile State
  const [dietTags, setDietTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ecoland-diet-tags');
      return saved ? JSON.parse(saved) : ['sin-gluten', 'vegano'];
    } catch {
      return ['sin-gluten', 'vegano'];
    }
  });

  const toggleTag = (id: string) => {
    setDietTags(prev => {
      const updated = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      try {
        localStorage.setItem('ecoland-diet-tags', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast({
      title: "Perfil Alimentario actualizado",
      description: "Tu catálogo y recomendaciones se han sincronizado.",
    });
  };

  // 1. DIARIO NUTRICIONAL (FOOD TRACKING)
  const [mealLogs, setMealLogs] = useState<MealLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('ecoland-meal-logs');
      return saved ? JSON.parse(saved) : [
        {
          id: '1',
          name: 'Copos de Avena Sin Gluten Bio (50g) con bebida vegetal',
          meal: 'desayuno',
          calories: 210,
          protein: 7,
          carbs: 35,
          fats: 3.5,
          fiber: 5.5,
          productSlug: 'ecosana-copos-de-avena-sin-gluten-1k'
        },
        {
          id: '2',
          name: 'Guiso de Lentejas con Verduras Bio Gumendi (350g)',
          meal: 'comida',
          calories: 320,
          protein: 18,
          carbs: 45,
          fats: 4,
          fiber: 12,
          productSlug: 'gumendi-lentejas-con-verduras-720gr'
        }
      ];
    } catch {
      return [];
    }
  });

  // Save meal logs
  useEffect(() => {
    try {
      localStorage.setItem('ecoland-meal-logs', JSON.stringify(mealLogs));
    } catch {}
  }, [mealLogs]);

  // Target Daily Nutritional Goals
  const dailyGoals = {
    calories: calorieGoal,
    protein: 80,
    carbs: 220,
    fats: 65,
    fiber: 30
  };

  // Computed Totals
  const currentTotals = mealLogs.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fats: acc.fats + item.fats,
    fiber: acc.fiber + item.fiber,
  }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

  // Quick Add Food State
  const [newFoodName, setNewFoodName] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<'desayuno' | 'comida' | 'cena' | 'snacks'>('desayuno');
  const [selectedCatalogFood, setSelectedCatalogFood] = useState<string>('');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName && !selectedCatalogFood) return;

    let itemToAdd: MealLogItem;

    if (selectedCatalogFood) {
      const p = allCatalogProducts.find(x => x.slug === selectedCatalogFood);
      if (p) {
        itemToAdd = {
          id: Date.now().toString(),
          name: `${p.name.split('–')[0]} (Ración bio)`,
          meal: selectedMeal,
          calories: 180,
          protein: p.tags.includes('proteina') ? 16 : 6,
          carbs: 26,
          fats: 2.5,
          fiber: 5,
          productSlug: p.slug
        };
      } else {
        itemToAdd = {
          id: Date.now().toString(),
          name: newFoodName,
          meal: selectedMeal,
          calories: 150,
          protein: 5,
          carbs: 20,
          fats: 3,
          fiber: 3
        };
      }
    } else {
      itemToAdd = {
        id: Date.now().toString(),
        name: newFoodName,
        meal: selectedMeal,
        calories: 180,
        protein: 7,
        carbs: 25,
        fats: 4,
        fiber: 4
      };
    }

    setMealLogs(prev => [itemToAdd, ...prev]);
    setNewFoodName('');
    setSelectedCatalogFood('');
    toast({
      title: "Alimento registrado",
      description: `Se ha añadido ${itemToAdd.name} a tu ${selectedMeal}.`,
    });
  };

  const removeMealLog = (id: string) => {
    setMealLogs(prev => prev.filter(m => m.id !== id));
    toast({ title: "Registro eliminado" });
  };

  // Water Hydration State
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('ecoland-water-glasses') || 5);
    } catch { return 5; }
  });

  const updateWater = (delta: number) => {
    setWaterGlasses(prev => {
      const next = Math.max(0, Math.min(12, prev + delta));
      try { localStorage.setItem('ecoland-water-glasses', next.toString()); } catch {}
      return next;
    });
  };

  // 2. ESCÁNER DE CÓDIGOS DE BARRAS / BUSCADOR EAN
  const [scanCode, setScanCode] = useState('8437004123019');
  const [scannedProduct, setScannedProduct] = useState<CatalogProduct | null>(
    allCatalogProducts.find(p => p.slug === 'ecosana-copos-de-avena-sin-gluten-1k') || null
  );

  const handleSimulateScan = (codeToSearch: string) => {
    setScanCode(codeToSearch);
    // Find matching or relevant item
    const found = allCatalogProducts.find(p => 
      p.id.includes(codeToSearch) || 
      p.slug.toLowerCase().includes(codeToSearch.toLowerCase()) ||
      p.name.toLowerCase().includes(codeToSearch.toLowerCase())
    ) || allCatalogProducts[0];
    
    setScannedProduct(found);
    toast({
      title: "Código escaneado con éxito",
      description: `Identificado: ${found.name.split('–')[0]} (${formatPrice(found.price)})`,
    });
  };

  // 3. COMPARADOR NUTRICIONAL
  const [compareSlugs, setCompareSlugs] = useState<string[]>([
    'ecosana-copos-de-avena-sin-gluten-1k',
    'gumendi-garbanzo-cocido-660gr',
    'el-granero-integral-quinoa-bio-500gr-granero'
  ]);

  const compareProducts = compareSlugs
    .map(s => allCatalogProducts.find(p => p.slug === s))
    .filter(Boolean) as CatalogProduct[];

  // 4. MI DESPENSA DIGITAL (PANTRY)
  const [pantryItems, setPantryItems] = useState([
    { name: 'Copos de Avena Sin Gluten 1k Ecosana', daysLeft: 4, fullDays: 30, slug: 'ecosana-copos-de-avena-sin-gluten-1k', price: 5.90 },
    { name: 'Garbanzos Cocidos Extra Bio Gumendi 660g', daysLeft: 12, fullDays: 45, slug: 'gumendi-garbanzo-cocido-660gr', price: 3.10 },
    { name: 'Aceite de Oliva Virgen Extra 5L Lagar de Soto', daysLeft: 22, fullDays: 90, slug: 'general-multimarca-aceite-de-oliva-virgen-extra-5l-lagar-de', price: 62.50 },
    { name: 'Té Matcha Ecológico 70g Drasanvi', daysLeft: 3, fullDays: 25, slug: 'drasanvi-te-matcha-70gr', price: 13.30 },
  ]);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-6">
      <div className="container-eco max-w-6xl">
        
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="h-4 w-4 text-emerald-700" />
            <span>ECOSISTEMA INTEGRAL DE SALUD & NUTRICIÓN BIOLÓGICA</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Ecoland <span className="text-emerald-700">EcoHealth</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            La primera plataforma que conecta tu diario nutricional, tus alergias, tu despensa y el menú semanal con la compra directa de alimentos biológicos reales.
          </p>
        </div>

        {/* AVISO MÉDICO Y CLASIFICACIÓN DE FUNCIONALIDADES (PRIORIDAD 8) */}
        <details className="group mb-6 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950">
          <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none text-sm [&::-webkit-details-marker]:hidden">
            <span>
              <strong className="font-semibold">Aviso de salud:</strong> herramientas informativas que no sustituyen a tu médico ni a tu dietista-nutricionista.
            </span>
            <span className="shrink-0 text-xs font-medium text-amber-800 underline underline-offset-2 group-open:hidden">Más información</span>
            <span className="shrink-0 text-xs font-medium text-amber-800 underline underline-offset-2 hidden group-open:inline">Cerrar</span>
          </summary>
          <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
              <strong className="block text-slate-800 text-xs uppercase font-bold">1. Información</strong>
              <span className="text-slate-600 text-xs">Valores nutricionales y alérgenos de etiquetado oficial (Reglamento UE 1169/2011).</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
              <strong className="block text-slate-800 text-xs uppercase font-bold">2. Estimación</strong>
              <span className="text-slate-600 text-xs">Fórmula bioenergética Mifflin-St Jeor para TDEE. Cálculo matemático orientativo.</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
              <strong className="block text-slate-800 text-xs uppercase font-bold">3. Recomendación</strong>
              <span className="text-slate-600 text-xs">Guía visual Plato Harvard (Harvard T.H. Chan School of Public Health).</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
              <strong className="block text-slate-800 text-xs uppercase font-bold">4. Función Comercial</strong>
              <span className="text-slate-600 text-xs">Asociación a productos biológicos en stock para confeccionar la cesta de compra.</span>
            </div>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed pt-1">
            <strong>Aviso de Salud:</strong> Las herramientas de Ecoland EcoHealth tienen carácter exclusivamente informativo y de divulgación alimentaria. No constituyen diagnóstico médico, plan dietoterápico clínico ni prescripción individual. Las personas con patologías digestivas, enfermedad celíaca, alergias anafilácticas o mujeres embarazadas deben consultar siempre a su médico especialista o dietista-nutricionista colegiado.
          </p>
          </div>
        </details>

        {/* Global Hub Navigation Tabs: en móvil fila deslizable; desde tablet, cuadrícula sin scroll */}
        <nav aria-label="Herramientas de EcoHealth" className="mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible [scrollbar-width:none]">
          <div className="flex sm:grid sm:grid-cols-4 gap-2 min-w-max sm:min-w-0">
            {([
              { id: 'harvard', label: 'Plato Harvard', desc: 'Compra equilibrada', icon: UtensilsCrossed },
              { id: 'calculadora', label: 'Gasto calórico', desc: 'Cuánto quemas al día', icon: Flame },
              { id: 'diario', label: 'Mi diario', desc: 'Comidas y macros', icon: BarChart3 },
              { id: 'perfil', label: 'Perfil y alergias', desc: 'Dietas e intolerancias', icon: Wheat },
              { id: 'escaner', label: 'Auditor Bio', desc: 'Ultraprocesados y Microbiota', icon: ShieldCheck },
              { id: 'comparador', label: 'Comparador', desc: 'Nutrientes y €/kg', icon: Scale },
              { id: 'despensa', label: 'Mi despensa', desc: 'Caducidad y reposición', icon: Package },
              { id: 'presupuesto', label: 'Presupuesto', desc: 'Nutrición por euro', icon: Wallet },
            ] as const).map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                    active
                      ? 'bg-emerald-900 border-emerald-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-200' : 'text-emerald-700'}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold whitespace-nowrap">{tab.label}</span>
                    <span className={`hidden sm:block text-xs truncate ${active ? 'text-emerald-100/80' : 'text-slate-500'}`}>{tab.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ============================================================== */}
        {/* TAB 1: DIARIO NUTRICIONAL (CALORÍAS, MACROS, COMIDAS, AGUA) */}
        {/* ============================================================== */}
                {/* ============================================================== */}
        {/* TAB HARVARD: PLATO SALUDABLE HARVARD INTERACTIVO */}
        {/* ============================================================== */}
        {activeTab === 'harvard' && <HarvardPlateInteractive />}

        {/* ============================================================== */}
        {activeTab === 'calculadora' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs max-w-4xl mx-auto space-y-8">
            <div className="border-b pb-4">
              <h2 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                <span>🔥</span> Calculadora de Gasto Energético Diario (TDEE & BMR)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Averigua con exactitud cuántas calorías quema tu cuerpo al día para saber exactamente cuánto consumir y lograr tu objetivo sin pasar hambre.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              
              {/* Form Inputs */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Sexo biológico:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserGender('mujer')}
                      className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                        userGender === 'mujer' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      👩 Mujer
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserGender('hombre')}
                      className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                        userGender === 'hombre' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      👨 Hombre
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Edad (años):</label>
                    <Input 
                      type="number" 
                      value={userAge} 
                      onChange={(e) => setUserAge(Number(e.target.value))}
                      className="text-xs h-10"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Altura (cm):</label>
                    <Input 
                      type="number" 
                      value={userHeight} 
                      onChange={(e) => setUserHeight(Number(e.target.value))}
                      className="text-xs h-10"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Peso (kg):</label>
                    <Input 
                      type="number" 
                      value={userWeight} 
                      onChange={(e) => setUserWeight(Number(e.target.value))}
                      className="text-xs h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Nivel de Actividad Física:</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50/50"
                  >
                    <option value={1.2}>Sedentario (trabajo de oficina, poco ejercicio)</option>
                    <option value={1.375}>Ligero (ejercicio suave 1 a 3 días por semana)</option>
                    <option value={1.55}>Moderado (deporte o entrenamiento 3 a 5 días/semana)</option>
                    <option value={1.725}>Muy activo (entrenamiento intenso 6 a 7 días/semana)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Objetivo Personal:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'perder', label: '⚖️ Perder Grasa' },
                      { id: 'mantener', label: '✨ Mantener / Vital' },
                      { id: 'ganar', label: '💪 Ganar Músculo' },
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setFitnessGoal(g.id as any)}
                        className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                          fitnessGoal === g.id ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculation Result Card */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs uppercase font-extrabold text-emerald-400">Resultados Científicos (Fórmula Mifflin-St Jeor)</span>
                  <h3 className="text-xl font-bold mt-1">Tu Gasto Metabólico</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Metabolismo Basal (BMR - quema en reposo):</span>
                    <strong className="text-white tabular-nums text-sm">{bmr} kcal</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Gasto Total Diario (TDEE - con tu actividad):</span>
                    <strong className="text-emerald-400 tabular-nums text-base">{tdee} kcal</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] text-emerald-300 font-bold block uppercase">Objetivo recomendado:</span>
                      <span className="text-xs text-emerald-100">
                        {fitnessGoal === 'perder' ? 'Déficit calórico moderado' : fitnessGoal === 'ganar' ? 'Superávit limpio para masa' : 'Mantenimiento de energía'}
                      </span>
                    </div>
                    <strong className="text-2xl font-black text-white tabular-nums">{targetCaloriesCalculated} kcal</strong>
                  </div>
                </div>

                {((userGender === 'hombre' && targetCaloriesCalculated < 1500) || (userGender === 'mujer' && targetCaloriesCalculated < 1200) || (tdee - targetCaloriesCalculated > 500)) && (
                    <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-600/80 text-amber-200 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <AlertCircle className="h-4 w-4" />
                        <span>Aviso de Precaución Nutricional</span>
                      </div>
                      <p className="leading-snug">
                        Tu selección produce una ingesta estimada potencialmente muy restrictiva. Ecoland no optimiza dietas extremas ni promueve déficits agresivos. Te recomendamos consultar con un médico especialista o dietista-nutricionista colegiado para una pauta segura.
                      </p>
                    </div>
                  )}

                  <Button 
                  onClick={applyCalculatedCalories}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black h-11 text-xs shadow-md"
                >
                  Aplicar {targetCaloriesCalculated} kcal a mi diario de hoy
                </Button>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'diario' && (
          <div className="space-y-8">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2 col-span-2 md:col-span-1">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Energía Diaria</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-extrabold text-slate-900">{currentTotals.calories}</span>
                  <span className="text-xs text-slate-500">/ {dailyGoals.calories} kcal</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all" 
                    style={{ width: `${Math.min(100, (currentTotals.calories / dailyGoals.calories) * 100)}%` }} 
                  />
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {Math.round((currentTotals.calories / dailyGoals.calories) * 100)}% del objetivo diario
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Proteína Vegetal</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-bold text-emerald-800">{currentTotals.protein}g</span>
                  <span className="text-xs text-slate-500">/ {dailyGoals.protein}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (currentTotals.protein / dailyGoals.protein) * 100)}%` }} />
                </div>
                <span className="text-xs text-slate-500">Legumbres y cereal bio</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Carbohidratos</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-bold text-amber-700">{currentTotals.carbs}g</span>
                  <span className="text-xs text-slate-500">/ {dailyGoals.carbs}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (currentTotals.carbs / dailyGoals.carbs) * 100)}%` }} />
                </div>
                <span className="text-xs text-slate-500">Granos enteros y fibra</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Grasas Saludables</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-bold text-teal-700">{currentTotals.fats}g</span>
                  <span className="text-xs text-slate-500">/ {dailyGoals.fats}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: `${Math.min(100, (currentTotals.fats / dailyGoals.fats) * 100)}%` }} />
                </div>
                <span className="text-xs text-slate-500">AOVE y frutos secos</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Fibra Prebiótica</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-bold text-emerald-900">{currentTotals.fiber}g</span>
                  <span className="text-xs text-slate-500">/ {dailyGoals.fiber}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-700 h-full rounded-full" style={{ width: `${Math.min(100, (currentTotals.fiber / dailyGoals.fiber) * 100)}%` }} />
                </div>
                <span className="text-xs text-emerald-700 font-semibold">Microbiota sana</span>
              </div>
            </div>

            {/* Layout: Meals List & Food Adder */}
            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* Left: Meals Timeline */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <span>🥗</span> Registro de Comidas de Hoy
                  </h3>
                  <Badge variant="outline" className="text-xs text-slate-600">
                    {mealLogs.length} alimentos registrados
                  </Badge>
                </div>

                {['desayuno', 'comida', 'cena', 'snacks'].map((mealName) => {
                  const itemsOfMeal = mealLogs.filter(m => m.meal === mealName);
                  const mealCal = itemsOfMeal.reduce((s, x) => s + x.calories, 0);

                  return (
                    <div key={mealName} className="bg-white rounded-3xl p-5 border shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b pb-2.5">
                        <span className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                          {mealName === 'desayuno' && '🌅 Desayuno'}
                          {mealName === 'comida' && '☀️ Comida'}
                          {mealName === 'cena' && '🌙 Cena'}
                          {mealName === 'snacks' && '🍎 Snacks & Media Mañana'}
                        </span>
                        <span className="text-xs tabular-nums font-bold text-emerald-800">{mealCal} kcal</span>
                      </div>

                      {itemsOfMeal.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">No has registrado alimentos en esta comida todavía.</p>
                      ) : (
                        <div className="space-y-2">
                          {itemsOfMeal.map(item => (
                            <div key={item.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
                              <div className="space-y-0.5">
                                <span className="font-semibold text-slate-900 block">{item.name}</span>
                                <span className="text-[11px] text-slate-500 tabular-nums">
                                  {item.calories} kcal • P: {item.protein}g • C: {item.carbs}g • G: {item.fats}g • Fibra: {item.fiber}g
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.productSlug && (
                                  <Link to={`/tienda/producto/${item.productSlug}`}>
                                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                                      Ver en tienda
                                    </Badge>
                                  </Link>
                                )}
                                <button 
                                  onClick={() => removeMealLog(item.id)}
                                  className="text-slate-500 hover:text-red-600 transition-colors p-1"
                                  title="Eliminar"
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

              {/* Right: Quick Food Logger & Hydration */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Form to Log Food */}
                <div className="bg-white rounded-3xl p-6 border shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b">
                    <Plus className="h-5 w-5 text-emerald-700" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Registrar Alimento</h4>
                      <p className="text-[11px] text-slate-500">Añade desde el catálogo de Ecoland o comida casera</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddLog} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Comida:</label>
                      <select 
                        value={selectedMeal} 
                        onChange={(e: any) => setSelectedMeal(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50/50"
                      >
                        <option value="desayuno">🌅 Desayuno</option>
                        <option value="comida">☀️ Comida</option>
                        <option value="cena">🌙 Cena</option>
                        <option value="snacks">🍎 Snacks / Media tarde</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Elegir de productos Ecoland:</label>
                      <select
                        value={selectedCatalogFood}
                        onChange={(e) => setSelectedCatalogFood(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 truncate"
                      >
                        <option value="">-- Seleccionar alimento bio del catálogo --</option>
                        <option value="ecosana-copos-de-avena-sin-gluten-1k">Copos de Avena Sin Gluten 1k Ecosana (5.90€)</option>
                        <option value="gumendi-garbanzo-cocido-660gr">Garbanzo Cocido Extra Bio Gumendi (3.10€)</option>
                        <option value="gumendi-lentejas-con-verduras-720gr">Lentejas con Verduras Bio Gumendi (3.50€)</option>
                        <option value="el-granero-integral-quinoa-bio-500gr-granero">Quinoa Bio 500g El Granero Integral</option>
                        <option value="iswari-super-vegan-protein-250gr">Súper Vegan Protein 250g Iswari</option>
                        <option value="drasanvi-te-matcha-70gr">Té Matcha Ecológico 70g Drasanvi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">O escribe alimento libre:</label>
                      <Input
                        placeholder="ej. Tostada con tomate y AOVE, plátano..."
                        value={newFoodName}
                        onChange={(e) => setNewFoodName(e.target.value)}
                        className="text-xs h-10"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs h-10">
                      + Guardar en mi diario de hoy
                    </Button>
                  </form>
                </div>

                {/* Hydration Tracker */}
                <div className="bg-white rounded-3xl p-6 border shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-teal-600" />
                      <h4 className="font-bold text-slate-900 text-sm">Hidratación Diaria</h4>
                    </div>
                    <span className="text-xs tabular-nums font-bold text-teal-800">
                      {(waterGlasses * 0.25).toFixed(2)} L / 2.0 L
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 py-2 flex-wrap">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateWater(i < waterGlasses ? -1 : 1)}
                        className={`text-2xl p-1.5 rounded-xl transition-all ${
                          i < waterGlasses 
                            ? 'scale-110 drop-shadow-xs bg-teal-50' 
                            : 'opacity-30 grayscale hover:opacity-60'
                        }`}
                        title={`Vaso ${i + 1} (250 ml)`}
                      >
                        🥤
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateWater(-1)}
                      className="text-xs flex-1"
                    >
                      - 1 Vaso
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => updateWater(1)}
                      className="text-xs flex-1 bg-teal-700 hover:bg-teal-600 text-white font-bold"
                    >
                      + 1 Vaso (250ml)
                    </Button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PERFIL ALIMENTARIO & ALERGIAS */}
        {/* ============================================================== */}
        {activeTab === 'perfil' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs max-w-4xl mx-auto space-y-8">
            <Link
              to="/salud"
              className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-900 p-4 text-white hover:bg-emerald-800 transition-colors"
            >
              <span>
                <strong className="block">Nuevo: Ecoland Salud</strong>
                <span className="text-sm text-emerald-100">Alergias, celiaquía, azúcar, sal… Productos que encajan contigo, con avisos en la cesta.</span>
              </span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </Link>
            <div className="border-b pb-4">
              <h2 className="font-bold text-slate-900 text-xl">Configuración de Perfil Alimentario y Alergias</h2>
              <p className="text-xs text-slate-500 mt-1">
                Tus selecciones filtran automáticamente los más de 1.000 productos del catálogo y te advierten en cada ficha.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { id: 'sin-gluten', title: '🌾 Sin Gluten / Celíaco', desc: 'Evita trigo, cebada, centeno y espelta. Garantiza alimentos certificados.' },
                { id: 'vegano', title: '🌱 100% Vegano', desc: 'Excluye carnes, pescados, miel, jalea real y derivados lácteos.' },
                { id: 'proteina', title: '💪 Rico en Proteína', desc: 'Prioriza legumbres, superalimentos y proteínas vegetales de alta biodisponibilidad.' },
                { id: 'sin-azucar', title: '🚫 Sin Azúcar Añadido', desc: 'Filtra alimentos con azúcares refinados añadidos para control glucémico.' },
                { id: 'bio', title: '✨ 100% Bio Certificado', desc: 'Exclusivamente agricultura ecológica con sello Euro-hoja oficial de la UE.' },
                { id: 'detox', title: '🍃 Digestión & Detox', desc: 'Plantas depurativas, té verde, alcachofa, chlorella y fibras limpias.' }
              ].map(item => {
                const active = dietTags.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleTag(item.id)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                      active 
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-2xs' 
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${active ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {item.title}
                      </span>
                      {active && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <span>Tu configuración está activa y guardada en este dispositivo.</span>
              <Link to="/tienda">
                <Button className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs">
                  Ir a comprar con este perfil ➔
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: ESCÁNER EAN BIO & CÁMARA */}
        {/* ============================================================== */}
        {/* TAB 3: AUDITOR BIO & SEMÁFORO DE ULTRAPROCESADOS */}
        {/* ============================================================== */}
        {activeTab === 'escaner' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs max-w-4xl mx-auto space-y-6">
            <div className="border-b pb-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-950 border-emerald-300 font-bold text-xs">
                  Estándar Harvard & NOVA
                </Badge>
                <Badge variant="outline" className="text-slate-600 text-xs">
                  Microbiota Saludable
                </Badge>
              </div>
              <h2 className="font-bold text-slate-900 text-xl md:text-2xl mt-1 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-700" />
                Auditor de Calidad Bio & Semáforo de Ultraprocesados
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Descubre el grado de procesamiento real de cualquier alimento según la escala científica NOVA, su impacto en la microbiota intestinal y su alternativa limpia de proximidad.
              </p>
            </div>

            {/* Input del Auditor */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4" /> Motor de Auditoría Nutricional
                </span>
                <span className="text-[11px] text-slate-400">
                  Sin aditivos sintéticos
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  placeholder="Escribe un alimento... Ej: Galletas, Avena, Refresco, Garbanzos..."
                  className="bg-slate-800 border-slate-700 text-white text-xs sm:text-sm h-12"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSimulateScan(scanCode); }}
                />
                <Button 
                  onClick={() => handleSimulateScan(scanCode)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-6 text-xs shrink-0"
                >
                  Auditar
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap pt-1 text-[11px] text-slate-400 items-center">
                <span className="font-semibold text-slate-300">Ejemplos para auditar:</span>
                <button onClick={() => handleSimulateScan('avena')} className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">Avena integral bio</button>
                <button onClick={() => handleSimulateScan('galletas')} className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-amber-900/60 text-amber-200">Galletas industriales</button>
                <button onClick={() => handleSimulateScan('garbanzo')} className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">Garbanzos cocidos</button>
                <button onClick={() => handleSimulateScan('refresco')} className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-red-200">Refresco edulcorado</button>
                <button onClick={() => handleSimulateScan('quinoa')} className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">Quinoa real</button>
              </div>
            </div>

            {/* Resultado de la Auditoría */}
            {scannedProduct && (
              <div className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/40 space-y-5">
                {/* Diagnóstico NOVA y Microbiota */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                    scanCode.toLowerCase().includes('galleta') || scanCode.toLowerCase().includes('refresco')
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-white border-emerald-200 text-emerald-950'
                  }`}>
                    <span className="block text-[11px] uppercase font-bold text-slate-500">Grado de Procesamiento</span>
                    <strong className="text-base font-black block">
                      {scanCode.toLowerCase().includes('galleta') || scanCode.toLowerCase().includes('refresco')
                        ? 'NOVA 4: Ultraprocesado'
                        : 'NOVA 1: Alimento Puro Bio'}
                    </strong>
                    <span className="text-[11px] block text-slate-600">
                      {scanCode.toLowerCase().includes('galleta') || scanCode.toLowerCase().includes('refresco')
                        ? 'Harinas refinadas y emulsionantes'
                        : 'Sin ingredientes industriales'}
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                    scanCode.toLowerCase().includes('galleta') || scanCode.toLowerCase().includes('refresco')
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : 'bg-white border-emerald-200 text-emerald-950'
                  }`}>
                    <span className="block text-[11px] uppercase font-bold text-slate-500">Salud Intestinal</span>
                    <strong className="text-base font-black block">
                      {scanCode.toLowerCase().includes('galleta') || scanCode.toLowerCase().includes('refresco')
                        ? 'Disruptor de Barrera'
                        : 'Prebiótico Protector'}
                    </strong>
                    <span className="text-[11px] block text-slate-600">
                      {scanCode.toLowerCase().includes('galleta') || scanCode.toLowerCase().includes('refresco')
                        ? 'Altera la diversidad microbiana'
                        : 'Alimenta bacterias beneficiosas'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-center space-y-1">
                    <span className="block text-[11px] uppercase font-bold text-slate-500">Aditivos Químicos</span>
                    <strong className="text-base font-black text-emerald-800 block">
                      {scanCode.toLowerCase().includes('galleta') || scanCode.toLowerCase().includes('refresco')
                        ? 'Presencia de aditivos'
                        : '0% Aditivos (100% Puro)'}
                    </strong>
                    <span className="text-[11px] block text-slate-600">
                      Certificación ecológica UE
                    </span>
                  </div>
                </div>

                {/* Alternativa Limpia Ecoland */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      {scanCode.toLowerCase().includes('galleta') || scanCode.toLowerCase().includes('refresco')
                        ? 'Sustituto Limpio Recomendado en Ecoland:'
                        : 'Producto Ecológico Certificado de Proximidad:'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4.5 rounded-2xl border border-emerald-200 shadow-2xs">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 p-1.5 border border-slate-100 flex items-center justify-center shrink-0">
                      <img src={scannedProduct.image} alt={scannedProduct.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">100% Bio Certificado</Badge>
                        <Badge variant="outline" className="text-xs">{scannedProduct.brand}</Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base">{scannedProduct.name}</h4>
                      <p className="text-xs text-slate-600 line-clamp-1">{scannedProduct.description}</p>
                      <div className="pt-0.5 flex items-center justify-center sm:justify-start gap-3">
                        <span className="text-lg font-black text-emerald-900">{formatPrice(scannedProduct.price)}</span>
                        <span className="text-xs text-slate-500">Castilla y León · Entrega 24h</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => { addCatalogProduct(scannedProduct); setIsOpen(true); }}
                      className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs h-11 px-5 shrink-0 gap-2 shadow-xs w-full sm:w-auto"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Añadir a mi cesta
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: COMPARADOR NUTRICIONAL LADO A LADO */}
        {/* ============================================================== */}
        {activeTab === 'comparador' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs max-w-5xl mx-auto space-y-6">
            <div className="border-b pb-4">
              <h2 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                <Scale className="h-6 w-6 text-emerald-700" />
                Comparador Nutricional y Precio por Kilo
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Compara 3 alimentos bio lado a lado para tomar la mejor decisión según tu objetivo nutricional y bolsillo.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50/80">
                    <th className="p-3 font-bold text-slate-700 w-1/4">Atributo</th>
                    {compareProducts.map(p => (
                      <th key={p.id} className="p-3 font-bold text-slate-900 w-1/4 text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-xl border p-1">
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="line-clamp-2 text-xs font-bold">{p.name.split('–')[1]?.trim() || p.name.split('–')[0]}</span>
                        <span className="text-emerald-800 font-extrabold text-sm block mt-1">{formatPrice(p.price)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-emerald-50/40">
                    <td className="p-3 font-bold text-emerald-950">EcoScore Sostenibilidad</td>
                    {compareProducts.map((p, idx) => (
                      <td key={p.id} className="p-3 text-center">
                        <span className="inline-block bg-emerald-900 text-white font-black px-2 py-0.5 rounded text-xs">
                          EcoScore A (★★★)
                        </span>
                        <span className="block text-xs text-emerald-800 mt-0.5">~0.24 kg CO₂e</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Certificación Oficial</td>
                    {compareProducts.map(p => (
                      <td key={p.id} className="p-3 text-center text-emerald-700 font-bold">🌿 Euro-hoja UE</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Alérgenos Principales</td>
                    {compareProducts.map(p => (
                      <td key={p.id} className="p-3 text-center">
                        {p.tags.includes('sin-gluten') ? '✅ Sin Gluten' : 'Contiene gluten natural'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Proteína / 100g</td>
                    {compareProducts.map((p, idx) => (
                      <td key={p.id} className="p-3 text-center font-bold text-slate-800">
                        {idx === 0 ? '11,5 g' : idx === 1 ? '19,0 g' : '14,0 g'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Fibra Prebiótica / 100g</td>
                    {compareProducts.map((p, idx) => (
                      <td key={p.id} className="p-3 text-center font-bold text-emerald-800">
                        {idx === 0 ? '10,0 g' : idx === 1 ? '17,0 g' : '7,0 g'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Envase</td>
                    {compareProducts.map((p, idx) => (
                      <td key={p.id} className="p-3 text-center text-slate-600">
                        {idx === 1 ? 'Frasco de cristal reciclable' : 'Papel kraft biodegradable'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Acción de Compra</td>
                    {compareProducts.map(p => (
                      <td key={p.id} className="p-3 text-center">
                        <Button 
                          size="sm" 
                          onClick={() => { addCatalogProduct(p); setIsOpen(true); }}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs h-8"
                        >
                          Añadir
                        </Button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: MI DESPENSA DIGITAL & REPOSICIÓN */}
        {/* ============================================================== */}
        {activeTab === 'despensa' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs max-w-4xl mx-auto space-y-6">
            <div className="border-b pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-xl">Mi Despensa Digital & Alertas de Reposición</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Se sincroniza automáticamente con tus compras de tienda física y online para que nunca te falten básicos bio.
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">
                {pantryItems.length} alimentos guardados
              </Badge>
            </div>

            <div className="space-y-3">
              {pantryItems.map((item, idx) => {
                const percent = Math.round((item.daysLeft / item.fullDays) * 100);
                const isLow = item.daysLeft <= 5;
                const product = allCatalogProducts.find(p => p.slug === item.slug);

                return (
                  <div key={idx} className="p-4 rounded-2xl border bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                        {isLow && (
                          <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">
                            ⚠️ Quedan pocos días
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Consumo estimado: <strong>{item.daysLeft} días restantes</strong></span>
                        <span>•</span>
                        <span>{formatPrice(item.price)}</span>
                      </div>
                      <div className="w-full max-w-xs bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-600'}`} 
                          style={{ width: `${percent}%` }} 
                        />
                      </div>
                    </div>

                    <div className="shrink-0">
                      {product && (
                        <Button 
                          size="sm"
                          onClick={() => { addCatalogProduct(product); setIsOpen(true); }}
                          className={`text-xs font-bold gap-1.5 ${isLow ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-800 hover:bg-emerald-700 text-white'}`}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Reponer ({formatPrice(item.price)})
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: MODO PRESUPUESTO SALUDABLE */}
        {/* ============================================================== */}
        {activeTab === 'presupuesto' && <BudgetOptimizerInteractive />}

      </div>
    </div>
  );
};

export default EcoHealth;
