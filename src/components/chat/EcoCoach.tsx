import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Leaf, Sparkles, ShoppingBag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ecoCoachIcon from '@/assets/eco-coach-icon.svg';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  actions?: { label: string; href?: string; action?: string }[];
  packRecommendation?: { name: string; slug: string; price: string };
}

interface OrderHistory {
  items: string[];
  categories: string[];
  totalSpent: number;
  orderCount: number;
}

const quickActions = [
  { label: 'Recomiéndame', query: 'recomienda' },
  { label: 'Pack según mi frigo', query: 'frigo' },
  { label: 'Proteína', query: 'proteina' },
  { label: 'Sin gluten', query: 'gluten' },
  { label: 'Para oficina', query: 'oficina' },
];

const getPersonalizedGreeting = (orderHistory: OrderHistory | null, userName?: string): Message => {
  if (!orderHistory || orderHistory.orderCount === 0) {
    return {
      id: 'default',
      type: 'bot',
      content: `¡Hola${userName ? `, ${userName}` : ''}! 🌿 Soy tu Eco-Coach. ¿En qué puedo ayudarte hoy? Puedo recomendarte el pack perfecto según tu objetivo, o crear un pack personalizado según lo que necesitas en tu nevera.`,
      actions: [
        { label: 'Ver packs', href: '/packs' },
        { label: 'Hacer el test', href: '/quiz' },
      ],
    };
  }

  const favoriteCategories = orderHistory.categories.slice(0, 2).join(' y ');
  return {
    id: 'personalized',
    type: 'bot',
    content: `¡Hola${userName ? `, ${userName}` : ''}! 🌿 Veo que te gustan los productos de ${favoriteCategories}. ¿Quieres que te recomiende algo similar o probamos algo nuevo? También puedo crear un pack personalizado según lo que te falta en casa.`,
    actions: [
      { label: 'Repite mi favorito', href: '/packs' },
      { label: 'Pack según mi frigo', action: 'frigo' },
      { label: 'Algo nuevo', action: 'nuevo' },
    ],
  };
};

const responses: Record<string, (orderHistory: OrderHistory | null) => Message> = {
  recomienda: (orderHistory) => ({
    id: 'recomienda',
    type: 'bot',
    content: orderHistory?.orderCount 
      ? `Basándome en tus compras anteriores de ${orderHistory.categories[0] || 'productos eco'}, te recomendaría explorar packs similares. ¿Cuál es tu objetivo principal?`
      : '¡Genial! Para recomendarte el pack ideal, ¿me cuentas cuál es tu objetivo principal? Por ejemplo: energía, digestión, proteína, sin gluten...',
    actions: [
      { label: 'Hacer el test completo', href: '/quiz' },
    ],
  }),
  frigo: () => ({
    id: 'frigo',
    type: 'bot',
    content: '🧊 ¡Perfecto! Cuéntame qué te falta en la nevera o despensa. Por ejemplo: "me falta desayuno saludable", "necesito snacks para la oficina", "quiero proteína vegetal". Crearé un pack personalizado para ti.',
    actions: [],
  }),
  proteina: (orderHistory) => ({
    id: 'proteina',
    type: 'bot',
    content: orderHistory?.items.some(i => i.toLowerCase().includes('proteina'))
      ? '¡Veo que ya has probado nuestros productos proteicos! Te gustó. El Pack Proteico Natural tiene más opciones que te encantarán.'
      : '¡Perfecto para deportistas! Te recomiendo el Pack Proteico Natural. Incluye proteína vegetal de alta calidad, frutos secos y alimentos energéticos.',
    packRecommendation: { name: 'Proteico Natural', slug: 'proteico-natural', price: 'Desde 29,90€' },
    actions: [
      { label: 'Ver pack', href: '/packs/proteico-natural' },
    ],
  }),
  gluten: () => ({
    id: 'gluten',
    type: 'bot',
    content: 'Entiendo, la seguridad es lo primero. El Pack Sin Gluten Seguro tiene productos 100% certificados. ¡Puedes comprar tranquilo!',
    packRecommendation: { name: 'Sin Gluten Seguro', slug: 'sin-gluten-seguro', price: 'Desde 26,90€' },
    actions: [
      { label: 'Ver pack', href: '/packs/sin-gluten-seguro' },
    ],
  }),
  oficina: () => ({
    id: 'oficina',
    type: 'bot',
    content: 'Para la oficina tenemos el pack perfecto: snacks saludables, bebidas y comidas rápidas que no comprometen tu salud. ¡Ideal para la semana!',
    packRecommendation: { name: 'Oficina Saludable', slug: 'oficina-saludable', price: 'Desde 21,90€' },
    actions: [
      { label: 'Ver pack', href: '/packs/oficina-saludable' },
    ],
  }),
  alergias: () => ({
    id: 'alergias',
    type: 'bot',
    content: 'Las alergias son importantes. Te recomiendo hacer el test para indicar tus restricciones específicas. Cada pack tiene la información de alérgenos bien detallada.',
    actions: [
      { label: 'Hacer el test', href: '/quiz' },
      { label: 'Ver packs', href: '/packs' },
    ],
  }),
  energia: (orderHistory) => ({
    id: 'energia',
    type: 'bot',
    content: orderHistory?.categories.includes('energia')
      ? '¡Ya conoces nuestros productos energéticos! Te han gustado. El Pack Energía Mañanas tiene todo para empezar cada día con fuerza.'
      : '¡Energía natural! El Pack Energía Mañanas es perfecto: avena, superalimentos, semillas... Todo para empezar el día con fuerza.',
    packRecommendation: { name: 'Energía Mañanas', slug: 'energia-mananas', price: 'Desde 22,90€' },
    actions: [
      { label: 'Ver pack', href: '/packs/energia-mananas' },
    ],
  }),
  nuevo: () => ({
    id: 'nuevo',
    type: 'bot',
    content: '¡Me encanta tu espíritu aventurero! 🌱 Te sugiero probar algo diferente. ¿Qué te parece explorar nuestros packs de digestión o el pack vegano fácil?',
    actions: [
      { label: 'Pack Digestión', href: '/packs/digestion-bienestar' },
      { label: 'Pack Vegano', href: '/packs/vegano-facil' },
      { label: 'Ver todos', href: '/packs' },
    ],
  }),
};

const handleFrigoRequest = (input: string): Message => {
  const keywords = input.toLowerCase();
  
  if (keywords.includes('desayuno') || keywords.includes('mañana')) {
    return {
      id: 'frigo-desayuno',
      type: 'bot',
      content: '🥣 ¡Entendido! Para desayunos saludables te prepararía un pack con: avena ecológica, miel pura, semillas de chía, frutos rojos deshidratados y granola artesanal. ¿Te parece bien?',
      packRecommendation: { name: 'Energía Mañanas', slug: 'energia-mananas', price: 'Desde 22,90€' },
      actions: [
        { label: 'Ver este pack', href: '/packs/energia-mananas' },
        { label: 'Personalizar más', action: 'personalizar' },
      ],
    };
  }
  
  if (keywords.includes('snack') || keywords.includes('oficina') || keywords.includes('pica')) {
    return {
      id: 'frigo-snacks',
      type: 'bot',
      content: '🥜 ¡Snacks eco para picar sin remordimientos! Te sugiero: mix de frutos secos, barritas energéticas, chips de verduras, crackers integrales y chocolate negro 85%.',
      packRecommendation: { name: 'Oficina Saludable', slug: 'oficina-saludable', price: 'Desde 21,90€' },
      actions: [
        { label: 'Ver este pack', href: '/packs/oficina-saludable' },
      ],
    };
  }
  
  if (keywords.includes('proteina') || keywords.includes('musculo') || keywords.includes('gym') || keywords.includes('deporte')) {
    return {
      id: 'frigo-proteina',
      type: 'bot',
      content: '💪 ¡Para ganar músculo de forma natural! Pack con: proteína de guisante, tempeh, tofu, legumbres secas, semillas de cáñamo y mantequilla de almendras.',
      packRecommendation: { name: 'Proteico Natural', slug: 'proteico-natural', price: 'Desde 29,90€' },
      actions: [
        { label: 'Ver este pack', href: '/packs/proteico-natural' },
      ],
    };
  }
  
  if (keywords.includes('verdura') || keywords.includes('fresca') || keywords.includes('ensalada')) {
    return {
      id: 'frigo-verduras',
      type: 'bot',
      content: '🥗 ¡Fresquito y saludable! Aunque no vendemos verduras frescas online, sí tenemos: conservas de verduras eco, cremas de verduras, y en nuestra tienda física encontrarás verduras frescas certificadas.',
      actions: [
        { label: 'Ver dónde estamos', href: '/donde-estamos' },
        { label: 'Conservas eco', href: '/tienda' },
      ],
    };
  }
  
  return {
    id: 'frigo-general',
    type: 'bot',
    content: '🧺 Basándome en lo que necesitas, te recomiendo empezar con nuestro Pack Inicio Eco. Tiene los básicos esenciales para una despensa saludable: aceite AOVE, pasta integral, legumbres, arroz y más.',
    packRecommendation: { name: 'Inicio Eco', slug: 'inicio-eco', price: 'Desde 24,90€' },
    actions: [
      { label: 'Ver pack básicos', href: '/packs/inicio-eco' },
      { label: 'Cuéntame más', action: 'mas-detalle' },
    ],
  };
};

export const EcoCoach = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [orderHistory, setOrderHistory] = useState<OrderHistory | null>(null);
  const [userName, setUserName] = useState<string | undefined>();
  const [isFrigoMode, setIsFrigoMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch profile name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]);
        }

        // Fetch order history
        const { data: orders } = await supabase
          .from('orders')
          .select('id, total')
          .eq('user_id', user.id);

        if (orders && orders.length > 0) {
          const orderIds = orders.map(o => o.id);
          const { data: items } = await supabase
            .from('order_items')
            .select('item_name, item_type')
            .in('order_id', orderIds);

          const categories = [...new Set((items || []).map(i => i.item_type))];
          const itemNames = (items || []).map(i => i.item_name);

          setOrderHistory({
            items: itemNames,
            categories,
            totalSpent: orders.reduce((sum, o) => sum + Number(o.total), 0),
            orderCount: orders.length,
          });
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Set initial greeting when component mounts or when user data is loaded
    setMessages([getPersonalizedGreeting(orderHistory, userName)]);
  }, [orderHistory, userName]);

  const handleSend = (query?: string) => {
    const userQuery = query || input.toLowerCase().trim();
    if (!userQuery) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query || input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Handle response
    setTimeout(() => {
      let response: Message;
      
      // Check if we're in frigo mode
      if (isFrigoMode) {
        response = handleFrigoRequest(userQuery);
        setIsFrigoMode(false);
      } else if (userQuery.includes('frigo') || userQuery.includes('nevera') || userQuery.includes('falta')) {
        response = responses.frigo(orderHistory);
        setIsFrigoMode(true);
      } else if (userQuery.includes('proteina') || userQuery.includes('proteína') || userQuery.includes('fitness') || userQuery.includes('deporte')) {
        response = responses.proteina(orderHistory);
      } else if (userQuery.includes('gluten') || userQuery.includes('celiaco') || userQuery.includes('celíaco')) {
        response = responses.gluten(orderHistory);
      } else if (userQuery.includes('oficina') || userQuery.includes('trabajo') || userQuery.includes('snack')) {
        response = responses.oficina(orderHistory);
      } else if (userQuery.includes('alergia') || userQuery.includes('intolerancia')) {
        response = responses.alergias(orderHistory);
      } else if (userQuery.includes('energia') || userQuery.includes('energía') || userQuery.includes('mañana') || userQuery.includes('desayuno')) {
        response = responses.energia(orderHistory);
      } else if (userQuery.includes('nuevo') || userQuery.includes('diferente') || userQuery.includes('probar')) {
        response = responses.nuevo(orderHistory);
      } else if (userQuery.includes('recomienda') || userQuery.includes('ayuda') || userQuery.includes('pack')) {
        response = responses.recomienda(orderHistory);
      } else {
        response = {
          id: 'fallback',
          type: 'bot',
          content: 'Entiendo lo que necesitas. ¿Te gustaría que te recomiende un pack específico o prefieres hacer el test para una recomendación más personalizada?',
          actions: [
            { label: 'Hacer el test', href: '/quiz' },
            { label: 'Ver todos los packs', href: '/packs' },
          ],
        };
      }

      setMessages(prev => [...prev, { ...response, id: Date.now().toString() }]);
    }, 500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-lg overflow-hidden animate-pulse-eco"
        style={{ background: 'linear-gradient(135deg, hsl(113 39% 49%) 0%, hsl(120 31% 32%) 100%)' }}
      >
        <img 
          src={ecoCoachIcon} 
          alt="Eco-Coach" 
          className="w-full h-full object-cover"
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)] bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-eco-dark text-primary-foreground flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-foreground/20 flex-shrink-0">
                <img src={ecoCoachIcon} alt="Eco-Coach" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold">Eco-Coach</h3>
                <p className="text-sm text-primary-foreground/80">
                  {orderHistory?.orderCount ? 'Te conozco 💚' : 'Tu asistente eco personal'}
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

            {/* Eco Points indicator if user has history */}
            {orderHistory && orderHistory.orderCount > 0 && (
              <div className="px-4 py-2 bg-eco-cream/50 flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-eco-green" />
                <span className="text-eco-dark">
                  {orderHistory.orderCount} pedidos • Cliente habitual
                </span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Pack Recommendation */}
                    {message.packRecommendation && (
                      <Link
                        to={`/packs/${message.packRecommendation.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="mt-3 block p-3 rounded-xl bg-background/50 hover:bg-background transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">{message.packRecommendation.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{message.packRecommendation.price}</p>
                      </Link>
                    )}
                    
                    {/* Actions */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action, i) => (
                          action.href ? (
                            <Link
                              key={i}
                              to={action.href}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              {action.label}
                            </Link>
                          ) : (
                            <button
                              key={i}
                              onClick={() => handleSend(action.action || action.label)}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              {action.label}
                            </button>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t overflow-x-auto">
              <div className="flex gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.query}
                    onClick={() => handleSend(action.query)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isFrigoMode ? "¿Qué te falta en casa?" : "Escribe tu mensaje..."}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
