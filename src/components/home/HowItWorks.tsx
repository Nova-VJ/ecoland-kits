import { motion } from 'framer-motion';
import { Package, CheckCircle, Truck } from 'lucide-react';

const steps = [
  {
    icon: Package,
    title: 'Elige tu pack',
    description: 'Selecciona según tu objetivo o haz el test para una recomendación personalizada.',
  },
  {
    icon: CheckCircle,
    title: 'Lo preparamos con cuidado',
    description: 'Productos ecológicos seleccionados y empaquetados con materiales sostenibles.',
  },
  {
    icon: Truck,
    title: 'Envío a casa o recogida',
    description: 'Elige la opción que prefieras. Envío rápido o recogida en punto de entrega.',
  },
];

export const HowItWorks = () => {
  return (
    <section className="section-padding">
      <div className="container-eco">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Cómo funciona
          </h2>
          <p className="text-muted-foreground mt-4">
            En 3 simples pasos tienes tu pack eco en casa
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              {/* Step number */}
              <div className="relative inline-flex mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/30 flex items-center justify-center">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </span>
              </div>

              <h3 className="font-display text-xl font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
