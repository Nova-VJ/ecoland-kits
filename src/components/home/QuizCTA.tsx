import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ecoCoachFull from '@/assets/eco-coach.svg';

export const QuizCTA = () => {
  return (
    <section className="section-padding">
      <div className="container-eco">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/30 to-eco-soft/20 p-8 md:p-12 lg:p-16">
          {/* Pattern */}
          <div className="absolute inset-0 bg-eco-pattern opacity-20" />
          
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="eco-badge inline-flex gap-2">
                <Sparkles className="w-4 h-4" />
                Recomendación personalizada
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                ¿No sabes cuál elegir?
              </h2>
              <p className="text-lg text-muted-foreground">
                Haz el test y te recomendamos 2 packs perfectos para ti. 
                Solo 7 preguntas rápidas.
              </p>
              <Link to="/quiz">
                <Button className="btn-hero">
                  Hacer el test
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Eco Coach Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="w-64 h-64 md:w-80 md:h-80">
                <img 
                  src={ecoCoachFull} 
                  alt="Eco-Coach" 
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
