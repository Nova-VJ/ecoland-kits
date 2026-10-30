import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShoppingBag, Calendar, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ONBOARDING_STORAGE_KEY = 'ecoland_onboarding_completed_v1';

export const WelcomeOnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!hasSeen) {
        // Small delay so the page loads cleanly first
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {}
    setIsOpen(false);
  };

  const steps = [
    {
      title: "Bienvenido a Ecoland Bio",
      subtitle: "Alimentación ecológica certificada y bienestar real en tu hogar.",
      badge: "🌿 Descubre Ecoland",
      icon: Sparkles,
      iconBg: "bg-emerald-100 text-emerald-800",
      description: "Hemos diseñado una experiencia clara en 4 secciones para acompañarte en tu día a día: Comprar, Cocinar, Organizarte y Cuidarte.",
      buttonText: "Siguiente paso",
      link: null
    },
    {
      title: "1.000+ Productos Ecológicos",
      subtitle: "Trazabilidad 100% real, sin gluten, vegano y calidades gourmet.",
      badge: "🛒 Comprar con confianza",
      icon: ShoppingBag,
      iconBg: "bg-emerald-100 text-emerald-800",
      description: "Encuentra tus alimentos básicos o déjate inspirar por nuestros packs listos para cocinar. Con filtros rápidos de dieta en un clic.",
      buttonText: "Siguiente paso",
      link: null
    },
    {
      title: "Tu Plato Saludable y Menús",
      subtitle: "Planifica tu semana y cuida tu nutrición con el Plato de Harvard.",
      badge: "🥗 Nutrición consciente",
      icon: Heart,
      iconBg: "bg-rose-100 text-rose-800",
      description: "Organiza tus comidas de lunes a domingo, consulta recetas sencillas y revisa el equilibrio nutricional de tu cesta familiar.",
      buttonText: "¡Empezar a explorar!",
      link: "/tienda"
    }
  ];

  if (!isOpen) return null;

  const current = steps[step];
  const StepIcon = current.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Cerrar bienvenida"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
              {current.badge}
            </span>
          </div>

          {/* Icon Header */}
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${current.iconBg}`}>
              <StepIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {current.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
            {current.description}
          </p>

          {/* Progress dots & action button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-emerald-700' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {step < steps.length - 1 ? (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-xl px-5"
                >
                  {current.buttonText}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleClose}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-xl px-6"
                >
                  {current.buttonText}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
