import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, AlertTriangle, Clock, Users, ChefHat, ArrowRight, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { getPackBySlug, PackSize, packSizes } from '@/data/packs';
import { getRecipesByPackSlug } from '@/data/recipes';
import { useCart } from '@/context/CartContext';

const PackDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const pack = getPackBySlug(slug || '');
  const recipes = getRecipesByPackSlug(slug || '');
  const { addItem } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<PackSize>('M');
  const [isSubscription, setIsSubscription] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  if (!pack) {
    return (
      <div className="section-padding text-center">
        <h1 className="font-display text-2xl">Pack no encontrado</h1>
        <Link to="/packs" className="text-primary hover:underline mt-4 inline-block">
          Volver a packs
        </Link>
      </div>
    );
  }

  const price = pack.prices[selectedSize];
  const finalPrice = isSubscription ? price * 0.9 : price;

  const handleAdd = () => {
    addItem(pack, selectedSize, isSubscription);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="section-padding">
      <div className="container-eco">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">Inicio</Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link to="/packs" className="text-muted-foreground hover:text-foreground">Packs</Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">{pack.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted">
              <img 
                src={pack.image} 
                alt={pack.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {pack.tags.map(tag => (
                <span key={tag} className="eco-badge">{tag}</span>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <span className="text-4xl mb-2 block">{pack.icon}</span>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{pack.name}</h1>
              <p className="text-lg text-muted-foreground mt-2">{pack.shortDescription}</p>
            </div>

            <p className="text-muted-foreground">{pack.description}</p>

            {/* Size Selector */}
            <div>
              <h3 className="font-medium mb-3">Tamaño del pack</h3>
              <div className="grid grid-cols-4 gap-2">
                {packSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-4 rounded-xl text-center transition-all ${
                      selectedSize === size
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span className="block font-semibold">{size}</span>
                    <span className="block text-sm opacity-80">{pack.prices[size].toFixed(2)}€</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subscription Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-primary/20">
              <div className="flex items-center gap-3">
                <Repeat className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Suscripción mensual</p>
                  <p className="text-sm text-muted-foreground">Ahorra 10% y recíbelo cada mes</p>
                </div>
              </div>
              <Switch checked={isSubscription} onCheckedChange={setIsSubscription} />
            </div>

            {/* Price & CTA */}
            <div className="flex items-end justify-between pt-4 border-t">
              <div>
                {isSubscription && (
                  <p className="text-sm text-muted-foreground line-through">{price.toFixed(2)}€</p>
                )}
                <p className="text-3xl font-display font-bold">
                  {finalPrice.toFixed(2)}€
                  <span className="text-base font-normal text-muted-foreground ml-2">
                    / pack {selectedSize}
                  </span>
                </p>
              </div>
              <Button 
                size="lg" 
                className={`btn-hero ${isAdded ? 'bg-eco-soft' : ''}`}
                onClick={handleAdd}
              >
                {isAdded ? (
                  <>
                    <Check className="h-5 w-5" />
                    Añadido
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    Añadir al carrito
                  </>
                )}
              </Button>
            </div>

            {/* What's Included */}
            <div className="pt-6 border-t">
              <h3 className="font-display text-xl font-semibold mb-4">¿Qué incluye?</h3>
              <ul className="space-y-2">
                {pack.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Whom */}
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
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">Alérgenos</h4>
                    <p className="text-sm text-muted-foreground">{pack.allergens.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Recipes */}
        {recipes.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
              Recetas con este pack
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Link 
                  key={recipe.id} 
                  to={`/blog/${recipe.slug}`}
                  className="pack-card group"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold group-hover:text-primary transition-colors">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {recipe.timeMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat className="h-4 w-4" />
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Substitution Note */}
        <p className="text-center text-sm text-muted-foreground mt-12 p-4 bg-muted/50 rounded-xl">
          ⚠️ <strong>Sustituciones:</strong> algunos productos pueden variar por stock manteniendo equivalencia.
        </p>
      </div>
    </div>
  );
};

export default PackDetail;
