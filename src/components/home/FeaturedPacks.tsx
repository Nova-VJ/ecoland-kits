import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PackCard } from '@/components/packs/PackCard';
import { getFeaturedPacks } from '@/data/packs';

export const FeaturedPacks = () => {
  const featuredPacks = getFeaturedPacks().slice(0, 6);

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-eco">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="eco-badge mb-4 inline-flex">⭐ Los más vendidos</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Packs para cada objetivo
          </h2>
          <p className="text-muted-foreground mt-4">
            Elige el pack que mejor se adapta a tus necesidades. 
            Todos con productos ecológicos de calidad.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featuredPacks.map((pack, i) => (
            <PackCard key={pack.id} pack={pack} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/packs">
            <Button size="lg" variant="outline" className="gap-2">
              Ver todos los packs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
