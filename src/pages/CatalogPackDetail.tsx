import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCatalogPackBySlug, CatalogPack } from '@/data/catalog';
import { useCart } from '@/context/CartContext';
import { useProductViews } from '@/hooks/useProductViews';
import { formatPrice } from '@/lib/utils';

const CatalogPackDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const pack = getCatalogPackBySlug(slug || '');
  const { addCatalogPack } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const { trackView } = useProductViews();

  useEffect(() => {
    if (pack) {
      trackView({
        id: pack.slug,
        type: 'catalog-pack',
        name: pack.name,
        image: pack.image,
        price: pack.price,
      });
    }
  }, [pack, trackView]);

  if (!pack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pack no encontrado</h1>
          <Link to="/tienda">
            <Button><ArrowLeft className="h-4 w-4 mr-2" /> Volver a la tienda</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    addCatalogPack(pack);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const getTierLabel = (tier: CatalogPack['tier']) => {
    const map = { basic: 'Basic', standard: 'Standard', premium: 'Premium', 'premium-top': 'Premium TOP' };
    return map[tier];
  };

  const getTierStyle = (tier: CatalogPack['tier']) => {
    const map = {
      basic: 'bg-eco-cream text-eco-dark',
      standard: 'bg-primary/20 text-primary',
      premium: 'bg-amber-100 text-amber-800',
      'premium-top': 'bg-gradient-to-r from-amber-200 to-yellow-300 text-amber-900',
    };
    return map[tier];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-4">
        <div className="container-eco">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Inicio</Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/tienda" className="text-muted-foreground hover:text-foreground">Tienda</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{pack.name}</span>
          </div>
        </div>
      </div>

      <div className="container-eco py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-video rounded-3xl overflow-hidden bg-muted relative">
              <img src={pack.image} alt={pack.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="text-3xl">{pack.icon}</span>
                <Badge className={getTierStyle(pack.tier)}>{getTierLabel(pack.tier)}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {pack.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{pack.name}</h1>
              <p className="text-lg text-muted-foreground mt-2">{pack.shortDescription}</p>
            </div>

            <p className="text-muted-foreground">{pack.description}</p>

            <div className="flex items-end justify-between pt-4 border-t">
              <div>
                <p className="text-3xl font-display font-bold text-primary">{formatPrice(pack.price)}</p>
                <p className="text-sm text-muted-foreground">{pack.products.length} productos incluidos</p>
              </div>
              <Button
                size="lg"
                className={`btn-hero ${isAdded ? 'bg-eco-soft' : ''}`}
                onClick={handleAdd}
              >
                {isAdded ? (
                  <><Check className="h-5 w-5" /> Añadido</>
                ) : (
                  <><ShoppingBag className="h-5 w-5" /> Añadir al carrito</>
                )}
              </Button>
            </div>

            {/* Products included */}
            <div className="pt-6 border-t">
              <h3 className="font-display text-xl font-semibold mb-4">Productos incluidos</h3>
              <div className="space-y-2">
                {pack.products.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-primary">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* For whom */}
            <div className="grid md:grid-cols-2 gap-4 pt-6 border-t">
              <div>
                <h4 className="font-medium mb-2">¿Para quién es?</h4>
                <p className="text-sm text-muted-foreground">{pack.forWhom}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">¿Cuándo usarlo?</h4>
                <p className="text-sm text-muted-foreground">{pack.whenToUse}</p>
              </div>
            </div>

            {/* Allergens */}
            {pack.allergens.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Alérgenos</h4>
                    <p className="text-sm text-amber-700">{pack.allergens.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}

            <Link to="/tienda" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la tienda
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPackDetail;
