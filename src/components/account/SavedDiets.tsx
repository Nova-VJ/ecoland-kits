import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Leaf, Trash2, ShoppingCart, Loader2, Download, ChevronDown, ChevronUp, X, Plus, Search, Repeat, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { catalogPacks } from '@/data/catalog/packs-catalog';
import { useToast } from '@/hooks/use-toast';
import { generateDietPdf } from '@/lib/dietPdfGenerator';
import ReactMarkdown from 'react-markdown';

interface Diet {
  id: string;
  title: string;
  diet_content: string;
  product_slugs: string[];
  created_at: string;
  subscription_active: boolean;
  subscription_interval: string | null;
  subscription_plan: string | null;
}

const DISCOUNTS: Record<string, { label: string; discount: number }> = {
  '3months': { label: '3 meses', discount: 0.10 },
  '6months': { label: '6 meses', discount: 0.15 },
  '1year': { label: '1 año', discount: 0.20 },
};

const getProductInfo = (slug: string) => {
  const product = allCatalogProducts.find(p => p.slug === slug);
  if (product) return { name: product.name, price: product.price, type: 'product' as const };
  const pack = catalogPacks.find(p => p.slug === slug);
  if (pack) return { name: pack.name, price: pack.price, type: 'pack' as const };
  return null;
};

export const SavedDiets = () => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState<string | null>(null);
  const { addCatalogProduct, addCatalogPack } = useCart();
  const { toast } = useToast();

  useEffect(() => { fetchDiets(); }, []);

  const fetchDiets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
        subscription_active: d.subscription_active || false,
        subscription_interval: d.subscription_interval,
        subscription_plan: d.subscription_plan,
      })));
    }
    setLoading(false);
  };

  const updateDiet = async (id: string, updates: Partial<Diet>) => {
    const dbUpdates: any = {};
    if (updates.product_slugs !== undefined) dbUpdates.product_slugs = updates.product_slugs;
    if (updates.subscription_active !== undefined) dbUpdates.subscription_active = updates.subscription_active;
    if (updates.subscription_interval !== undefined) dbUpdates.subscription_interval = updates.subscription_interval;
    if (updates.subscription_plan !== undefined) dbUpdates.subscription_plan = updates.subscription_plan;

    await supabase.from('saved_diets' as any).update(dbUpdates).eq('id', id);
    setDiets(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const removeProduct = (dietId: string, slug: string) => {
    const diet = diets.find(d => d.id === dietId);
    if (!diet) return;
    const newSlugs = diet.product_slugs.filter(s => s !== slug);
    updateDiet(dietId, { product_slugs: newSlugs });
    toast({ title: 'Producto eliminado de la dieta' });
  };

  const addProductToDiet = (dietId: string, slug: string) => {
    const diet = diets.find(d => d.id === dietId);
    if (!diet || diet.product_slugs.includes(slug)) return;
    updateDiet(dietId, { product_slugs: [...diet.product_slugs, slug] });
    setShowSearch(null);
    setSearchQuery('');
    toast({ title: 'Producto añadido a la dieta' });
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

  const downloadPdf = (diet: Diet) => {
    generateDietPdf({
      title: diet.title,
      dietContent: diet.diet_content,
      productSlugs: diet.product_slugs,
      createdAt: diet.created_at,
    });
    toast({ title: 'PDF descargado' });
  };

  const toggleSubscription = (diet: Diet) => {
    const newActive = !diet.subscription_active;
    updateDiet(diet.id, {
      subscription_active: newActive,
      subscription_interval: newActive ? (diet.subscription_interval || 'monthly') : diet.subscription_interval,
      subscription_plan: newActive ? (diet.subscription_plan || '3months') : diet.subscription_plan,
    });
  };

  const getTotalPrice = (slugs: string[]) =>
    slugs.reduce((sum, slug) => sum + (getProductInfo(slug)?.price || 0), 0);

  const getDiscountedPrice = (diet: Diet) => {
    const total = getTotalPrice(diet.product_slugs);
    const discount = diet.subscription_plan ? DISCOUNTS[diet.subscription_plan]?.discount || 0 : 0;
    return total * (1 - discount);
  };

  // Search results for adding products
  const searchResults = searchQuery.length >= 2
    ? [
        ...allCatalogProducts.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.includes(searchQuery.toLowerCase())
        ).slice(0, 5).map(p => ({ slug: p.slug, name: p.name, price: p.price, type: 'product' as const })),
        ...catalogPacks.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.includes(searchQuery.toLowerCase())
        ).slice(0, 3).map(p => ({ slug: p.slug, name: p.name, price: p.price, type: 'pack' as const })),
      ]
    : [];

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
    <div className="space-y-4">
      {diets.map(diet => {
        const isExpanded = expandedId === diet.id;
        const totalPrice = getTotalPrice(diet.product_slugs);
        const discountedPrice = getDiscountedPrice(diet);

        return (
          <div key={diet.id} className="border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-start justify-between gap-2">
              <button onClick={() => setExpandedId(isExpanded ? null : diet.id)} className="text-left flex-1 flex items-center gap-2">
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                <div>
                  <h4 className="font-medium text-sm">{diet.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(diet.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}{diet.product_slugs.length} productos · {totalPrice.toFixed(2)}€
                  </p>
                </div>
              </button>
              <div className="flex gap-1 flex-shrink-0">
                {diet.subscription_active && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Repeat className="h-3 w-3" />
                    {diet.subscription_interval === 'weekly' ? 'Semanal' : 'Mensual'}
                  </Badge>
                )}
                <Button size="icon" variant="ghost" onClick={() => downloadPdf(diet)} title="Descargar PDF">
                  <Download className="h-4 w-4" />
                </Button>
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

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t">
                {/* Products list */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Productos</h5>
                    <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => setShowSearch(showSearch === diet.id ? null : diet.id)}>
                      <Plus className="h-3 w-3" /> Añadir
                    </Button>
                  </div>

                  {/* Product search */}
                  {showSearch === diet.id && (
                    <div className="mb-3 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Buscar producto o pack..."
                          className="pl-8 h-8 text-xs"
                          autoFocus
                        />
                      </div>
                      {searchResults.length > 0 && (
                        <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                          {searchResults.map(r => (
                            <button
                              key={r.slug}
                              onClick={() => addProductToDiet(diet.id, r.slug)}
                              className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between text-xs"
                              disabled={diet.product_slugs.includes(r.slug)}
                            >
                              <span className={diet.product_slugs.includes(r.slug) ? 'text-muted-foreground' : ''}>
                                {r.type === 'pack' ? '📦 ' : ''}{r.name}
                              </span>
                              <span className="text-primary font-medium">{r.price.toFixed(2)}€</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product items */}
                  {diet.product_slugs.map(slug => {
                    const info = getProductInfo(slug);
                    return (
                      <div key={slug} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30 group">
                        <span className="text-xs flex-1">
                          {info ? (
                            <>{info.type === 'pack' ? '📦 ' : ''}{info.name}</>
                          ) : (
                            <span className="text-muted-foreground">{slug}</span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          {info && <span className="text-xs text-primary font-medium">{info.price.toFixed(2)}€</span>}
                          <button onClick={() => removeProduct(diet.id, slug)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {diet.product_slugs.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">Sin productos. Añade alguno.</p>
                  )}
                </div>

                {/* Subscription section */}
                <div className="border-t p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Suscripción periódica</span>
                    </div>
                    <Switch checked={diet.subscription_active} onCheckedChange={() => toggleSubscription(diet)} />
                  </div>

                  {diet.subscription_active && (
                    <div className="space-y-3 mt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Frecuencia</label>
                          <Select
                            value={diet.subscription_interval || 'monthly'}
                            onValueChange={v => updateDiet(diet.id, { subscription_interval: v })}
                          >
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="monthly">Mensual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Compromiso</label>
                          <Select
                            value={diet.subscription_plan || '3months'}
                            onValueChange={v => updateDiet(diet.id, { subscription_plan: v })}
                          >
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3months">3 meses (-10%)</SelectItem>
                              <SelectItem value="6months">6 meses (-15%)</SelectItem>
                              <SelectItem value="1year">1 año (-20%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Price summary */}
                      <div className="bg-background rounded-lg p-3 border">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Precio sin descuento</span>
                          <span className="line-through">{totalPrice.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold text-primary mt-1">
                          <span>Precio con {DISCOUNTS[diet.subscription_plan || '3months']?.label}</span>
                          <span>{discountedPrice.toFixed(2)}€</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Ahorras {(totalPrice - discountedPrice).toFixed(2)}€ por pedido ({(DISCOUNTS[diet.subscription_plan || '3months']?.discount * 100).toFixed(0)}% dto.)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Diet content */}
                <div className="border-t p-4">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Plan de comidas</h5>
                  <div className="prose prose-sm max-w-none text-sm">
                    <ReactMarkdown>{diet.diet_content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
