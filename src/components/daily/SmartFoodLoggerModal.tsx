import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Search, Keyboard, Mic, Camera, Barcode, 
  Check, AlertCircle, ArrowRight,
  Clock, RefreshCw, UtensilsCrossed, FileText, ShieldCheck,
  CheckCircle2, AlertTriangle, HelpCircle, Layers, SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  smartFoodLoggerService, 
  PhotoAnalysisResult, 
  UniversalEanProduct,
  MenuScanResult
} from '@/services/smartFoodLoggerService';
import { dailyNutritionStore, MealType } from '@/services/dailyNutritionStore';
import { productInsightsService } from '@/services/productInsightsService';
import { useToast } from '@/hooks/use-toast';

interface SmartFoodLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMeal?: MealType;
  onLoggedSuccess?: () => void;
}

export const SmartFoodLoggerModal = ({
  isOpen,
  onClose,
  defaultMeal = 'comida',
  onLoggedSuccess
}: SmartFoodLoggerModalProps) => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'habitual' | 'eat_out' | 'photo' | 'ean' | 'menuscan' | 'text'>('habitual');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(defaultMeal);

  // 1. Photo mode states
  const [photoContextPrompt, setPhotoContextPrompt] = useState('');
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysisResult | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState(1.0);

  // 2. EAN mode states
  const [barcodeInput, setBarcodeInput] = useState('843700000001');
  const [eanProduct, setEanProduct] = useState<UniversalEanProduct | null>(null);

  // 3. MenuScan mode states
  const [menuScanResult, setMenuScanResult] = useState<MenuScanResult | null>(null);
  const [selectedMenuDishId, setSelectedMenuDishId] = useState<string | null>(null);

  // 4. Text & habitual states
  const [textInput, setTextInput] = useState('');

  // Start funnel telemetry when modal opens
  useEffect(() => {
    if (isOpen) {
      const order = smartFoodLoggerService.getContextualMethodOrder();
      if (order[0] === 'EATING_OUT') setActiveTab('eat_out');
      else if (order[0] === 'HABITUAL') setActiveTab('habitual');
      else setActiveTab('habitual');

      productInsightsService.startLoggingSession('habitual');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handler for Photo analysis
  const handleAnalyzePhoto = () => {
    const result = smartFoodLoggerService.analyzePhotoMeal('dummy_photo', photoContextPrompt);
    setPhotoAnalysis(result);
    setPortionMultiplier(1.0);
    productInsightsService.updateLoggingSessionStep('food_detected', { method: 'photo' });
  };

  const handleApplyPortionScale = (multiplier: number) => {
    if (!photoAnalysis) return;
    const scaled = smartFoodLoggerService.scalePhotoPortion(photoAnalysis, multiplier);
    setPhotoAnalysis(scaled);
    setPortionMultiplier(multiplier);
  };

  // Handler for Barcode scan
  const handleScanBarcode = () => {
    const prod = smartFoodLoggerService.resolveBarcodeUniversal(barcodeInput);
    setEanProduct(prod);
    productInsightsService.updateLoggingSessionStep('food_detected', { method: 'EAN' });
  };

  // Handler for MenuScan
  const handleScanMenu = () => {
    const menu = smartFoodLoggerService.parseRestaurantMenu('Carta Restaurante');
    setMenuScanResult(menu);
    setSelectedMenuDishId(menu.dishes[0]?.id || null);
    productInsightsService.updateLoggingSessionStep('food_detected', { method: 'eating_out' });
  };

  // Final confirmation to log into daily nutrition store
  const handleConfirmLog = () => {
    let name = 'Comida registrada';
    let calories = 400;
    let protein = 25;
    let carbs = 40;
    let fat = 12;
    let fiber = 5;

    if (activeTab === 'photo' && photoAnalysis) {
      name = photoAnalysis.detectedDishName;
      calories = photoAnalysis.totalCalories;
      protein = photoAnalysis.totalProtein;
      carbs = photoAnalysis.totalCarbs;
      fat = photoAnalysis.totalFat;
      fiber = photoAnalysis.totalFiber;
    } else if (activeTab === 'ean' && eanProduct) {
      name = `${eanProduct.productName} (${eanProduct.brand})`;
      calories = eanProduct.caloriesPer100g;
      protein = eanProduct.proteinPer100g;
      carbs = eanProduct.carbsPer100g;
      fat = eanProduct.fatPer100g;
      fiber = eanProduct.fiberPer100g;
    } else if (activeTab === 'menuscan' && menuScanResult && selectedMenuDishId) {
      const dish = menuScanResult.dishes.find(d => d.id === selectedMenuDishId);
      if (dish) {
        name = `${dish.name} (Restaurante)`;
        calories = dish.estimatedCalories;
        protein = dish.estimatedProtein;
        carbs = 35;
        fat = 15;
        fiber = 4;
        smartFoodLoggerService.saveRestaurantMeal(menuScanResult.restaurantName || 'Restaurante', dish.name, dish.estimatedCalories, dish.estimatedProtein);
      }
    } else if (activeTab === 'eat_out') {
      name = 'Menú del día equilibrado (Comí fuera)';
      calories = 580;
      protein = 34;
      carbs = 55;
      fat = 18;
      fiber = 7;
    } else {
      name = 'Desayuno habitual (Avena con frutas y café)';
      calories = 360;
      protein = 14;
      carbs = 52;
      fat = 7;
      fiber = 8;
    }

    dailyNutritionStore.addMealLog({
      meal: selectedMeal,
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      vegetableServing: 1
    });

    productInsightsService.updateLoggingSessionStep('log_completed');

    toast({
      title: 'Comida registrada en segundos',
      description: `${name} añadido a tu ${selectedMeal}.`
    });

    if (onLoggedSuccess) onLoggedSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b flex items-center justify-between bg-slate-50/60">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-800" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Smart Food Logger 3.0
                </h2>
                <Badge variant="outline" className="border-emerald-300 text-emerald-900 font-bold text-[10px]">
                  Cero Fricción
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Registra lo que has comido en segundos con la máxima transparencia.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de Momento del Día */}
          <div className="px-5 pt-3 pb-2 flex items-center gap-1.5 border-b bg-white text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Momento:</span>
            {(['desayuno', 'comida', 'merienda', 'cena', 'snack'] as MealType[]).map((meal) => (
              <button
                key={meal}
                onClick={() => setSelectedMeal(meal)}
                className={`px-2.5 py-1 rounded-xl font-bold capitalize transition-all ${
                  selectedMeal === meal
                    ? 'bg-emerald-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {meal}
              </button>
            ))}
          </div>

          {/* Selector de Pestañas / Métodos de Entrada */}
          <div className="px-5 pt-3 pb-1 flex items-center gap-1.5 border-b bg-slate-50/40 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => setActiveTab('habitual')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'habitual' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Habituales (1-Tap)</span>
            </button>

            <button
              onClick={() => setActiveTab('eat_out')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'eat_out' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Comí fuera</span>
            </button>

            <button
              onClick={() => setActiveTab('photo')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'photo' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Foto con Confianza</span>
            </button>

            <button
              onClick={() => setActiveTab('ean')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'ean' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Código EAN</span>
            </button>

            <button
              onClick={() => setActiveTab('menuscan')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'menuscan' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Carta de Restaurante</span>
            </button>
          </div>

          {/* Contenido Dinámico por Pestaña */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {/* 1. MODO HABITUAL (1-TAP 2.1s) */}
            {activeTab === 'habitual' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Tus platos más frecuentes listos para registrar en un solo toque:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { title: 'Avena con fruta y nueces', desc: 'Desayuno habitual · 360 kcal · 8g fibra', cals: 360 },
                    { title: 'Lentejas pardinas con arroz', desc: 'Comida casera · 420 kcal · 14g fibra', cals: 420 },
                    { title: 'Tostada de aguacate y tomate', desc: 'Desayuno o cena · 280 kcal · 6g fibra', cals: 280 },
                    { title: 'Salteado de garbanzos y verduras', desc: 'Cena rápida · 340 kcal · 11g fibra', cals: 340 }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={handleConfirmLog}
                      className="p-3 rounded-2xl border text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-start justify-between group"
                    >
                      <div className="space-y-0.5">
                        <strong className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 block">
                          {item.title}
                        </strong>
                        <span className="text-[11px] text-slate-500">{item.desc}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-mono group-hover:bg-emerald-100">
                        1-Tap
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. MODO COMÍ FUERA */}
            {activeTab === 'eat_out' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Estimaciones rápidas y tranquilas para comidas fuera de casa sin pesajes:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { name: 'Menú del día equilibrado', desc: 'Primer plato de verduras/legumbres + segundo a la plancha' },
                    { name: 'Ensalada completa o poke', desc: 'Base vegetal, proteína y cereales integrales' },
                    { name: 'Comida libre o celebración', desc: 'Plato más contundente, postre o tapeo festivo' },
                    { name: 'Bocadillo o sandwich vegetal', desc: 'Opción rápida de cafetería o viaje' }
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={handleConfirmLog}
                      className="p-3 rounded-2xl border text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-all space-y-1"
                    >
                      <strong className="text-xs font-bold text-slate-900 block">{opt.name}</strong>
                      <span className="text-[11px] text-slate-500 leading-tight block">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MODO FOTO CON MOTOR DE CONFIANZA */}
            {activeTab === 'photo' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Instrucciones o contexto adicional (Opcional):</span>
                    <Badge variant="outline" className="text-[9px]">Motor de Confianza</Badge>
                  </div>
                  <Input
                    placeholder="Ej: era pollo, sin aceite, plato pequeño..."
                    value={photoContextPrompt}
                    onChange={(e) => setPhotoContextPrompt(e.target.value)}
                    className="text-xs rounded-xl bg-white"
                  />
                  <Button
                    size="sm"
                    onClick={handleAnalyzePhoto}
                    className="w-full bg-emerald-800 text-white rounded-xl text-xs font-bold h-8"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                    <span>Simular Foto y Analizar Plato</span>
                  </Button>
                </div>

                {photoAnalysis && (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="font-bold text-slate-900 text-sm">
                        {photoAnalysis.detectedDishName}
                      </strong>
                      <Badge className="bg-emerald-800 text-white font-mono text-[10px]">
                        Confianza: {photoAnalysis.confidenceLevel}
                      </Badge>
                    </div>

                    {/* Desglose de ingredientes con nivel de confianza */}
                    <div className="space-y-1.5 border-t pt-2">
                      {photoAnalysis.ingredients.map((ing, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl border">
                          <span className="font-medium text-slate-800">{ing.name} (~{ing.estimatedGrams}g)</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-600">{ing.calories} kcal</span>
                            <Badge variant={ing.confidence === 'ALTA' ? 'outline' : 'secondary'} className="text-[9px] font-mono">
                              {ing.confidence} ({ing.confidencePercent}%)
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Modificadores de porción rápidos */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 mr-1">Ración:</span>
                      {[
                        { label: '-20%', mul: 0.8 },
                        { label: '½ ración', mul: 0.5 },
                        { label: '1 ración', mul: 1.0 },
                        { label: '1½ ración', mul: 1.5 },
                        { label: '+25%', mul: 1.25 },
                        { label: '2 raciones', mul: 2.0 }
                      ].map((btn, i) => (
                        <button
                          key={i}
                          onClick={() => handleApplyPortionScale(btn.mul)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            portionMultiplier === btn.mul ? 'bg-emerald-900 text-white' : 'bg-white border text-slate-700'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between font-mono font-bold text-emerald-950">
                      <span>Total estimado:</span>
                      <span>{photoAnalysis.totalCalories} kcal · {photoAnalysis.totalProtein}g P · {photoAnalysis.totalFiber}g Fibra</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. MODO CÓDIGO EAN UNIVERSAL */}
            {activeTab === 'ean' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border space-y-2">
                  <span className="font-bold text-slate-700 block">Introduce o escanea un código de barras:</span>
                  <div className="flex gap-2">
                    <Input
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="843700000001"
                      className="text-xs font-mono rounded-xl bg-white"
                    />
                    <Button size="sm" onClick={handleScanBarcode} className="bg-emerald-800 text-white rounded-xl px-3 font-bold">
                      Buscar
                    </Button>
                  </div>
                </div>

                {eanProduct && (
                  <div className="p-4 bg-white border rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">{eanProduct.productName}</strong>
                        <span className="text-[11px] text-slate-500">{eanProduct.brand} · Ración: {eanProduct.servingSize}</span>
                      </div>
                      <Badge className="bg-slate-900 text-white font-mono text-[10px]">
                        Fuente: {eanProduct.provenance.source}
                      </Badge>
                    </div>

                    {/* Food Fingerprint Compatibility Badge */}
                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      eanProduct.compatibility.status === 'COMPATIBLE' 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}>
                      {eanProduct.compatibility.status === 'COMPATIBLE' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      )}
                      <div className="text-[11px] leading-tight">
                        <strong>Food Fingerprint: {eanProduct.compatibility.status}</strong>
                        <p>{eanProduct.compatibility.reason}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px] pt-1 border-t">
                      <div className="p-1 bg-slate-50 rounded-lg">
                        <span className="text-[9px] text-slate-400 block">Kcal</span>
                        <strong>{eanProduct.caloriesPer100g}</strong>
                      </div>
                      <div className="p-1 bg-slate-50 rounded-lg">
                        <span className="text-[9px] text-slate-400 block">Proteína</span>
                        <strong>{eanProduct.proteinPer100g}g</strong>
                      </div>
                      <div className="p-1 bg-slate-50 rounded-lg">
                        <span className="text-[9px] text-slate-400 block">Carbos</span>
                        <strong>{eanProduct.carbsPer100g}g</strong>
                      </div>
                      <div className="p-1 bg-slate-50 rounded-lg">
                        <span className="text-[9px] text-slate-400 block">Fibra</span>
                        <strong>{eanProduct.fiberPer100g}g</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. MODO MENUSCAN (CARTA RESTAURANTE) */}
            {activeTab === 'menuscan' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">
                    Extrae platos de una foto o PDF de carta de restaurante y compara opciones:
                  </p>
                  <Button size="sm" onClick={handleScanMenu} variant="outline" className="rounded-xl text-xs h-7 gap-1 font-bold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Cargar Carta</span>
                  </Button>
                </div>

                {menuScanResult && (
                  <div className="space-y-2.5">
                    <div className="p-2.5 bg-amber-50/70 border border-amber-300 rounded-xl text-[10px] text-amber-950 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <p>{menuScanResult.disclaimer}</p>
                    </div>

                    <div className="space-y-2">
                      {menuScanResult.dishes.map((dish) => (
                        <div
                          key={dish.id}
                          onClick={() => setSelectedMenuDishId(dish.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                            selectedMenuDishId === dish.id
                              ? 'bg-emerald-50/60 border-emerald-500 shadow-2xs'
                              : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <strong className="text-xs font-bold text-slate-900 block">{dish.name}</strong>
                              <p className="text-[11px] text-slate-500">{dish.description}</p>
                            </div>
                            <span className="font-mono font-bold text-xs text-slate-800">
                              {dish.priceEur ? `${dish.priceEur.toFixed(2)} €` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2 pt-1.5 border-t text-[10px]">
                            <Badge variant={dish.isLightOption ? 'outline' : 'secondary'} className="font-mono">
                              ~{dish.estimatedCalories} kcal
                            </Badge>
                            <span className="font-mono text-slate-600">~{dish.estimatedProtein}g proteína</span>
                            {dish.isLightOption && (
                              <Badge className="bg-emerald-100 text-emerald-900 border-none font-bold">
                                Opción Ligera
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer de Confirmación */}
          <div className="p-4 border-t bg-slate-50/60 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Momento seleccionado: <strong className="capitalize text-slate-800">{selectedMeal}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={onClose} className="rounded-xl text-xs">
                Cancelar
              </Button>
              <Button size="sm" onClick={handleConfirmLog} className="bg-emerald-800 text-white rounded-xl text-xs font-bold px-4 gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Guardar en {selectedMeal}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SmartFoodLoggerModal;
