import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, ShoppingCart, UtensilsCrossed, Sparkles, Repeat, Crown, Download, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ecoCoachIcon from '@/assets/eco-coach-icon.svg';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const STEPS: Step[] = [
  {
    icon: <img src={ecoCoachIcon} alt="Eco-Coach" className="w-12 h-12 rounded-full" />,
    title: '¡Bienvenido a Eco Land! 🌿',
    description: 'Soy tu Eco-Coach y te voy a enseñar todo lo que puedes hacer aquí. ¡Es muy fácil!',
    highlight: 'Haz clic en mi icono flotante en cualquier momento para hablar conmigo.',
  },
  {
    icon: <UtensilsCrossed className="w-10 h-10 text-primary" />,
    title: 'Dietas personalizadas con IA',
    description: 'Cuéntame tus objetivos (perder peso, ganar músculo, más energía...) y te creo una dieta semanal completa con productos ecológicos de nuestra tienda.',
    highlight: 'Puedes guardar tus dietas, editarlas y descargarlas en PDF profesional.',
  },
  {
    icon: <ShoppingCart className="w-10 h-10 text-primary" />,
    title: 'Compra directa desde el chat',
    description: 'Cuando te recomiende productos, verás tarjetas interactivas para añadirlos al carrito con un solo clic. ¡Sin buscar nada!',
    highlight: 'Al aceptar una dieta, todos los productos se añaden al carrito automáticamente.',
  },
  {
    icon: <Repeat className="w-10 h-10 text-primary" />,
    title: 'Suscripciones con descuento',
    description: 'Activa la suscripción en cualquier dieta guardada y recibe tus productos periódicamente (semanal o mensual).',
    highlight: '10% dto. por 3 meses · 15% por 6 meses · 20% por 1 año',
  },
  {
    icon: <Crown className="w-10 h-10 text-primary" />,
    title: 'Club Eco y Eco Puntos',
    description: 'Ganas 1 Eco Punto por cada euro de compra. Únete al Club Eco para obtener un 10% de descuento permanente en todos los packs.',
    highlight: 'Consulta tus puntos y estado del club en tu perfil.',
  },
  {
    icon: <Download className="w-10 h-10 text-primary" />,
    title: 'Instala la app en tu móvil',
    description: 'Eco Land funciona como una app. Instálala en tu teléfono o PC desde el navegador para acceder más rápido y recibir notificaciones.',
    highlight: 'Busca "Instalar" o "Añadir a pantalla de inicio" en el menú de tu navegador.',
  },
  {
    icon: <MapPin className="w-10 h-10 text-primary" />,
    title: '¡Visítanos en Valladolid!',
    description: 'Estamos en C. de Recondo, 7. Más de 15 años ofreciendo productos ecológicos certificados con sello UE y Castilla y León.',
    highlight: 'L-V: 10:00–14:30 y 17:30–20:30 | Sábados: 10:00–14:30',
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export const OnboardingTutorial = ({ onComplete }: OnboardingTutorialProps) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleFinish = () => {
    localStorage.setItem('ecoland-onboarding-done', 'true');
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-card rounded-3xl shadow-2xl border max-w-md w-full overflow-hidden"
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-primary to-eco-dark px-6 pt-6 pb-8 text-primary-foreground relative">
          <button onClick={handleFinish} className="absolute top-4 right-4 opacity-60 hover:opacity-100 transition-opacity">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg border border-white/20">
              {current.icon}
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70 font-medium">
                Paso {step + 1} de {STEPS.length}
              </p>
              <h3 className="text-lg font-display font-bold leading-tight mt-0.5">
                {current.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-foreground leading-relaxed">
            {current.description}
          </p>
          {current.highlight && (
            <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <p className="text-xs text-primary font-medium leading-relaxed">
                💡 {current.highlight}
              </p>
            </div>
          )}
        </div>

        {/* Progress dots + nav */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setStep(s => s - 1)} className="gap-1 text-xs">
                <ChevronLeft className="h-3.5 w-3.5" /> Atrás
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={handleFinish} className="gap-1 text-xs bg-primary">
                <Sparkles className="h-3.5 w-3.5" /> ¡Empezar!
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(s => s + 1)} className="gap-1 text-xs">
                Siguiente <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
