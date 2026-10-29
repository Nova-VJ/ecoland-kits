import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useProductViews } from '@/hooks/useProductViews';
import { formatPrice } from '@/lib/utils';

export const RecentlyViewed = () => {
  const { views, isLoading } = useProductViews();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}
      </div>
    );
  }

  if (views.length === 0) {
    return (
      <div className="text-center py-8">
        <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No has visitado ningún producto aún</p>
        <p className="text-xs text-muted-foreground mt-1">Explora la tienda para ver tu historial aquí</p>
      </div>
    );
  }

  // Deduplicate by product_id, keep most recent
  const unique = views.reduce<typeof views>((acc, v) => {
    if (!acc.find(x => x.product_id === v.product_id)) acc.push(v);
    return acc;
  }, []).slice(0, 8);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {unique.map((view, i) => {
        const linkPath = view.product_type === 'catalog-pack'
          ? `/tienda/pack/${view.product_id}`
          : `/tienda/producto/${view.product_id}`;

        return (
          <motion.div
            key={view.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={linkPath}
              className="group block bg-card rounded-xl border overflow-hidden hover:shadow-md transition-all"
            >
              {view.product_image && (
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={view.product_image}
                    alt={view.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-2">
                <p className="text-xs font-medium line-clamp-2">{view.product_name}</p>
                {view.product_price && (
                  <p className="text-xs font-bold text-primary mt-1">{formatPrice(Number(view.product_price))}</p>
                )}
                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">
                    {new Date(view.viewed_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};
