import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Package, Repeat, Crown, LogOut, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  is_club_member: boolean;
  subscription_active: boolean;
}

const Cuenta = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      setUser(user);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || '',
          postal_code: profileData.postal_code || '',
        });
      }
      
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos se han guardado correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error al guardar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-eco max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">Mi cuenta</h1>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Status Cards */}
            <div className="lg:col-span-1 space-y-4">
              {/* Club Status */}
              <div className={`rounded-2xl p-6 border ${profile?.is_club_member ? 'bg-eco-soft/20 border-eco-green' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Crown className={`h-6 w-6 ${profile?.is_club_member ? 'text-eco-green' : 'text-muted-foreground'}`} />
                  <h3 className="font-semibold">Club Eco</h3>
                </div>
                {profile?.is_club_member ? (
                  <Badge className="bg-eco-green text-white">Miembro activo</Badge>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      Únete y obtén un 10% en todos los packs
                    </p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/club')}>
                      Unirme al club
                    </Button>
                  </>
                )}
              </div>

              {/* Subscription Status */}
              <div className={`rounded-2xl p-6 border ${profile?.subscription_active ? 'bg-primary/10 border-primary' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Repeat className={`h-6 w-6 ${profile?.subscription_active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <h3 className="font-semibold">Suscripción</h3>
                </div>
                {profile?.subscription_active ? (
                  <Badge className="bg-primary text-primary-foreground">Activa</Badge>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      Recibe tus packs favoritos cada mes
                    </p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/suscripcion')}>
                      Ver opciones
                    </Button>
                  </>
                )}
              </div>

              {/* Orders */}
              <div className="rounded-2xl p-6 border bg-muted/30">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="h-6 w-6 text-muted-foreground" />
                  <h3 className="font-semibold">Mis pedidos</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Aún no tienes pedidos
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border p-6">
                <h2 className="font-display text-xl font-semibold mb-6">Datos personales</h2>
                
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nombre completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                          className="pl-10"
                          placeholder="Tu nombre"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10"
                          placeholder="+34 600 000 000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="pl-10"
                        placeholder="Calle, número, piso..."
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Madrid"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Código postal</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                        placeholder="28001"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSave} disabled={isSaving} className="btn-primary">
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cuenta;
