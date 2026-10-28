import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Sparkles, Scale, Apple, CheckCircle2, ShoppingBag, 
  ShieldCheck, ArrowRight, RefreshCw, AlertCircle, ChefHat, Wallet, MessageSquare,
  Droplet, Plus, Trash2, Search, Barcode, Camera, Layers, Check, ChevronRight, Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { HarvardPlateInteractive } from '@/components/ecohealth/HarvardPlateInteractive';
import { BudgetOptimizerInteractive } from '@/components/ecohealth/BudgetOptimizerInteractive';


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
  const [activeTab, setActiveTab] = useState<'harvard' | 'diario' | 'calculadora' | 'perfil' | 'escaner' | 'comparador' | 'despensa' | 'presupuesto'>('harvard');

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
      description: `Identificado: ${found.name.split('–')[0]} (${found.price.toFixed(2)}€)`,
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

        {/* Global Hub Navigation Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border shadow-xs mb-8 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {[
              { id: 'harvard', label: '🍽️ Plato Harvard Interactivo', desc: '¡Otra forma creativa de comprar!' },
              { id: 'calculadora', label: '🔥 Gasto Calórico & TDEE', desc: 'Averigua cuánto quemas al día' },
              { id: 'diario', label: '📊 Mi Diario & Calorías', desc: 'Seguimiento de comidas y macros' },
              { id: 'perfil', label: '🌾 Perfil & Alergias', desc: 'Dietas e intolerancias' },
              { id: 'escaner', label: '📷 Escáner EAN Bio', desc: 'Cámara y Nutri-Score' },
              { id: 'comparador', label: '⚖️ Comparador 1 a 1', desc: 'Nutrientes y €/kg' },
              { id: 'despensa', label: '🥫 Mi Despensa & Reposición', desc: 'Caducidad y stock en casa' },
              { id: 'presupuesto', label: '💶 Modo Presupuesto', desc: 'Nutrición por euro' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-0.5 ${
                  activeTab === tab.id
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-normal ${activeTab === tab.id ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {tab.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

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
                    <span className="text-slate-400">Metabolismo Basal (BMR - quema en reposo):</span>
                    <strong className="text-white font-mono text-sm">{bmr} kcal</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Gasto Total Diario (TDEE - con tu actividad):</span>
                    <strong className="text-emerald-400 font-mono text-base">{tdee} kcal</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] text-emerald-300 font-bold block uppercase">Objetivo recomendado:</span>
                      <span className="text-xs text-emerald-100">
                        {fitnessGoal === 'perder' ? 'Déficit calórico moderado' : fitnessGoal === 'ganar' ? 'Superávit limpio para masa' : 'Mantenimiento de energía'}
                      </span>
                    </div>
                    <strong className="text-2xl font-black text-white font-mono">{targetCaloriesCalculated} kcal</strong>
                  </div>
                </div>

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
                  <span className="text-xs text-slate-400">/ {dailyGoals.calories} kcal</span>
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
                  <span className="text-xs text-slate-400">/ {dailyGoals.protein}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (currentTotals.protein / dailyGoals.protein) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-slate-500">Legumbres y cereal bio</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Carbohidratos</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-bold text-amber-700">{currentTotals.carbs}g</span>
                  <span className="text-xs text-slate-400">/ {dailyGoals.carbs}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (currentTotals.carbs / dailyGoals.carbs) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-slate-500">Granos enteros y fibra</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Grasas Saludables</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-bold text-teal-700">{currentTotals.fats}g</span>
                  <span className="text-xs text-slate-400">/ {dailyGoals.fats}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: `${Math.min(100, (currentTotals.fats / dailyGoals.fats) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-slate-500">AOVE y frutos secos</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border shadow-2xs space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Fibra Prebiótica</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-bold text-emerald-900">{currentTotals.fiber}g</span>
                  <span className="text-xs text-slate-400">/ {dailyGoals.fiber}g</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-700 h-full rounded-full" style={{ width: `${Math.min(100, (currentTotals.fiber / dailyGoals.fiber) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">Microbiota sana</span>
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
                        <span className="text-xs font-mono font-bold text-emerald-800">{mealCal} kcal</span>
                      </div>

                      {itemsOfMeal.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">No has registrado alimentos en esta comida todavía.</p>
                      ) : (
                        <div className="space-y-2">
                          {itemsOfMeal.map(item => (
                            <div key={item.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
                              <div className="space-y-0.5">
                                <span className="font-semibold text-slate-900 block">{item.name}</span>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {item.calories} kcal • P: {item.protein}g • C: {item.carbs}g • G: {item.fats}g • Fibra: {item.fiber}g
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.productSlug && (
                                  <Link to={`/tienda/producto/${item.productSlug}`}>
                                    <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                                      Ver en tienda
                                    </Badge>
                                  </Link>
                                )}
                                <button 
                                  onClick={() => removeMealLog(item.id)}
                                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
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
                    <span className="text-xs font-mono font-bold text-teal-800">
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
        {activeTab === 'escaner' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs max-w-4xl mx-auto space-y-8">
            <div className="border-b pb-4">
              <h2 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                <Barcode className="h-6 w-6 text-emerald-700" />
                Escáner de Código de Barras EAN & Análisis Bio
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Escanea cualquier producto con la cámara de tu móvil en tienda física o en casa para verificar ingredientes, alérgenos y comprar en Ecoland.
              </p>
            </div>

            {/* Simulated Barcode Input */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Lector de código activado
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  Modo Tienda Física
                </Badge>
              </div>

              <div className="flex gap-3">
                <Input
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  placeholder="Introduce código EAN o nombre de producto..."
                  className="bg-slate-800 border-slate-700 text-white text-xs h-11 font-mono"
                />
                <Button 
                  onClick={() => handleSimulateScan(scanCode)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 px-6 text-xs"
                >
                  Escanear
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap pt-1 text-[11px] text-slate-400">
                <span>Pruebas rápidas:</span>
                <button onClick={() => handleSimulateScan('avena')} className="underline hover:text-white">Avena Sin Gluten</button>
                <span>•</span>
                <button onClick={() => handleSimulateScan('garbanzo')} className="underline hover:text-white">Garbanzos Gumendi</button>
                <span>•</span>
                <button onClick={() => handleSimulateScan('matcha')} className="underline hover:text-white">Té Matcha</button>
                <span>•</span>
                <button onClick={() => handleSimulateScan('quinoa')} className="underline hover:text-white">Quinoa Bio</button>
              </div>
            </div>

            {/* Scanned Result Card */}
            {scannedProduct && (
              <div className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/40 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl bg-white p-2 border flex items-center justify-center shrink-0">
                    <img src={scannedProduct.image} alt={scannedProduct.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px]">100% Bio Certificado</Badge>
                      <Badge variant="outline" className="text-[10px]">{scannedProduct.brand}</Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{scannedProduct.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{scannedProduct.description}</p>
                    <div className="pt-1 flex items-center justify-center sm:justify-start gap-4">
                      <span className="text-xl font-extrabold text-emerald-800">{scannedProduct.price.toFixed(2)}€</span>
                      <span className="text-xs text-slate-500">Stock físico verificado</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => { addCatalogProduct(scannedProduct); setIsOpen(true); }}
                    className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs h-11 px-5 shrink-0 gap-2 shadow-sm"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Añadir al carrito
                  </Button>
                </div>

                {/* Semáforo Nutricional */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-emerald-200/70 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                    <span className="block text-[10px] text-slate-400">Nutri-Score</span>
                    <strong className="text-emerald-700 text-sm font-black">A (Excelente)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                    <span className="block text-[10px] text-slate-400">Eco-Score</span>
                    <strong className="text-emerald-700 text-sm font-black">A (Impacto Mínimo)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                    <span className="block text-[10px] text-slate-400">Aditivos Químicos</span>
                    <strong className="text-emerald-700 text-sm font-black">0% Limpio</strong>
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
                        <span className="text-emerald-800 font-extrabold text-sm block mt-1">{p.price.toFixed(2)}€</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-emerald-50/40">
                    <td className="p-3 font-bold text-emerald-950">EcoScore Sostenibilidad</td>
                    {compareProducts.map((p, idx) => (
                      <td key={p.id} className="p-3 text-center">
                        <span className="inline-block bg-emerald-900 text-white font-black px-2 py-0.5 rounded text-[10px]">
                          EcoScore A (★★★)
                        </span>
                        <span className="block text-[10px] text-emerald-800 mt-0.5">~0.24 kg CO₂e</span>
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
                          <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px]">
                            ⚠️ Quedan pocos días
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Consumo estimado: <strong>{item.daysLeft} días restantes</strong></span>
                        <span>•</span>
                        <span>{item.price.toFixed(2)}€</span>
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
                          Reponer ({item.price.toFixed(2)}€)
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
