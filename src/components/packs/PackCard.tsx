import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pack, PackSize, packSizes } from '@/data/packs';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface PackCardProps {
  pack: Pack;
  index?: number;
}

export const PackCard = ({ pack, index = 0 }: PackCardProps) => {
  const [selectedSize, setSelectedSize] = useState<PackSize>('M');
  const [isAdded, setIsAdded] = useState(false);
  const { addPack } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addPack(pack, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link to={`/packs/${pack.slug}`} className="block pack-card group">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={pack.image}
            alt={pack.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Tags */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {pack.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="eco-badge text-xs">
                {tag}
              </span>
            ))}
          </div>
          {/* Icon */}
          <div className="absolute top-3 right-3 text-2xl">
            {pack.icon}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
              {pack.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {pack.shortDescription}
            </p>
          </div>

          {/* Size Selector */}
          <div className="flex gap-1">
            {packSizes.map((size) => (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedSize === size
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xl font-display font-bold">
                {formatPrice(pack.prices[selectedSize])}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                / pack {selectedSize}
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleAdd}
              className={`gap-1.5 ${isAdded ? 'bg-eco-soft text-eco-dark' : ''}`}
            >
              {isAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Añadido
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Añadir
                </>
              )}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
