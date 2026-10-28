import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Sparkles, Scale, Apple, CheckCircle2, ShoppingBag, 
  ShieldCheck, ArrowRight, RefreshCw, AlertCircle, ChefHat, Wallet, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { allCatalogProducts } from '@/data/catalog/individual-products';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const EcoHealth = () => {
  const { addCatalogProduct, setIsOpen } = useCart();
  const { toast } = useToast();

  // Diet Profile State
  const [dietTags, setDietTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ecoland-diet-tags');
      return saved ? JSON.parse(saved) : ['sin-gluten', 'vegano'];
    } catch {
      return ['sin-gluten', 'vegano'];
    }
  });

  const [goal, setGoal] = useState<string>('vitalidad');
  const [budget, setBudget] = useState<number>(35);

  const toggleTag = (id: string) => {
    setDietTags(prev => {
      const updated = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      try {
        localStorage.setItem('ecoland-diet-tags', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast({
      title: "Perfil Alimentario actualizado",
      description: "Tu catálogo y recomendaciones se han sincronizado.",
    });
  };

  // Curated budget staples based on catalog
  const budgetBasket = [
    allCatalogProducts.find(p => p.slug === 'ecosana-copos-de-avena-sin-gluten-1k'),
    allCatalogProducts.find(p => p.slug === 'gumendi-garbanzo-cocido-660gr'),
    allCatalogProducts.find(p => p.slug === 'gumendi-lentejas-con-verduras-720gr'),
    allCatalogProducts.find(p => p.slug === 'el-granero-integral-quinoa-bio-500gr-granero'),
  ].filter(Boolean);

  const budgetTotal = budgetBasket.reduce((sum, item) => sum + (item?.price || 0), 0);

  const handleAddBudgetBasket = () => {
    budgetBasket.forEach(p => {
      if (p) addCatalogProduct(p);
    });
    setIsOpen(true);
    toast({
      title: "¡Cesta económica añadida!",
      description: `Se han añadido ${budgetBasket.length} alimentos bio por ${budgetTotal.toFixed(2)}€.`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-8">
      <div className="container-eco max-w-5xl">
        
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="h-4 w-4 text-emerald-700" />
            <span>MÓDULO OFICIAL ECOHEALTH & NUTRICIÓN CONSCIENTE</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Tu Salud y Alimentación <span className="text-emerald-700">100% Ecológica</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            Personaliza tus objetivos nutricionales, previene alérgenos y planifica tu compra semanal con alimentos reales de nuestra tienda física y online.
          </p>
        </motion.div>

        {/* Grid: 3 Interactive Modules */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Perfil Alimentario & Alergias (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Perfil Alimentario Interactivo */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-xs space-y-6"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
                    🌾
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">1. Mi Perfil Alimentario & Alergias</h2>
                    <p className="text-xs text-slate-500">Filtra todo el catálogo y recibe advertencias de seguridad automáticas.</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-emerald-800 border-emerald-300 bg-emerald-50/50">
                  Guardado local
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { id: 'sin-gluten', title: 'Sin Gluten / Celíaco', desc: 'Avena certificada, quinoa y harinas limpias', icon: '🌾' },
                  { id: 'vegano', title: '100% Vegano', desc: 'Proteína vegetal y legumbres bio', icon: '🌱' },
                  { id: 'proteina', title: 'Rico en Proteína', desc: 'Superalimentos y legumbres saciantes', icon: '💪' },
                  { id: 'sin-azucar', title: 'Sin Azúcar Añadido', desc: 'Bajo índice glucémico natural', icon: '🚫' },
                  { id: 'bio', title: '100% Bio Certificado', desc: 'Aval oficial Euro-hoja de la UE', icon: '✨' },
                  { id: 'detox', title: 'Depurativo & Digestión', desc: 'Infusiones, fibras y fermentados', icon: '🍃' }
                ].map(item => {
                  const active = dietTags.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleTag(item.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 ${
                        active 
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-2xs' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-bold ${active ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {item.title}
                          </span>
                          {active && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                <span>¿Quieres aplicar estos filtros en la tienda ahora?</span>
                <Link to="/tienda">
                  <Button size="sm" className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold h-8 text-xs">
                    Ver tienda personalizada ➔
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* 2. Modo Presupuesto Nutricional (Smart Budget) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-xs space-y-6"
            >
              <div className="flex items-center gap-2.5 border-b pb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
                  💶
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">2. Modo Presupuesto Saludable</h2>
                  <p className="text-xs text-slate-500">Alimentos bio de máxima densidad de nutrientes por euro invertido.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950 text-emerald-50 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Cesta Esencial Recomendada</span>
                    <h3 className="text-lg font-bold text-white">4 Básicos de Alto Rendimiento</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-display font-extrabold text-white">{budgetTotal.toFixed(2)}€</span>
                    <span className="block text-[11px] text-emerald-300">Total cesta completa</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs divide-y divide-emerald-800/60 pt-1">
                  {budgetBasket.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center pt-2">
                      <span className="text-emerald-100 font-medium truncate max-w-[280px]">
                        • {p?.name.split('–')[0] || p?.name}
                      </span>
                      <strong className="text-white font-mono">{p?.price.toFixed(2)}€</strong>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleAddBudgetBasket}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold shadow-md gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Añadir esta cesta al carrito en 1 clic
                </Button>
              </div>
            </motion.div>

          </div>

          {/* Right Column: EcoAsistente & Hábitos (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* EcoAsistente IA Widget Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 md:p-7 shadow-md space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Eco-Coach IA</h3>
                  <p className="text-xs text-emerald-200">Asistente conectado al stock real de Ecoland</p>
                </div>
              </div>

              <p className="text-xs text-emerald-100 leading-relaxed">
                Pídele recetas, dietas personalizadas o recomendaciones de productos según tus calorías, presupuesto o intolerancias.
              </p>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] space-y-1.5 text-emerald-200">
                <div className="flex items-center gap-2">
                  <span>💡</span>
                  <em>"Quiero cenas veganas para 3 días por 25€"</em>
                </div>
                <div className="flex items-center gap-2">
                  <span>💡</span>
                  <em>"¿Qué desayuno sin gluten me sacia más?"</em>
                </div>
              </div>

              <Link to="/tienda">
                <Button className="w-full bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs gap-2 shadow-sm">
                  <MessageSquare className="h-4 w-4 text-emerald-800" />
                  Abrir chat con el Eco-Coach
                </Button>
              </Link>
            </motion.div>

            {/* EcoHabits Tracker Preview */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>🌱</span> EcoHabits Semanales
                </h4>
                <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[11px]">Nivel Consciente</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>💧 Hidratación diaria (2L)</span>
                    <strong className="text-slate-900">85%</strong>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>🥗 Variedad vegetal (5 raciones)</span>
                    <strong className="text-slate-900">100%</strong>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>♻️ Envases libres de plástico</span>
                    <strong className="text-slate-900">92%</strong>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 text-center">
                Cada compra bio en tienda física u online suma puntos para tu <strong>Club Ecoland</strong>.
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default EcoHealth;
