import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  allCatalogProducts, 
  catalogCategories, 
  catalogPacks,
  CatalogProduct,
  CatalogPack 
} from '@/data/catalog';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/context/CatalogContext';
import { RefreshCw, Radio } from 'lucide-react';
import { formatPrice, cleanProductName } from '@/lib/utils';
import { ProductDietBadges } from '@/components/common/ProductDietBadges';
import { CategoryIcon } from '@/components/common/CategoryIcon';

const productTags = [
  { id: 'bio', label: 'Bio' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'sin-gluten', label: 'Sin Gluten' },
  { id: 'sin-azucar', label: 'Sin Azúcar' },
  { id: 'proteina', label: 'Proteína' },
  { id: 'detox', label: 'Infusiones' },
  { id: 'fermentado', label: 'Fermentado' },
  { id: 'premium', label: 'Premium' },
];

const packCategories = [
  { id: 'vegano', label: 'Vegano', icon: '🌱' },
  { id: 'detox', label: 'Infusiones', icon: '🍃' },
  { id: 'asiatica', label: 'Asiática', icon: '🍱' },
  { id: 'mar', label: 'Mar', icon: '🐟' },
  { id: 'cafe', label: 'Café', icon: '☕' },
  { id: 'inmunidad', label: 'Vitaminas', icon: '🛡️' },
  { id: 'cosmetica', label: 'Cosmética', icon: '🧴' },
  { id: 'snacks', label: 'Snacks', icon: '🍪' },
  { id: 'aceites', label: 'Aceites', icon: '🫒' },
  { id: 'accesorios', label: 'Accesorios', icon: '💧' },
];

// Productos que se pintan de una vez; el resto se carga con "Ver más"
const PAGE_SIZE = 24;

const Tienda = () => {
  const { products, isLiveSync, isSyncing, refreshCatalog } = useCatalog();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ecoland-diet-tags');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleDietToggle = (tagId: string) => {
    setSelectedTags(prev => {
      const updated = prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId];
      try { localStorage.setItem('ecoland-diet-tags', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };
  const [activeTab, setActiveTab] = useState<'productos' | 'packs'>('productos');
  const { addCatalogProduct, addCatalogPack } = useCart();

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => product.tags.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [searchQuery, selectedCategory, selectedTags]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => setVisibleCount(PAGE_SIZE), [filteredProducts]);

  const filteredPacks = useMemo(() => {
    return catalogPacks.filter(pack => {
      const matchesSearch = searchQuery === '' || 
        pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || pack.category === selectedCategory;
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => pack.tags.some(t => t.toLowerCase().includes(tag)));
      
      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [searchQuery, selectedCategory, selectedTags]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedTags.length > 0 || searchQuery;

  const getTierBadge = (tier: CatalogPack['tier']) => {
    const styles = {
      'basic': 'bg-eco-cream text-eco-dark',
      'standard': 'bg-primary/20 text-primary',
      'premium': 'bg-amber-100 text-amber-800',
      'premium-top': 'bg-gradient-to-r from-amber-200 to-yellow-300 text-amber-900',
    };
    const labels = {
      'basic': 'Basic',
      'standard': 'Standard',
      'premium': 'Premium',
      'premium-top': 'Premium TOP',
    };
    return <Badge className={styles[tier]}>{labels[tier]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-eco-cream/50 to-background py-16">
        <div className="container-eco">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Tienda <span className="gradient-text">Ecológica</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Más de 1.000 productos ecológicos certificados y 24 packs temáticos con trazabilidad real
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-eco py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'productos' | 'packs'); setSelectedCategory(null); }} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="productos" className="gap-2">
              <Package className="h-4 w-4" />
              Productos ({allCatalogProducts.length})
            </TabsTrigger>
            <TabsTrigger value="packs" className="gap-2">
              🎁 Packs ({catalogPacks.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'productos' ? "Buscar entre más de 1.000 productos bio (ej. avena, matcha, quinoa, lentejas)..." : "Buscar packs temáticos..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-base shadow-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto h-11"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros avanzados
            {hasActiveFilters && (
              <Badge className="ml-2 bg-primary text-primary-foreground">
                {(selectedCategory ? 1 : 0) + selectedTags.length}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={() => { clearFilters(); try { localStorage.removeItem('ecoland-diet-tags'); } catch {} }} className="h-11">
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Barra de Perfil Alimentario / Dietas Rápidas */}
        <div className="mb-8 p-3 rounded-2xl bg-primary/5 border border-primary/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5 mr-2">
            Mi perfil alimentario:
          </span>
          <Link to="/salud" className="order-last ml-auto text-xs font-medium text-primary underline underline-offset-2">
            Personalízalo en Ecoland Salud
          </Link>
          {[
            { id: 'sin-gluten', label: 'Sin gluten', desc: 'Productos declarados sin gluten' },
            { id: 'vegano', label: 'Vegano', desc: 'Sin ingredientes de origen animal' },
            { id: 'proteina', label: 'Rico en proteína', desc: 'Legumbres, tofu, proteína vegetal' },
            { id: 'sin-azucar', label: 'Sin azúcar añadido', desc: 'Sin azúcares añadidos según el envase' },
            { id: 'bio', label: 'Ecológico certificado', desc: 'Sello ecológico de la UE' }
          ].map(diet => {
            const isActive = selectedTags.includes(diet.id);
            return (
              <button
                key={diet.id}
                onClick={() => handleDietToggle(diet.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 border flex items-center gap-1 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105' 
                    : 'bg-background hover:bg-muted text-muted-foreground border-muted-foreground/20'
                }`}
                title={diet.desc}
              >
                <CategoryIcon id={diet.id} className="w-3.5 h-3.5" />
                {diet.label}
                {isActive && <span className="ml-1 text-xs">✓</span>}
              </button>
            );
          })}
          {selectedTags.length > 0 && (
            <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">
              Filtro persistente activo ({selectedTags.length} seleccionados)
            </span>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-2xl p-6 mb-8 border"
          >
            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Categorías</h3>
              <div className="flex flex-wrap gap-2">
                {(activeTab === 'productos' ? catalogCategories : packCategories).map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5"><CategoryIcon id={category.id} />{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold mb-3">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {productTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'bg-eco-soft text-eco-dark'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results count */}
        <p className="text-muted-foreground mb-6">
          {activeTab === 'productos' 
            ? `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`
            : `${filteredPacks.length} pack${filteredPacks.length !== 1 ? 's' : ''} encontrado${filteredPacks.length !== 1 ? 's' : ''}`
          }
        </p>

        {/* Products Grid */}
        {activeTab === 'productos' && (
          <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.slice(0, visibleCount).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min((index % PAGE_SIZE) * 0.02, 0.3) }}
                className="group bg-card rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-300"
              >
                <Link to={`/tienda/producto/${product.slug}`}>
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <div className="p-3 sm:p-4">
                  <div className="hidden sm:flex flex-wrap gap-1 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.brand}
                    </Badge>
                    {product.tags.slice(0, 1).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {productTags.find(t => t.id === tag)?.label || tag}
                      </Badge>
                    ))}
                  </div>
                  <Link to={`/tienda/producto/${product.slug}`}>
                    <h3 className="font-semibold mb-1 line-clamp-2 hover:text-primary transition-colors text-sm" title={product.name}>
                      {cleanProductName(product.name)}
                    </h3>
                  </Link>
                  <div className="mb-3 min-h-[1.5rem]">
                    <ProductDietBadges productId={product.id} />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-base sm:text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {product.weight && product.weight !== 'Formato estándar' && (
                        <span className="text-xs text-muted-foreground ml-1">
                          / {product.weight}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="h-10 w-full sm:w-auto"
                      onClick={() => addCatalogProduct(product)}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? 'Añadir' : 'Agotado'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {visibleCount < filteredProducts.length && (
            <div className="flex flex-col items-center gap-2 mt-10">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisibleCount(n => n + PAGE_SIZE)}
                className="rounded-xl border-emerald-200 text-emerald-900 hover:bg-emerald-50 hover:text-emerald-900"
              >
                Ver más productos
              </Button>
              <span className="text-xs text-muted-foreground">
                Mostrando {visibleCount} de {filteredProducts.length}
              </span>
            </div>
          )}
          </>
        )}

        {/* Packs Grid */}
        {activeTab === 'packs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPacks.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className="group bg-card rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-300"
              >
                <Link to={`/tienda/pack/${pack.slug}`}>
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    <img
                      src={pack.image}
                      alt={pack.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-2xl">{pack.icon}</span>
                      {getTierBadge(pack.tier)}
                    </div>
                    {pack.featured && (
                      <Badge className="absolute top-3 right-3 bg-eco-green text-white">
                        ⭐ Destacado
                      </Badge>
                    )}
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {pack.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link to={`/tienda/pack/${pack.slug}`}>
                    <h3 className="font-display font-semibold text-lg mb-1 hover:text-primary transition-colors">
                      {pack.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {pack.shortDescription}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {pack.products.length} productos incluidos
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(pack.price)}
                    </span>
                    <Button
                      onClick={() => addCatalogPack(pack)}
                    >
                      Añadir Pack
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {((activeTab === 'productos' && filteredProducts.length === 0) || 
          (activeTab === 'packs' && filteredPacks.length === 0)) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No se encontraron {activeTab === 'productos' ? 'productos' : 'packs'} con esos criterios
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tienda;
