import ReactMarkdown from "react-markdown";
import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCatalogProductBySlug, catalogCategories } from '@/data/catalog';
import { useCart } from '@/context/CartContext';
import { useProductViews } from '@/hooks/useProductViews';
const productTags = [
  { id: 'bio', label: 'Bio' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'sin-gluten', label: 'Sin Gluten' },
  { id: 'sin-azucar', label: 'Sin Azúcar' },
  { id: 'proteina', label: 'Proteína' },
  { id: 'detox', label: 'Detox' },
  { id: 'fermentado', label: 'Fermentado' },
  { id: 'premium', label: 'Premium' },
  { id: 'probiotico', label: 'Probiótico' },
  { id: 'omega3', label: 'Omega-3' },
  { id: 'inmunidad', label: 'Inmunidad' },
  { id: 'energia', label: 'Energía' },
  { id: 'cbd', label: 'CBD' },
  { id: 'alto-fibra', label: 'Alto en Fibra' },
  { id: 'bajo-sodio', label: 'Bajo en Sodio' },
  { id: 'comercio-justo', label: 'Comercio Justo' },
];

const CatalogProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = getCatalogProductBySlug(slug || '');
  const { addCatalogProduct } = useCart();
  const { trackView } = useProductViews();

  useEffect(() => {
    if (product) {
      trackView({
        id: product.slug,
        type: 'catalog-product',
        name: product.name,
        image: product.image,
        price: product.price,
      });
    }
  }, [product, trackView]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Link to="/tienda">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = catalogCategories.find(c => c.id === product.category);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-4">
        <div className="container-eco">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Inicio</Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/tienda" className="text-muted-foreground hover:text-foreground">Tienda</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-eco py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-square rounded-3xl overflow-hidden bg-white p-6 border flex items-center justify-center shadow-xs"
          >
            <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {category && (
              <Badge variant="secondary" className="text-sm">
                {category.icon} {category.label}
              </Badge>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{product.name}</h1>

            {/* Certificado Ecológico Oficial UE */}
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-2xl">🌿</span>
              <div>
                <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Certificado de Agricultura Ecológica (Unión Europea)
                </div>
                <div className="text-xs text-emerald-800 font-medium">
                  Garantía oficial Euro-hoja · 100% libre de pesticidas sintéticos y organismos modificados
                </div>
              </div>
            </div>

            <Badge variant="outline">{product.brand}</Badge>

            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <Badge key={tag} className="bg-eco-soft/30 text-eco-dark border-0">
                  {productTags.find(t => t.id === tag)?.label || tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{product.price.toFixed(2)}€</span>
              {product.weight && <span className="text-muted-foreground">/ {product.weight}</span>}
              {product.inStock ? (
                <span className="text-eco-green flex items-center gap-1 ml-4">
                  <Check className="h-4 w-4" /> En stock
                </span>
              ) : (
                <span className="text-destructive ml-4">Agotado</span>
              )}
            </div>

            <div className="prose prose-emerald max-w-none text-slate-700 leading-relaxed text-base pt-6 border-t border-slate-200">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4 text-slate-700 leading-relaxed text-base">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold text-emerald-950 block text-lg mt-5 mb-1.5">{children}</strong>
                }}
              >
                {product.description}
              </ReactMarkdown>
            </div>

            <Button
              size="lg"
              className="w-full md:w-auto btn-primary"
              onClick={() => addCatalogProduct(product)}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.inStock ? 'Añadir al carrito' : 'Producto agotado'}
            </Button>

            <div className="space-y-4 pt-6 border-t">
              {product.ingredients && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Ingredientes</h3>
                  <p className="text-muted-foreground">{product.ingredients}</p>
                </div>
              )}

              {product.usage && (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 shadow-xs">
                  <h3 className="font-bold text-emerald-950 mb-2 flex items-center gap-2 text-base">
                    <span>🍳</span> Versatilidad en la cocina y aplicaciones saludables
                  </h3>
                  <div className="text-slate-700 text-sm whitespace-pre-line leading-relaxed font-normal">
                    {product.usage}
                  </div>
                </div>
              )}

              {product.allergens.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="h-4 w-4" /> Alérgenos
                  </h3>
                  <ul className="text-amber-700">
                    {product.allergens.map((allergen, i) => (
                      <li key={i}>{allergen}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Link to="/tienda" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la tienda
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CatalogProductDetail;
