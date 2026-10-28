import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Sparkles, Check, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

// Limpiador estético del nombre del producto
function cleanTitle(name: string): string {
  const parts = name.split('–');
  if (parts.length > 1) {
    let clean = parts[1].trim().replace(/""/g, '').replace(/Formato estándar/gi, '').trim();
    clean = clean.split('“')[0].split('"')[0].trim();
    return clean.length > 40 ? clean.substring(0, 40) + '…' : clean;
  }
  return name.length > 40 ? name.substring(0, 40) + '…' : name;
}

export const FeaturedProducts = () => {
  const { addCatalogProduct, setIsOpen } = useCart();
  const { toast } = useToast();

  // Selección de 6 productos estrella más vendidos de la despensa bio
  const bestSellers: CatalogProduct[] = [
    allCatalogProducts.find(p => p.slug === 'ecosana-copos-de-avena-sin-gluten-1k'),
    allCatalogProducts.find(p => p.slug === 'gumendi-garbanzo-cocido-660gr'),
    allCatalogProducts.find(p => p.slug === 'gumendi-lentejas-con-verduras-720gr'),
    allCatalogProducts.find(p => p.slug === 'el-granero-integral-quinoa-bio-500gr-granero'),
    allCatalogProducts.find(p => p.category === 'aceites' && p.price > 0),
    allCatalogProducts.find(p => p.slug.includes('acai') || p.category === 'superfoods'),
  ].filter(Boolean) as CatalogProduct[];

  const handleAddToCart = (product: CatalogProduct) => {
    addCatalogProduct(product);
    setIsOpen(true);
    toast({
      title: "✓ Producto añadido al carrito",
      description: `${cleanTitle(product.name)} (${product.price.toFixed(2)}€)`,
    });
  };

  return (
    <section className="section-padding bg-gradient-to-b from-white to-slate-50/60">
      <div className="container-eco">
        
        {/* Encabezado de la sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              <span>ALIMENTACIÓN BIOLÓGICA DE TEMPORADA</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Los Más Vendidos de Nuestra Despensa
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Básicos ecológicos de máxima calidad nutricional seleccionados directamente de productores sostenibles y de cercanía.
            </p>
          </div>

          <Link to="/tienda">
            <Button 
              variant="outline"
              className="border-emerald-800 text-emerald-900 hover:bg-emerald-800 hover:text-white font-bold text-xs rounded-2xl gap-2 transition-all shadow-2xs"
            >
              <span>Ver todo el catálogo (+1.000)</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Cuadrícula de Productos con Microinteracciones */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestSellers.map((product, i) => (
            <motion.div
              key={product.id || product.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Imagen del producto con efecto zoom sutil */}
                <div className="w-full aspect-square rounded-2xl bg-slate-50 p-4 border border-slate-100 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  
                  {/* Badges ecológicos */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.tags.includes('vegano') && (
                      <Badge className="bg-emerald-900/85 backdrop-blur-xs text-white border-0 text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                        Vegano
                      </Badge>
                    )}
                    {product.tags.includes('sin-gluten') && (
                      <Badge className="bg-amber-800/85 backdrop-blur-xs text-white border-0 text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                        Sin Gluten
                      </Badge>
                    )}
                  </div>

                  <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-400 bg-white/90 px-2 py-0.5 rounded-full border shadow-2xs">
                    {product.brand}
                  </span>
                </div>

                {/* Título y Categoría */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="font-display font-bold text-slate-900 text-sm md:text-base line-clamp-2 mt-0.5 group-hover:text-emerald-800 transition-colors">
                    {cleanTitle(product.name)}
                  </h3>
                  {product.weight && (
                    <span className="text-xs text-slate-400 block mt-1">
                      Formato: {product.weight}
                    </span>
                  )}
                </div>
              </div>

              {/* Precio y Botón CTA con microinteracción Framer Motion */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">PVP con IVA</span>
                  <strong className="text-2xl font-black font-mono text-slate-900">
                    {product.price.toFixed(2)}€
                  </strong>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToCart(product)}
                  className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Añadir</span>
                </motion.button>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
