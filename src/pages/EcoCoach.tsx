import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, ChefHat, CheckCircle2, Bookmark, Calendar, 
  ShoppingBag, Shield, Clock, AlertTriangle, ArrowRight, Bot, Info, Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ecoCoachService, CoachResponse, CoachAction } from '@/services/ecoCoachService';
import { productInsightsService } from '@/services/productInsightsService';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { dailyNutritionStore } from '@/services/dailyNutritionStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text?: string;
  response?: CoachResponse;
  timestamp: string;
}

const SUGGESTED_QUERIES = [
  '¿Qué puedo cenar hoy?',
  '¿Qué puedo cocinar con lo que tengo?',
  'Me quedan 15 minutos, ¿qué hago?',
  '¿Qué puedo comer con más fibra?',
  '¿Tengo suficiente proteína hoy?',
  '¿Qué preparo mañana?',
  '¿Qué debería consumir antes de que se estropee?',
  'Ayúdame a planificar tres cenas baratas'
];

export const EcoCoach = () => {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Mensaje inicial de bienvenida contextual
    const initialResp = ecoCoachService.queryCoach({ text: '¿Qué puedo cenar hoy?' });
    return [
      {
        id: 'msg_welcome',
        sender: 'coach',
        response: {
          ...initialResp,
          title: '¡Hola! Soy tu EcoCoach Contextual',
          message: 'He revisado tu diario de hoy, tu despensa y tus alimentos próximos a fecha. Mi objetivo es ayudarte a decidir sin fricción, ahorrando compras innecesarias. ¿Qué necesitas hoy?'
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
      const coachResp = ecoCoachService.queryCoach({ text: query });
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

  const handleExecuteAction = (action: CoachAction) => {
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
              <Badge variant="outline" className="text-[11px] font-medium border-slate-300 text-slate-600">
                🔒 Datos 100% Privados
              </Badge>
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Pregúntale lo que necesitas en cualquier momento. El EcoCoach consulta tu despensa, tus alimentos a punto de vencer y tu plan antes de sugerirte comprar nada.
          </p>

          {/* Chips de Preguntas Frecuentes Sugeridas */}
          <div className="pt-2 border-t space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
              Preguntas sugeridas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(q)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100/70 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-950 text-xs font-semibold transition-all text-left"
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
                <div className="bg-emerald-900 text-white rounded-3xl rounded-tr-xs px-5 py-3 max-w-lg shadow-sm text-xs md:text-sm">
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

                      <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                        {msg.response.message}
                      </p>

                      {/* Tarjeta de Receta Accionable si aplica */}
                      {msg.response.recipeCard && (
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
                        </div>
                        <div className="pl-5 flex items-center gap-1 text-xs text-slate-500">
                          <Info className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>Fundamentado en: {msg.response.dataGrounding}</span>
                        </div>
                      </div>

                      {/* Feedback Discreto del Coach (P2.5 Punto 6) */}
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

        {/* Barra de Entrada / Consulta Personalizada */}
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl border shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu consulta... Ej: ¿Qué puedo cenar hoy en 10 minutos?"
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
