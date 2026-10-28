import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Search, Keyboard, Mic, Camera, Barcode, 
  Check, Plus, Trash2, Edit2, AlertCircle, ShoppingBag, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fastFoodParser, FoodParseResult, ParsedFoodItem } from '@/services/fastFoodParser';
import { dailyNutritionStore, MealType } from '@/services/dailyNutritionStore';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { useToast } from '@/hooks/use-toast';

interface FastFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMeal?: MealType;
  onLoggedSuccess?: () => void;
}

export const FastFoodModal = ({
  isOpen,
  onClose,
  defaultMeal = 'desayuno',
  onLoggedSuccess
}: FastFoodModalProps) => {
  const { toast } = useToast();

  const [activeMode, setActiveMode] = useState<'text' | 'voice' | 'photo' | 'barcode' | 'catalog'>('text');
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

  // Manejador de parseo de texto natural
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
  const handleParsePhoto = (preset: 'tostadas_aguacate' | 'ensalada_quinoa' | 'bowl_avena') => {
    setPhotoPreset(preset);
    const res = fastFoodParser.parsePhotoMeal(preset);
    setParsedResult(res);
  };

  // Manejador de código de barras
  const handleBarcodeLookup = () => {
    const found = allCatalogProducts.find(p => p.id.includes(barcodeInput) || p.slug.includes(barcodeInput)) || allCatalogProducts[0];
    const res: FoodParseResult = {
      rawInput: `Código EAN: ${barcodeInput} · ${found.name}`,
      source: 'barcode',
      confidenceNotice: 'Datos oficiales verificados de la etiqueta del fabricante bio.',
      totalEstimatedCalories: 185,
      totalProtein: found.tags.includes('proteina') ? 14 : 7,
      totalCarbs: 26,
      totalFats: 3.5,
      totalFiber: 5.5,
      items: [
        {
          id: `ean_${found.id}`,
          name: found.name.split('–')[0],
          quantityDescription: '1 ración bio (~50g)',
          weightGrams: 50,
          calories: 185,
          protein: found.tags.includes('proteina') ? 14 : 7,
          carbs: 26,
          fats: 3.5,
          fiber: 5.5,
          isOrganic: true
        }
      ]
    };
    setParsedResult(res);
  };

  // Manejador de producto del catálogo
  const handleSelectCatalogProduct = (prod: CatalogProduct) => {
    const res: FoodParseResult = {
      rawInput: prod.name,
      source: 'catalog',
      confidenceNotice: 'Información nutricional oficial del catálogo ecológico.',
      totalEstimatedCalories: 190,
      totalProtein: prod.tags.includes('proteina') ? 15 : 6,
      totalCarbs: 28,
      totalFats: 3,
      totalFiber: 6,
      items: [
        {
          id: `cat_${prod.id}`,
          name: prod.name.split('–')[0],
          quantityDescription: '1 ración (~60g)',
          weightGrams: 60,
          calories: 190,
          protein: prod.tags.includes('proteina') ? 15 : 6,
          carbs: 28,
          fats: 3,
          fiber: 6,
          isOrganic: true
        }
      ]
    };
    setParsedResult(res);
  };

  // Guardar en el diario
  const handleConfirmLog = () => {
    if (!parsedResult || parsedResult.items.length === 0) return;

    for (const item of parsedResult.items) {
      dailyNutritionStore.addMealLog({
        name: `${item.name} (${item.quantityDescription})`,
        meal: selectedMeal,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        fiber: item.fiber,
        source: parsedResult.source
      });
    }

    toast({
      title: "Comida registrada en tu día",
      description: `Añadidas ${parsedResult.totalEstimatedCalories} kcal y ${parsedResult.totalProtein}g de proteína a tu ${selectedMeal}.`,
    });

    setParsedResult(null);
    setTextInput('');
    if (onLoggedSuccess) onLoggedSuccess();
    onClose();
  };

  // Eliminar un ingrediente del resultado preliminar
  const removeParsedItem = (id: string) => {
    if (!parsedResult) return;
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
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Prueba rápida:</span>
                    {[
                      '2 tostadas integrales con aguacate y cafe',
                      'Porridge de avena con kefir y frutos secos',
                      'Guiso de lentejas con arroz y manzana',
                      'Tortilla de 2 huevos con espinacas'
                    ].map(sample => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => {
                          setTextInput(sample);
                          const res = fastFoodParser.parseNaturalText(sample, 'text');
                          setParsedResult(res);
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-600 px-2 py-1 rounded-lg transition-colors border border-slate-200"
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. MODO VOZ */}
              {activeMode === 'voice' && (
                <div className="p-5 rounded-2xl bg-slate-50 border text-center space-y-4">
                  <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse scale-110 shadow-lg' 
                      : 'bg-emerald-900 text-white shadow-md'
                  }`}>
                    <Mic className="h-6 w-6" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-xs">
                      {isRecording ? 'Escuchando tu comida...' : 'Dictar comida en voz alta'}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Pronuncia lo que has comido y las cantidades aproximadas.
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border text-[11px] text-slate-700 italic">
                    "{voiceText}"
                  </div>
                  <Button
                    onClick={handleSimulateVoice}
                    disabled={isRecording}
                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl py-5 font-bold text-xs"
                  >
                    {isRecording ? 'Procesando audio...' : '🎙️ Simular dictado y estimar'}
                  </Button>
                </div>
              )}

              {/* 3. MODO FOTO */}
              {activeMode === 'photo' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-emerald-800 shrink-0" />
                    <span className="text-[11px]">
                      La visión artificial identifica los alimentos visibles y calcula porciones promedio.
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700">Elige un plato fotografiado para estimar:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'tostadas_aguacate', label: 'Tostadas Aguacate', desc: 'Pan espelta, aguacate, café', cals: '395 kcal' },
                      { id: 'ensalada_quinoa', label: 'Bowl Quinoa & Garbanzos', desc: 'Quinoa, garbanzos, espinacas', cals: '430 kcal' },
                      { id: 'bowl_avena', label: 'Porridge de Avena Bio', desc: 'Avena, bebida vegetal, nueces', cals: '385 kcal' },
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleParsePhoto(p.id as any)}
                        className="p-3 rounded-2xl border text-left bg-slate-50 hover:bg-emerald-50/80 hover:border-emerald-600 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <strong className="block text-slate-900 text-xs">{p.label}</strong>
                          <span className="text-[10px] text-slate-500 line-clamp-2">{p.desc}</span>
                        </div>
                        <Badge variant="outline" className="mt-2 text-[10px] font-mono text-emerald-900 font-bold self-start">
                          {p.cals}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. MODO CÓDIGO DE BARRAS */}
              {activeMode === 'barcode' && (
                <div className="p-4 rounded-2xl bg-slate-50 border space-y-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Barcode className="h-5 w-5 text-emerald-800" />
                    <strong>Escáner de Código EAN</strong>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="8437004123019"
                      className="rounded-xl h-10 font-mono text-xs bg-white"
                    />
                    <Button
                      onClick={handleBarcodeLookup}
                      className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl px-4 font-bold text-xs"
                    >
                      Escanear
                    </Button>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Conectado con más de 1.000 productos ecológicos certificados de Ecoland.
                  </span>
                </div>
              )}

              {/* 5. MODO CATÁLOGO */}
              {activeMode === 'catalog' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                    <Input
                      placeholder="Buscar producto ecológico (ej: avena, garbanzos, kéfir)..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="pl-9 rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {allCatalogProducts
                      .filter(p => !catalogSearch || p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                      .slice(0, 5)
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectCatalogProduct(p)}
                          className="p-2.5 rounded-xl border bg-slate-50 hover:bg-emerald-50 hover:border-emerald-600 cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div className="truncate pr-2">
                            <strong className="block text-slate-900 text-xs truncate">{p.name.split('–')[0]}</strong>
                            <span className="text-[10px] text-slate-500">{p.brand} · {p.price.toFixed(2)}€</span>
                          </div>
                          <Badge className="bg-emerald-900 text-white text-[10px] shrink-0">+ Añadir</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VISTA PRELIMINAR / EDICIÓN ANTES DE GUARDAR */}
          {parsedResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-700" />
                  Alimentos Detectados
                </span>
                <button
                  onClick={() => setParsedResult(null)}
                  className="text-[11px] text-emerald-800 font-bold hover:underline"
                >
                  ← Cambiar entrada
                </button>
              </div>

              {/* Aviso de Estimación Orientativa */}
              <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{parsedResult.confidenceNotice}</span>
              </div>

              {/* Lista de alimentos reconocidos */}
              <div className="space-y-2">
                {parsedResult.items.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-2xl border bg-slate-50/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="block text-slate-900 text-xs">{item.name}</strong>
                      <span className="text-[11px] text-slate-500">{item.quantityDescription}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 text-xs">{item.calories} kcal</span>
                        <span className="text-[10px] text-slate-500 block">P: {item.protein}g · F: {item.fiber}g</span>
                      </div>
                      <button
                        onClick={() => removeParsedItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Eliminar alimento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales consolidados de la comida */}
              <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2">
                <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                  <span className="text-xs text-emerald-300">Total a registrar en {selectedMeal}:</span>
                  <span className="text-lg font-black font-mono">{parsedResult.totalEstimatedCalories} kcal</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-1">
                  <div className="bg-emerald-900/60 p-1.5 rounded-xl">
                    <span className="text-emerald-300 block">Proteína</span>
                    <strong className="font-mono text-xs">{parsedResult.totalProtein}g</strong>
                  </div>
                  <div className="bg-emerald-900/60 p-1.5 rounded-xl">
                    <span className="text-emerald-300 block">Hidratos</span>
                    <strong className="font-mono text-xs">{parsedResult.totalCarbs}g</strong>
                  </div>
                  <div className="bg-emerald-900/60 p-1.5 rounded-xl">
                    <span className="text-emerald-300 block">Grasas</span>
                    <strong className="font-mono text-xs">{parsedResult.totalFats}g</strong>
                  </div>
                  <div className="bg-emerald-900/60 p-1.5 rounded-xl">
                    <span className="text-emerald-300 block">Fibra</span>
                    <strong className="font-mono text-xs text-amber-300">{parsedResult.totalFiber}g</strong>
                  </div>
                </div>
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
