import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAbandonedCarts } from '@/hooks/useAbandonedCarts';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

export const AbandonedCarts = () => {
  const { carts, isLoading, markRecovered, deleteCart } = useAbandonedCarts();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
      </div>
    );
  }

  const activeCarts = carts.filter(c => !c.recovered);

  if (activeCarts.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No tienes carritos abandonados</p>
        <p className="text-xs text-muted-foreground mt-1">Los carritos que no completes aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeCarts.map((cart, i) => {
        const items = Array.isArray(cart.cart_items) ? cart.cart_items : [];
        const itemNames = items.slice(0, 3).map((item: any) => {
          if (item.type === 'catalog-product') return item.product?.name;
          if (item.type === 'catalog-pack') return item.pack?.name;
          if (item.type === 'pack') return item.pack?.name;
          if (item.type === 'product') return item.product?.name;
          return 'Producto';
        }).filter(Boolean);

        return (
          <motion.div
            key={cart.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {cart.item_count} artículo{cart.item_count !== 1 ? 's' : ''}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {Number(cart.total_price).toFixed(2)}€
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {new Date(cart.abandoned_at).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
              {itemNames.join(', ')}{items.length > 3 ? ` +${items.length - 3} más` : ''}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => deleteCart(cart.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Eliminar
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
