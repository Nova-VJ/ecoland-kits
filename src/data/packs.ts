import inicioEco from '@/assets/packs/inicio-eco.jpg';
import energiaMananas from '@/assets/packs/energia-mananas.jpg';
import digestionBienestar from '@/assets/packs/digestion-bienestar.jpg';
import proteicoNatural from '@/assets/packs/proteico-natural.jpg';
import resetSuave from '@/assets/packs/reset-suave.jpg';
import sinGluten from '@/assets/packs/sin-gluten.jpg';
import oficinaSaludable from '@/assets/packs/oficina-saludable.jpg';
import veganoFacil from '@/assets/packs/vegano-facil.jpg';
import kidsEco from '@/assets/packs/kids-eco.jpg';
import limpiezaEco from '@/assets/packs/limpieza-eco.jpg';
import higieneZerowaste from '@/assets/packs/higiene-zerowaste.jpg';
import cestaGourmet from '@/assets/packs/cesta-gourmet.jpg';

export interface Pack {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  image: string;
  prices: {
    S: number;
    M: number;
    L: number;
    XL: number;
  };
  objectives: string[];
  tags: string[];
  allergens: string[];
  forWhom: string;
  whenToUse: string;
  includes: string[];
  featured?: boolean;
}

export const packs: Pack[] = [
  {
    id: "1",
    slug: "inicio-eco",
    name: "Inicio Eco",
    shortDescription: "Tu primera despensa ecológica completa",
    description: "El pack perfecto para comenzar tu viaje eco. Incluye todos los básicos de despensa para una alimentación más consciente y saludable.",
    icon: "🌿",
    image: inicioEco,
    prices: { S: 24.90, M: 39.90, L: 59.90, XL: 89.90 },
    objectives: ["starter", "despensa"],
    tags: ["Bio", "Despensa"],
    allergens: ["Puede contener trazas de frutos secos"],
    forWhom: "Personas que quieren dar el primer paso hacia una alimentación más ecológica y consciente.",
    whenToUse: "Para organizar tu despensa con productos de calidad que te durarán semanas.",
    includes: ["Legumbres ecológicas", "Cereales integrales", "Semillas variadas", "Aceite de oliva virgen extra", "Especias y condimentos"],
    featured: true,
  },
  {
    id: "2",
    slug: "energia-mananas",
    name: "Energía Mañanas",
    shortDescription: "Desayunos que activan tu día",
    description: "Todo lo que necesitas para desayunos energéticos y nutritivos. Avena, bebidas vegetales, semillas y superalimentos.",
    icon: "☀️",
    image: energiaMananas,
    prices: { S: 22.90, M: 36.90, L: 54.90, XL: 84.90 },
    objectives: ["energia", "desayuno"],
    tags: ["Bio", "Energía"],
    allergens: ["Gluten (según avena)", "Frutos secos"],
    forWhom: "Personas activas que buscan energía natural para empezar el día con fuerza.",
    whenToUse: "Cada mañana para un desayuno completo y nutritivo.",
    includes: ["Avena ecológica", "Bebida vegetal", "Miel o sirope", "Semillas de chía y lino", "Cacao puro", "Granola artesanal"],
    featured: true,
  },
  {
    id: "3",
    slug: "digestion-bienestar",
    name: "Digestión & Bienestar",
    shortDescription: "Cuida tu sistema digestivo naturalmente",
    description: "Selección de infusiones digestivas, semillas y alimentos que favorecen una digestión saludable y el bienestar intestinal.",
    icon: "🍃",
    image: digestionBienestar,
    prices: { S: 24.90, M: 39.90, L: 59.90, XL: 89.90 },
    objectives: ["digestión", "bienestar"],
    tags: ["Bio", "Digestivo", "Suave"],
    allergens: ["Semillas"],
    forWhom: "Personas que buscan mejorar su digestión y bienestar intestinal de forma natural.",
    whenToUse: "Como rutina después de las comidas o cuando necesites sentirte más ligero.",
    includes: ["Infusiones digestivas variadas", "Semillas de hinojo", "Probióticos naturales", "Snacks suaves", "Té verde"],
    featured: true,
  },
  {
    id: "4",
    slug: "proteico-natural",
    name: "Proteico Natural",
    shortDescription: "Proteína de calidad para tu entrenamiento",
    description: "Pack orientado a deportistas y personas activas. Proteína vegetal de alta calidad, frutos secos y alimentos energéticos.",
    icon: "💪",
    image: proteicoNatural,
    prices: { S: 29.90, M: 44.90, L: 69.90, XL: 99.90 },
    objectives: ["proteína", "fitness", "deporte"],
    tags: ["Proteína", "Fitness", "Bio"],
    allergens: ["Lácteos (si whey)", "Frutos secos", "Soja"],
    forWhom: "Deportistas, personas activas o quienes buscan aumentar su ingesta proteica de forma natural.",
    whenToUse: "Antes o después de entrenar, o como snack proteico entre comidas.",
    includes: ["Proteína vegetal en polvo", "Crema de frutos secos", "Barritas proteicas", "Semillas de cáñamo", "Bebida vegetal proteica"],
    featured: true,
  },
  {
    id: "5",
    slug: "reset-suave",
    name: "Reset Suave",
    shortDescription: "Vuelve a sentirte ligero",
    description: "Caldos, sopas ligeras y alimentos suaves para cuando necesitas un reset digestivo sin pasar hambre.",
    icon: "💧",
    image: resetSuave,
    prices: { S: 23.90, M: 37.90, L: 57.90, XL: 87.90 },
    objectives: ["ligero", "detox", "reset"],
    tags: ["Ligero", "Suave", "Bio"],
    allergens: ["Revisar etiquetas según productos"],
    forWhom: "Personas que buscan días más ligeros o recuperarse de excesos.",
    whenToUse: "Durante 1-3 días cuando necesites sentirte más ligero.",
    includes: ["Caldos ecológicos", "Sopas de verduras", "Infusiones depurativas", "Verduras deshidratadas", "Semillas"],
    featured: false,
  },
  {
    id: "6",
    slug: "sin-gluten-seguro",
    name: "Sin Gluten Seguro",
    shortDescription: "Despensa 100% libre de gluten",
    description: "Productos certificados sin gluten para una alimentación segura y deliciosa. Pasta, harinas y snacks aptos para celíacos.",
    icon: "🌾",
    image: sinGluten,
    prices: { S: 26.90, M: 42.90, L: 64.90, XL: 94.90 },
    objectives: ["sin-gluten", "alergias"],
    tags: ["Sin Gluten", "Certificado", "Bio"],
    allergens: ["Libre de gluten (certificado)"],
    forWhom: "Personas celíacas o con sensibilidad al gluten que buscan productos seguros y de calidad.",
    whenToUse: "Para tu despensa diaria sin preocupaciones.",
    includes: ["Pasta sin gluten", "Harinas alternativas", "Galletas sin gluten", "Pan crujiente", "Cereales aptos"],
    featured: true,
  },
  {
    id: "7",
    slug: "oficina-saludable",
    name: "Oficina Saludable",
    shortDescription: "Snacks sanos para tu jornada laboral",
    description: "Todo lo que necesitas para comer sano en la oficina: snacks, bebidas y comidas rápidas que no comprometen tu salud.",
    icon: "💼",
    image: oficinaSaludable,
    prices: { S: 21.90, M: 34.90, L: 52.90, XL: 82.90 },
    objectives: ["oficina", "snacks", "trabajo"],
    tags: ["Snacks", "Práctico", "Bio"],
    allergens: ["Frutos secos (posible)"],
    forWhom: "Profesionales que pasan muchas horas fuera de casa y quieren comer mejor.",
    whenToUse: "Llévalo a la oficina y tendrás toda la semana cubierta.",
    includes: ["Mix de frutos secos", "Barritas energéticas", "Bebidas saludables", "Galletas integrales", "Sopas instantáneas eco"],
    featured: false,
  },
  {
    id: "8",
    slug: "vegano-facil",
    name: "Vegano Fácil",
    shortDescription: "Despensa vegana completa y deliciosa",
    description: "Pack pensado para la alimentación 100% vegetal. Proteínas, legumbres, condimentos y todo lo esencial.",
    icon: "🥬",
    image: veganoFacil,
    prices: { S: 24.90, M: 39.90, L: 59.90, XL: 89.90 },
    objectives: ["vegano", "vegetariano", "plant-based"],
    tags: ["Vegano", "100% Vegetal", "Bio"],
    allergens: ["Sésamo", "Soja"],
    forWhom: "Veganos, vegetarianos o cualquier persona que quiera incorporar más opciones vegetales.",
    whenToUse: "Base perfecta para tu alimentación vegana semanal.",
    includes: ["Legumbres variadas", "Tofu o tempeh", "Leche vegetal", "Cremas vegetales", "Condimentos especiales"],
    featured: true,
  },
  {
    id: "9",
    slug: "kids-eco",
    name: "Kids Eco",
    shortDescription: "Meriendas sanas que les encantarán",
    description: "Productos ecológicos pensados para los más pequeños: snacks saludables, galletas sin azúcar añadido y meriendas nutritivas.",
    icon: "⭐",
    image: kidsEco,
    prices: { S: 19.90, M: 29.90, L: 44.90, XL: 69.90 },
    objectives: ["niños", "familia", "merienda"],
    tags: ["Kids", "Sin azúcar añadido", "Bio"],
    allergens: ["Lácteos", "Frutos secos (posible)"],
    forWhom: "Familias con niños que buscan opciones de merienda más saludables.",
    whenToUse: "Para meriendas, almuerzos escolares o snacks en casa.",
    includes: ["Galletas sin azúcar", "Purés de fruta", "Cacao puro", "Cereales infantiles", "Barritas de fruta"],
    featured: false,
  },
  {
    id: "10",
    slug: "limpieza-ecologica",
    name: "Limpieza Ecológica",
    shortDescription: "Tu hogar limpio y libre de tóxicos",
    description: "Productos de limpieza ecológicos y biodegradables. Cuida tu hogar y el planeta con ingredientes naturales.",
    icon: "🧹",
    image: limpiezaEco,
    prices: { S: 18.90, M: 29.90, L: 44.90, XL: 69.90 },
    objectives: ["limpieza", "hogar", "eco"],
    tags: ["Hogar", "Biodegradable", "Eco"],
    allergens: [],
    forWhom: "Hogares que quieren reducir la exposición a químicos y cuidar el medio ambiente.",
    whenToUse: "Para la limpieza diaria de todas las superficies de tu hogar.",
    includes: ["Multiusos ecológico", "Lavavajillas natural", "Jabón de Castilla", "Esponjas biodegradables", "Paños reutilizables"],
    featured: false,
  },
  {
    id: "11",
    slug: "higiene-zero-waste",
    name: "Higiene Zero Waste",
    shortDescription: "Cuidado personal sin residuos",
    description: "Pack de higiene personal con productos sólidos y zero waste. Reduce tu huella plástica sin renunciar al cuidado.",
    icon: "🧼",
    image: higieneZerowaste,
    prices: { S: 19.90, M: 34.90, L: 49.90, XL: 74.90 },
    objectives: ["higiene", "zero-waste", "sostenible"],
    tags: ["Zero Waste", "Natural", "Eco"],
    allergens: ["Frutos secos (según aceite)"],
    forWhom: "Personas comprometidas con reducir su impacto ambiental en el baño.",
    whenToUse: "Para tu rutina de higiene diaria sin generar residuos plásticos.",
    includes: ["Champú sólido", "Jabón artesanal", "Cepillo de bambú", "Desodorante natural", "Esponja vegetal"],
    featured: false,
  },
  {
    id: "12",
    slug: "cesta-gourmet-eco",
    name: "Cesta Gourmet Eco",
    shortDescription: "El regalo perfecto para los amantes de lo natural",
    description: "Selección premium de productos gourmet ecológicos. Ideal para regalar o para darte un capricho especial.",
    icon: "🎁",
    image: cestaGourmet,
    prices: { S: 34.90, M: 54.90, L: 79.90, XL: 119.90 },
    objectives: ["regalo", "gourmet", "premium"],
    tags: ["Gourmet", "Regalo", "Premium"],
    allergens: ["Frutos secos", "Gluten (según productos)", "Lácteos"],
    forWhom: "Para regalar a alguien especial o para darte un capricho.",
    whenToUse: "Ocasiones especiales, cumpleaños, aniversarios o simplemente para disfrutar.",
    includes: ["Chocolate artesanal", "Aceite premium", "Conservas gourmet", "Frutos secos premium", "Té o café de origen"],
    featured: true,
  },
];

export const objectives = [
  { id: "energia", label: "Energía", icon: "⚡" },
  { id: "digestion", label: "Digestión", icon: "🍃" },
  { id: "proteina", label: "Proteico", icon: "💪" },
  { id: "sin-gluten", label: "Sin Gluten", icon: "🌾" },
  { id: "vegano", label: "Vegano", icon: "🥬" },
  { id: "oficina", label: "Oficina", icon: "💼" },
  { id: "kids", label: "Kids", icon: "⭐" },
  { id: "limpieza", label: "Limpieza", icon: "🧹" },
  { id: "higiene", label: "Higiene", icon: "🧼" },
  { id: "regalo", label: "Regalos", icon: "🎁" },
];

export const packSizes = ["S", "M", "L", "XL"] as const;
export type PackSize = typeof packSizes[number];

export const getFeaturedPacks = () => packs.filter(p => p.featured);
export const getPackBySlug = (slug: string) => packs.find(p => p.slug === slug);
