import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function cleanTitle(name: string): string {
  const parts = name.split('–');
  if (parts.length > 1) {
    let clean = parts[1].trim().replace(/""/g, '').replace(/Formato estándar/gi, '').trim();
    clean = clean.split('“')[0].split('"')[0].trim();
    return clean.length > 38 ? clean.substring(0, 38) + '…' : clean;
  }
  return name.length > 38 ? name.substring(0, 38) + '…' : name;
}

export const QuickSearchModal = ({ isOpen, onClose }: QuickSearchModalProps) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const { addCatalogProduct, setIsOpen: setCartOpen } = useCart();
  const { toast } = useToast();

  const searchResults = useMemo(() => {
    if (!query.trim() && activeCategory === 'todas') {
      return allCatalogProducts.slice(0, 8);
    }

    let pool = allCatalogProducts;
    if (activeCategory !== 'todas') {
      pool = pool.filter(p => p.category === activeCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      pool = pool.filter(p => 
        (p.name + ' ' + p.brand + ' ' + p.description + ' ' + p.category).toLowerCase().includes(q)
      );
    }

    return pool.slice(0, 16);
  }, [query, activeCategory]);

  const handleAdd = (product: CatalogProduct) => {
    addCatalogProduct(product);
    setCartOpen(true);
    toast({
      title: "✓ Añadido al carrito",
      description: `${cleanTitle(product.name)} (${product.price.toFixed(2)}€)`,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-5 md:p-6 max-w-2xl w-full shadow-2xl border space-y-4 max-h-[85vh] flex flex-col"
        >
          {/* Header con Buscador */}
          <div className="flex items-center gap-3 border-b pb-3">
            <Search className="h-5 w-5 text-emerald-800 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar entre +1.000 alimentos biológicos (ej. avena, garbanzo, aceite)..."
              className="w-full text-sm font-medium bg-transparent outline-none placeholder:text-slate-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Categorías Rápidas */}
          <div className="flex gap-1.5 flex-wrap text-xs">
            {[
              { id: 'todas', label: 'Todos (+1.000)' },
              { id: 'desayunos', label: 'Desayunos & Copos' },
              { id: 'legumbres', label: 'Legumbres & Guisos' },
              { id: 'aceites', label: 'Aceites Nobles' },
              { id: 'superfoods', label: 'Superfoods' },
              { id: 'salsas', label: 'Huerta & Salsas' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-emerald-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Contador de resultados */}
          <div className="flex justify-between items-center text-xs text-slate-500 px-1">
            <span>
              {query ? `Resultados para "${query}"` : 'Productos destacados:'}
            </span>
            <span className="font-mono text-[11px] font-bold text-emerald-800">
              {searchResults.length} mostrados
            </span>
          </div>

          {/* Lista de Resultados con Scroll */}
          <div className="overflow-y-auto space-y-2 pr-1 flex-1">
            {searchResults.map(product => (
              <div
                key={product.id || product.slug}
                className="p-3 rounded-2xl border bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-11 h-11 rounded-xl bg-white p-1 border shrink-0 flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="truncate">
                    <span className="block text-xs font-bold text-slate-900 truncate group-hover:text-emerald-900">
                      {cleanTitle(product.name)}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">{product.brand}</span>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <strong className="text-sm font-black font-mono text-slate-900">
                    {product.price.toFixed(2)}€
                  </strong>
                  <button
                    onClick={() => handleAdd(product)}
                    className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold transition-all shadow-2xs"
                    title="Añadir a la cesta"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {searchResults.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <span className="text-3xl block">🔍</span>
                <p className="text-xs font-bold text-slate-700">No encontramos ningún producto para esa búsqueda</p>
                <p className="text-[11px] text-slate-400">Prueba con palabras como "avena", "quinoa", "garbanzo" o "aceite".</p>
              </div>
            )}
          </div>

          {/* Footer del buscador */}
          <div className="pt-2 border-t flex items-center justify-between text-xs">
            <Link 
              to="/tienda" 
              onClick={onClose}
              className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
            >
              <span>Ir a la tienda completa con todos los filtros</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-[10px] text-slate-400">Presiona ESC o pulsa fuera para cerrar</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
