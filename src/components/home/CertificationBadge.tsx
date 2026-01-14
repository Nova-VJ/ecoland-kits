import { motion } from 'framer-motion';
import euOrganicLogo from '@/assets/logos/eu-organic-logo.svg';
import castillaLeonLogo from '@/assets/logos/castilla-leon.svg';

export const CertificationBadge = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 px-4"
    >
      <div className="container-eco">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex items-center gap-4">
            <img 
              src={euOrganicLogo} 
              alt="Certificación Ecológica Unión Europea" 
              className="h-14 md:h-16 w-auto"
            />
            <img 
              src={castillaLeonLogo} 
              alt="Producción Ecológica Castilla y León" 
              className="h-10 md:h-12 w-auto rounded"
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg md:text-xl font-display font-semibold text-primary">
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
