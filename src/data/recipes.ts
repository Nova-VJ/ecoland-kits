export interface Recipe {
  id: string;
  slug: string;
  title: string;
  packSlug: string;
  timeMinutes: number;
  difficulty: "Fácil" | "Media" | "Avanzada";
  servings: string;
  tags: string[];
  allergens: string[];
  excerpt: string;
  ingredients: string[];
  steps: string[];
  tips: string[];
  image: string;
}

export const recipes: Recipe[] = [
  {
    id: "1",
    slug: "bowl-eco-base-despensa",
    title: "Bowl Eco \"Base de Despensa\"",
    packSlug: "inicio-eco",
    timeMinutes: 20,
    difficulty: "Fácil",
    servings: "2",
    tags: ["despensa", "facil", "meal-prep", "eco"],
    allergens: ["Frutos secos (si usas crema)"],
    excerpt: "Un bowl rápido y completo usando básicos del Pack Inicio Eco.",
    ingredients: [
      "1 taza de legumbre cocida (garbanzo/lenteja)",
      "1/2 taza de cereal integral cocido (arroz/quinoa)",
      "1 cucharada de semillas (chía/lino)",
      "1 cucharada de crema de frutos secos (opcional)",
      "Verduras frescas al gusto (tomate, pepino, zanahoria rallada)",
      "AOVE + sal + limón"
    ],
    steps: [
      "Cocina o calienta la legumbre y el cereal integral.",
      "Monta el bowl con las verduras frescas.",
      "Añade las semillas y aliña con AOVE, limón y una pizca de sal.",
      "Opcional: agrega una cucharadita de crema de frutos secos para más sabor."
    ],
    tips: [
      "Haz doble cantidad y guarda en tuppers 2–3 días.",
      "Cambia el aliño (limón, vinagre suave, especias) para variar sin complicarte."
    ],
    image: "/packs/inicio-eco.jpg"
  },
  {
    id: "2",
    slug: "avena-cremosa-energia-mananas",
    title: "Avena cremosa \"Energía Mañanas\"",
    packSlug: "energia-mananas",
    timeMinutes: 10,
    difficulty: "Fácil",
    servings: "1",
    tags: ["desayuno", "energia", "rapido", "eco"],
    allergens: ["Gluten (según avena)", "Frutos secos (si añades)"],
    excerpt: "Desayuno rápido con avena, bebida vegetal y semillas.",
    ingredients: [
      "1/2 taza de avena",
      "1 taza de bebida vegetal",
      "1 cucharadita de semillas (chía/lino)",
      "1 cucharadita de miel/sirop (opcional)",
      "Canela o cacao puro (opcional)"
    ],
    steps: [
      "Calienta la bebida vegetal en un cazo.",
      "Añade la avena y cocina 3–5 minutos removiendo.",
      "Incorpora las semillas y termina con canela o cacao.",
      "Endulza solo si lo necesitas."
    ],
    tips: [
      "Versión fría: deja reposar en nevera (overnight).",
      "Si quieres más textura, añade semillas al final."
    ],
    image: "/packs/energia-mananas.jpg"
  },
  {
    id: "3",
    slug: "infusion-digestiva-crunch-semillas",
    title: "Infusión digestiva + \"crunch\" de semillas",
    packSlug: "digestion-bienestar",
    timeMinutes: 7,
    difficulty: "Fácil",
    servings: "1",
    tags: ["digestivo", "rutina", "suave", "eco"],
    allergens: ["Semillas"],
    excerpt: "Rutina suave: infusión digestiva y semillas en una base ligera.",
    ingredients: [
      "1 infusión digestiva (bolsita o mezcla)",
      "1 cucharadita de semillas (chía/lino)",
      "Yogur vegetal o compota (opcional)",
      "1 snack suave del pack (opcional)"
    ],
    steps: [
      "Prepara la infusión y deja reposar 5–7 minutos.",
      "Si quieres, mezcla las semillas con yogur vegetal o compota.",
      "Acompaña con un snack suave del pack (opcional)."
    ],
    tips: [
      "Si las semillas te resultan fuertes, reduce la cantidad y aumenta agua.",
      "Perfecto como cierre de cena ligera."
    ],
    image: "/packs/digestion-bienestar.jpg"
  },
  {
    id: "4",
    slug: "batido-proteico-natural",
    title: "Batido Proteico Natural \"Pre/Post\"",
    packSlug: "proteico-natural",
    timeMinutes: 5,
    difficulty: "Fácil",
    servings: "1",
    tags: ["proteina", "fitness", "rapido", "eco"],
    allergens: ["Lácteos (si whey)", "Frutos secos (si crema)"],
    excerpt: "Batido rápido con proteína del pack, perfecto antes o después de entrenar.",
    ingredients: [
      "1 scoop de proteína del pack",
      "250 ml de bebida vegetal o agua",
      "1 cucharadita de crema de frutos secos (opcional)",
      "1 cucharadita de semillas (opcional)"
    ],
    steps: [
      "Añade el líquido en un shaker o batidora.",
      "Incorpora la proteína y agita o bate 20–30 segundos.",
      "Opcional: añade crema de frutos secos y/o semillas para más saciedad.",
      "Sirve y listo."
    ],
    tips: [
      "Para versión más cremosa: añade hielo y bate 10–15 segundos más.",
      "Ajusta el líquido para dejarlo más denso o más ligero."
    ],
    image: "/packs/proteico-natural.jpg"
  },
  {
    id: "5",
    slug: "sopa-rapida-reset",
    title: "Sopa rápida \"Reset\" (base del pack)",
    packSlug: "reset-suave",
    timeMinutes: 12,
    difficulty: "Fácil",
    servings: "2",
    tags: ["ligero", "cena", "rapido", "eco"],
    allergens: ["Según el caldo/sopa (revisar etiqueta)"],
    excerpt: "Cena ligera en 12 minutos usando el caldo o sopa del pack.",
    ingredients: [
      "2 raciones de caldo/sopa del pack",
      "Verdura extra opcional (espinaca, zanahoria rallada, calabacín)",
      "1 cucharadita de semillas (opcional)"
    ],
    steps: [
      "Calienta el caldo/sopa en un cazo.",
      "Añade verdura extra y cocina 2–3 minutos.",
      "Sirve y termina con semillas (opcional)."
    ],
    tips: [
      "Ajusta la sal al final (muchos caldos ya vienen equilibrados).",
      "Ideal para volver a rutina sin complicarte."
    ],
    image: "/packs/reset-suave.jpg"
  },
  {
    id: "6",
    slug: "pasta-sin-gluten-sos",
    title: "Pasta Sin Gluten \"SOS\" con salsa rápida",
    packSlug: "sin-gluten-seguro",
    timeMinutes: 18,
    difficulty: "Fácil",
    servings: "2",
    tags: ["sin-gluten", "despensa", "rapido", "eco"],
    allergens: ["Revisar trazas según producto"],
    excerpt: "Comida rápida sin gluten con pasta del pack y una salsa sencilla.",
    ingredients: [
      "200 g de pasta sin gluten del pack",
      "Salsa/condimento del pack (tomate, pesto, etc.)",
      "AOVE",
      "Especias al gusto"
    ],
    steps: [
      "Cuece la pasta según indicación del paquete.",
      "Calienta la salsa/condimento en una sartén o cazo.",
      "Mezcla pasta y salsa. Añade un chorrito de AOVE.",
      "Ajusta con especias al gusto."
    ],
    tips: [
      "Reserva un poco de agua de cocción para ligar la salsa.",
      "Si eres muy sensible, prioriza productos certificados sin gluten."
    ],
    image: "/packs/sin-gluten.jpg"
  },
  {
    id: "7",
    slug: "snack-box-oficina-5-min",
    title: "Snack Box de Oficina (5 min)",
    packSlug: "oficina-saludable",
    timeMinutes: 5,
    difficulty: "Fácil",
    servings: "1",
    tags: ["oficina", "snacks", "rapido", "eco"],
    allergens: ["Frutos secos (posible)"],
    excerpt: "Tu combo de oficina listo en 5 minutos: snack + bebida + extra saludable.",
    ingredients: [
      "1 snack de frutos secos del pack",
      "1 barrita/galleta saludable del pack",
      "1 bebida saludable del pack",
      "1 comida rápida sana del pack (sopa/conserva) o extra equivalente"
    ],
    steps: [
      "Prepara una caja/tupper con snack + barrita/galleta.",
      "Añade la bebida y un extra (sopa/conserva) para completar.",
      "Guárdalo en mochila o deja en el escritorio."
    ],
    tips: [
      "Haz 2–3 snack boxes de una vez para la semana.",
      "Alterna sabores para no aburrirte."
    ],
    image: "/packs/oficina-saludable.jpg"
  },
  {
    id: "8",
    slug: "bowl-vegano-facil-15-min",
    title: "Bowl Vegano Fácil (15 min)",
    packSlug: "vegano-facil",
    timeMinutes: 15,
    difficulty: "Fácil",
    servings: "2",
    tags: ["vegano", "despensa", "facil", "eco"],
    allergens: ["Sésamo (si usas)", "Soja (según proteína)"],
    excerpt: "Bowl vegano con legumbre, semillas y condimento del pack.",
    ingredients: [
      "1 taza de legumbre cocida",
      "1/2 taza de cereal cocido o base de ensalada",
      "1 opción de proteína vegetal del pack (opcional)",
      "1 cucharada de semillas",
      "Salsa/condimento del pack"
    ],
    steps: [
      "Prepara la base: cereal o ensalada.",
      "Añade legumbre y proteína vegetal (si usas).",
      "Termina con semillas y salsa/condimento."
    ],
    tips: [
      "Cambia la salsa y parece receta nueva.",
      "Añade verduras crudas para más volumen."
    ],
    image: "/packs/vegano-facil.jpg"
  },
  {
    id: "9",
    slug: "cacao-eco-merienda-kids",
    title: "Cacao Eco estilo merienda (Kids)",
    packSlug: "kids-eco",
    timeMinutes: 5,
    difficulty: "Fácil",
    servings: "1",
    tags: ["kids", "merienda", "rapido", "eco"],
    allergens: ["Lácteos (si leche)", "Frutos secos (posible)"],
    excerpt: "Merienda sencilla: cacao puro y un snack kids del pack.",
    ingredients: [
      "200–250 ml de bebida vegetal o leche",
      "1 cucharadita de cacao puro del pack",
      "1 snack/galleta kids del pack"
    ],
    steps: [
      "Mezcla el cacao con un poco de líquido hasta disolver.",
      "Añade el resto del vaso y remueve bien.",
      "Acompaña con un snack/galleta del pack."
    ],
    tips: [
      "Si quieres más cremoso, calienta 30–45 segundos.",
      "Endulza solo si hace falta y en poca cantidad."
    ],
    image: "/packs/kids-eco.jpg"
  },
  {
    id: "10",
    slug: "spray-multiusos-eco-uso-diario",
    title: "Spray multiusos eco (uso diario)",
    packSlug: "limpieza-ecologica",
    timeMinutes: 5,
    difficulty: "Fácil",
    servings: "1 botella",
    tags: ["hogar", "limpieza", "diy", "eco"],
    allergens: [],
    excerpt: "Spray multiusos sencillo para superficies lavables.",
    ingredients: [
      "250 ml de agua",
      "250 ml de vinagre blanco",
      "1 cucharadita de jabón suave (opcional)",
      "1 botella con spray"
    ],
    steps: [
      "Mezcla agua y vinagre en la botella.",
      "Opcional: añade jabón suave y agita.",
      "Pulveriza en superficies lavables y pasa un paño."
    ],
    tips: [
      "⚠️ Seguridad: NO mezclar nunca con lejía ni amoníaco.",
      "Prueba primero en una zona pequeña si es una superficie delicada."
    ],
    image: "/packs/limpieza-eco.jpg"
  },
  {
    id: "11",
    slug: "exfoliante-corporal-azucar-aceite",
    title: "Exfoliante corporal sencillo (azúcar + aceite)",
    packSlug: "higiene-zero-waste",
    timeMinutes: 5,
    difficulty: "Fácil",
    servings: "1 tarro",
    tags: ["higiene", "zero-waste", "diy", "eco"],
    allergens: ["Frutos secos (según aceite)"],
    excerpt: "Exfoliante casero simple para usar 1–2 veces por semana.",
    ingredients: [
      "4 cucharadas de azúcar (o sal fina)",
      "2 cucharadas de aceite vegetal (oliva/coco, según prefieras)",
      "1 tarro pequeño"
    ],
    steps: [
      "Mezcla azúcar y aceite hasta conseguir una textura húmeda.",
      "Guárdalo en un tarro limpio y seco.",
      "En ducha, aplica con movimientos suaves y aclara."
    ],
    tips: [
      "⚠️ No usar en piel irritada, recién depilada o con heridas.",
      "Evita que entre agua en el tarro para que dure más."
    ],
    image: "/packs/higiene-zerowaste.jpg"
  },
  {
    id: "12",
    slug: "tabla-gourmet-eco-10-min",
    title: "Tabla \"Gourmet Eco\" en 10 minutos",
    packSlug: "cesta-gourmet-eco",
    timeMinutes: 10,
    difficulty: "Fácil",
    servings: "2–4",
    tags: ["gourmet", "regalo", "facil", "eco"],
    allergens: ["Frutos secos", "Gluten (según crackers)", "Lácteos (si añades queso)"],
    excerpt: "Una tabla rápida para regalar o improvisar una cena bonita.",
    ingredients: [
      "Chocolate saludable del pack",
      "Frutos secos premium del pack",
      "Conserva gourmet del pack",
      "Té o café del pack (para acompañar)",
      "Opcional: crackers/pan y fruta"
    ],
    steps: [
      "Coloca frutos secos y chocolate en un plato.",
      "Abre la conserva gourmet y sirve con crackers/pan (opcional).",
      "Prepara té o café para acompañar."
    ],
    tips: [
      "Añade uvas o manzana en gajos para un toque fresco.",
      "Ideal para regalo: acompaña con una tarjeta y queda perfecto."
    ],
    image: "/packs/cesta-gourmet.jpg"
  }
];

export const getRecipeBySlug = (slug: string) => recipes.find(r => r.slug === slug);
export const getRecipesByPackSlug = (packSlug: string) => recipes.filter(r => r.packSlug === packSlug);
