import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProductViews } from '@/hooks/useProductViews';
import { allCatalogProducts, catalogPacks } from '@/data/catalog';
import { useCart } from '@/context/CartContext';

export const PersonalizedOffers = () => {
  const { views } = useProductViews();
  const { addCatalogProduct, addCatalogPack } = useCart();

  const recommendations = useMemo(() => {
    if (views.length === 0) {
      // No history: show featured packs
      return {
        products: allCatalogProducts.filter(p => p.tags.includes('bio')).slice(0, 4),
        packs: catalogPacks.filter(p => p.featured).slice(0, 2),
        reason: 'Productos populares que te pueden interesar',
      };
    }

    // Analyze viewed products to find preferred categories and tags
    const viewedIds = new Set(views.map(v => v.product_id));
    const categoryCount: Record<string, number> = {};
    const tagCount: Record<string, number> = {};

    views.forEach(v => {
      const product = allCatalogProducts.find(p => p.id === v.product_id || p.slug === v.product_id);
      if (product) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        product.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
      }
    });

    const topCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);

    // Recommend unseen products from preferred categories/tags
    const recommended = allCatalogProducts
      .filter(p => !viewedIds.has(p.id) && !viewedIds.has(p.slug))
      .map(p => {
        let score = 0;
        if (topCategories.includes(p.category)) score += 3;
        p.tags.forEach(t => { if (topTags.includes(t)) score += 1; });
        return { product: p, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(r => r.product);

    // Recommend packs matching preferred categories
    const recommendedPacks = catalogPacks
      .filter(p => topCategories.includes(p.category) || topTags.some(t => p.tags.some(pt => pt.toLowerCase().includes(t))))
      .slice(0, 2);

    return {
      products: recommended.length > 0 ? recommended : allCatalogProducts.slice(0, 4),
      packs: recommendedPacks.length > 0 ? recommendedPacks : catalogPacks.filter(p => p.featured).slice(0, 2),
      reason: recommended.length > 0
        ? `Basado en tus visitas a ${topCategories[0] || 'productos'}`
        : 'Productos populares que te pueden interesar',
    };
  }, [views]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm text-muted-foreground">{recommendations.reason}</span>
      </div>

      {/* Recommended Products */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {recommendations.products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/tienda/producto/${product.slug}`}
              className="group block bg-card rounded-xl border overflow-hidden hover:shadow-md transition-all relative"
            >
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-primary/90 text-primary-foreground text-[10px] gap-1">
                  <Tag className="h-2.5 w-2.5" />
                  Para ti
                </Badge>
              </div>
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium line-clamp-2">{product.name}</p>
                <p className="text-xs font-bold text-primary mt-1">{product.price.toFixed(2)}€</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recommended Packs */}
      {recommendations.packs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Packs recomendados</h4>
          {recommendations.packs.map((pack, i) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 bg-card rounded-xl border p-3 hover:shadow-md transition-all"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img src={pack.image} alt={pack.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{pack.icon}</span>
                  <p className="font-medium text-sm">{pack.name}</p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{pack.shortDescription}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-primary">{pack.price.toFixed(2)}€</p>
                <Button size="sm" variant="outline" className="text-xs mt-1" onClick={(e) => {
                  e.preventDefault();
                  addCatalogPack(pack);
                }}>
                  Añadir
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
