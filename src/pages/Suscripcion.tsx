import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Repeat, Percent, Gift, Pause, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const benefits = [
  { icon: Percent, title: '10% de descuento', description: 'En todos los packs con suscripción activa' },
  { icon: Repeat, title: 'Entrega automática', description: 'Recibe tu pack cada mes sin preocuparte' },
  { icon: Pause, title: 'Pausa cuando quieras', description: 'Sin compromiso, cancela o pausa fácilmente' },
  { icon: Gift, title: 'Sorpresas exclusivas', description: 'Muestras y productos extra en tus envíos' },
];

const Suscripcion = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
            <Repeat className="w-4 h-4" />
            Suscripción mensual
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Repite tu pack{' '}
            <span className="gradient-text">sin preocuparte</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Ahorra un 10% con suscripción y cambia o pausa cuando quieras. 
            Productos eco en tu puerta cada mes.
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card shadow-eco-card text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/5 to-secondary/30 rounded-3xl p-8 md:p-12 mb-16"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Elige tu pack', desc: 'Selecciona el pack que prefieras y activa la opción de suscripción' },
              { step: 2, title: 'Recíbelo cada mes', desc: 'Te lo enviamos automáticamente cada 30 días' },
              { step: 3, title: 'Cambia o pausa', desc: 'Modifica tu suscripción desde tu cuenta cuando quieras' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Empieza a ahorrar hoy
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Elige cualquier pack y activa la suscripción en el checkout. 
            El descuento se aplica automáticamente.
          </p>
          <Link to="/packs">
            <Button className="btn-hero">
              Ver packs con suscripción
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Suscripcion;
