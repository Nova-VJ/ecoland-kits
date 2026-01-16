import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, ShoppingBag, Bot, Shield, Heart, Globe, Sparkles, FileText, Apple, ChevronDown, ChevronUp, Zap, Brain, Dumbbell, ShoppingBasket, Coffee, Nut, Wheat, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

// FAQ Data
const faqs = [{
  q: '¿Ecológico significa "más sano" siempre?',
  a: 'No es magia: depende del producto. Pero suele significar menos químicos de síntesis y procesos más naturales.'
}, {
  q: '¿Cómo sé si es ecológico de verdad?',
  a: 'Busca sellos/certificaciones y etiquetas claras. En Ecoland ya lo filtramos por ti.'
}, {
  q: '¿Por dónde empiezo con presupuesto limitado?',
  a: 'Básicos diarios: avena, legumbres, aceite, huevos, café, frutos secos.'
}, {
  q: '¿Se nota en el sabor?',
  a: 'En muchos productos sí: aceites, frutos secos, cacao, café y básicos de calidad.'
}, {
  q: '¿Esto es solo para veganos o fitness?',
  a: 'No. Es para cualquiera que quiera comer mejor sin complicarse.'
}, {
  q: '¿Y si no sé qué elegir?',
  a: 'Usa Eco-Coach: te guía por objetivo y preferencias.'
}];

// Objectives tiles data
const objectives = [{
  id: 'energia',
  icon: Zap,
  label: 'Más energía',
  tips: ['Desayunos limpios', 'Snacks sin relleno', 'Café/cacao de calidad']
}, {
  id: 'digestion',
  icon: Brain,
  label: 'Mejor digestión',
  tips: ['Fibra natural', 'Legumbres y granos', 'Infusiones digestivas']
}, {
  id: 'proteina',
  icon: Dumbbell,
  label: 'Más proteína',
  tips: ['Legumbres y tofu', 'Frutos secos', 'Proteína vegetal']
}, {
  id: 'basicos',
  icon: ShoppingBasket,
  label: 'Básicos de despensa',
  tips: ['Aceite, pasta, arroz', 'Conservas de calidad', 'Especias y condimentos']
}];

// First kit carousel items
const firstKitItems = [{
  icon: Wheat,
  label: 'Avena / base desayuno'
}, {
  icon: Coffee,
  label: 'Legumbre esencial'
}, {
  icon: Leaf,
  label: 'AOVE ecológico'
}, {
  icon: Nut,
  label: 'Frutos secos naturales'
}, {
  icon: Coffee,
  label: 'Café o cacao puro'
}, {
  icon: Sparkles,
  label: 'Semillas (chía/lino)'
}, {
  icon: ShoppingBag,
  label: 'Conserva buena'
}, {
  icon: Apple,
  label: 'Snack limpio'
}];
const ImportanciaMision = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null);
  return <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-eco-cream/30 to-background overflow-hidden">
        <div className="container-eco relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-eco-dark">Importancia de lo ecológico 
y nuestra misión.</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              No es una moda. Es una forma más limpia, consciente y práctica de cuidarte. 
              Y una manera real de proteger el planeta, compra a compra.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg" className="btn-hero">
                <Link to="/quiz">
                  <Bot className="h-5 w-5 mr-2" />
                  Recomendación en 30 segundos
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="btn-hero-secondary">
                <Link to="/packs">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Ver Packs para empezar
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="px-3 py-1.5 rounded-full bg-eco-soft/30 text-eco-dark">
                ✅ Fácil de empezar
              </span>
              <span className="px-3 py-1.5 rounded-full bg-eco-soft/30 text-eco-dark">
                ✅ Básicos filtrados
              </span>
              <span className="px-3 py-1.5 rounded-full bg-eco-soft/30 text-eco-dark">
                ✅ Packs listos
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Block */}
      <section className="py-16 bg-eco-green text-white">
        <div className="container-eco">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-center">
              💚 Nuestra misión
            </h2>
            <p className="text-lg md:text-xl text-center mb-10 text-white/90">
              En Ecoland queremos llevar comida sana y ecológica a los hogares de España. 
              Hacerlo fácil, accesible y real. Creemos que comer mejor no debería ser complicado, 
              y que cada compra puede cuidar también del planeta.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[{
              icon: ShoppingBasket,
              title: 'Comida sana en casa',
              desc: 'Productos ecológicos seleccionados para tu día a día.'
            }, {
              icon: Heart,
              title: 'Hogares de España',
              desc: 'Una despensa más limpia, sin líos ni postureo.'
            }, {
              icon: Globe,
              title: 'Cuidar el planeta',
              desc: 'Elegir ecológico es apoyar prácticas más responsables.'
            }].map((item, i) => <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <item.icon className="h-10 w-10 mx-auto mb-4 text-eco-cream" />
                  <h3 className="font-body font-bold text-lg mb-2">{item.title}</h3>
                  <p className="font-body text-white/90 text-sm">{item.desc}</p>
                </div>)}
            </div>

            <p className="text-center text-eco-cream italic">
              "Una compra mejor hoy = un hábito mejor mañana."
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild variant="secondary" size="lg">
                <Link to="/quiz">
                  <Bot className="h-5 w-5 mr-2" />
                  Eco-Coach: recomiéndame
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-eco-cream text-eco-cream hover:bg-eco-cream hover:text-eco-green">
                <Link to="/packs">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Ver Packs Ecoland
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Summary Chips */}
      <section className="py-12">
        <div className="container-eco">
          <div className="flex flex-wrap justify-center gap-3">
            {[{
            icon: '🧘',
            label: 'Te sientes más ligero/a'
          }, {
            icon: '🧾',
            label: 'Ingredientes más simples'
          }, {
            icon: '🌍',
            label: 'Menos impacto'
          }, {
            icon: '⭐',
            label: 'Mejor sabor y calidad'
          }, {
            icon: '🧺',
            label: 'Compra con propósito'
          }].map((chip, i) => <span key={i} className="px-4 py-2 rounded-full bg-eco-cream text-eco-dark font-medium">
                {chip.icon} {chip.label}
              </span>)}
          </div>
        </div>
      </section>

      {/* What is Ecological Section */}
      <section className="py-16 bg-white">
        <div className="container-eco max-w-3xl">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-eco-dark">
              ¿Qué significa ecológico de verdad?
            </h2>
            <p className="text-muted-foreground mb-6">
              Un producto ecológico se produce con normas estrictas para reducir químicos de síntesis y cuidar el entorno.
            </p>
            <ul className="space-y-3">
              {[{
              icon: Shield,
              text: 'Evitar pesticidas/químicos de síntesis'
            }, {
              icon: Leaf,
              text: 'Cuidar suelo/agua/biodiversidad'
            }, {
              icon: FileText,
              text: 'Reducir aditivos innecesarios'
            }, {
              icon: Heart,
              text: 'Procesos más naturales y responsables'
            }].map((item, i) => <li key={i} className="flex items-center gap-3 p-3 bg-eco-cream/30 rounded-lg">
                  <item.icon className="h-5 w-5 text-eco-green" />
                  <span>{item.text}</span>
                </li>)}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground italic">
              En corto: más respeto, menos atajos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5 Reasons Grid */}
      <section className="py-16">
        <div className="container-eco">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-10 text-center text-eco-dark"> 5 motivos para elegir ecológico</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[{
            icon: Shield,
            title: 'Menos exposición a residuos químicos',
            desc: 'Elegir opciones más limpias en productos de consumo diario es sentido común.'
          }, {
            icon: FileText,
            title: 'Ingredientes más simples',
            desc: 'Menos relleno, más producto real. Listas más cortas y claras.'
          }, {
            icon: Sparkles,
            title: 'Sabor y calidad',
            desc: 'La materia prima manda: cuando es buena, no necesita disfrazarse.'
          }, {
            icon: Globe,
            title: 'Mejor para el planeta',
            desc: 'Apoyas prácticas que cuidan suelos y agua sin hacer nada extra.'
          }, {
            icon: Heart,
            title: 'Compra con propósito',
            desc: 'Cuando tu compra refleja tus valores, se vuelve hábito.'
          }].map((item, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} className="bg-white rounded-xl p-6 border border-eco-green/10 shadow-sm">
                <item.icon className="h-8 w-8 text-eco-green mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-eco-dark">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Ecoland te lo hace fácil */}
      <section className="py-16 bg-eco-cream/30">
        <div className="container-eco max-w-3xl">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="font-body text-2xl md:text-3xl font-bold mb-4 text-center text-eco-dark">
              🌿 Pequeños cambios, grandes resultados
            </h2>
            <p className="text-muted-foreground mb-8 text-center">
              No hace falta revolucionar tu despensa. Con pequeños cambios, notas la diferencia.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-4">
              {[{
              icon: ShoppingBasket,
              title: 'Empieza por básicos',
              desc: 'Avena, legumbres, aceite, huevos, café, frutos secos'
            }, {
              icon: ShoppingBag,
              title: 'Compra con intención',
              desc: 'Packs y planificación = menos desperdicio'
            }, {
              icon: Sparkles,
              title: 'Prioriza lo diario',
              desc: 'Lo que más consumes primero'
            }].map((item, i) => <div key={i} className="bg-white rounded-xl p-5 border border-eco-green/10">
                  <item.icon className="h-6 w-6 text-eco-green mb-3" />
                  <h3 className="font-semibold text-eco-dark mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>)}
            </div>
            <p className="mt-8 text-center font-medium text-eco-dark italic">
              "Lo ecológico no va de perfección. Va de progreso."
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3 Steps Stepper */}
      <section className="py-16 bg-white">
        <div className="container-eco max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-10 text-center text-eco-dark">
            🔥 Empieza hoy en 3 pasos
          </h2>
          <div className="space-y-6">
            {[{
            step: 1,
            icon: '🥣',
            title: 'Cambia un básico',
            desc: 'Elige un producto que uses a diario y cámbialo por su versión ecológica.'
          }, {
            step: 2,
            icon: '🧾',
            title: 'Elige listas cortas de ingredientes',
            desc: 'Menos aditivos, más producto real.'
          }, {
            step: 3,
            icon: '🤖',
            title: 'Pide recomendación personalizada',
            desc: 'Usa Eco-Coach para encontrar lo que mejor se adapta a ti.'
          }].map(item => <motion.div key={item.step} initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} className="flex items-start gap-4 p-5 bg-eco-cream/30 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-eco-green text-white flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{item.icon} {item.title}</h4>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>)}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" className="btn-hero">
              <Link to="/quiz">
                <Bot className="h-5 w-5 mr-2" />
                Empezar con Eco-Coach
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Objectives Tiles */}
      <section className="py-16">
        <div className="container-eco max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 text-center text-eco-dark">
            🤝 Ecoland te lo pone fácil
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Te ayudamos a elegir según tu objetivo.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {objectives.map(obj => <motion.div key={obj.id} initial={{
            opacity: 0,
            y: 10
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="bg-white rounded-xl border border-eco-green/10 overflow-hidden">
                <button onClick={() => setExpandedObjective(expandedObjective === obj.id ? null : obj.id)} className="w-full p-5 flex items-center justify-between hover:bg-eco-cream/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <obj.icon className="h-6 w-6 text-eco-green" />
                    <span className="font-semibold text-lg">{obj.label}</span>
                  </div>
                  {expandedObjective === obj.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </button>
                {expandedObjective === obj.id && <motion.div initial={{
              height: 0,
              opacity: 0
            }} animate={{
              height: 'auto',
              opacity: 1
            }} className="px-5 pb-5">
                    <ul className="space-y-2 mb-4">
                      {obj.tips.map((tip, i) => <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-eco-green" />
                          {tip}
                        </li>)}
                    </ul>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/packs">Ver selección</Link>
                    </Button>
                  </motion.div>}
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* First Kit Carousel */}
      <section className="py-16 bg-eco-cream/30">
        <div className="container-eco">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-10 text-center text-eco-dark"> Tu primer kit ecológico</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {firstKitItems.map((item, i) => <motion.div key={i} initial={{
            opacity: 0,
            scale: 0.95
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.05
          }} className="flex-shrink-0 w-36 snap-center">
                <div className="bg-white rounded-xl p-4 text-center border border-eco-green/10 h-full">
                  <item.icon className="h-8 w-8 mx-auto mb-3 text-eco-green" />
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 bg-white">
        <div className="container-eco max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-10 text-center text-eco-dark">
            ❓ Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 10
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="bg-eco-cream/30 rounded-xl overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full p-5 flex items-center justify-between text-left hover:bg-eco-cream/50 transition-colors">
                  <span className="font-semibold text-eco-dark">{faq.q}</span>
                  {expandedFaq === i ? <ChevronUp className="h-5 w-5 text-eco-green flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-eco-green flex-shrink-0" />}
                </button>
                {expandedFaq === i && <motion.div initial={{
              height: 0,
              opacity: 0
            }} animate={{
              height: 'auto',
              opacity: 1
            }} className="px-5 pb-5">
                    <p className="text-muted-foreground">{faq.a}</p>
                  </motion.div>}
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-eco-green to-eco-dark text-white">
        <div className="container-eco text-center max-w-3xl">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              🎯 Empieza por un cambio pequeño hoy
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Un básico mejor hoy es un hábito mejor mañana. Y una forma real de cuidar tu salud y el planeta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/quiz">
                  <Bot className="h-5 w-5 mr-2" />
                  Hablar con Eco-Coach
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-eco-cream text-eco-cream hover:bg-eco-cream hover:text-eco-green">
                <Link to="/packs">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Ver Packs
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-eco-cream text-eco-cream hover:bg-eco-cream hover:text-eco-green">
                <Link to="/tienda">
                  <ShoppingBasket className="h-5 w-5 mr-2" />
                  Explorar básicos
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-eco-green/95 backdrop-blur-sm p-3 flex gap-2 justify-center lg:hidden border-t border-white/10">
        <Button asChild size="sm" variant="secondary" className="flex-1 max-w-[120px]">
          <Link to="/quiz">
            <Bot className="h-4 w-4 mr-1" />
            Eco-Coach
          </Link>
        </Button>
        <Button asChild size="sm" variant="secondary" className="flex-1 max-w-[100px]">
          <Link to="/packs">
            <ShoppingBag className="h-4 w-4 mr-1" />
            Packs
          </Link>
        </Button>
        <Button asChild size="sm" variant="secondary" className="flex-1 max-w-[100px]">
          <Link to="/tienda">
            <ShoppingBasket className="h-4 w-4 mr-1" />
            Básicos
          </Link>
        </Button>
      </div>
      
      {/* Spacer for mobile sticky */}
      <div className="h-16 lg:hidden" />
    </div>;
};
export default ImportanciaMision;