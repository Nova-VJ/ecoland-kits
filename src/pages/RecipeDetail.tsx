import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, ChefHat, AlertTriangle, Lightbulb, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRecipeBySlug } from '@/data/recipes';
import { getPackBySlug } from '@/data/packs';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

const RecipeDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const recipe = getRecipeBySlug(slug || '');
  const pack = recipe ? getPackBySlug(recipe.packSlug) : null;
  const { addPack, setIsOpen } = useCart();
  const { toast } = useToast();

  const handleAddRecipeToCart = () => {
    if (pack) {
      addPack(pack, 'M', false);
      setIsOpen(true);
      toast({
        title: "¡Ingredientes añadidos!",
        description: `Se han añadido los ingredientes frescos para ${recipe?.title || 'tu receta'} al carrito.`,
      });
    } else {
      setIsOpen(true);
      toast({
        title: "Receta lista",
        description: "Revisa los productos recomendados para esta receta en tu cesta.",
      });
    }
  };

  if (!recipe) {
    return (
      <div className="section-padding text-center">
        <h1 className="font-display text-2xl">Receta no encontrada</h1>
        <Link to="/blog" className="text-primary hover:underline mt-4 inline-block">
          Volver a recetas
        </Link>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-eco max-w-4xl">
        {/* Back */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a recetas
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.tags.map(tag => (
              <span key={tag} className="eco-badge text-xs">{tag}</span>
            ))}
          </div>
          
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {recipe.title}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6">{recipe.excerpt}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm pb-6 border-b">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {recipe.timeMinutes} minutos
            </span>
            <span className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              {recipe.difficulty}
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {recipe.servings} {recipe.servings === "1" ? "ración" : "raciones"}
            </span>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-8 aspect-video rounded-2xl overflow-hidden"
        >
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Pack CTA */}
        {pack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/30 border border-primary/20"
          >
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img src={pack.image} alt={pack.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm text-muted-foreground">Receta del pack</p>
                <h3 className="font-display text-xl font-semibold">{pack.name}</h3>
                <p className="text-sm text-muted-foreground">Desde {pack.prices.S.toFixed(2)}€</p>
              </div>
              <div className="flex gap-3">
                <Link to={`/packs/${pack.slug}`}>
                  <Button variant="outline">Ver pack</Button>
                </Link>
                <Button className="gap-2 btn-hero" onClick={handleAddRecipeToCart}>
                  <ShoppingBag className="h-4 w-4" />
                  Comprar ingredientes ({pack.prices.M.toFixed(2)}€)
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1"
          >
            <div className="sticky top-24">
              <h2 className="font-display text-xl font-semibold mb-4">Ingredientes</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {ingredient}
                  </li>
                ))}
              </ul>

              {pack && (
                <div className="mt-5 pt-4 border-t">
                  <Button 
                    className="w-full gap-2 shadow-md"
                    onClick={handleAddRecipeToCart}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Añadir cesta de receta (1-clic)
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center mt-2">
                    Incluye los ingredientes bio necesarios para {recipe.servings} raciones.
                  </p>
                </div>
              )}

              {/* Allergens */}
              {recipe.allergens.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-destructive">Alérgenos</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {recipe.allergens.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 space-y-8"
          >
            <div>
              <h2 className="font-display text-xl font-semibold mb-6">Preparación</h2>
              <ol className="space-y-6">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {recipe.tips.length > 0 && (
              <div className="p-6 rounded-2xl bg-secondary/50 border">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-eco-accent" />
                  <h3 className="font-display text-lg font-semibold">Consejos</h3>
                </div>
                <ul className="space-y-3">
                  {recipe.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-eco-accent">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
