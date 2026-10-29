import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, ChefHat, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { recipes } from '@/data/recipes';
import { AiFridgeRecipeGenerator } from '@/components/recipes/AiFridgeRecipeGenerator';

export const Blog = () => {
  return (
    <div className="section-padding bg-slate-50/50 min-h-screen">
      <div className="container-eco max-w-6xl space-y-12">
        
        {/* Hero de Recetas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Cocina Consciente y Saludable
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Recetas Bio & Chef Inteligente
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            Platos equilibrados con alimentos ecológicos de temporada. Diseña recetas mágicas con lo que tienes en tu nevera o cocina las creaciones de nuestro equipo.
          </p>
        </motion.div>

        {/* 1. MÓDULO CHEF IA: GENERADOR DE RECETAS CON LO QUE TIENES EN TU NEVERA */}
        <AiFridgeRecipeGenerator />

        {/* 2. RECETAS CURADAS OFICIALES DE ECOLAND */}
        <div className="space-y-6 pt-6">
          <div className="border-b pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900">
                Recetas Destacadas de la Despensa Ecoland
              </h2>
              <p className="text-xs text-slate-500">
                Elaboradas por nutricionistas con ingredientes 100% ecológicos.
              </p>
            </div>
            <span className="text-xs tabular-nums text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {recipes.length} recetas oficiales
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, i) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/blog/${recipe.slug}`} className="block pack-card group h-full bg-white rounded-3xl border overflow-hidden shadow-2xs hover:shadow-md transition-all">
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                      {recipe.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs font-bold bg-white/90 backdrop-blur-xs text-emerald-950 px-2 py-0.5 rounded-full shadow-2xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-display text-lg font-bold line-clamp-2 group-hover:text-emerald-800 transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{recipe.excerpt}</p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-emerald-700" />
                          <span>{recipe.timeMinutes} min</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-emerald-700" />
                          <span>{recipe.servings} raciones</span>
                        </span>
                      </div>
                      <span className="text-emerald-800 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Ver receta <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Blog;
