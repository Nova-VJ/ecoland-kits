import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, Sparkles, ShoppingBag, Clock, Flame, CheckCircle2, 
  Plus, X, ArrowRight, RefreshCw, AlertCircle, Utensils, Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { useToast } from '@/hooks/use-toast';
import { dailyNutritionStore, MealType } from '@/services/dailyNutritionStore';

const COMMON_FRIDGE_ITEMS = [
  'Garbanzos', 'Lentejas', 'Avena', 'Tomate', 'Espinacas', 
  'Quinoa', 'Arroz', 'Tofu', 'Aceite de Oliva', 'Ajo', 
  'Cebolla', 'Calabacín', 'Zanahoria', 'Semillas de Chía', 'Pimiento'
];

interface GeneratedRecipe {
  id: string;
  title: string;
  description: string;
  timeMinutes: number;
  difficulty: 'Fácil' | 'Media';
  calories: number;
  proteinGrams: number;
  tags: string[];
  userIngredients: string[];
  missingProducts: CatalogProduct[];
  steps: string[];
}

export const AiFridgeRecipeGenerator = () => {
  const { addCatalogProduct, setIsOpen } = useCart();
  const { toast } = useToast();

  const [selectedItems, setSelectedItems] = useState<string[]>(['Garbanzos', 'Tomate', 'Aceite de Oliva']);
  const [customInput, setCustomInput] = useState<string>('');
  const [dietFilter, setDietFilter] = useState<'todas' | 'vegana' | 'sin-gluten' | 'proteica'>('todas');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentRecipe, setCurrentRecipe] = useState<GeneratedRecipe | null>(null);
  const [servingsToLog, setServingsToLog] = useState<number>(1);
  const [selectedMealForLog, setSelectedMealForLog] = useState<MealType>('comida');
  const [loggedSuccess, setLoggedSuccess] = useState<boolean>(false);

  const handleLogToDiary = () => {
    if (!currentRecipe) return;
    dailyNutritionStore.logRecipeToDiary(
      currentRecipe.title,
      servingsToLog,
      currentRecipe.calories,
      currentRecipe.proteinGrams,
      selectedMealForLog
    );
    setLoggedSuccess(true);
    toast({
      title: "¡Receta registrada en tu día!",
      description: `Añadido "${currentRecipe.title}" (${servingsToLog} ${servingsToLog === 1 ? 'ración' : 'raciones'}) a tu ${selectedMealForLog}.`,
    });
    setTimeout(() => setLoggedSuccess(false), 3000);
  };

  const toggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const addCustomItem = () => {
    if (!customInput.trim()) return;
    const clean = customInput.trim();
    if (!selectedItems.includes(clean)) {
      setSelectedItems(prev => [...prev, clean]);
    }
    setCustomInput('');
  };

  const removeSelectedItem = (item: string) => {
    setSelectedItems(prev => prev.filter(i => i !== item));
  };

  const generateRecipe = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Selecciona al menos 1 ingrediente",
        description: "Elige qué tienes en tu nevera o despensa para crear tu receta.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      // Determinación inteligente de la receta según lo que hay en nevera
      const hasGarbanzo = selectedItems.some(i => i.toLowerCase().includes('garbanzo'));
      const hasLenteja = selectedItems.some(i => i.toLowerCase().includes('lenteja'));
      const hasAvena = selectedItems.some(i => i.toLowerCase().includes('avena'));
      const hasQuinoa = selectedItems.some(i => i.toLowerCase().includes('quinoa') || i.toLowerCase().includes('arroz'));

      let recipeTitle = "Salteado Mediterráneo Rápido Bio";
      let desc = "Una preparación rápida y aromática aprovechando tus ingredientes de despensa con toque crujiente.";
      let time = 15;
      let cals = 380;
      let prot = 18;
      let steps = [
        "Lavar y preparar los vegetales frescos en cortes uniformes.",
        "Calentar dos cucharadas soperas de AOVE en sartén amplia o wok a fuego medio.",
        "Rehogar los ingredientes aromáticos durante 3 minutos hasta dorar suavemente.",
        "Incorporar la base principal, saltear enérgicamente y aderezar con hierbas provenzales o especias.",
        "Servir caliente con un toque final de semillas tostadas."
      ];

      if (hasAvena) {
        recipeTitle = "Porridge Dorado Antiinflamatorio con Topping Crujiente";
        desc = "Desayuno o cena reconstituyente con copos de avena integrales, leche vegetal y semillas ricas en omega-3.";
        time = 10;
        cals = 340;
        prot = 14;
        steps = [
          "Cocer a fuego suave la avena con agua o bebida vegetal durante 5 minutos removiendo con cuchara de madera.",
          "Añadir una pizca de canela en rama y piel de limón bio.",
          "Retirar del fuego al alcanzar una textura melosa y cremosa.",
          "Coronar con semillas de chía, rodajas de fruta fresca y un hilo de miel cruda o sirope de agave."
        ];
      } else if (hasGarbanzo || hasLenteja) {
        recipeTitle = "Cazuela Rápida de Legumbres Estofadas con Verduras de la Huerta";
        desc = "Plato de cuchara completo y reconfortante rico en proteína vegetal limpia, hierro y fibra saciante.";
        time = 20;
        cals = 450;
        prot = 24;
        steps = [
          "En cazuela de barro o sartén honda, dorar a fuego suave cebolla y ajo con aceite de oliva virgen extra.",
          "Añadir el tomate triturado y dejar reducir a fuego lento 5 minutos.",
          "Incorporar las legumbres cocidas enjuagadas junto con las espinacas o verduras troceadas.",
          "Cubrir ligeramente con agua o caldo vegetal bio y dejar hacer chup-chup 8 minutos para integrar sabores.",
          "Rectificar de sal marina sin refinar y servir con hojas de laurel."
        ];
      } else if (hasQuinoa) {
        recipeTitle = "Bowl Templado de Quinoa Real con Salteado de Hortalizas";
        desc = "Combinación completa de aminoácidos esenciales con textura crujiente y vegetales tiernos al vapor.";
        time = 18;
        cals = 410;
        prot = 19;
        steps = [
          "Enjuagar la quinoa bajo agua fría y cocer 12 minutos hasta que el grano abra.",
          "Mientras tanto, saltear a fuego vivo los vegetales con un toque de ajo picado.",
          "Mezclar la quinoa escurrida con las hortalizas calientes.",
          "Aliñar con zumo de limón fresco, AOVE y semillas bio."
        ];
      }

      // Encontrar 1 o 2 productos reales de Ecoland para complementar la receta
      const missingCandidates = allCatalogProducts.filter(p => p.price > 0 && p.inStock);
      const missing1 = missingCandidates.find(p => p.slug.includes('quinoa') || p.slug.includes('acai') || p.slug.includes('semillas')) || missingCandidates[0];
      const missing2 = missingCandidates.find(p => p.category === 'aceites' || p.slug.includes('aceite')) || missingCandidates[1];
      
      const missing = [missing1, missing2].filter(Boolean) as CatalogProduct[];

      setCurrentRecipe({
        id: `recipe-${Date.now()}`,
        title: recipeTitle,
        description: desc,
        timeMinutes: time,
        difficulty: 'Fácil',
        calories: cals,
        proteinGrams: prot,
        tags: dietFilter === 'vegana' ? ['100% Vegano', 'Sin Lácteos', 'Alto en Fibra'] : dietFilter === 'sin-gluten' ? ['Sin Gluten Certificado', 'Digestión Fácil'] : ['100% Bio', 'Saludable', 'Rápido'],
        userIngredients: [...selectedItems],
        missingProducts: missing,
        steps
      });

      setIsGenerating(false);
      toast({
        title: "¡Receta creada por Chef IA!",
        description: `Se diseñó "${recipeTitle}" con los ingredientes de tu nevera.`,
      });
    }, 700);
  };

  const handleBuyMissing = () => {
    if (!currentRecipe) return;
    currentRecipe.missingProducts.forEach(prod => {
      addCatalogProduct(prod);
    });
    setIsOpen(true);
    const sum = currentRecipe.missingProducts.reduce((acc, p) => acc + p.price, 0);
    toast({
      title: "Ingredientes añadidos al carrito",
      description: `Se han sumado los ${currentRecipe.missingProducts.length} alimentos bio por ${sum.toFixed(2)}€.`,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 border shadow-xs space-y-8">
      
      {/* Header del Chef IA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Inteligencia Artificial Culinaria
            </span>
            <Badge className="bg-amber-100 text-amber-900 border-0 text-[10px]">
              Cero Desperdicio
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900 flex items-center gap-2.5">
            <ChefHat className="h-7 w-7 text-emerald-800" />
            Chef IA: ¿Qué tienes en tu nevera?
          </h2>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
            Dinos qué ingredientes te quedan en casa. Nuestra IA creará una receta biológica equilibrada al instante y te dirá qué ingredientes complementarios de Ecoland necesitas.
          </p>
        </div>

        {/* Filtro de estilo dietético */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border text-xs font-bold text-slate-700 shrink-0">
          {[
            { id: 'todas', label: 'Cualquiera' },
            { id: 'vegana', label: '🌱 Vegana' },
            { id: 'sin-gluten', label: '🌾 Sin Gluten' },
            { id: 'proteica', label: '💪 Proteica' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDietFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dietFilter === f.id ? 'bg-emerald-900 text-white shadow-2xs' : 'hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de ingredientes de la nevera */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">
            1. Marca lo que tienes a mano en tu despensa o nevera:
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_FRIDGE_ITEMS.map(item => {
              const isSelected = selectedItems.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs' 
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span>{item}</span>
                  {isSelected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Plus className="h-3 w-3 text-slate-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Añadir ingrediente libre */}
        <div className="flex gap-2 max-w-md pt-1">
          <Input 
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
            placeholder="Añadir otro ingrediente (ej. almendras, calabaza)..."
            className="text-xs bg-slate-50 rounded-xl h-9"
          />
          <Button 
            onClick={addCustomItem}
            variant="outline"
            size="sm"
            className="h-9 px-4 rounded-xl text-xs font-bold"
          >
            Añadir
          </Button>
        </div>

        {/* Ingredientes seleccionados listos */}
        {selectedItems.length > 0 && (
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-900">En tu nevera:</span>
            {selectedItems.map(item => (
              <span key={item} className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-emerald-950 px-2.5 py-1 rounded-full border shadow-2xs">
                <span>{item}</span>
                <button onClick={() => removeSelectedItem(item)} className="text-slate-400 hover:text-red-600">×</button>
              </span>
            ))}
          </div>
        )}

        {/* Botón para generar receta */}
        <Button 
          onClick={generateRecipe}
          disabled={isGenerating || selectedItems.length === 0}
          className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-6 px-8 rounded-2xl shadow-md gap-2.5 text-sm"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Chef IA creando tu receta...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>Crear receta mágica con mi nevera</span>
            </>
          )}
        </Button>
      </div>

      {/* RESULTADO DE LA RECETA GENERADA */}
      <AnimatePresence>
        {currentRecipe && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-3xl bg-slate-50 border border-emerald-200/80 space-y-6 shadow-xs"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {currentRecipe.tags.map(t => (
                    <Badge key={t} className="bg-emerald-100 text-emerald-900 border-0 text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-display text-2xl font-black text-slate-900">
                  {currentRecipe.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  {currentRecipe.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono shrink-0 bg-white p-3 rounded-2xl border">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-700" />
                  <span>{currentRecipe.timeMinutes} min</span>
                </div>
                <div className="border-l pl-4 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-600" />
                  <span>{currentRecipe.calories} kcal</span>
                </div>
                <div className="border-l pl-4">
                  <strong className="text-emerald-800">{currentRecipe.proteinGrams}g</strong> prot.
                </div>
              </div>
            </div>

            {/* Conexión directa con Ecoland Hoy: Registrar en Diario */}
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">¿Vas a preparar esta receta hoy?</span>
                  <span className="text-[11px] text-emerald-700">Se registrará automáticamente en tu diario de nutrición con sus calorías y macronutrientes.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                <select
                  value={selectedMealForLog}
                  onChange={(e) => setSelectedMealForLog(e.target.value as MealType)}
                  className="text-xs bg-white border border-emerald-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 cursor-pointer"
                >
                  <option value="desayuno">Desayuno</option>
                  <option value="comida">Comida</option>
                  <option value="cena">Cena</option>
                  <option value="snack">Snack</option>
                </select>

                <select
                  value={servingsToLog}
                  onChange={(e) => setServingsToLog(Number(e.target.value))}
                  className="text-xs bg-white border border-emerald-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 cursor-pointer"
                >
                  <option value={1}>1 ración</option>
                  <option value={2}>2 raciones</option>
                  <option value={3}>3 raciones</option>
                  <option value={4}>4 raciones</option>
                </select>

                <Button
                  onClick={handleLogToDiary}
                  size="sm"
                  className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl gap-1.5 shadow-xs"
                >
                  {loggedSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>¡Registrada!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Registrar en mi día</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Cuadrícula de Ingredientes: Lo que tienes vs Lo que te falta en Ecoland */}
            <div className="grid md:grid-cols-12 gap-6">
              
              {/* Lo que tienes en casa (5 cols) */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border space-y-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Ingredientes que ya tienes en casa:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {currentRecipe.userIngredients.map(ing => (
                    <li key={ing} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lo que te falta de Ecoland (7 cols con compra directa) */}
              <div className="md:col-span-7 bg-emerald-950 text-white p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Despensa Ecoland</span>
                    <h5 className="font-bold text-sm">Ingredientes Bio Complementarios que te Faltan</h5>
                  </div>
                  <span className="text-xs text-emerald-300 font-mono">
                    Total: {currentRecipe.missingProducts.reduce((acc, p) => acc + p.price, 0).toFixed(2)}€
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {currentRecipe.missingProducts.map(p => (
                    <div key={p.slug} className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-800 flex items-center gap-2.5">
                      <img src={p.image} alt={p.name} className="w-9 h-9 object-contain rounded-lg bg-white p-0.5" />
                      <div className="truncate flex-1">
                        <span className="block font-bold text-white truncate text-[11px]">{p.name.split('–')[0]}</span>
                        <span className="block text-[10px] text-emerald-300 font-mono">{p.price.toFixed(2)}€</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleBuyMissing}
                  className="w-full bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black py-4 text-xs rounded-xl shadow-sm gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Añadir los que me faltan al carrito ({currentRecipe.missingProducts.reduce((acc, p) => acc + p.price, 0).toFixed(2)}€)</span>
                </Button>
              </div>

            </div>

            {/* Paso a paso de preparación */}
            <div className="space-y-3 pt-2">
              <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Utensils className="h-4 w-4 text-emerald-700" />
                Instrucciones de preparación saludables:
              </h5>
              <div className="space-y-2 text-xs text-slate-700">
                {currentRecipe.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white border">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
