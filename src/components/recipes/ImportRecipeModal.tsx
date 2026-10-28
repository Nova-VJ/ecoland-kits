import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link2, FileText, Camera, Check, AlertCircle, ShoppingBag, 
  Calendar, BookOpen, Utensils, X, Sparkles, ChefHat 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { recipeImportService } from '@/services/recipeImportService';
import { dailyNutritionStore, ImportedRecipe } from '@/services/dailyNutritionStore';

interface ImportRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeSaved?: (recipe: ImportedRecipe) => void;
}

export const ImportRecipeModal = ({ isOpen, onClose, onRecipeSaved }: ImportRecipeModalProps) => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'photo'>('url');
  const [urlInput, setUrlInput] = useState('https://recetas.bio/curry-garbanzos');
  const [textInput, setTextInput] = useState('');
  const [parsedRecipe, setParsedRecipe] = useState<ImportedRecipe | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [missingAdded, setMissingAdded] = useState(false);

  if (!isOpen) return null;

  const handleParse = () => {
    setIsProcessing(true);
    setMissingAdded(false);
    setTimeout(() => {
      let raw = '';
      if (activeTab === 'url') raw = urlInput;
      else if (activeTab === 'text') raw = textInput || 'Bowl de quinoa con garbanzos y espinacas';
      else raw = 'Foto de plato mediterráneo';

      const res = recipeImportService.parseRecipe({
        type: activeTab,
        rawInput: raw
      });

      setParsedRecipe(res);
      setIsProcessing(false);
    }, 400);
  };

  const handleSaveRecipe = () => {
    if (!parsedRecipe) return;
    const saved = dailyNutritionStore.saveImportedRecipe(parsedRecipe);
    toast({
      title: "¡Receta guardada!",
      description: `"${saved.title}" añadida a tus recetas privadas con atribución a la fuente original.`
    });
    if (onRecipeSaved) onRecipeSaved(saved);
    onClose();
  };

  const handleAddMissingToShoppingList = () => {
    if (!parsedRecipe) return;
    const count = recipeImportService.addMissingIngredientsToShoppingList(parsedRecipe);
    setMissingAdded(true);
    toast({
      title: "Lista de compra actualizada",
      description: `Se han añadido ${count} ingredientes faltantes a tu lista de la compra (sin enviar al carrito).`
    });
  };

  const handleAddToWeek = () => {
    if (!parsedRecipe) return;
    dailyNutritionStore.trackEvent('recipe_added_to_week', { title: parsedRecipe.title });
    toast({
      title: "Añadida a Mi Semana",
      description: `"${parsedRecipe.title}" programada para planificar tus comidas familiares.`
    });
  };

  const handleLogToDiary = () => {
    if (!parsedRecipe) return;
    dailyNutritionStore.logRecipeToDiary(
      parsedRecipe.title,
      1,
      parsedRecipe.estimatedCalories,
      parsedRecipe.estimatedProtein,
      'comida'
    );
    toast({
      title: "Registrado en tu diario de hoy",
      description: `Añadido ${parsedRecipe.title} (${parsedRecipe.estimatedCalories} kcal).`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-xl w-full border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-white">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Importador Universal de Recetas</h3>
              <p className="text-[11px] text-emerald-300">Pega un enlace web, texto libre o foto de cualquier receta</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-900 text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Selector de modo de importación */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl">
            {[
              { id: 'url', label: 'Enlace Web (URL)', icon: Link2 },
              { id: 'text', label: 'Texto Libre', icon: FileText },
              { id: 'photo', label: 'Foto / Captura', icon: Camera }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setParsedRecipe(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold transition-all text-xs ${
                    isActive ? 'bg-white text-emerald-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {/* Formulario de entrada */}
          {!parsedRecipe && (
            <div className="space-y-3">
              {activeTab === 'url' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Enlace de la receta externa:</label>
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/receta-quinoa"
                    className="rounded-xl h-10 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Preservamos siempre la atribución y enlace a la fuente original.
                  </span>
                </div>
              )}

              {activeTab === 'text' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Pega los ingredientes y preparación:</label>
                  <textarea
                    rows={4}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Ejemplo:&#10;Guiso de garbanzos con espinacas&#10;- 200g garbanzos cocidos&#10;- una taza de espinacas&#10;- 2 cucharadas de AOVE"
                    className="w-full rounded-2xl border p-3 text-xs bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              )}

              {activeTab === 'photo' && (
                <div className="p-6 border-2 border-dashed border-emerald-300 rounded-2xl text-center space-y-2 bg-emerald-50/40">
                  <Camera className="w-8 h-8 text-emerald-700 mx-auto" />
                  <strong className="block text-slate-800 text-xs">Captura de libro o pantalla</strong>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Reconocimiento óptico de ingredientes y pasos de cocina.
                  </p>
                </div>
              )}

              <Button
                onClick={handleParse}
                disabled={isProcessing}
                className="w-full py-5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Normalizando ingredientes...' : 'Importar y estructurar receta'}</span>
              </Button>
            </div>
          )}

          {/* Vista previa de receta estructurada con cruce contra despensa */}
          {parsedRecipe && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-slate-50 border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-800 font-bold">
                    {parsedRecipe.sourceAttribution}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    ⏱ {parsedRecipe.prepTimeMinutes} min · {parsedRecipe.servings} raciones
                  </Badge>
                </div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {parsedRecipe.title}
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span>~{parsedRecipe.estimatedCalories} kcal</span>
                  <span>·</span>
                  <span>Prot: {parsedRecipe.estimatedProtein}g</span>
                  <span>·</span>
                  <span>Fibra: {parsedRecipe.estimatedFiber}g</span>
                </div>
              </div>

              {/* Cruce Inteligente contra Despensa */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Ingredientes normalizados ({parsedRecipe.ingredients.filter(i => i.inPantry).length}/{parsedRecipe.ingredients.length} en tu despensa):</span>
                </div>

                <div className="space-y-1.5">
                  {parsedRecipe.ingredients.map((ing, idx) => (
                    <div 
                      key={idx}
                      className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                        ing.inPantry ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {ing.inPantry ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-900 truncate">
                          {ing.raw}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                          ({ing.amount} {ing.unit})
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold shrink-0 ${ing.inPantry ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {ing.inPantry ? 'YA TIENES (0€)' : `TE FALTA (~${ing.estimatedPriceEuro?.toFixed(2)}€)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones directas sobre la receta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t">
                {parsedRecipe.ingredients.some(i => !i.inPantry) && (
                  <Button
                    onClick={handleAddMissingIngredientsToShoppingList}
                    disabled={missingAdded}
                    variant="outline"
                    className="py-5 rounded-xl border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-700" />
                    <span>{missingAdded ? '✓ Faltantes en Lista' : 'Añadir faltantes a Lista'}</span>
                  </Button>
                )}

                <Button
                  onClick={handleSaveRecipe}
                  className="py-5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Guardar en Mis Recetas</span>
                </Button>

                <Button
                  onClick={handleAddToWeek}
                  variant="outline"
                  className="py-5 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Añadir a Mi Semana</span>
                </Button>

                <Button
                  onClick={handleLogToDiary}
                  variant="outline"
                  className="py-5 rounded-xl border-emerald-300 text-emerald-900 hover:bg-emerald-50 font-bold text-xs gap-1.5"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Registrar en mi día</span>
                </Button>
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={() => setParsedRecipe(null)}
                  className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                >
                  Importar otra receta
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
