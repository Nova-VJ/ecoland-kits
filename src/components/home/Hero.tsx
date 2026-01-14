import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Truck, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ecolandSymbol from '@/assets/ecoland-symbol.svg';
const benefits = [{
  icon: Sparkles,
  text: 'Selección eco premium'
}, {
  icon: Clock,
  text: 'Todo en un pack, ahorra tiempo'
}, {
  icon: Truck,
  text: 'Envío o recogida'
}, {
  icon: MessageCircle,
  text: 'Eco-Coach te recomienda en 30s'
}];
export const Hero = () => {
  return <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-eco-dark/90 via-eco-dark/70 to-eco-dark/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-eco-dark/60 via-transparent to-transparent" />
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-eco-pattern opacity-20" />

      {/* Content */}
      <div className="container-eco relative z-10">
        <div className="max-w-3xl space-y-8">
          {/* Ecoland Symbol and Tagline */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-4">
              <img src={ecolandSymbol} alt="Ecoland" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />
              <div className="h-12 w-px bg-white/30" />
              <p className="text-white/90 text-lg md:text-xl font-medium italic">
                Más de 15 años llevando comida sana a tu hogar
              </p>
            </div>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2,
          duration: 0.6
        }}>
            <span className="eco-badge mb-4 inline-flex bg-white/20 backdrop-blur-sm text-white border-white/30">
              🌿 Productos ecológicos seleccionados
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance text-white">
              Packs ecológicos listos para{' '}
              <span className="text-eco-cream">tu objetivo</span>
            </h1>
          </motion.div>

          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4,
          duration: 0.6
        }} className="text-lg md:text-xl text-white/80 max-w-xl">
            Seleccionados por Ecoland. Compra en 1 clic. 
            Suscripción opcional con 10% de descuento.
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6,
          duration: 0.6
        }} className="flex flex-wrap gap-4">
            <Link to="/packs">
              <Button className="btn-hero bg-eco-cream text-eco-dark hover:bg-white">
                Ver packs
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/quiz">
              <Button className="btn-hero-secondary border-white text-white hover:bg-white/10">
                Hacer el test
              </Button>
            </Link>
          </motion.div>

          {/* Benefits */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.8,
          duration: 0.6
        }} className="grid grid-cols-2 gap-4 pt-4 mt-0 mb-[42px]">
            {benefits.map((benefit, i) => <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <benefit.icon className="h-5 w-5 text-eco-cream" />
                </div>
                <span className="text-sm font-medium text-white/90">{benefit.text}</span>
              </div>)}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.2,
      duration: 0.6
    }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{
        y: [0, 8, 0]
      }} transition={{
        repeat: Infinity,
        duration: 1.5
      }} className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-eco-cream" />
        </motion.div>
      </motion.div>
    </section>;
};