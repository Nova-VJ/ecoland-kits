import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, ChefHat, CheckCircle2, Bookmark, Calendar, 
  ShoppingBag, Shield, Clock, AlertTriangle, ArrowRight, Bot, Info, Box,
  Camera, Scale, Utensils, RefreshCw, Check, ThumbsUp, ThumbsDown,
  Mic, MicOff, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { useHealthProfile } from '@/context/HealthProfileContext';
import { ecoCoachService, CoachResponse, CoachAction } from '@/services/ecoCoachService';
import { productInsightsService } from '@/services/productInsightsService';
import { dailyNutritionStore } from '@/services/dailyNutritionStore';
import { foodVisionEngine, IdentifiedFoodResult } from '@/lib/foodVisionEngine';
import { CatalogProduct } from '@/data/catalog/individual-products';

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text?: string;
  photoUrl?: string;
  response?: CoachResponse;
  timestamp: string;
}

const SUGGESTED_QUERIES = [
  '🎙️ Dictar comida por voz',
  '📸 Analizar plato por foto',
  '¿Qué puedo cenar hoy en 10 minutos?',
  'Me quedan 5 minutos, ¿qué hago?',
  '¿Qué puedo comer con más fibra?',
  '¿Tengo suficiente proteína hoy?',
  '¿Qué debería consumir antes de que se estropee?',
  'Ayúdame a planificar tres cenas baratas'
];

export const EcoCoach = () => {
  const { toast } = useToast();
  const { addCatalogProduct, setIsOpen } = useCart();
  const { profile } = useHealthProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Mensaje inicial de bienvenida contextual adaptado al perfil
    const initialResp = ecoCoachService.queryCoach({ 
      text: '¿Qué puedo cenar hoy?',
      avoidAllergens: profile.avoidAllergens 
    });
    return [
      {
        id: 'msg_welcome',
        sender: 'coach',
        response: {
          ...initialResp,
          title: '¡Hola! Soy tu EcoCoach Contextual',
          message: `He revisado tu diario de hoy, tu despensa y tus preferencias${profile.avoidAllergens.length > 0 ? ` (evitando: ${profile.avoidAllergens.join(', ')})` : ''}. Puedes dictarme comidas por voz con el micrófono 🎙️, subir fotos de platos para contar calorías o pedirme recetas rápidas sin compras innecesarias. ¿Qué necesitas hoy?`
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [isTyping, setIsTyping] = useState(false);
  const [feedbackState, setFeedbackState] = useState<Record<string, { isHelpful: boolean; negativeReason?: string }>>({});
  const [negativePromptMsgId, setNegativePromptMsgId] = useState<string | null>(null);

  const handleFeedback = (msgId: string, query: string, title: string, isHelpful: boolean) => {
    if (!isHelpful) {
      setNegativePromptMsgId(msgId);
    } else {
      productInsightsService.recordCoachFeedback({
        query,
        responseTitle: title,
        isHelpful: true
      });
      setFeedbackState(prev => ({ ...prev, [msgId]: { isHelpful: true } }));
      toast({ title: '¡Gracias!', description: 'Nos ayuda a adaptar tus futuras sugerencias.' });
    }
  };

  const handleSelectNegativeReason = (msgId: string, query: string, title: string, reason: any) => {
    productInsightsService.recordCoachFeedback({
      query,
      responseTitle: title,
      isHelpful: false,
      negativeReason: reason
    });
    setFeedbackState(prev => ({ ...prev, [msgId]: { isHelpful: false, negativeReason: reason } }));
    setNegativePromptMsgId(null);
    toast({ title: 'Preferencia guardada', description: 'Ajustaremos las recomendaciones culinarias.' });
  };

  const handleSendQuery = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const coachResp = ecoCoachService.queryCoach({ 
        text: query,
        avoidAllergens: profile.avoidAllergens 
      });
      productInsightsService.recordCoachResponseShown(query, coachResp.title);
      const coachMsg: ChatMessage = {
        id: `msg_c_${Date.now()}`,
        sender: 'coach',
        response: coachResp,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, coachMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: 'Dictado no soportado',
        description: 'Tu navegador no tiene activado el reconocimiento por voz nativo. Puedes escribir tu consulta en el recuadro.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: '🎙️ Escuchando...',
          description: 'Di lo que has comido o tu consulta (ej: "He comido ensalada con garbanzos").'
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleSendQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const queryHint = fileName.includes('lenteja') ? 'lentejas estofadas'
      : fileName.includes('garbanzo') ? 'garbanzos espinacas'
      : fileName.includes('avena') || fileName.includes('porridge') ? 'porridge de avena'
      : fileName.includes('quinoa') ? 'bowl de quinoa'
      : fileName.includes('calabacin') || fileName.includes('crema') ? 'crema de calabacin'
      : fileName.includes('tostada') || fileName.includes('aguacate') ? 'tostada de aguacate'
      : fileName.includes('arroz') ? 'arroz salteado'
      : 'ensalada mediterranea';

    const previewUrl = URL.createObjectURL(file);

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: `📸 Foto enviada: ${file.name}`,
      photoUrl: previewUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const coachResp = ecoCoachService.queryCoach({ 
        text: `foto de ${queryHint}`,
        photoUrlOrBase64: previewUrl,
        avoidAllergens: profile.avoidAllergens
      });
      productInsightsService.recordCoachResponseShown('photo_analysis', coachResp.title);
      const coachMsg: ChatMessage = {
        id: `msg_c_${Date.now()}`,
        sender: 'coach',
        response: coachResp,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, coachMsg]);
      setIsTyping(false);
    }, 550);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdatePortion = (msgId: string, currentVision: IdentifiedFoodResult, mult: number) => {
    const updatedVision = foodVisionEngine.identifyMeal(currentVision.detectedDishName, mult);
    setMessages(prev => prev.map(msg => {
      if (msg.id !== msgId || !msg.response) return msg;
      return {
        ...msg,
        response: {
          ...msg.response,
          title: `📸 Reconocimiento de Comida: ${updatedVision.detectedDishName} (${mult}x)`,
          visionCard: updatedVision,
          recipeCard: msg.response.recipeCard ? {
            ...msg.response.recipeCard,
            calories: updatedVision.calories,
            protein: updatedVision.proteinGrams,
            fiber: updatedVision.fiberGrams
          } : undefined,
          actions: [
            {
              id: 'act_confirm_vision_updated',
              label: `✓ Confirmar y registrar ${updatedVision.calories} kcal`,
              type: 'log_diary',
              payload: {
                title: `${updatedVision.detectedDishName} (${mult}x)`,
                cals: updatedVision.calories,
                prot: updatedVision.proteinGrams,
                fiber: updatedVision.fiberGrams,
                meal: 'comida'
              }
            }
          ]
        }
      };
    }));
    toast({
      title: `Porción ajustada (${mult}x)`,
      description: `Recalculado a ${updatedVision.calories} kcal y ${updatedVision.proteinGrams}g de proteína.`
    });
  };

  const handleSelectAlternativeDish = (msgId: string, alternativeDishName: string) => {
    const newVision = foodVisionEngine.identifyMeal(alternativeDishName);
    setMessages(prev => prev.map(msg => {
      if (msg.id !== msgId || !msg.response) return msg;
      return {
        ...msg,
        response: {
          ...msg.response,
          title: `📸 Reconocimiento de Comida: ${newVision.detectedDishName}`,
          message: `Plato actualizado a ${newVision.detectedDishName}. Estimo ${newVision.calories} kcal y ${newVision.proteinGrams}g de proteína. ¿Deseas registrarlo en tu diario?`,
          visionCard: newVision,
          actions: [
            {
              id: 'act_confirm_alt_vision',
              label: `✓ Confirmar y registrar ${newVision.calories} kcal`,
              type: 'log_diary',
              payload: {
                title: newVision.detectedDishName,
                cals: newVision.calories,
                prot: newVision.proteinGrams,
                fiber: newVision.fiberGrams,
                meal: 'comida'
              }
            }
          ]
        }
      };
    }));
    toast({
      title: 'Plato actualizado',
      description: `Cambiado a ${newVision.detectedDishName} (${newVision.calories} kcal).`
    });
  };

  const handleAddToCart = (product: CatalogProduct) => {
    addCatalogProduct(product);
    setIsOpen(true);
    toast({
      title: 'Añadido a tu cesta',
      description: `${product.name} listo en tu pedido.`
    });
  };

  const handleExecuteAction = (action: CoachAction) => {
    if (action.type === 'add_to_cart' && action.payload) {
      handleAddToCart(action.payload);
      return;
    }

    const res = ecoCoachService.executeAction(action);
    productInsightsService.recordCoachActionClicked(action.type as any);
    productInsightsService.recordMeaningfulAction('coach_action_executed');
    toast({
      title: action.label,
      description: res.feedbackMessage
    });
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'DATO':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'ESTIMACIÓN':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'SUGERENCIA':
      default:
        return 'bg-emerald-100 text-emerald-950 border-emerald-300';
    }
  };

  return (
    <div className="section-padding bg-slate-50/50 min-h-screen">
      <div className="container-eco max-w-4xl space-y-6">
        
        {/* Cabecera Principal */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-700 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Compañero Alimentario Inteligente
                </span>
                <h1 className="font-display text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  EcoCoach Contextual
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] font-medium border-emerald-300 text-emerald-900 bg-emerald-50/50">
                🌱 Despensa Primero (0€ gasto)
              </Badge>
              {profile.avoidAllergens.length > 0 && (
                <Badge variant="outline" className="text-[11px] font-medium border-amber-300 text-amber-900 bg-amber-50">
                  🛡️ Sin: {profile.avoidAllergens.join(', ')}
                </Badge>
              )}
              <Badge variant="outline" className="text-[11px] font-medium border-slate-300 text-slate-600">
                🔒 100% Privado
              </Badge>
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Pregúntale lo que necesitas en cualquier momento, dicta por voz 🎙️ o sube una foto de tu comida. El EcoCoach consulta tu despensa, respeta tus alergias, cuenta calorías por foto con confirmación previa y te sugiere recetas rápidas.
          </p>

          {/* Chips de Consultas Rápidas */}
          <div className="pt-2 border-t space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
              Consultas y Reconocimiento Rápido:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (q.includes('Dictar')) handleToggleVoice();
                    else handleSendQuery(q);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                    q.startsWith('🎙️')
                      ? 'bg-emerald-100/80 hover:bg-emerald-200/80 border-emerald-400 text-emerald-950 font-bold'
                      : q.startsWith('📸')
                      ? 'bg-amber-50 hover:bg-amber-100/80 border-amber-300 text-amber-950 font-bold'
                      : 'bg-slate-100 hover:bg-emerald-100/70 border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-950'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Historial de Mensajes / Conversación */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'user' ? (
                <div className="bg-emerald-900 text-white rounded-3xl rounded-tr-xs px-5 py-3 max-w-lg shadow-sm text-xs md:text-sm space-y-2">
                  {msg.photoUrl && (
                    <img 
                      src={msg.photoUrl} 
                      alt="Foto subida" 
                      className="w-full max-h-48 object-cover rounded-2xl border border-white/20" 
                    />
                  )}
                  <p>{msg.text}</p>
                  <span className="text-xs text-emerald-300 block text-right mt-1 tabular-nums">
                    {msg.timestamp}
                  </span>
                </div>
              ) : (
                <div className="bg-white rounded-3xl rounded-tl-xs p-5 md:p-6 max-w-2xl border shadow-xs space-y-3.5 text-xs">
                  {msg.response && (
                    <>
                      <div className="flex items-center justify-between gap-2 border-b pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {msg.response.title}
                          </span>
                          <Badge className={`text-xs font-black border uppercase tracking-wider ${getBadgeStyle(msg.response.infoType)}`}>
                            {msg.response.infoType}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500 tabular-nums">
                          {msg.timestamp}
                        </span>
                      </div>

                      <p className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {msg.response.message}
                      </p>

                      {/* Tarjeta Interactiva de Food Vision (Foto & Calorías) si aplica */}
                      {msg.response.visionCard && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/60 border border-emerald-300/80 shadow-2xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold">
                                📸
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                                  Reconocimiento Calibrado ({msg.response.visionCard.confidenceLevel})
                                </span>
                                <strong className="text-xs md:text-sm text-slate-900 block">
                                  {msg.response.visionCard.detectedDishName}
                                </strong>
                              </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-950 border-emerald-300 text-[11px] font-bold">
                              ✓ {msg.response.visionCard.confidencePercent}% Confianza
                            </Badge>
                          </div>

                          {/* Contador de Calorías y Macros visual */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                            <div className="p-2.5 rounded-xl bg-white border border-emerald-200/90 shadow-2xs">
                              <span className="text-[10px] text-slate-500 block uppercase font-bold">Calorías</span>
                              <span className="text-base md:text-lg font-black text-emerald-950 tabular-nums">
                                {msg.response.visionCard.calories}
                              </span>
                              <span className="text-[10px] text-slate-400 block">kcal</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                              <span className="text-[10px] text-slate-500 block uppercase font-bold">Proteína</span>
                              <span className="text-sm md:text-base font-bold text-slate-900 tabular-nums">
                                {msg.response.visionCard.proteinGrams}g
                              </span>
                              <span className="text-[10px] text-slate-400 block">vegetal</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                              <span className="text-[10px] text-slate-500 block uppercase font-bold">Fibra</span>
                              <span className="text-sm md:text-base font-bold text-emerald-800 tabular-nums">
                                {msg.response.visionCard.fiberGrams}g
                              </span>
                              <span className="text-[10px] text-slate-400 block">saludable</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                              <span className="text-[10px] text-slate-500 block uppercase font-bold">Hidratos</span>
                              <span className="text-sm md:text-base font-bold text-slate-700 tabular-nums">
                                {msg.response.visionCard.carbsGrams}g
                              </span>
                              <span className="text-[10px] text-slate-400 block">lenta absorción</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
                              <span className="text-[10px] text-slate-500 block uppercase font-bold">Ración</span>
                              <span className="text-sm md:text-base font-bold text-slate-700 tabular-nums">
                                ~{msg.response.visionCard.servingGrams}g
                              </span>
                              <span className="text-[10px] text-slate-400 block">peso plato</span>
                            </div>
                          </div>

                          {/* Selector de Ajuste de Porción */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                              <Scale className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Ajustar tamaño de porción consumida:</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: '½ Ración (ligera)', mult: 0.5 },
                                { label: '1x Ración estándar', mult: 1.0 },
                                { label: '1.5x Ración generosa', mult: 1.5 },
                                { label: '2x Doble plato', mult: 2.0 },
                              ].map((scale) => (
                                <button
                                  key={scale.mult}
                                  onClick={() => handleUpdatePortion(msg.id, msg.response!.visionCard!, scale.mult)}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white hover:bg-emerald-100 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-950 transition-colors"
                                >
                                  {scale.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Confirmación previa y opciones alternativas si no era ese plato */}
                          <div className="space-y-1.5 pt-1 border-t border-emerald-100">
                            <span className="text-[11px] font-bold text-slate-700 block">
                              ¿No era este plato? Pulsa en el correcto para recalcular al instante:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.response.visionCard.alternativeOptions.map((alt) => (
                                <button
                                  key={alt.key}
                                  onClick={() => handleSelectAlternativeDish(msg.id, alt.name)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-medium text-emerald-900 transition-colors"
                                >
                                  {alt.name} ({alt.calories} kcal)
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Recomendación de receta / mejora de calidad */}
                          {msg.response.visionCard.recipeRecommendation && (
                            <div className="p-3 rounded-xl bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                              <strong className="block text-[11px] uppercase tracking-wider text-emerald-900 font-bold">
                                💡 {msg.response.visionCard.recipeRecommendation.title}
                              </strong>
                              <p className="text-[11px] leading-relaxed text-emerald-900/90">
                                {msg.response.visionCard.recipeRecommendation.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tarjeta de Receta Accionable si aplica (cuando no es visionCard) */}
                      {msg.response.recipeCard && !msg.response.visionCard && (
                        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <strong className="text-xs md:text-sm text-emerald-950 block">
                                {msg.response.recipeCard.title}
                              </strong>
                              <span className="text-[11px] text-emerald-800">
                                ⏱ {msg.response.recipeCard.prepTimeMinutes} min · {msg.response.recipeCard.servings} ración
                              </span>
                            </div>
                            <div className="flex items-center gap-2 tabular-nums text-[11px] font-bold text-emerald-900">
                              <span>{msg.response.recipeCard.calories} kcal</span>
                              <span>·</span>
                              <span>P: {msg.response.recipeCard.protein}g</span>
                              <span>·</span>
                              <span>F: {msg.response.recipeCard.fiber}g</span>
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-600 border-t border-emerald-200/60 pt-2">
                            <span className="font-bold text-emerald-950 block">Pasos de preparación rápida:</span>
                            <ol className="list-decimal list-inside space-y-1">
                              {msg.response.recipeCard.steps.map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )}

                      {/* Tarjeta de Producto Ecológico Recomendado (1-Tap Add to Cart) */}
                      {msg.response.recommendedProduct && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <img
                              src={msg.response.recommendedProduct.image}
                              alt={msg.response.recommendedProduct.name}
                              className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-emerald-200 shrink-0"
                            />
                            <div>
                              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                                Ingrediente Bio Recomendado
                              </span>
                              <strong className="text-xs md:text-sm text-slate-900 line-clamp-1 block">
                                {msg.response.recommendedProduct.name}
                              </strong>
                              <span className="text-xs font-black text-emerald-950">
                                {msg.response.recommendedProduct.price.toFixed(2)} €
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleAddToCart(msg.response!.recommendedProduct!)}
                            size="sm"
                            className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9 px-4 gap-1.5 shrink-0 shadow-xs w-full sm:w-auto"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Añadir a mi cesta</span>
                          </Button>
                        </div>
                      )}

                      {/* Botones de Acción Directa (Cerrar el Bucle) */}
                      {msg.response.actions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                          {msg.response.actions.map(act => (
                            <Button
                              key={act.id}
                              onClick={() => handleExecuteAction(act)}
                              size="sm"
                              className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl h-9 px-3 gap-1.5 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{act.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Contexto Utilizado (Basado en tus datos) */}
                      <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Shield className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Basado en tus datos (Contexto utilizado):</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-600 pl-5">
                          <span className="flex items-center gap-1 text-emerald-800 font-medium">✓ Tu despensa</span>
                          <span className="flex items-center gap-1 text-emerald-800 font-medium">✓ Tu diario de hoy</span>
                          <span className="flex items-center gap-1 text-emerald-800 font-medium">✓ Tu plan semanal</span>
                          {profile.avoidAllergens.length > 0 && (
                            <span className="flex items-center gap-1 text-amber-800 font-medium">✓ Alergias filtradas</span>
                          )}
                        </div>
                        <div className="pl-5 flex items-center gap-1 text-xs text-slate-500">
                          <Info className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>Fundamentado en: {msg.response.dataGrounding}</span>
                        </div>
                      </div>

                      {/* Feedback Discreto del Coach */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100/80 text-[11px]">
                        <span className="text-slate-500 text-xs">¿Te sirvió esta sugerencia?</span>
                        
                        {feedbackState[msg.id] ? (
                          <span className="text-emerald-800 font-bold text-xs flex items-center gap-1">
                            ✓ {feedbackState[msg.id].isHelpful ? 'Valoración positiva registrada' : 'Preferencia guardada'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleFeedback(msg.id, msg.text || '', msg.response?.title || '', true)}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-950 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <span>👍</span>
                              <span>Sí</span>
                            </button>
                            <button
                              onClick={() => handleFeedback(msg.id, msg.text || '', msg.response?.title || '', false)}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-950 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <span>👎</span>
                              <span>No mucho</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Selector de Motivo de Rechazo Si Seleccionó Negativo */}
                      {negativePromptMsgId === msg.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5"
                        >
                          <span className="text-[11px] font-bold text-amber-950 block">
                            Cuéntanos brevemente para afinar futuras sugerencias:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {[
                              { id: 'no_ingredients', label: 'No tenía esos ingredientes' },
                              { id: 'too_much_time', label: 'Demasiado tiempo' },
                              { id: 'too_expensive', label: 'Demasiado caro' },
                              { id: 'did_not_feel_like_it', label: 'No me apetecía' },
                              { id: 'not_what_i_wanted', label: 'No era lo que buscaba' },
                              { id: 'other', label: 'Otro' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => handleSelectNegativeReason(msg.id, msg.text || '', msg.response?.title || '', opt.id)}
                                className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-200 text-xs font-semibold text-amber-900 transition-colors"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl p-4 border text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                <Sparkles className="w-4 h-4 text-emerald-700 animate-spin" />
                <span>EcoCoach analizando tu despensa y objetivos...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Barra de Entrada / Consulta Personalizada + Voz + Cámara */}
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl border shadow-lg space-y-2">
          {isListening && (
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <strong className="font-bold">Escuchando en vivo:</strong>
              <span>Habla con naturalidad sobre lo que has comido o tu consulta culinaria...</span>
            </div>
          )}

          {/* Input oculto para subida de imagen de comida */}
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            onChange={handlePhotoUpload} 
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            {/* Botón de Dictado por Voz */}
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleVoice}
              className={`h-12 w-12 rounded-2xl border shrink-0 p-0 shadow-2xs flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 border-red-600 text-white animate-pulse'
                  : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-800'
              }`}
              title={isListening ? 'Detener dictado' : 'Hablar por micrófono con el EcoCoach'}
            >
              {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-emerald-800" />}
            </Button>

            {/* Botón de Cámara / Subir Foto de Comida */}
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-12 w-12 rounded-2xl border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-800 shrink-0 p-0 shadow-2xs flex items-center justify-center transition-all"
              title="Tomar foto o subir imagen de comida para calcular calorías"
            >
              <Camera className="w-5 h-5 text-emerald-800" />
            </Button>

            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Escuchando tu voz..." : "Escribe o usa el micrófono 🎙️... Ej: ¿Qué ceno en 10 min?"}
              className="rounded-2xl border-slate-200 focus:border-emerald-600 text-xs sm:text-sm h-12 bg-slate-50"
            />

            <Button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="h-12 px-5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Preguntar</span>
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default EcoCoach;
