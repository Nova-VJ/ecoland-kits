import {
  ShoppingBasket, ChefHat, CalendarCheck, HeartPulse, Store, Package, RotateCcw, Repeat, Crown,
  Bot, BookOpen, Sun, CalendarDays, Wallet, Users, FileSpreadsheet, UtensilsCrossed, BarChart3,
  Flame, Barcode, Scale, ClipboardList, BellRing, type LucideIcon,
} from 'lucide-react';

// Mapa único de la app: las 4 puertas, sus funciones (en el orden en que se usan juntas)
// y la explicación que da EcoCoach. El menú, las páginas de sección y el coach leen de aquí.

export interface SectionItem {
  to: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  /** Qué explica EcoCoach cuando el cliente pregunta por esta función */
  howTo: string;
}

export interface AppSection {
  id: 'comprar' | 'cocinar' | 'organizarme' | 'cuidarme';
  path: string;
  label: string;
  question: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;
  steps: string[];
  items: SectionItem[];
}

export const APP_SECTIONS: AppSection[] = [
  {
    id: 'comprar',
    path: '/comprar',
    label: 'Comprar',
    question: 'Necesito algo',
    tagline: 'Más de 1.000 productos ecológicos, con filtros para veganos, celíacos y alergias.',
    icon: ShoppingBasket,
    accent: 'bg-emerald-100 text-emerald-900',
    steps: ['Busca o filtra por lo que necesitas', 'Añade a la cesta', 'Recíbelo en casa o recógelo en la tienda'],
    items: [
      { to: '/tienda', label: 'Tienda ecológica', desc: 'Todo el catálogo, con filtros por categoría y dieta.', icon: Store,
        howTo: 'Usa el buscador o elige una categoría. Las etiquetas Vegano y Sin gluten de cada producto están verificadas; toca el producto para ver su ficha completa, ingredientes y alérgenos.' },
      { to: '/packs', label: 'Packs listos', desc: 'Selecciones hechas por Ecoland para un objetivo.', icon: Package,
        howTo: 'Cada pack junta productos que se usan juntos (desayunos, despensa básica…). Puedes añadirlo entero a la cesta con un toque.' },
      { to: '/cuenta?tab=pedidos', label: 'Repetir mi compra', desc: 'Vuelve a pedir lo de la última vez.', icon: RotateCcw,
        howTo: 'En Mi cuenta → Pedidos ves tus compras anteriores y puedes repetir cualquiera. Necesitas haber iniciado sesión.' },
      { to: '/suscripcion', label: 'Suscripción', desc: 'Lo que usas siempre, cada semana o cada mes.', icon: Repeat,
        howTo: 'Elige productos y frecuencia. Puedes pausar, saltar un envío o cancelar cuando quieras.' },
      { to: '/club', label: 'Club Ecoland', desc: 'Ventajas para clientes habituales.', icon: Crown,
        howTo: 'El Club reúne las ventajas para clientes habituales de Ecoland.' },
    ],
  },
  {
    id: 'cocinar',
    path: '/cocinar',
    label: 'Cocinar',
    question: '¿Qué hago de comer?',
    tagline: 'Ideas con lo que tienes en casa, recetas paso a paso y tu despensa al día.',
    icon: ChefHat,
    accent: 'bg-amber-100 text-amber-900',
    steps: ['Cuéntale a EcoCoach qué tienes', 'Elige una receta', 'Añade lo que falta a la cesta'],
    items: [
      { to: '/coach', label: '¿Qué cocino hoy?', desc: 'EcoCoach te propone platos con lo que tienes.', icon: Bot,
        howTo: 'Escribe los ingredientes que tienes y el tiempo disponible ("tengo arroz, calabacín y 20 minutos"). EcoCoach te propone platos y te dice qué te falta.' },
      { to: '/blog', label: 'Recetas', desc: 'Recetas con productos de Ecoland.', icon: BookOpen,
        howTo: 'Cada receta indica tiempo, raciones e ingredientes. Puedes añadir sus ingredientes a la cesta.' },
      { to: '/hoy?abrir=recetas', label: 'Modo cocina', desc: 'Pasos grandes, temporizadores y pantalla encendida.', icon: ChefHat,
        howTo: 'Abre una receta en modo cocina: la pantalla no se apaga, los pasos se leen de lejos y tienes temporizadores.' },
      { to: '/hoy?abrir=despensa', label: 'Mi despensa', desc: 'Qué tienes en casa y qué se está acabando.', icon: Package,
        howTo: 'Añade lo que tienes (o importa un pedido). Marca "queda poco" o "se acabó" y Ecoland aprende cuánto te dura cada producto para avisarte a tiempo.' },
    ],
  },
  {
    id: 'organizarme',
    path: '/organizarme',
    label: 'Organizarme',
    question: 'Quiero planificar y ahorrar',
    tagline: 'Tu día, tu semana, tu presupuesto y avisos antes de quedarte sin nada.',
    icon: CalendarCheck,
    accent: 'bg-sky-100 text-sky-900',
    steps: ['Planifica tu semana', 'Genera la lista de la compra', 'Recibe aviso cuando algo se esté acabando'],
    items: [
      { to: '/hoy', label: 'Mi día', desc: 'Lo que comes hoy y accesos rápidos.', icon: Sun,
        howTo: 'Registra lo que comes con "Registrar comida" y usa "¿Qué puedo hacer ahora?" si no sabes por dónde empezar.' },
      { to: '/semana', label: 'Mi semana', desc: 'Menú semanal y lista de la compra.', icon: CalendarDays,
        howTo: 'Coloca recetas en cada día. Puedes marcar días libres o de sobras; la lista de la compra se calcula sola.' },
      { to: '/organizarme#reposicion', label: 'Avisos de reposición', desc: 'Te avisamos antes de que se acabe.', icon: BellRing,
        howTo: 'Ecoland calcula cuándo se te acabará cada producto: con tu propio ritmo si lo marcas en la despensa, o con un consumo medio si aún no hay datos. Puedes desactivar los avisos cuando quieras.' },
      { to: '/hoy?abrir=presupuesto', label: 'Presupuesto', desc: 'Cuánto gastas y cuánto te queda.', icon: Wallet,
        howTo: 'Fija un presupuesto semanal y ve el gasto y el coste medio por plato.' },
      { to: '/hoy?abrir=hogar', label: 'Mi hogar', desc: 'Quién come en casa y sus preferencias.', icon: Users,
        howTo: 'Añade a las personas de tu casa para ajustar cantidades y recetas.' },
      { to: '/hoy?abrir=informe', label: 'Informe', desc: 'Resumen para ti o tu dietista.', icon: FileSpreadsheet,
        howTo: 'Exporta un resumen de tus hábitos para compartirlo con un profesional.' },
    ],
  },
  {
    id: 'cuidarme',
    path: '/cuidarme',
    label: 'Cuidarme',
    question: 'Quiero comer mejor',
    tagline: 'Tu perfil (alergias, celiaquía, vegano…), el plato de Harvard y tu diario.',
    icon: HeartPulse,
    accent: 'bg-rose-100 text-rose-900',
    steps: ['Indica qué quieres cuidar', 'Mira qué productos te encajan', 'Lleva tu diario y equilibra el plato'],
    items: [
      { to: '/salud', label: 'Mi perfil de salud', desc: 'Alergias, celiaquía, lactosa, vegano…', icon: HeartPulse,
        howTo: 'Marca lo que quieres cuidar. La tienda te mostrará en verde lo compatible y te avisará en la cesta si algo no encaja. No es un diagnóstico.' },
      { to: '/ecohealth?tab=harvard', label: 'Plato de Harvard', desc: 'Equilibra tu compra por grupos.', icon: UtensilsCrossed,
        howTo: 'Añade productos al plato y verás qué grupo te falta (verduras, cereales integrales, proteína). Luego pásalo a la cesta.' },
      { to: '/ecohealth?tab=diario', label: 'Mi diario', desc: 'Comidas y macros del día.', icon: BarChart3,
        howTo: 'Apunta lo que comes y consulta tu resumen diario y semanal.' },
      { to: '/ecohealth?tab=calculadora', label: 'Gasto calórico', desc: 'Cuánto gastas al día, aproximadamente.', icon: Flame,
        howTo: 'Introduce edad, peso, altura y actividad para una estimación orientativa.' },
      { to: '/ecohealth?tab=escaner', label: 'Escáner', desc: 'Escanea un código de barras.', icon: Barcode,
        howTo: 'Escanea el código de un producto para ver ingredientes y alérgenos si están disponibles.' },
      { to: '/ecohealth?tab=comparador', label: 'Comparador', desc: 'Compara productos y precio por kilo.', icon: Scale,
        howTo: 'Elige dos o más productos para comparar precio por kilo y características.' },
      { to: '/quiz', label: 'Test rápido', desc: 'Te recomendamos por dónde empezar.', icon: ClipboardList,
        howTo: 'Unas pocas preguntas para recomendarte packs y secciones.' },
    ],
  },
];

/** Sección a la que pertenece una ruta (para marcar el menú y para que EcoCoach sepa dónde estás). */
export function sectionForPath(pathname: string, search = ''): AppSection | undefined {
  const full = pathname + search;
  return APP_SECTIONS.find(s => pathname === s.path)
    ?? APP_SECTIONS.find(s => s.items.some(i => full === i.to || pathname === i.to.split(/[?#]/)[0]))
    ?? (pathname.startsWith('/tienda') ? APP_SECTIONS[0] : undefined);
}
