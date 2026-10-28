import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  recipeQueueService,
  ManagedRecipe,
  RecipeQueueStatus,
  RecipePantryMatch
} from '@/services/recipeQueueService';
import { CookingModeModal } from './CookingModeModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ChefHat,
  Sparkles,
  Bookmark,
  Pin,
  Clock,
  Flame,
  ArrowRight,
  Plus,
  Play,
  Heart,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface RecipeInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCookRecipeSuccess?: () => void;
}

export const RecipeInboxModal: React.FC<RecipeInboxModalProps> = ({
  isOpen,
  onClose,
  onCookRecipeSuccess
}) => {
  const [recipes, setRecipes] = useState<ManagedRecipe[]>([]);
  const [activeTab, setActiveTab] = useState<RecipeQueueStatus | 'PINNED'>('QUEUE');
  const [recommendations, setRecommendations] = useState<RecipePantryMatch[]>([]);
  const [selectedRecipeForCooking, setSelectedRecipeForCooking] = useState<ManagedRecipe | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const list = recipeQueueService.getRecipes();
    setRecipes(list);
    setRecommendations(recipeQueueService.getSmartMealRecommendations());
  };

  const handleStatusChange = (recipeId: string, status: RecipeQueueStatus) => {
    recipeQueueService.setRecipeStatus(recipeId, status);
    loadData();
  };

  const handleTogglePin = (recipeId: string) => {
    recipeQueueService.togglePinned(recipeId);
    loadData();
  };

  const handleStartCooking = (recipe: ManagedRecipe) => {
    setSelectedRecipeForCooking(recipe);
  };

  // Filtrado de recetas según pestaña activa
  const filteredRecipes = recipes.filter(r => {
    if (activeTab === 'PINNED') return r.isPinned && r.queueStatus !== 'ARCHIVED';
    return r.queueStatus === activeTab;
  });

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Recipe Inbox & Smart Meal Planner
                    </h2>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                      P3-B & P3-C
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Cruce de recetas con despensa · Cola semanal sin estrés · Modo Cocina manos libres
                  </p>
                </div>
              </div>

              <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full w-8 h-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Smart Meal Matcher Banner (Aprovechamiento Despensa) */}
            {recommendations.length > 0 && (
              <div className="px-5 py-3.5 bg-emerald-50/80 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-emerald-950 font-bold block">
                      Recomendación Smart: {recommendations[0].recipe.title}
                    </strong>
                    <span className="text-[11px] text-emerald-800">
                      Tienes el <strong>{recommendations[0].pantryCoveredPercent}% en casa</strong>
                      {recommendations[0].rescuesExpiringItems.length > 0 &&
                        ` · Rescata: ${recommendations[0].rescuesExpiringItems.join(', ')}`}
                      {recommendations[0].missingCostEstimateEuro === 0
                        ? ' · 0€ de gasto adicional'
                        : ` · ~${recommendations[0].missingCostEstimateEuro.toFixed(2)}€ faltante`}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleStartCooking(recommendations[0].recipe)}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs h-7 px-3 gap-1.5 shrink-0"
                >
                  <Play className="w-3 h-3" />
                  <span>Cocinar en Modo 2.0</span>
                </Button>
              </div>
            )}

            {/* Selector de Pestañas de la Cola */}
            <div className="p-3 sm:p-4 border-b bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'QUEUE', label: 'En Cola Esta Semana' },
                  { id: 'INBOX', label: 'Por Probar (Inbox)' },
                  { id: 'HABITUAL', label: 'Habituales del Hogar' },
                  { id: 'PINNED', label: '📌 Fijadas' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-400 font-medium">
                {filteredRecipes.length} receta{filteredRecipes.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Listado de Recetas */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              {filteredRecipes.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No hay recetas en esta sección.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredRecipes.map(recipe => {
                    const match = recipeQueueService.evaluateRecipePantryMatch(recipe);
                    return (
                      <div
                        key={recipe.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <strong className="text-sm font-bold text-slate-900 block leading-tight">
                                {recipe.title}
                              </strong>
                              <span className="text-[11px] text-slate-500">{recipe.sourceAttribution}</span>
                            </div>
                            <button
                              onClick={() => handleTogglePin(recipe.id)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                recipe.isPinned
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Métricas Nutricionales y Tiempo */}
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {recipe.prepTimeMinutes}m
                            </span>
                            <span>·</span>
                            <span>{recipe.estimatedCalories} kcal</span>
                            <span>·</span>
                            <span className="text-emerald-800 font-bold">{recipe.estimatedFiber}g fibra</span>
                          </div>

                          {/* Badges de Cruce con Despensa */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold ${
                                match.pantryCoveredPercent >= 75
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                  : 'bg-amber-50 text-amber-900 border-amber-300'
                              }`}
                            >
                              {match.pantryCoveredPercent}% en casa
                            </Badge>

                            {match.missingCostEstimateEuro === 0 ? (
                              <Badge className="bg-emerald-100 text-emerald-900 border-none text-[10px] font-bold">
                                0€ gasto
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] font-mono">
                                +{match.missingCostEstimateEuro.toFixed(2)}€
                              </Badge>
                            )}

                            {match.rescuesExpiringItems.length > 0 && (
                              <Badge className="bg-purple-100 text-purple-900 border-none text-[9px] font-bold">
                                Rescata alimento próximo
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="pt-2 border-t flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            {recipe.queueStatus !== 'QUEUE' && (
                              <button
                                onClick={() => handleStatusChange(recipe.id, 'QUEUE')}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-medium"
                              >
                                En cola
                              </button>
                            )}
                            {recipe.queueStatus !== 'HABITUAL' && (
                              <button
                                onClick={() => handleStatusChange(recipe.id, 'HABITUAL')}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-medium"
                              >
                                Habitual
                              </button>
                            )}
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleStartCooking(recipe)}
                            className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold px-3 h-8 gap-1.5"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Modo Cocina</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Modal Inmersivo de Modo Cocina 2.0 */}
      <CookingModeModal
        recipe={selectedRecipeForCooking}
        isOpen={!!selectedRecipeForCooking}
        onClose={() => setSelectedRecipeForCooking(null)}
        onRecipeCompleted={() => {
          setSelectedRecipeForCooking(null);
          loadData();
          if (onCookRecipeSuccess) onCookRecipeSuccess();
        }}
      />
    </>
  );
};

export default RecipeInboxModal;
