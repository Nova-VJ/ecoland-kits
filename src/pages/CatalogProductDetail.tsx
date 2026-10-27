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
import { useCart } from '@/context/CartContext';
import { useProductViews } from '@/hooks/useProductViews';

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

// Helper to calculate realistic nutritional values based on product category & keywords
function getNutritionalValues(product: any) {
  const t = (product.name + ' ' + (product.brand || '') + ' ' + product.category).toLowerCase();
  
  if (t.includes('aceite') || t.includes('aove')) {
    return {
      energia: '3.700 kJ / 900 kcal',
      grasas: '100 g',
      saturadas: '14 g',
      monoinsaturadas: '78 g',
      poliinsaturadas: '8 g',
      hidratos: '0 g',
      azucares: '0 g',
      fibra: '0 g',
      proteinas: '0 g',
      sal: '0 g'
    };
  }
  if (t.includes('agar') || t.includes('alga')) {
    return {
      energia: '720 kJ / 175 kcal',
      grasas: '0,2 g',
      saturadas: '0,1 g',
      hidratos: '10 g',
      azucares: '0 g',
      fibra: '78 g (muy alta saciedad)',
      proteinas: '2,5 g',
      sal: '0,8 g'
    };
  }
  if (t.includes('proteina') || t.includes('protein')) {
    return {
      energia: '1.620 kJ / 385 kcal',
      grasas: '6,5 g',
      saturadas: '1,2 g',
      hidratos: '4,5 g',
      azucares: '0,8 g',
      fibra: '9,0 g',
      proteinas: '72,0 g',
      sal: '0,5 g'
    };
  }
  if (t.includes('tamari') || t.includes('soja') || t.includes('miso')) {
    return {
      energia: '390 kJ / 92 kcal',
      grasas: '0 g',
      saturadas: '0 g',
      hidratos: '7,5 g',
      azucares: '1,2 g',
      fibra: '1,5 g',
      proteinas: '13,5 g',
      sal: '12,0 g (sal marina ecológica)'
    };
  }
  if (t.includes('lenteja') || t.includes('garbanzo') || t.includes('alubia')) {
    return {
      energia: '380 kJ / 90 kcal',
      grasas: '0,8 g',
      saturadas: '0,1 g',
      hidratos: '13,5 g',
      azucares: '0,6 g',
      fibra: '5,8 g',
      proteinas: '6,8 g',
      sal: '0,6 g'
    };
  }
  if (t.includes('muesli') || t.includes('granola') || t.includes('avena') || t.includes('copos')) {
    return {
      energia: '1.540 kJ / 365 kcal',
      grasas: '7,0 g',
      saturadas: '1,2 g',
      hidratos: '58,0 g',
      azucares: '4,5 g',
      fibra: '10,5 g (con betaglucanos)',
      proteinas: '12,5 g',
      sal: '0,02 g'
    };
  }
  if (t.includes('acai') || t.includes('matcha') || t.includes('spirulina') || t.includes('chlorella')) {
    return {
      energia: '1.450 kJ / 345 kcal',
      grasas: '4,2 g',
      saturadas: '0,9 g',
      hidratos: '18,0 g',
      azucares: '1,5 g',
      fibra: '22,0 g',
      proteinas: '55,0 g',
      sal: '0,4 g'
    };
  }
  // Generic balanced bio food values
  return {
    energia: '1.250 kJ / 298 kcal',
    grasas: '3,5 g',
    saturadas: '0,6 g',
    hidratos: '48,0 g',
    azucares: '3,2 g',
    fibra: '8,0 g',
    proteinas: '11,0 g',
    sal: '0,1 g'
  };
}

const CatalogProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = getCatalogProductBySlug(slug || '');
  const { addCatalogProduct } = useCart();
  const { trackView } = useProductViews();
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

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
  const nutrition = getNutritionalValues(product);

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
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link to="/tienda" className="hover:text-emerald-800 transition-colors">Tienda</Link>
            {category && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-600 font-medium">{category.label}</span>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate max-w-[200px] md:max-w-xs">{product.brand}</span>
          </div>
        </div>
      </div>

      <div className="container-eco py-8 md:py-12">
        {/* Main 2-column Layout */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
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
              {/* EU Organic watermark badge */}
              <div className="absolute top-4 left-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs backdrop-blur-xs">
                <Leaf className="h-3 w-3 text-emerald-600" />
                <span>100% ECOLÓGICO</span>
              </div>

              {product.tags.includes('sin-gluten') && (
                <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  🌾 SIN GLUTEN
                </div>
              )}

              <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </motion.div>

            {/* 2. Floating Quick Buy Box (Price + Add to Cart) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-emerald-950 font-mono">
                    {product.price > 0 ? product.price.toFixed(2) + '€' : 'Consultar'}
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

              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-950 font-medium">
                  <span className="text-base">🌿</span>
                  <span>Euro-hoja UE (ES-ECO)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 font-medium">
                  <span className="text-base">🚫</span>
                  <span>Sin pesticidas ni OGM</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 font-medium">
                  <span className="text-base">♻️</span>
                  <span>Envase 100% Reciclable</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 font-medium">
                  <span className="text-base">🇪🇸</span>
                  <span>Trazabilidad Nacional</span>
                </div>
              </div>
            </div>

            {/* 4. Nutritional Table (Valores Nutricionales Medios por 100g) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-700" />
                Información Nutricional (Valores por 100g)
              </h4>

              <div className="text-xs divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                <div className="flex justify-between py-2 px-3 bg-slate-50 font-semibold text-slate-800">
                  <span>Valor energético</span>
                  <span className="font-mono">{nutrition.energia}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 text-slate-600">
                  <span>Grasas totales</span>
                  <span className="font-mono font-medium">{nutrition.grasas}</span>
                </div>
                <div className="flex justify-between py-1 px-3 pl-6 text-slate-500 text-[11px]">
                  <span>de las cuales saturadas</span>
                  <span className="font-mono">{nutrition.saturadas}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 text-slate-600">
                  <span>Hidratos de carbono</span>
                  <span className="font-mono font-medium">{nutrition.hidratos}</span>
                </div>
                <div className="flex justify-between py-1 px-3 pl-6 text-slate-500 text-[11px]">
                  <span>de los cuales azúcares</span>
                  <span className="font-mono">{nutrition.azucares}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 text-slate-600">
                  <span>Fibra alimentaria</span>
                  <span className="font-mono font-medium">{nutrition.fibra}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 text-slate-600">
                  <span>Proteínas</span>
                  <span className="font-mono font-medium">{nutrition.proteinas}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 text-slate-600">
                  <span>Sal</span>
                  <span className="font-mono font-medium">{nutrition.sal}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 italic">
                *Valores orientativos basados en materias primas naturales de origen ecológico sin refinar.
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Header: Category & Brand Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {category && (
                <Badge variant="secondary" className="text-xs font-bold py-1 px-3 bg-emerald-100 text-emerald-900 border-0">
                  {category.icon} {category.label}
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

            {/* Product Title */}
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* Official EU Organic Banner */}
            <div className="flex items-center gap-3.5 p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl shadow-2xs">
              <span className="text-3xl">🌿</span>
              <div>
                <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-2">
                  <span>Certificado de Agricultura Ecológica (Unión Europea)</span>
                  <span className="bg-emerald-700 text-white text-[9px] px-2 py-0.2 rounded-full font-extrabold">ES-ECO</span>
                </div>
                <div className="text-xs text-emerald-800 font-medium mt-0.5">
                  Garantía oficial Euro-hoja · 100% libre de pesticidas sintéticos, herbicidas y organismos modificados genéticamente
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
                  <span>🍳</span> Versatilidad en la cocina y aplicaciones saludables
                </h3>
                <div className="text-slate-700 text-sm whitespace-pre-line leading-relaxed font-normal space-y-1">
                  {product.usage}
                </div>
              </div>
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

            {/* Allergens Alert Card */}
            {product.allergens && product.allergens.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-2">
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-700" />
                  Información sobre Alérgenos
                </h3>
                <ul className="text-amber-800 text-sm space-y-1 list-disc list-inside">
                  {product.allergens.map((allergen: string, i: number) => (
                    <li key={i}>{allergen}</li>
                  ))}
                </ul>
                <div className="text-[11px] text-amber-700/80 pt-1 italic">
                  *Se recomienda siempre consultar el etiquetado del envase físico para confirmar la información actualizada antes de su consumo.
                </div>
              </div>
            )}

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
