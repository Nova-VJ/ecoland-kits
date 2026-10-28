import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Package, Leaf, TrendingUp, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface OrderWithProfile {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total: number;
  user_id: string;
  full_name: string | null;
  eco_points: number | null;
  phone: string | null;
  points_awarded: number;
}

interface UserStats {
  user_id: string;
  full_name: string | null;
  eco_points: number;
  total_orders: number;
  total_spent: number;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<OrderWithProfile[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (!profile?.is_admin) {
        navigate('/cuenta');
        return;
      }

      setIsAdmin(true);

      // Fetch all orders with profile data using the view
      const { data: ordersData, error: ordersError } = await supabase
        .from('admin_orders_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      } else {
        setOrders(ordersData || []);
      }

      // Calculate user stats
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, eco_points');

      if (profiles) {
        const stats: UserStats[] = profiles.map((p) => {
          const userOrders = (ordersData || []).filter((o) => o.user_id === p.user_id);
          return {
            user_id: p.user_id,
            full_name: p.full_name,
            eco_points: p.eco_points || 0,
            total_orders: userOrders.length,
            total_spent: userOrders.reduce((sum, o) => sum + Number(o.total), 0),
          };
        }).filter(s => s.total_orders > 0 || s.eco_points > 0);

        setUserStats(stats.sort((a, b) => b.eco_points - a.eco_points));
      }

      setIsLoading(false);
    };

    checkAdminAndFetchData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const totalEcoPoints = userStats.reduce((sum, u) => sum + u.eco_points, 0);
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-eco">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cuenta')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold">Panel de Admin</h1>
              <p className="text-muted-foreground">Gestión de pedidos y eco puntos</p>
            </div>
          </div>

          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => navigate('/admin/product-insights')}
              className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Laboratorio Product Insights (P2.5)</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl p-6 border">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total Pedidos</span>
              </div>
              <p className="text-3xl font-bold">{orders.length}</p>
            </div>
            <div className="bg-card rounded-xl p-6 border">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Ingresos Totales</span>
              </div>
              <p className="text-3xl font-bold">{totalRevenue.toFixed(2)}€</p>
            </div>
            <div className="bg-card rounded-xl p-6 border">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Clientes Activos</span>
              </div>
              <p className="text-3xl font-bold">{userStats.length}</p>
            </div>
            <div className="bg-card rounded-xl p-6 border">
              <div className="flex items-center gap-3 mb-2">
                <Leaf className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Eco Puntos Totales</span>
              </div>
              <p className="text-3xl font-bold">{totalEcoPoints}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-display text-xl font-semibold mb-4">Pedidos Recientes</h2>
              <div className="space-y-3">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.full_name || 'Usuario'} • {new Date(order.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{Number(order.total).toFixed(2)}€</p>
                      <Badge variant="secondary" className="text-xs">
                        +{order.points_awarded} pts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Eco Points Ranking */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-display text-xl font-semibold mb-4">Ranking Eco Puntos</h2>
              <div className="space-y-3">
                {userStats.slice(0, 10).map((user, index) => (
                  <div key={user.user_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-amber-400 text-amber-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-amber-600 text-amber-100' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{user.full_name || 'Usuario'}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.total_orders} pedidos • {user.total_spent.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary">{user.eco_points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
