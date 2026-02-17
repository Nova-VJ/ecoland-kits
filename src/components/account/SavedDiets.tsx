import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Leaf, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { catalogPacks } from '@/data/catalog/packs-catalog';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface Diet {
  id: string;
  title: string;
  diet_content: string;
  product_slugs: string[];
  created_at: string;
}

export const SavedDiets = () => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { addCatalogProduct, addCatalogPack } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchDiets();
  }, []);

  const fetchDiets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('eco_coach_conversations' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Get saved diets
    const { data: dietsData } = await supabase
      .from('saved_diets' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dietsData) {
      setDiets(dietsData.map((d: any) => ({
        id: d.id,
        title: d.title,
        diet_content: d.diet_content,
        product_slugs: (d.product_slugs || []) as string[],
        created_at: d.created_at,
      })));
    }
    setLoading(false);
  };

  const addAllToCart = (slugs: string[]) => {
    let added = 0;
    slugs.forEach(slug => {
      const product = allCatalogProducts.find(p => p.slug === slug);
      if (product) { addCatalogProduct(product); added++; return; }
      const pack = catalogPacks.find(p => p.slug === slug);
      if (pack) { addCatalogPack(pack); added++; }
    });
    toast({ title: `${added} productos añadidos al carrito` });
  };

  const deleteDiet = async (id: string) => {
    await supabase.from('saved_diets' as any).delete().eq('id', id);
    setDiets(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Dieta eliminada' });
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (diets.length === 0) {
    return (
      <div className="text-center py-8">
        <Leaf className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No tienes dietas guardadas aún.</p>
        <p className="text-xs text-muted-foreground mt-1">Habla con el Eco-Coach y acepta una dieta para guardarla aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {diets.map(diet => (
        <div key={diet.id} className="border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <button
              onClick={() => setExpandedId(expandedId === diet.id ? null : diet.id)}
              className="text-left flex-1"
            >
              <h4 className="font-medium text-sm">{diet.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(diet.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </button>
            <div className="flex gap-1">
              {diet.product_slugs.length > 0 && (
                <Button size="icon" variant="ghost" onClick={() => addAllToCart(diet.product_slugs)} title="Añadir todo al carrito">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => deleteDiet(diet.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {expandedId === diet.id && (
            <div className="mt-3 pt-3 border-t prose prose-sm max-w-none text-sm">
              <ReactMarkdown>{diet.diet_content}</ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
