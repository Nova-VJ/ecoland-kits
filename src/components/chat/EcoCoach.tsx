import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import ecoCoachIcon from '@/assets/eco-coach-icon.svg';
import ReactMarkdown from 'react-markdown';
import { EcoCoachProductCard } from './EcoCoachProductCard';
import { EcoCoachTerms } from './EcoCoachTerms';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { catalogPacks } from '@/data/catalog/packs-catalog';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  { label: '🎯 Crear mi dieta', query: 'Quiero que me crees una dieta personalizada' },
  { label: '💪 Ganar masa', query: 'Quiero ganar masa muscular, ¿qué me recomiendas?' },
  { label: '⚖️ Perder peso', query: 'Quiero perder peso de forma saludable' },
  { label: '🌱 Vegano', query: 'Soy vegano y necesito una dieta equilibrada' },
  { label: '🚫 Sin gluten', query: 'Necesito opciones sin gluten' },
];

const AssistantMessage = ({ content }: { content: string }) => {
  const parts = content.split(/(\[\[(?:product|pack):[a-z0-9-]+\]\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const productMatch = part.match(/^\[\[product:([a-z0-9-]+)\]\]$/);
        if (productMatch) return <EcoCoachProductCard key={i} type="product" slug={productMatch[1]} />;
        const packMatch = part.match(/^\[\[pack:([a-z0-9-]+)\]\]$/);
        if (packMatch) return <EcoCoachProductCard key={i} type="pack" slug={packMatch[1]} />;
        if (!part) return null;
        return <ReactMarkdown key={i}>{part}</ReactMarkdown>;
      })}
    </>
  );
};

// Extract product slugs from message content
const extractSlugs = (content: string): string[] => {
  const matches = content.matchAll(/\[\[(product|pack):([a-z0-9-]+)\]\]/g);
  return [...matches].map(m => m[2]);
};

export const EcoCoach = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(() => localStorage.getItem('eco-coach-terms') === 'accepted');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! 🌿 Soy tu **Eco-Coach**. Puedo crear una dieta personalizada con productos ecológicos de nuestra tienda.\n\n¿Cuál es tu objetivo principal? Por ejemplo: ganar masa muscular, perder peso, mejorar la digestión, más energía...',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/eco-coach`;
  const { addCatalogProduct, addCatalogPack } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('eco-coach-terms', 'accepted');
    setTermsAccepted(true);
  };

  const ensureConversation = async (): Promise<string | null> => {
    if (conversationId) return conversationId;
    if (!userId) return null;

    const { data, error } = await supabase
      .from('eco_coach_conversations' as any)
      .insert({ user_id: userId, title: 'Consulta Eco-Coach' })
      .select('id')
      .single();

    if (error || !data) return null;
    const id = (data as any).id;
    setConversationId(id);
    return id;
  };

  const saveMessage = async (convId: string, role: string, content: string) => {
    await supabase.from('eco_coach_messages' as any).insert({
      conversation_id: convId,
      role,
      content,
    });
  };

  const saveDiet = async (dietContent: string) => {
    if (!userId) {
      toast({
        title: 'Crea una cuenta',
        description: 'Para guardar dietas necesitas crear una cuenta en Ecoland.',
        variant: 'destructive',
      });
      return;
    }

    const slugs = extractSlugs(dietContent);
    const convId = await ensureConversation();

    // Save all messages to conversation if first save
    if (convId) {
      for (const msg of messages.filter(m => m.id !== 'welcome')) {
        await saveMessage(convId, msg.role, msg.content);
      }

      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg) {
        await supabase.from('eco_coach_conversations' as any)
          .update({ title: firstUserMsg.content.slice(0, 80) })
          .eq('id', convId);
      }
    }

    // Extract diet name from content (look for "# 🥗 ..." pattern)
    let dietTitle = `Dieta - ${new Date().toLocaleDateString('es-ES')}`;
    const titleMatch = dietContent.match(/^#\s*🥗?\s*(.+)$/m);
    if (titleMatch) {
      dietTitle = titleMatch[1].trim();
    }

    await supabase.from('saved_diets' as any).insert({
      user_id: userId,
      conversation_id: convId,
      title: dietTitle,
      diet_content: dietContent.replace(/\[\[(product|pack):[a-z0-9-]+\]\]/g, ''),
      product_slugs: slugs,
    });

    // Add all products to cart
    let added = 0;
    slugs.forEach(slug => {
      const product = allCatalogProducts.find(p => p.slug === slug);
      if (product) { addCatalogProduct(product); added++; return; }
      const pack = catalogPacks.find(p => p.slug === slug);
      if (pack) { addCatalogPack(pack); added++; }
    });

    toast({
      title: '✅ Dieta guardada',
      description: `"${dietTitle}" guardada. ${added} productos añadidos al carrito.`,
    });
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id.startsWith('stream-')) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { id: `stream-${Date.now()}`, role: 'assistant', content: assistantContent }];
      });
    };

    try {
      const apiMessages = messages
        .filter(m => m.id !== 'welcome')
        .concat(userMsg)
        .map(m => ({ role: m.role, content: m.content }));

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al conectar con Eco-Coach');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw || raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {}
        }
      }

      // Auto-save conversation for logged-in users
      if (userId) {
        const convId = await ensureConversation();
        if (convId) {
          await saveMessage(convId, 'user', text);
          if (assistantContent) await saveMessage(convId, 'assistant', assistantContent);
        }
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', content: `❌ ${e.message || 'Error al conectar. Inténtalo de nuevo.'}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the last assistant message looks like a diet plan
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant' && m.id !== 'welcome');
  const hasDietContent = lastAssistantMsg && (
    lastAssistantMsg.content.includes('[[product:') ||
    lastAssistantMsg.content.includes('[[pack:') ||
    (lastAssistantMsg.content.includes('desayuno') && lastAssistantMsg.content.includes('cena'))
  );

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-lg overflow-hidden animate-pulse-eco"
        style={{ background: 'linear-gradient(135deg, hsl(113 39% 49%) 0%, hsl(120 31% 32%) 100%)' }}
      >
        <img src={ecoCoachIcon} alt="Eco-Coach" className="w-full h-full object-cover" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)] bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-eco-dark text-primary-foreground flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-foreground/20 flex-shrink-0">
                <img src={ecoCoachIcon} alt="Eco-Coach" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold">Eco-Coach IA</h3>
                <p className="text-sm text-primary-foreground/80 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Dietas personalizadas con IA
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {!termsAccepted ? (
              <EcoCoachTerms onAccept={handleAcceptTerms} />
            ) : (
              <>
                {/* Login notice */}
                {!userId && (
                  <div className="px-4 pt-2">
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                      💡 <a href="/registro" className="underline font-medium">Crea una cuenta</a> para guardar tus dietas y el historial de chat.
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      }`}>
                        {message.role === 'assistant' ? (
                          <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-li:my-0 prose-ul:my-1 prose-ol:my-1 prose-headings:my-2 prose-strong:text-foreground">
                            <AssistantMessage content={message.content} />
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Save diet button */}
                  {hasDietContent && !isLoading && (
                    <div className="flex justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1.5 border-primary text-primary"
                        onClick={() => saveDiet(lastAssistantMsg!.content)}
                      >
                        <Save className="h-3.5 w-3.5" />
                        Aceptar dieta, guardar y añadir al carrito
                      </Button>
                    </div>
                  )}

                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                  <div className="px-4 py-2 border-t overflow-x-auto">
                    <div className="flex gap-2">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => sendMessage(action.query)}
                          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Cuéntame tu objetivo..."
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
