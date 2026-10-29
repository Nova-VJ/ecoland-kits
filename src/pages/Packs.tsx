import { useState } from 'react';
import { motion } from 'framer-motion';
import { PackCard } from '@/components/packs/PackCard';
import { packs, objectives } from '@/data/packs';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/components/common/CategoryIcon';

const Packs = () => {
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);

  const filteredPacks = packs.filter(pack => {
    if (selectedObjective && !pack.objectives.some(o => o.toLowerCase().includes(selectedObjective.toLowerCase()))) {
      return false;
    }
    return true;
  });

  return (
    <div className="section-padding bg-muted/20">
      <div className="container-eco">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Nuestros Packs
          </h1>
          <p className="text-muted-foreground mt-4">
            12 packs ecológicos para cada objetivo. Elige el tuyo.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            <Button
              variant={selectedObjective === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedObjective(null)}
            >
              Todos
            </Button>
            {objectives.map(obj => (
              <Button
                key={obj.id}
                variant={selectedObjective === obj.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedObjective(obj.id)}
                className="gap-1"
              >
                <CategoryIcon id={obj.id} />
                {obj.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPacks.map((pack, i) => (
            <PackCard key={pack.id} pack={pack} index={i} />
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          ⚠️ Sustituciones: algunos productos pueden variar por stock manteniendo equivalencia.
        </p>
      </div>
    </div>
  );
};

export default Packs;
