import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Search, Keyboard, Mic, Camera, Barcode, 
  Check, Plus, Trash2, Edit2, AlertCircle, ShoppingBag, ArrowRight,
  Bookmark, CheckCircle2, AlertTriangle, Clock, RefreshCw, UtensilsCrossed
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fastFoodParser, FoodParseResult, ParsedFoodItem } from '@/services/fastFoodParser';
import { dailyNutritionStore, MealType, PantryDeductionProposal } from '@/services/dailyNutritionStore';
import { productInsightsService } from '@/services/productInsightsService';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { useToast } from '@/hooks/use-toast';

interface FastFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMeal?: MealType;
  onLoggedSuccess?: () => void;
  onPantryProposalTriggered?: (proposal: PantryDeductionProposal) => void;
}

export const FastFoodModal = ({
  isOpen,
  onClose,
  defaultMeal = 'desayuno',
  onLoggedSuccess,
  onPantryProposalTriggered
}: FastFoodModalProps) => {
  const { toast } = useToast();

  const [activeMode, setActiveMode] = useState<'text' | 'voice' | 'photo' | 'barcode' | 'catalog' | 'eat_out'>('text');
  const [eatOutInput, setEatOutInput] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(defaultMeal);

  // Modo Texto
  const [textInput, setTextInput] = useState('');

  // Modo Voz
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('He comido 250 gramos de lentejas estofadas con arroz y una manzana');

  // Modo Foto
  const [photoPreset, setPhotoPreset] = useState<'tostadas_aguacate' | 'ensalada_quinoa' | 'bowl_avena'>('tostadas_aguacate');

  // Modo Código de Barras
  const [barcodeInput, setBarcodeInput] = useState('8437004123019');

  // Modo Catálogo
  const [catalogSearch, setCatalogSearch] = useState('');

  // Resultado parseado para revisión / edición antes de guardar
  const [parsedResult, setParsedResult] = useState<FoodParseResult | null>(null);

  // Guardar como comida personalizada favorita
  const [shouldSaveAsMeal, setShouldSaveAsMeal] = useState(false);
  const [savedMealName, setSavedMealName] = useState('');

  // Sugerencias predictivas directas
  const predictiveContext = dailyNutritionStore.getPredictiveSuggestions();

  // Manejador de parseo de texto natural
  const handleParseEatOut = (presetText?: string) => {
    const raw = (presetText || eatOutInput).trim() || 'Lentejas, pollo con patatas y café';
    const res = fastFoodParser.parseNaturalText(raw, 'text');
    res.confidenceNotice = 'Estimación: las cantidades de una comida preparada fuera de casa pueden variar considerablemente.';
    res.requiresReview = true;
    res.overallConfidence = 'medium';
    setParsedResult(res);
    dailyNutritionStore.trackEvent('eat_out_logged', { text: raw });
  };

  const handleParseText = () => {
    if (!textInput.trim()) return;
    const res = fastFoodParser.parseNaturalText(textInput, 'text');
    setParsedResult(res);
  };

  // Manejador de dictado por voz
  const handleSimulateVoice = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const res = fastFoodParser.parseNaturalText(voiceText, 'voice');
      setParsedResult(res);
    }, 1200);
  };

  // Manejador de foto
  const handleSelectPhotoPreset = (type: 'tostadas_aguacate' | 'ensalada_quinoa' | 'bowl_avena') => {
    setPhotoPreset(type);
    const res = fastFoodParser.parsePhotoMeal(type);
    setParsedResult(res);
  };

  // Ajuste rápido de ración en item (+/- 20%)
  const adjustItemQuantity = (id: string, factor: number) => {
    if (!parsedResult) return;
    const updatedItems = parsedResult.items.map(it => {
      if (it.id !== id) return it;
      const newWeight = Math.max(10, Math.round(it.weightGrams * factor));
      const ratio = newWeight / it.weightGrams;
      return {
        ...it,
        weightGrams: newWeight,
        quantityDescription: `~${newWeight}g ajustados`,
        calories: Math.round(it.calories * ratio),
        protein: Math.round(it.protein * ratio * 10) / 10,
        carbs: Math.round(it.carbs * ratio * 10) / 10,
        fats: Math.round(it.fats * ratio * 10) / 10,
        fiber: Math.round(it.fiber * ratio * 10) / 10,
        confidence: 'high' as const // Usuario lo validó manualmente
      };
    });

    const totalEstimatedCalories = updatedItems.reduce((acc, it) => acc + it.calories, 0);
    const totalProtein = Math.round(updatedItems.reduce((acc, it) => acc + it.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(updatedItems.reduce((acc, it) => acc + it.carbs, 0) * 10) / 10;
    const totalFats = Math.round(updatedItems.reduce((acc, it) => acc + it.fats, 0) * 10) / 10;
    const totalFiber = Math.round(updatedItems.reduce((acc, it) => acc + it.fiber, 0) * 10) / 10;

    setParsedResult({
      ...parsedResult,
      items: updatedItems,
      totalEstimatedCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      totalFiber
    });
  };

  // Guardar en el diario
  const handleConfirmLog = () => {
    if (!parsedResult || parsedResult.items.length === 0) return;

    let pantryProposalToTrigger: PantryDeductionProposal | null = null;

    for (const item of parsedResult.items) {
      const addedEntry = dailyNutritionStore.addMealLog({
        name: `${item.name} (${item.quantityDescription})`,
        meal: selectedMeal,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        fiber: item.fiber,
        // El diario no distingue texto escrito ni catálogo: ambos cuentan como entrada manual
        source: parsedResult.source === 'text' || parsedResult.source === 'catalog' ? 'manual' : parsedResult.source
      });

      // Cruce inteligente con despensa (P1-C)
      if (!pantryProposalToTrigger) {
        const prop = dailyNutritionStore.checkPantryDeductionSuggestions(addedEntry);
        if (prop) {
          pantryProposalToTrigger = prop;
        }
      }
    }

    // Si marcó "Guardar como comida" (P1-A Punto 5)
    if (shouldSaveAsMeal && parsedResult.items.length > 0) {
      const comboName = savedMealName.trim() || parsedResult.items.map(i => i.name).join(' + ');
      dailyNutritionStore.saveAsMeal({
        name: comboName,
        meal: selectedMeal,
        description: parsedResult.items.map(i => `${i.name} (${i.quantityDescription})`).join(', '),
        servings: 1,
        calories: parsedResult.totalEstimatedCalories,
        protein: parsedResult.totalProtein,
        carbs: parsedResult.totalCarbs,
        fats: parsedResult.totalFats,
        fiber: parsedResult.totalFiber
      });
      toast({
        title: "¡Guardada en tus comidas habituales!",
        description: `Podrás registrar "${comboName}" en un solo toque cuando quieras.`,
      });
    }

    toast({
      title: "Comida registrada en tu día",
      description: `Añadidas ${parsedResult.totalEstimatedCalories} kcal y ${parsedResult.totalProtein}g de proteína a tu ${selectedMeal}.`,
    });

    if (pantryProposalToTrigger && onPantryProposalTriggered) {
      onPantryProposalTriggered(pantryProposalToTrigger);
    }

    setParsedResult(null);
    setTextInput('');
    setShouldSaveAsMeal(false);
    setSavedMealName('');
    productInsightsService.updateLoggingSessionStep('log_completed');
    productInsightsService.recordMeaningfulAction('food_logged');
    if (onLoggedSuccess) onLoggedSuccess();
    onClose();
  };

  // Eliminar un ingrediente del resultado preliminar
  const removeParsedItem = (id: string) => {
    if (!parsedResult) return;
    productInsightsService.updateLoggingSessionStep('food_corrected', { wasCorrected: true });
    const filtered = parsedResult.items.filter(i => i.id !== id);
    const totalEstimatedCalories = filtered.reduce((acc, it) => acc + it.calories, 0);
    const totalProtein = Math.round(filtered.reduce((acc, it) => acc + it.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(filtered.reduce((acc, it) => acc + it.carbs, 0) * 10) / 10;
    const totalFats = Math.round(filtered.reduce((acc, it) => acc + it.fats, 0) * 10) / 10;
    const totalFiber = Math.round(filtered.reduce((acc, it) => acc + it.fiber, 0) * 10) / 10;

    setParsedResult({
      ...parsedResult,
      items: filtered,
      totalEstimatedCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      totalFiber
    });
  };

  // Registro en 1 toque desde sugerencia predictiva
  const handleQuickPredictiveLog = (item: any) => {
    if (item.type === 'habitual') {
      const habId = item.id.replace('pred_hab_', '');
      dailyNutritionStore.logHabitualMeal(habId);
    } else if (item.type === 'saved') {
      const savedId = item.id.replace('pred_saved_', '');
      dailyNutritionStore.logSavedMeal(savedId, selectedMeal);
    } else {
      dailyNutritionStore.addMealLog({
        name: item.subtitle || item.title,
        meal: selectedMeal,
        calories: item.calories,
        protein: item.protein,
        carbs: Math.round(item.calories * 0.5 / 4),
        fats: Math.round(item.calories * 0.25 / 9),
        fiber: item.fiber,
        source: 'manual'
      });
    }

    toast({
      title: "¡Registrado en 1 toque!",
      description: `Añadido ${item.title} (${item.calories} kcal) a tu ${selectedMeal}.`,
    });

    productInsightsService.updateLoggingSessionStep('log_completed');
    productInsightsService.recordMeaningfulAction('food_logged');
    productInsightsService.updateLoggingSessionStep('log_completed');
    productInsightsService.recordMeaningfulAction('habitual_meal_logged');
    if (onLoggedSuccess) onLoggedSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white rounded-3xl max-w-xl w-full border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Registrar Comida en Segundos</h3>
              <p className="text-[11px] text-emerald-300">Sin búsquedas tediosas: escribe, habla o fotografía tu plato</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-900 text-emerald-300 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">

          {/* Selector de tipo de comida */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              ¿A qué momento del día corresponde?
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {(['desayuno', 'comida', 'cena', 'snacks'] as MealType[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMeal(m)}
                  className={`py-2 text-[11px] font-bold rounded-xl capitalize transition-all ${
                    selectedMeal === m 
                      ? 'bg-white text-emerald-900 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* SUGERENCIAS PREDICTIVAS DIRECTAS EN 1 TOQUE (P1-A Punto 3) */}
          {!parsedResult && predictiveContext.suggestions.length > 0 && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  Sugerencias para esta hora ({predictiveContext.recommendedMealType}):
                </span>
                <span className="text-xs text-emerald-700 font-medium">1 clic</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {predictiveContext.suggestions.map(sug => (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => handleQuickPredictiveLog(sug)}
                    className="p-2.5 rounded-xl bg-white border border-emerald-200/60 hover:bg-emerald-100/60 text-left flex items-center justify-between transition-all group shadow-2xs"
                  >
                    <div className="truncate pr-2">
                      <strong className="block text-slate-900 text-[11px] truncate group-hover:text-emerald-950">
                        {sug.title}
                      </strong>
                      <span className="text-xs text-slate-500 truncate block">
                        {sug.subtitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="tabular-nums text-xs font-bold text-slate-700">
                        {sug.calories} kcal
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs group-hover:bg-emerald-900">
                        +
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de modo de entrada (5 en 1) */}
          {!parsedResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2 gap-1 overflow-x-auto">
                {[
                  { id: 'text', label: 'Escribir', icon: Keyboard },
                  { id: 'voice', label: 'Voz', icon: Mic },
                  { id: 'photo', label: 'Foto IA', icon: Camera },
                  { id: 'barcode', label: 'Código', icon: Barcode },
                  { id: 'catalog', label: 'Catálogo', icon: Search },
                  { id: 'eat_out', label: 'Comí fuera', icon: UtensilsCrossed },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMode(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap text-xs ${
                        isActive
                          ? 'bg-emerald-900 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 1. MODO TEXTO NATURAL */}
              {activeMode === 'text' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500">
                    Escribe lo que has comido tal como lo dirías a un amigo:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: 2 tostadas integrales con aguacate y café con leche"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleParseText()}
                      className="rounded-xl h-11 text-xs"
                      autoFocus
                    />
                    <Button 
                      onClick={handleParseText}
                      disabled={!textInput.trim()}
                      className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl px-4 font-bold shrink-0"
                    >
                      Estimar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-xs text-slate-500 font-semibold mr-1">Prueba rápida:</span>
                    {[
                      '2 tostadas integrales con aguacate y cafe',
                      'Porridge de avena con kefir y frutos secos',
                      'Guiso de lentejas con arroz y manzana',
                      'Tortilla de 2 huevos con espinacas'
                    ].map(sample => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => { setTextInput(sample); const res = fastFoodParser.parseNaturalText(sample, 'text'); setParsedResult(res); }}
                        className="text-xs bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border rounded-lg px-2 py-1 transition-colors"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. MODO DICTADO POR VOZ */}
              {activeMode === 'voice' && (
                <div className="space-y-4 text-center py-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Mic className={`h-8 w-8 ${isRecording ? 'text-red-600 animate-pulse' : 'text-emerald-800'}`} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">Dicta tu comida</h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      "Me he comido un plato de lentejas con un poco de arroz y una manzana"
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border text-left text-[11px] text-slate-700">
                    <span className="text-xs text-slate-500 font-bold block mb-1">Transcripción simulada:</span>
                    <Input 
                      value={voiceText} 
                      onChange={(e) => setVoiceText(e.target.value)} 
                      className="text-xs bg-white h-9"
                    />
                  </div>
                  <Button
                    onClick={handleSimulateVoice}
                    disabled={isRecording}
                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-5 rounded-2xl gap-2 shadow-sm"
                  >
                    {isRecording ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                    <span>{isRecording ? 'Escuchando y procesando...' : 'Iniciar dictado por voz'}</span>
                  </Button>
                </div>
              )}

              {/* 3. MODO FOTO IA */}
              {activeMode === 'photo' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500">
                    Selecciona una foto de tu plato para analizarla con visión artificial:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'tostadas_aguacate', label: 'Tostadas Aguacate', cals: '395 kcal' },
                      { id: 'ensalada_quinoa', label: 'Bowl Quinoa', cals: '430 kcal' },
                      { id: 'bowl_avena', label: 'Porridge Avena', cals: '385 kcal' },
                    ].map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPhotoPreset(preset.id as any)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          photoPreset === preset.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Camera className="h-5 w-5 mx-auto mb-1 text-emerald-800" />
                        <span className="block text-[11px] leading-tight">{preset.label}</span>
                        <span className="text-xs text-slate-500 tabular-nums">{preset.cals}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. MODO CÓDIGO EAN */}
              {activeMode === 'barcode' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500">
                    Introduce el código EAN del producto biológico:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Ej: 8437004123019"
                      className="rounded-xl h-11 text-xs tabular-nums"
                    />
                    <Button
                      onClick={() => {
                        const res = fastFoodParser.parseNaturalText('lentejas pardinas bio', 'barcode');
                        setParsedResult(res);
                      }}
                      className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl px-4 font-bold"
                    >
                      Escanear
                    </Button>
                  </div>
                </div>
              )}

              {/* 6. MODO COMÍ FUERA (P2-D) */}
              {activeMode === 'eat_out' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-950 space-y-1">
                    <strong className="block font-bold">Registro flexible sin culpa:</strong>
                    <p className="text-amber-800 leading-relaxed">
                      Ecoland no castiga ni compensa restrictivamente las comidas fuera. Estimamos las porciones para mantener tu visión global.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Describe lo que has comido:</label>
                    <Input
                      value={eatOutInput}
                      onChange={(e) => setEatOutInput(e.target.value)}
                      placeholder="Ej: Lentejas, pollo con patatas y café..."
                      className="rounded-xl h-11 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase font-bold text-slate-500 block">O elige un ejemplo habitual:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        'Menú del día: lentejas estofadas y pollo con patatas',
                        'Ensalada mediterránea completa y café solo',
                        'Tapas variadas de verduras y tortilla casera',
                        'Plato de arroz con verduras y pescado a la plancha'
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleParseEatOut(preset)}
                          className="p-2 text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-[11px] font-semibold text-slate-700 hover:text-emerald-950 transition-all line-clamp-1"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleParseEatOut()}
                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl py-5 font-bold text-xs gap-1.5"
                  >
                    <span>Estimar Comida Fuera</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* 5. MODO CATÁLOGO DIRECTO */}
              {activeMode === 'catalog' && (
                <div className="space-y-3">
                  <Input
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Buscar avena, kéfir, garbanzos en catálogo..."
                    className="rounded-xl h-11 text-xs"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {allCatalogProducts
                      .filter(p => !catalogSearch || p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                      .slice(0, 5)
                      .map(p => (
                        <div
                          key={p.slug}
                          onClick={() => {
                            const res = fastFoodParser.parseNaturalText(p.name.split('–')[0], 'catalog');
                            setParsedResult(res);
                          }}
                          className="p-2.5 rounded-xl border hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-slate-900 truncate pr-2">{p.name.split('–')[0]}</span>
                          <span className="text-xs text-emerald-800 font-bold shrink-0">Seleccionar</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VISTA PRELIMINAR / EDICIÓN CON CONFIANZA IA (P1-A Punto 6) */}
          {parsedResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-700" />
                  Alimentos Detectados & Nivel de Confianza
                </span>
                <button
                  onClick={() => setParsedResult(null)}
                  className="text-[11px] text-emerald-800 font-bold hover:underline"
                >
                  ← Cambiar entrada
                </button>
              </div>

              {/* Aviso de Estimación Orientativa */}
              <div className={`p-3 rounded-2xl border text-[11px] flex items-start gap-2 ${
                parsedResult.requiresReview 
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950' 
                  : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              }`}>
                {parsedResult.requiresReview ? (
                  <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <strong className="block text-[11px]">
                    {parsedResult.requiresReview ? 'Revísalo antes de registrar:' : 'Estimación de alta precisión:'}
                  </strong>
                  <span className="leading-tight block">{parsedResult.confidenceNotice}</span>
                </div>
              </div>

              {/* Lista de alimentos reconocidos con ajuste rápido */}
              <div className="space-y-2">
                {parsedResult.items.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-2xl border bg-slate-50/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 text-xs">{item.name}</strong>
                          <span className={`text-xs px-1.5 py-0.2 rounded-md font-bold uppercase ${
                            item.confidence === 'high' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : item.confidence === 'medium'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-900'
                          }`}>
                            {item.confidence === 'high' ? 'Alta' : item.confidence === 'medium' ? 'Media' : 'Baja'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{item.quantityDescription}</span>
                        {item.confidenceReason && (
                          <span className="text-xs text-amber-800 font-medium block mt-0.5">
                            ⚠️ {item.confidenceReason}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="tabular-nums font-bold text-slate-900 text-xs">{item.calories} kcal</span>
                          <span className="text-xs text-slate-500 block">P: {item.protein}g · F: {item.fiber}g</span>
                        </div>
                        <button
                          onClick={() => removeParsedItem(item.id)}
                          className="text-slate-500 hover:text-rose-600 transition-colors p-1"
                          title="Eliminar alimento"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Botones de micro-ajuste de ración */}
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500 text-xs">Ajustar ración:</span>
                      <button
                        type="button"
                        onClick={() => adjustItemQuantity(item.id, 0.8)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 font-medium"
                      >
                        -20%
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustItemQuantity(item.id, 1.25)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 font-medium"
                      >
                        +25%
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales consolidados de la comida */}
              <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2">
                <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                  <span className="text-xs text-emerald-300">Total a registrar en {selectedMeal}:</span>
                  <span className="text-lg font-black tabular-nums">{parsedResult.totalEstimatedCalories} kcal</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div className="bg-emerald-900/60 p-1.5 rounded-xl">
                    <span className="text-emerald-300 block">Proteína</span>
                    <strong className="tabular-nums text-xs">{parsedResult.totalProtein}g</strong>
                  </div>
                  <div className="bg-emerald-900/60 p-1.5 rounded-xl">
                    <span className="text-emerald-300 block">Hidratos</span>
                    <strong className="tabular-nums text-xs">{parsedResult.totalCarbs}g</strong>
                  </div>
                  <div className="bg-emerald-900/60 p-1.5 rounded-xl">
                    <span className="text-emerald-300 block">Grasas</span>
                    <strong className="tabular-nums text-xs">{parsedResult.totalFats}g</strong>
                  </div>
                  <div className="bg-emerald-900/60 p-1.5 rounded-xl">
                    <span className="text-emerald-300 block">Fibra</span>
                    <strong className="tabular-nums text-xs text-amber-300">{parsedResult.totalFiber}g</strong>
                  </div>
                </div>
              </div>

              {/* CHECKBOX: GUARDAR COMO COMIDA HABITUAL FAVORITA (P1-A Punto 5) */}
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shouldSaveAsMeal}
                    onChange={(e) => setShouldSaveAsMeal(e.target.checked)}
                    className="rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
                    Guardar esta combinación como comida guardada favorita
                  </span>
                </label>
                {shouldSaveAsMeal && (
                  <Input
                    placeholder="Nombre del plato (ej: Mi desayuno bio, Poke rápido)..."
                    value={savedMealName}
                    onChange={(e) => setSavedMealName(e.target.value)}
                    className="text-xs bg-white rounded-xl h-9"
                  />
                )}
              </div>

              {/* Botón de Confirmación */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setParsedResult(null)}
                  className="flex-1 rounded-2xl py-6 font-bold text-xs"
                >
                  Volver a editar
                </Button>
                <Button
                  onClick={handleConfirmLog}
                  className="flex-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-6 text-xs rounded-2xl shadow-md gap-2"
                >
                  <span>Confirmar y Guardar</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
