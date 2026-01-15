import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, Calendar, MapPin, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: string | null;
  shipping_city: string | null;
  items?: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const OrderHistory = ({ userId }: { userId: string }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          return { ...order, items: items || [] };
        })
      );

      setOrders(ordersWithItems);
      setIsLoading(false);
    };

    fetchOrders();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Aún no tienes pedidos</p>
        <p className="text-sm text-muted-foreground mt-1">
          ¡Explora nuestros packs y haz tu primer pedido!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card rounded-xl border overflow-hidden"
        >
          {/* Order Header */}
          <button
            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{order.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-700'}>
                {statusLabels[order.status] || order.status}
              </Badge>
              <span className="font-semibold text-primary">{order.total.toFixed(2)}€</span>
              {expandedOrder === order.id ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {/* Expanded Details */}
          {expandedOrder === order.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t bg-muted/30 p-4"
            >
              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Productos</h4>
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-card rounded-lg p-3">
                      <div>
                        <p className="font-medium">{item.item_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {item.unit_price.toFixed(2)}€
                        </p>
                      </div>
                      <span className="font-semibold">{item.total_price.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                {order.shipping_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Dirección de envío</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_address}
                        {order.shipping_city && `, ${order.shipping_city}`}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Resumen</p>
                    <p className="text-sm text-muted-foreground">
                      Subtotal: {order.subtotal.toFixed(2)}€ + Envío: {order.shipping_cost.toFixed(2)}€
                    </p>
                  </div>
                </div>
              </div>

              {/* Eco Points earned */}
              <div className="mt-4 p-3 bg-eco-soft/20 rounded-lg flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <p className="text-sm">
                  <span className="font-semibold text-eco-dark">+{Math.floor(order.total)} Eco Puntos</span>
                  {' '}ganados con este pedido
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};
