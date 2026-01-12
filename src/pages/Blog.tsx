import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, ChefHat, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { recipes } from '@/data/recipes';

const Blog = () => {
  return (
    <div className="section-padding">
      <div className="container-eco">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Recetas Eco
          </h1>
          <p className="text-muted-foreground mt-4">
            Recetas sencillas usando los productos de nuestros packs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, i) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/blog/${recipe.slug}`} className="block pack-card group h-full">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {recipe.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="eco-badge text-xs">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-display text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{recipe.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{recipe.timeMinutes} min</span>
                    <span className="flex items-center gap-1"><ChefHat className="h-4 w-4" />{recipe.difficulty}</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{recipe.servings}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
