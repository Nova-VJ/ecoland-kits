import { motion } from 'framer-motion';
import { Leaf, MapPin, Shield, MessageCircle } from 'lucide-react';

const trustItems = [
  {
    icon: Leaf,
    title: 'Productos ecológicos',
    description: 'Certificados y de calidad premium',
  },
  {
    icon: MapPin,
    title: 'Selección local',
    description: 'Priorizamos productores cercanos',
  },
  {
    icon: Shield,
    title: 'Pago 100% seguro',
    description: 'Transacciones cifradas y protegidas',
  },
  {
    icon: MessageCircle,
    title: 'Atención personalizada',
    description: 'WhatsApp + Eco-Coach siempre disponible',
  },
];

export const Trust = () => {
  return (
    <section className="py-12 bg-secondary/30">
      <div className="container-eco">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {trustItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-sm md:text-base">{item.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
