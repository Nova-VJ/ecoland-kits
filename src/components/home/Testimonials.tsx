import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'María García',
    role: 'Cliente desde 2023',
    content: 'Los packs de Ecoland han cambiado mi forma de comprar. Todo viene perfectamente seleccionado y la calidad es increíble.',
    rating: 5,
  },
  {
    name: 'Carlos Ruiz',
    role: 'Deportista',
    content: 'El pack Proteico Natural es perfecto para mi rutina. Productos de calidad y muy práctico no tener que buscar cada cosa.',
    rating: 5,
  },
  {
    name: 'Laura Martínez',
    role: 'Madre de 2',
    content: 'El pack Kids Eco es un acierto. Mis hijos meriendan sano y yo estoy tranquila sabiendo qué ingredientes llevan.',
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-eco">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Lo que dicen nuestros clientes
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-6 rounded-2xl shadow-eco-card"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-eco-accent text-eco-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-4">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div>
                <p className="font-medium">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
