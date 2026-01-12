import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import ecoCoachIcon from '@/assets/eco-coach-icon.svg';
import ecoCoachFull from '@/assets/eco-coach.svg';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  actions?: { label: string; href?: string; action?: string }[];
  packRecommendation?: { name: string; slug: string; price: string };
}

const quickActions = [
  { label: 'Recomiéndame un pack', query: 'recomienda' },
  { label: 'Quiero proteína', query: 'proteina' },
  { label: 'Sin gluten', query: 'gluten' },
  { label: 'Para oficina', query: 'oficina' },
  { label: 'Tengo alergias', query: 'alergias' },
];

const responses: Record<string, Message> = {
  default: {
    id: 'default',
    type: 'bot',
    content: '¡Hola! 🌿 Soy tu Eco-Coach. ¿En qué puedo ayudarte hoy? Puedo recomendarte el pack perfecto según tu objetivo.',
    actions: [
      { label: 'Ver packs', href: '/packs' },
      { label: 'Hacer el test', href: '/quiz' },
    ],
  },
  recomienda: {
    id: 'recomienda',
    type: 'bot',
    content: '¡Genial! Para recomendarte el pack ideal, ¿me cuentas cuál es tu objetivo principal? Por ejemplo: energía, digestión, proteína, sin gluten...',
    actions: [
      { label: 'Hacer el test completo', href: '/quiz' },
    ],
  },
  proteina: {
    id: 'proteina',
    type: 'bot',
    content: '¡Perfecto para deportistas! Te recomiendo el Pack Proteico Natural. Incluye proteína vegetal de alta calidad, frutos secos y alimentos energéticos.',
    packRecommendation: { name: 'Proteico Natural', slug: 'proteico-natural', price: 'Desde 29,90€' },
    actions: [
      { label: 'Ver pack', href: '/packs/proteico-natural' },
    ],
  },
  gluten: {
    id: 'gluten',
    type: 'bot',
    content: 'Entiendo, la seguridad es lo primero. El Pack Sin Gluten Seguro tiene productos 100% certificados. ¡Puedes comprar tranquilo!',
    packRecommendation: { name: 'Sin Gluten Seguro', slug: 'sin-gluten-seguro', price: 'Desde 26,90€' },
    actions: [
      { label: 'Ver pack', href: '/packs/sin-gluten-seguro' },
    ],
  },
  oficina: {
    id: 'oficina',
    type: 'bot',
    content: 'Para la oficina tenemos el pack perfecto: snacks saludables, bebidas y comidas rápidas que no comprometen tu salud. ¡Ideal para la semana!',
    packRecommendation: { name: 'Oficina Saludable', slug: 'oficina-saludable', price: 'Desde 21,90€' },
    actions: [
      { label: 'Ver pack', href: '/packs/oficina-saludable' },
    ],
  },
  alergias: {
    id: 'alergias',
    type: 'bot',
    content: 'Las alergias son importantes. Te recomiendo hacer el test para indicar tus restricciones específicas. Cada pack tiene la información de alérgenos bien detallada.',
    actions: [
      { label: 'Hacer el test', href: '/quiz' },
      { label: 'Ver packs', href: '/packs' },
    ],
  },
  energia: {
    id: 'energia',
    type: 'bot',
    content: '¡Energía natural! El Pack Energía Mañanas es perfecto: avena, superalimentos, semillas... Todo para empezar el día con fuerza.',
    packRecommendation: { name: 'Energía Mañanas', slug: 'energia-mananas', price: 'Desde 22,90€' },
    actions: [
      { label: 'Ver pack', href: '/packs/energia-mananas' },
    ],
  },
};

export const EcoCoach = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([responses.default]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // Find matching response
    setTimeout(() => {
      let response = responses.default;
      
      if (userQuery.includes('proteina') || userQuery.includes('proteína') || userQuery.includes('fitness') || userQuery.includes('deporte')) {
        response = responses.proteina;
      } else if (userQuery.includes('gluten') || userQuery.includes('celiaco') || userQuery.includes('celíaco')) {
        response = responses.gluten;
      } else if (userQuery.includes('oficina') || userQuery.includes('trabajo') || userQuery.includes('snack')) {
        response = responses.oficina;
      } else if (userQuery.includes('alergia') || userQuery.includes('intolerancia')) {
        response = responses.alergias;
      } else if (userQuery.includes('energia') || userQuery.includes('energía') || userQuery.includes('mañana') || userQuery.includes('desayuno')) {
        response = responses.energia;
      } else if (userQuery.includes('recomienda') || userQuery.includes('ayuda') || userQuery.includes('pack')) {
        response = responses.recomienda;
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
                <p className="text-sm text-primary-foreground/80">Tu asistente eco personal</p>
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
                          <Leaf className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">{message.packRecommendation.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{message.packRecommendation.price}</p>
                      </Link>
                    )}
                    
                    {/* Actions */}
                    {message.actions && (
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
                  placeholder="Escribe tu mensaje..."
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
