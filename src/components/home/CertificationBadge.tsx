import { motion } from 'framer-motion';
import euOrganicLogo from '@/assets/logos/eu-organic-logo.png';
import castillaLeonLogo from '@/assets/logos/castilla-leon.png';

export const CertificationBadge = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 px-4"
    >
      <div className="container-eco">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-eco-cream/30 rounded-2xl border border-eco-green/10">
          <div className="flex items-center gap-6">
            <img 
              src={euOrganicLogo} 
              alt="Certificación Ecológica Unión Europea" 
              className="h-16 md:h-20 w-auto"
            />
            <img 
              src={castillaLeonLogo} 
              alt="CAECyL - Producción Ecológica Castilla y León" 
              className="h-16 md:h-20 w-auto"
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg md:text-xl font-display font-semibold text-eco-dark">
              Solo productos de certificación ecológica
            </p>
            <p className="text-sm text-muted-foreground">
              Avalados por la Unión Europea y Castilla y León
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
