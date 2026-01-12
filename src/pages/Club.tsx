import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Percent, Gift, Sparkles, Star, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const benefits = [
  { icon: Percent, text: '10% de descuento en todos los packs' },
  { icon: Gift, text: 'Sorpresa trimestral con productos exclusivos' },
  { icon: Sparkles, text: 'Acceso anticipado a novedades y lanzamientos' },
  { icon: Star, text: 'Invitaciones a eventos y talleres eco' },
  { icon: Crown, text: 'Atención prioritaria por WhatsApp' },
];

const Club = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      setSubmitted(true);
      toast.success('¡Bienvenido/a al Club Eco! 🌿');
    }
  };

  return (
    <div className="section-padding">
      <div className="container-eco">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="eco-badge inline-flex gap-2 mb-4">
            <Crown className="w-4 h-4" />
            Exclusivo para ti
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Club Eco 🌿
          </h1>
          <p className="text-xl text-muted-foreground">
            Para quienes quieren comprar mejor, cada mes. 
            Únete y disfruta de beneficios exclusivos.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
              Beneficios del Club
            </h2>
            <ul className="space-y-5">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-lg">{benefit.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {!submitted ? (
              <div className="bg-gradient-to-br from-primary/10 to-secondary/30 rounded-3xl p-8 md:p-10">
                <h3 className="font-display text-xl font-semibold mb-2">
                  Únete al Club Eco
                </h3>
                <p className="text-muted-foreground mb-6">
                  Es gratis. Solo necesitamos tu email para darte de alta.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <Input
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full btn-hero">
                    Unirme al Club Eco
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Al unirte aceptas recibir comunicaciones de Ecoland. 
                  Puedes darte de baja cuando quieras.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-primary/10 to-secondary/30 rounded-3xl p-8 md:p-10 text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">
                  ¡Bienvenido/a, {name}! 🌿
                </h3>
                <p className="text-muted-foreground mb-6">
                  Ya eres parte del Club Eco. Revisa tu email para confirmar tu suscripción 
                  y empezar a disfrutar de tus beneficios.
                </p>
                <Button asChild variant="outline">
                  <a href="/packs">Ver packs con descuento</a>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Club;
