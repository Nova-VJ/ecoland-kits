import ReactMarkdown from "react-markdown";
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ShoppingCart, Check, AlertTriangle, ShieldCheck, 
  Truck, Leaf, Award, Recycle, Sparkles, HeartHandshake, FileText, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCatalogProductBySlug, catalogCategories } from '@/data/catalog';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/context/CatalogContext';
import { useProductViews } from '@/hooks/useProductViews';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { ProductHealthPanel } from '@/components/salud/ProductHealthPanel';
import euOrganicLogo from '@/assets/logos/eu-organic-logo.png';
import { useProductFicha, ProductFichaBody, ProductFichaClosing } from '@/components/catalog/ProductFicha';
import { ProductDietBadges } from '@/components/common/ProductDietBadges';

const productTags = [
  { id: 'bio', label: '100% Bio' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'sin-gluten', label: 'Sin Gluten' },
  { id: 'sin-azucar', label: 'Sin Azúcar Añadido' },
  { id: 'proteina', label: 'Rico en Proteína' },
  { id: 'detox', label: 'Detox' },
  { id: 'fermentado', label: 'Fermentación Natural' },
  { id: 'premium', label: 'Calidad Gourmet' },
  { id: 'probiotico', label: 'Probiótico' },
  { id: 'omega3', label: 'Rico en Omega-3' },
  { id: 'inmunidad', label: 'Inmunidad' },
  { id: 'energia', label: 'Energía' },
  { id: 'cbd', label: 'CBD' },
  { id: 'alto-fibra', label: 'Alto en Fibra' },
  { id: 'bajo-sodio', label: 'Bajo en Sodio' },
  { id: 'comercio-justo', label: 'Comercio Justo' },
];

const CatalogProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getProductBySlug } = useCatalog();
  const product = getProductBySlug(slug || '');
  const { addCatalogProduct } = useCart();
  const { trackView } = useProductViews();
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [userDietTags, setUserDietTags] = useState<string[]>([]);
  const ficha = useProductFicha(product?.id);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecoland-diet-tags');
      if (saved) setUserDietTags(JSON.parse(saved));
    } catch {}
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border max-w-md">
          <h1 className="text-2xl font-bold mb-3 text-slate-800">Producto no encontrado</h1>
          <p className="text-slate-500 mb-6 text-sm">El producto que buscas no está disponible o ha cambiado de enlace.</p>
          <Link to="/tienda">
            <Button className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al catálogo completo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = catalogCategories.find(c => c.id === product.category);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addCatalogProduct(product);
    }
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200/80 py-3.5">
        <div className="container-eco">
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
            <Link to="/" className="hover:text-emerald-800 transition-colors">Inicio</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
            <Link to="/tienda" className="hover:text-emerald-800 transition-colors">Tienda</Link>
            {category && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-slate-600 font-medium">{category.label}</span>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-900 font-semibold truncate max-w-[200px] md:max-w-xs">{product.brand}</span>
          </div>
        </div>
      </div>

      <div className="container-eco py-8 md:py-12">
        {/* Main 2-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================= */}
          {/* LEFT COLUMN: STICKY PHOTO & RICH WIDGETS */}
          {/* ========================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            
            {/* 1. Main Packshot Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-square rounded-3xl overflow-hidden bg-white p-8 border border-slate-200/90 flex items-center justify-center shadow-xs relative group"
            >
              {/* EU Organic watermark badge (solo si el producto es ecológico) */}
              {product.tags.includes('bio') && <div className="absolute top-4 left-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs backdrop-blur-xs">
                <Leaf className="h-3 w-3 text-emerald-600" />
                <span>ECOLÓGICO</span>
              </div>}

              {product.tags.includes('sin-gluten') && (
                <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  DECLARADO SIN GLUTEN
                </div>
              )}

              <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              {product.image.includes('openfoodfacts.org') && (
                <a
                  href="https://world.openfoodfacts.org"
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2 py-0.5 text-xs text-slate-500"
                >
                  Foto: Open Food Facts (CC BY-SA)
                </a>
              )}
            </motion.div>

            {/* 2. Floating Quick Buy Box (Price + Add to Cart) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-emerald-950 tabular-nums">
                    {product.price > 0 ? formatPrice(product.price) : 'Consultar'}
                  </span>
                  <span className="text-xs text-slate-500 ml-2 font-medium">
                    IVA incluido (10%) · {product.weight || 'Envase estándar'}
                  </span>
                </div>
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                    <Check className="h-3.5 w-3.5" /> En stock
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded-full">
                    Agotado
                  </span>
                )}
              </div>

              {/* Quantity Selector + Add Button */}
              <div className="flex gap-3 items-center">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2.5 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 font-semibold text-slate-800 text-sm">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2.5 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                <Button
                  size="lg"
                  className={`flex-1 font-bold text-sm h-12 shadow-sm transition-all cursor-pointer ${
                    addedAnimation 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                  }`}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addedAnimation ? '✓ ¡Añadido a la cesta!' : 'Añadir al carrito'}
                </Button>
              </div>
            </div>

            {/* 3. Official Quality & Ecological Seals Grid (Like Drasanvi/Iswari) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-700" />
                Garantías y Certificados Oficiales
              </h4>

              <div className="flex items-center gap-4 pt-1">
                <img src={euOrganicLogo} alt="Logotipo de producción ecológica de la Unión Europea" className="h-14 w-auto rounded-sm shrink-0" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <p className="font-bold text-slate-900">Producción ecológica certificada (UE)</p>
                  <p>Cultivado y elaborado según el Reglamento (UE) 2018/848: sin pesticidas de síntesis ni OGM.</p>
                </div>
              </div>
            </div>

            {/* 5. Trust & Service Guarantees Card */}
            <div className="bg-emerald-950 text-emerald-50 rounded-2xl p-5 shadow-xs space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Compromiso y Confianza Ecoland
              </h4>
              <ul className="text-xs space-y-2.5 text-emerald-100/90 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Truck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Envío Seguro 24/48h:</strong> Embalaje biodegradable protegido contra roturas y temperatura controlada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Recycle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Huella Neutra:</strong> Envíos con compensación de emisiones y residuo mínimo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <HeartHandshake className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Atención de Tienda Física:</strong> Asesoramiento experto real por nuestros especialistas en herbolario y nutrición.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* ========================================= */}
          {/* RIGHT COLUMN: RICH GOURMET EDITORIAL CONTENT */}
          {/* ========================================= */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Header: Category & Brand Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {category && (
                <Badge variant="secondary" className="text-xs font-bold py-1 px-3 bg-emerald-100 text-emerald-900 border-0">
                  <CategoryIcon id={category.id} className="inline -mt-0.5 mr-1" />{category.label}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs font-bold py-1 px-3 text-slate-700 border-slate-300">
                Marca: {product.brand}
              </Badge>
              {product.weight && (
                <Badge variant="secondary" className="text-xs font-medium py-1 px-2.5 bg-slate-100 text-slate-600 border-0">
                  📦 {product.weight}
                </Badge>
              )}
            </div>

            {/* Perfil Alimentario Compatibility Banner */}
            {userDietTags.length > 0 && (
              <div className="p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-xs transition-all bg-emerald-50/80 border-emerald-200/80 text-emerald-950">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🌿</span>
                  <div>
                    <span className="font-bold">Tu Perfil Alimentario: </span>
                    <span>
                      {userDietTags.includes('sin-gluten') && (product.tags.includes('sin-gluten') ? 'Declarado sin gluten • ' : '⚠️ Precaución con gluten • ')}
                      {userDietTags.includes('vegano') && (product.tags.includes('vegano') ? 'Vegano • ' : '⚠️ No vegano • ')}
                      {userDietTags.includes('proteina') && (product.tags.includes('proteina') ? '💪 Alto en proteína • ' : '')}
                      {userDietTags.includes('bio') ? '✨ Certificado Bio UE' : 'Garantía Ecoland'}
                    </span>
                  </div>
                </div>
                <Link to="/tienda" className="text-[11px] font-semibold text-emerald-800 hover:underline shrink-0">
                  Modificar perfil
                </Link>
              </div>
            )}

            {/* Product Title */}
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-snug">
              {ficha?.titulo ?? product.name}
            </h1>
            <ProductDietBadges productId={product.id} max={6} />

            {/* Official EU Organic Banner */}
            <div className="flex items-center gap-3.5 p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl shadow-2xs">
              <img src={euOrganicLogo} alt="Logotipo de producción ecológica de la Unión Europea" className="h-10 w-auto rounded-sm shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Producto ecológico certificado (Unión Europea)
                </div>
                <div className="text-xs text-emerald-800 font-medium mt-0.5">
                  Sin pesticidas de síntesis ni organismos modificados genéticamente
                </div>
              </div>
            </div>

            {/* Tags Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {product.tags.map(tag => (
                <Badge key={tag} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 text-xs py-1 px-2.5 font-semibold">
                  {productTags.find(t => t.id === tag)?.label || tag}
                </Badge>
              ))}
            </div>

            {ficha ? (
              <ProductFichaBody ficha={ficha} />
            ) : (
              <>
            {/* Deep Gourmet Description (Rendered with ReactMarkdown) */}
            <div className="prose prose-emerald max-w-none text-slate-700 leading-relaxed text-base pt-6 border-t border-slate-200">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4 text-slate-700 leading-relaxed text-base">{children}</p>,
                  strong: ({ children }) => <strong className="font-extrabold text-emerald-950 block text-lg mt-6 mb-2">{children}</strong>
                }}
              >
                {product.description}
              </ReactMarkdown>
            </div>

            {/* Versatility in Kitchen Card */}
            {product.usage && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 shadow-xs space-y-3">
                <h3 className="font-extrabold text-emerald-950 text-lg flex items-center gap-2.5">
                  <span>🍳</span> Versatilidad en la cocina
                </h3>
                <div className="text-slate-700 text-sm whitespace-pre-line leading-relaxed font-normal space-y-1">
                  {product.usage}
                </div>
              </div>
            )}

              </>
            )}

            {/* Ingredients Card */}
            {product.ingredients && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  Lista de Ingredientes
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{product.ingredients}</p>
              </div>
            )}

            <ProductHealthPanel product={product} />

            {/* Allergens Alert Card */}
            {(ficha?.alergenos_texto || (product.allergens && product.allergens.length > 0)) && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-2">
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-700" />
                  Información sobre Alérgenos
                </h3>
                {ficha?.alergenos_texto ? (
                  <p className="text-amber-900 text-sm leading-relaxed">{ficha.alergenos_texto}</p>
                ) : (
                <ul className="text-amber-800 text-sm space-y-1 list-disc list-inside">
                  {product.allergens.map((allergen: string, i: number) => (
                    <li key={i}>{allergen}</li>
                  ))}
                </ul>
                )}

                <div className="text-[11px] text-amber-700/80 pt-1 italic">
                  *Se recomienda siempre consultar el etiquetado del envase físico para confirmar la información actualizada antes de su consumo.
                </div>
              </div>
            )}

            {ficha && <ProductFichaClosing ficha={ficha} />}

            {/* Back to Catalog Link */}
            <div className="pt-4">
              <Link to="/tienda" className="inline-flex items-center text-emerald-800 hover:text-emerald-900 font-bold text-sm hover:underline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver a explorar todos los productos
              </Link>
            </div>

          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default CatalogProductDetail;
