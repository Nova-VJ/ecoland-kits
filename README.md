# Ecoland Kits

PROMPT PARA LOVABLE — ECOLAND (TIENDA ECOLÓGICA POR PACKS + SUSCRIPCIÓN + QUIZ + BLOG DE RECETAS + ECO-COACH)
OBJETIVO GENERAL
Crear una web e-commerce moderna y muy enfocada a conversión para Ecoland, una tienda de productos ecológicos. El “producto estrella” son los packs por objetivo (salud/bienestar, proteína, oficina, hogar, regalos). La web debe facilitar: elegir pack → comprar rápido → repetir con suscripción opcional → aumentar ticket con extras → fidelizar con club y contenido. Que apenas una persona entre a la pagina se cautive por el sentido ecológico que tiene. 
La web debe construirse basada en el concepto de ecología (natural, sostenible, limpio, premium) y usando los colores del logo de Ecoland como base del diseño.
Que exista un carrito de compra donde poder agregar los packs
________________________________________
0) BRANDING / COLORES (OBLIGATORIO)
Usar los colores del logo de Ecoland como tema principal. Crear variables de tema (CSS/tokens) y aplicarlas en toda la web.
Paleta sugerida (ajustable):
•	--eco-green: #718d6e (verde principal)
•	--eco-cream: #f8dfc0 (crema)
•	--eco-dark: #386639 (verde oscuro para CTA/hover)
•	--eco-offwhite: #fefcf3 (fondos)
•	--eco-soft: #a6c38e (chips/etiquetas)
•	--text: #1f2a1f
Estilo visual:
•	Natural premium, minimalista, limpio, con aire orgánico (formas suaves, patrones sutiles).
•	Nada de estética “tech/cósmica”.
•	UI: tarjetas con sombras suaves, bordes redondeados, iconos lineales simples, fotos grandes.
•	Copys cortos, claros, centrados en beneficios (sin promesas médicas).
________________________________________
1) ASSETS / IMÁGENES (OBLIGATORIO)
Voy a aportar imágenes (logo + Eco-Coach). Debes:
•	Usarlas en la web y dejar sistema centralizado para reemplazarlas fácil.
•	Definir un objeto/config de assets:
o	brand.logo
o	assistant.ecoCoach.avatarHead
o	assistant.ecoCoach.avatarFull
o	assistant.ecoCoach.chatIcon
Uso recomendado:
•	Logo: header + footer.
•	Eco-Coach HEAD: botón flotante + avatar del chat.
•	Eco-Coach FULL: sección de quiz/ayuda + bloque “Eco-Coach recomienda”.
________________________________________
2) RUTAS / ESTRUCTURA DE PÁGINAS
Crear estas rutas:
•	Home /
•	Packs /packs
•	Detalle pack /packs/:slug
•	Tienda /tienda + /categoria/:slug + /producto/:slug
•	Quiz /quiz
•	Suscripción /suscripcion
•	Club /club
•	Blog Recetas /blog + /blog/:slug
•	Sobre /sobre
•	Contacto /contacto
•	Cuenta /cuenta
•	Carrito /carrito
•	Checkout /checkout
•	Gracias /gracias
________________________________________
3) HOME / (COPY LISTO + SECCIONES OBLIGATORIAS)
HERO
Título: Packs ecológicos listos para tu objetivo
Subtítulo: Seleccionados por Ecoland. Compra en 1 clic. Suscripción opcional.
Botones: Ver packs · Hacer el test · Novedades
Beneficios rápidos
•	Selección eco premium
•	Ahorro de tiempo (todo en un pack)
•	Envío o recogida
•	Eco-Coach te recomienda en 30s
Top Packs (6)
Cards con foto, objetivo, precio, tamaño (S/M/L), CTA “Añadir al carrito”.
Cómo funciona (3 pasos)
1.	Elige tu pack (o haz el test)
2.	Lo preparamos con productos eco
3.	Envío a casa o recogida en tienda
Bloque confianza
Productos ecológicos · selección local cuando sea posible · pago seguro · atención WhatsApp + Eco-Coach
Testimonios (editables)
CTA final
Título: ¿No sabes cuál elegir?
Texto: Haz el test y te recomendamos 2 packs perfectos para ti.
Botón: Hacer el test
________________________________________
4) CHATBOT / ASISTENTE VIRTUAL “ECO-COACH” (OBLIGATORIO)
Crear un botón flotante con Eco-Coach y una ventana de chat.
Nombre: Asistente Virtual Eco-Coach
Rol: experta en productos ecológicos, alimentación natural, packs, alérgenos, recomendaciones y ayuda de compra.
UI/Contenido:
•	Mensaje inicial: “Hola, soy Eco-Coach 🌿 Dime tu objetivo y te recomiendo el pack ideal.”
•	Quick actions:
o	Recomiéndame un pack
o	Quiero proteína
o	Sin gluten
o	Para oficina
o	Tengo alergias
o	Ver packs
o	Hacer el test
•	Debe devolver links clicables a /quiz, /packs, /packs/:slug, /contacto y WhatsApp (si hay).
•	Debe mostrar “mini-card” del pack recomendado con botones “Ver pack” y “Añadir”.
(Si no hay backend de IA aún, crear modo simulado con respuestas predefinidas y estructura lista para conectar a un endpoint.)
________________________________________
5) PÁGINA PACKS /packs + FILTROS (OBLIGATORIO)
Filtros:
•	Objetivo (Energía, Digestión, Proteico, Sin Gluten, Vegano, Oficina, Kids, Limpieza, Higiene, Regalos)
•	Presupuesto (Económico, Medio, Premium)
•	Tamaño (S/M/L/XL)
•	Tipo compra: “Una vez” / “Suscripción -10%”
Ordenar por: Más vendidos / Precio / Novedad
________________________________________
6) DETALLE PACK /packs/:slug
•	Galería + precio + selector tamaño (S/M/L/XL)
•	Compra única vs suscripción
•	Qué incluye (lista con mini fotos)
•	Para quién es + cuándo usarlo
•	Alérgenos y etiquetas
•	Sustituciones equivalentes por stock
•	Upsell: “Completa tu pack con…” (3–6 extras)
•	Recetas con este pack (3 recetas del blog vinculadas) + CTA “Añadir ingredientes al carrito”
•	FAQ pack
________________________________________
7) CATÁLOGO DE 12 PACKS (CREARLOS YA CON TODO)
Crear estos 12 packs con datos completos, icono sugerido e imagen referente. Precios editables:
1.	Inicio Eco (starter)
S 24.90 | M 39.90 | L 59.90 | XL 89.90
Icono: hoja+cesta · Imagen: despensa eco minimal
2.	Energía Mañanas
S 22.90 | M 36.90 | L 54.90 | XL 84.90
Icono: sol+hoja · Imagen: desayuno saludable editorial
3.	Digestión & Bienestar
S 24.90 | M 39.90 | L 59.90 | XL 89.90
Icono: estómago minimal+hoja · Imagen: infusiones/semillas
4.	Proteico Natural
S 29.90 | M 44.90 | L 69.90 | XL 99.90
Icono: pesa+hoja · Imagen: batido/proteína clean
5.	Reset Suave
S 23.90 | M 37.90 | L 57.90 | XL 87.90
Icono: gota+hoja · Imagen: caldos/bowls ligeros
6.	Sin Gluten Seguro
S 26.90 | M 42.90 | L 64.90 | XL 94.90
Icono: espiga tachada+hoja · Imagen: pasta/harina SG
7.	Oficina Saludable
S 21.90 | M 34.90 | L 52.90 | XL 82.90
Icono: maletín+hoja · Imagen: snacks escritorio premium
8.	Vegano Fácil
S 24.90 | M 39.90 | L 59.90 | XL 89.90
Icono: hoja+check · Imagen: bowl vegano
9.	Kids Eco
S 19.90 | M 29.90 | L 44.90 | XL 69.90
Icono: estrella+hoja · Imagen: meriendas kids suaves
10.	Limpieza Ecológica
S 18.90 | M 29.90 | L 44.90 | XL 69.90
Icono: spray+hoja · Imagen: limpieza eco minimal
11.	Higiene Zero Waste
S 19.90 | M 34.90 | L 49.90 | XL 74.90
Icono: jabón+hoja · Imagen: baño zero waste
12.	Cesta Gourmet Eco
S 34.90 | M 54.90 | L 79.90 | XL 119.90
Icono: regalo+hoja · Imagen: cesta premium eco
Nota obligatoria: “Sustituciones: algunos productos pueden variar por stock manteniendo equivalencia.”
________________________________________
8) TIENDA /tienda (PRODUCTOS SUELTOS)
•	Buscador + categorías (Despensa, Snacks, Bebidas, Suplementos, Limpieza, Higiene, Regalos)
•	Filtros por tags: Vegano / Sin gluten / Bio / Sin azúcar añadido
•	Ficha producto con alérgenos, ingredientes, uso.
________________________________________
9) QUIZ /quiz (RECOMENDADOR)
Preguntas:
1.	Objetivo
2.	Dieta (omni/veg/veggie)
3.	Alérgenos
4.	Presupuesto
5.	Frecuencia (una vez/mensual)
6.	Tiempo de cocina
7.	Preferencia (snacks/despensa/mixto)
Resultado: 2 packs + CTA comprar.
________________________________________
10) SUSCRIPCIÓN /suscripcion
Copy:
Título: “Repite tu pack sin preocuparte”
Texto: “Ahorra un 10% con suscripción y cambia o pausa cuando quieras.”
Bullets: -10% packs, prioridad, cambios fáciles, recordatorios.
Botón: “Ver packs con suscripción”
________________________________________
11) CLUB /club
Copy:
Título: “Club Eco 🌿”
Texto: “Para quienes quieren comprar mejor, cada mes.”
Incluye: 10% packs, preventa, sorpresa trimestral.
CTA: “Unirme al Club Eco”
________________________________________
12) BLOG /blog — RECETAS DE LOS PROPIOS PACKS (OBLIGATORIO)
•	Tipos: Recetas / Guías.
•	Filtros: pack relacionado, dieta, tiempo, dificultad.
•	Cada receta vinculada a un pack.
•	CTA: “Comprar el pack” + “Añadir ingredientes al carrito”.
•	Crear mínimo 12 recetas (1 por pack) con el contenido exacto (usar el set de recetas que te doy abajo).
________________________________________
13) RECETAS INICIALES (12) PARA CARGAR EN EL BLOG
Crear estas recetas tal cual (con tiempo, dificultad, ingredientes, pasos, alérgenos, tips, y CTAs).
(Usa las 12 recetas que ya te pasé: Bowl Eco, Avena, Infusión, Batido, Sopa Reset, Pasta SG, Snack Box, Bowl Vegano, Cacao Kids, Spray multiusos, Exfoliante, Tabla Gourmet. Mantén CTAs al pack correspondiente.)
Seguridad para DIY (obligatorio):
•	En limpieza: “No mezclar con lejía/amoníaco.”
•	En exfoliante: “No usar en piel irritada.”
________________________________________
14) CHECKOUT
•	Envío o recogida.
•	Cross-sell en carrito.
•	Stripe si se integra; si no, modo simulado preparado.
________________________________________
15) LEGAL (ESPAÑA)
Footer con enlaces: Aviso legal, Privacidad, Cookies, Términos de compra, Envíos y devoluciones (placeholders editables).
________________________________________
16) CRITERIOS DE ÉXITO
•	Diseño eco premium coherente con colores del logo.
•	Packs creados (12) con filtros, detalle, carrito, checkout.
•	Eco-Coach visible, funcional, con links clicables.
•	Blog de recetas ligado a packs con CTAs y añadir ingredientes.
•	Responsive perfecto.

[
  {
    "type": "recipe",
    "title": "Bowl Eco “Base de Despensa”",
    "slug": "bowl-eco-base-despensa",
    "pack_slug": "inicio-eco",
    "time_minutes": 20,
    "difficulty": "Fácil",
    "servings": "2",
    "tags": ["despensa", "facil", "meal-prep", "eco"],
    "allergens": ["Frutos secos (si usas crema)"],
    "excerpt": "Un bowl rápido y completo usando básicos del Pack Inicio Eco.",
    "ingredients": [
      "1 taza de legumbre cocida (garbanzo/lenteja)",
      "1/2 taza de cereal integral cocido (arroz/quinoa)",
      "1 cucharada de semillas (chía/lino)",
      "1 cucharada de crema de frutos secos (opcional)",
      "Verduras frescas al gusto (tomate, pepino, zanahoria rallada)",
      "AOVE + sal + limón"
    ],
    "steps": [
      "Cocina o calienta la legumbre y el cereal integral.",
      "Monta el bowl con las verduras frescas.",
      "Añade las semillas y aliña con AOVE, limón y una pizca de sal.",
      "Opcional: agrega una cucharadita de crema de frutos secos para más sabor."
    ],
    "tips": [
      "Haz doble cantidad y guarda en tuppers 2–3 días.",
      "Cambia el aliño (limón, vinagre suave, especias) para variar sin complicarte."
    ],
    "cta_primary": { "label": "Comprar el pack Inicio Eco", "href": "/packs/inicio-eco" },
    "cta_secondary": { "label": "Añadir ingredientes al carrito", "action": "ADD_INGREDIENTS_TO_CART" }
  },
  {
    "type": "recipe",
    "title": "Avena cremosa “Energía Mañanas”",
    "slug": "avena-cremosa-energia-mananas",
    "pack_slug": "energia-mananas",
    "time_minutes": 10,
    "difficulty": "Fácil",
    "servings": "1",
    "tags": ["desayuno", "energia", "rapido", "eco"],
    "allergens": ["Gluten (según avena)", "Frutos secos (si añades)"],
    "excerpt": "Desayuno rápido con avena, bebida vegetal y semillas.",
    "ingredients": [
      "1/2 taza de avena",
      "1 taza de bebida vegetal",
      "1 cucharadita de semillas (chía/lino)",
      "1 cucharadita de miel/sirop (opcional)",
      "Canela o cacao puro (opcional)"
    ],
    "steps": [
      "Calienta la bebida vegetal en un cazo.",
      "Añade la avena y cocina 3–5 minutos removiendo.",
      "Incorpora las semillas y termina con canela o cacao.",
      "Endulza solo si lo necesitas."
    ],
    "tips": [
      "Versión fría: deja reposar en nevera (overnight).",
      "Si quieres más textura, añade semillas al final."
    ],
    "cta_primary": { "label": "Comprar el pack Energía Mañanas", "href": "/packs/energia-mananas" },
    "cta_secondary": { "label": "Añadir ingredientes al carrito", "action": "ADD_INGREDIENTS_TO_CART" }
  },
  {
    "type": "recipe",
    "title": "Infusión digestiva + “crunch” de semillas",
    "slug": "infusion-digestiva-crunch-semillas",
    "pack_slug": "digestion-bienestar",
    "time_minutes": 7,
    "difficulty": "Fácil",
    "servings": "1",
    "tags": ["digestivo", "rutina", "suave", "eco"],
    "allergens": ["Semillas"],
    "excerpt": "Rutina suave: infusión digestiva y semillas en una base ligera.",
    "ingredients": [
      "1 infusión digestiva (bolsita o mezcla)",
      "1 cucharadita de semillas (chía/lino)",
      "Yogur vegetal o compota (opcional)",
      "1 snack suave del pack (opcional)"
    ],
    "steps": [
      "Prepara la infusión y deja reposar 5–7 minutos.",
      "Si quieres, mezcla las semillas con yogur vegetal o compota.",
      "Acompaña con un snack suave del pack (opcional)."
    ],
    "tips": [
      "Si las semillas te resultan fuertes, reduce la cantidad y aumenta agua.",
      "Perfecto como cierre de cena ligera."
    ],
    "cta_primary": { "label": "Comprar el pack Digestión & Bienestar", "href": "/packs/digestion-bienestar" },
    "cta_secondary": { "label": "Añadir ingredientes al carrito", "action": "ADD_INGREDIENTS_TO_CART" }
  },
  {
    "type": "recipe",
    "title": "Batido Proteico Natural “Pre/Post”",
    "slug": "batido-proteico-natural",
    "pack_slug": "proteico-natural",
    "time_minutes": 5,
    "difficulty": "Fácil",
    "servings": "1",
    "tags": ["proteina", "fitness", "rapido", "eco"],
    "allergens": ["Lácteos (si whey)", "Frutos secos (si crema)"],
    "excerpt": "Batido rápido con proteína del pack, perfecto antes o después de entrenar.",
    "ingredients": [
      "1 scoop de proteína del pack",
      "250 ml de bebida vegetal o agua",
      "1 cucharadita de crema de frutos secos (opcional)",
      "1 cucharadita de semillas (opcional)"
    ],
    "steps": [
      "Añade el líquido en un shaker o batidora.",
      "Incorpora la proteína y agita o bate 20–30 segundos.",
      "Opcional: añade crema de frutos secos y/o semillas para más saciedad.",
      "Sirve y listo."
    ],
    "tips": [
      "Para versión más cremosa: añade hielo y bate 10–15 segundos más.",
      "Ajusta el líquido para dejarlo más denso o más ligero."
    ],
    "cta_primary": { "label": "Comprar el pack Proteico Natural", "href": "/packs/proteico-natural" },
    "cta_secondary": { "label": "Añadir ingredientes al carrito", "action": "ADD_INGREDIENTS_TO_CART" }
  },
  {
    "type": "recipe",
    "title": "Sopa rápida “Reset” (base del pack)",
    "slug": "sopa-rapida-reset",
    "pack_slug": "reset-suave",
    "time_minutes": 12,
    "difficulty": "Fácil",
    "servings": "2",
    "tags": ["ligero", "cena", "rapido", "eco"],
    "allergens": ["Según el caldo/sopa (revisar etiqueta)"],
    "excerpt": "Cena ligera en 12 minutos usando el caldo o sopa del pack.",
    "ingredients": [
      "2 raciones de caldo/sopa del pack",
      "Verdura extra opcional (espinaca, zanahoria rallada, calabacín)",
      "1 cucharadita de semillas (opcional)"
    ],
    "steps": [
      "Calienta el caldo/sopa en un cazo.",
      "Añade verdura extra y cocina 2–3 minutos.",
      "Sirve y termina con semillas (opcional)."
    ],
    "tips": [
      "Ajusta la sal al final (muchos caldos ya vienen equilibrados).",
      "Ideal para volver a rutina sin complicarte."
    ],
    "cta_primary": { "label": "Comprar el pack Reset Suave", "href": "/packs/reset-suave" },
    "cta_secondary": { "label": "Añadir ingredientes al carrito", "action": "ADD_INGREDIENTS_TO_CART" }
  },
  {
    "type": "recipe",
    "title": "Pasta Sin Gluten “SOS” con salsa rápida",
    "slug": "pasta-sin-gluten-sos",
    "pack_slug": "sin-gluten-seguro",
    "time_minutes": 18,
    "difficulty": "Fácil",
    "servings": "2",
    "tags": ["sin-gluten", "despensa", "rapido", "eco"],
    "allergens": ["Revisar trazas según producto"],
    "excerpt": "Comida rápida sin gluten con pasta del pack y una salsa sencilla.",
    "ingredients": [
      "200 g de pasta sin gluten del pack",
      "Salsa/condimento del pack (tomate, pesto, etc.)",
      "AOVE",
      "Especias al gusto"
    ],
    "steps": [
      "Cuece la pasta según indicación del paquete.",
      "Calienta la salsa/condimento en una sartén o cazo.",
      "Mezcla pasta y salsa. Añade un chorrito de AOVE.",
      "Ajusta con especias al gusto."
    ],
    "tips": [
      "Reserva un poco de agua de cocción para ligar la salsa.",
      "Si eres muy sensible, prioriza productos certificados sin gluten."
    ],
    "cta_primary": { "label": "Comprar el pack Sin Gluten Seguro", "href": "/packs/sin-gluten-seguro" },
    "cta_secondary": { "label": "Añadir ingredientes al carrito", "action": "ADD_INGREDIENTS_TO_CART" }
  },
  {
    "type": "recipe",
    "title": "Snack Box de Oficina (5 min)",
    "slug": "snack-box-oficina-5-min",
    "pack_slug": "oficina-saludable",
    "time_minutes": 5,
    "difficulty": "Fácil",
    "servings": "1",
    "tags": ["oficina", "snacks", "rapido", "eco"],
    "allergens": ["Frutos secos (posible)"],
    "excerpt": "Tu combo de oficina listo en 5 minutos: snack + bebida + extra saludable.",
    "ingredients": [
      "1 snack de frutos secos del pack",
      "1 barrita/galleta saludable del pack",
      "1 bebida saludable del pack",
      "1 comida rápida sana del pack (sopa/conserva) o extra equivalente"
    ],
    "steps": [
      "Prepara una caja/tupper con snack + barrita/galleta.",
      "Añade la bebida y un extra (sopa/conserva) para completar.",
      "Guárdalo en mochila o deja en el escritorio."
    ],
    "tips": [
      "Haz 2–3 snack boxes de una vez para la semana.",
      "Alterna sabores para no aburrirte."
    ],
    "cta_primary": { "label": "Comprar el pack Oficina Saludable", "href": "/packs/oficina-saludable" },
    "cta_secondary": { "label": "Añadir ingredientes al carrito", "action": "ADD_INGREDIENTS_TO_CART" }
  },
  {
    "type": "recipe",
    "title": "Bowl Vegano Fácil (15 min)",
    "slug": "bowl-vegano-facil-15-min",
    "pack_slug": "vegano-facil",
    "time_minutes": 15,
    "difficulty": "Fácil",
    "servings": "2",
    "tags": ["vegano", "despensa", "facil", "eco"],
    "allergens": ["Sésamo (si usas)", "Soja (según proteína)"],
    "excerpt": "Bowl vegano con legumbre, semillas y condimento del pack.",
    "ingredients": [
      "1 taza de legumbre cocida",
      "1/2 taza de cereal cocido o base de ensalada",
      "1 opción de proteína vegetal del pack (opcional)",
      "1 cucharada de semillas",
      "Salsa/condimento del pack"
    ],
    "steps": [
      "Prepara la base: cereal o ensalada.",
      "Añade legumbre y proteína vegetal (si usas).",
      "Termina con semillas y salsa/condimento."
    ],
    "tips": [
      "Cambia la salsa y parece receta nueva.",
      "Añade verduras crudas para más volumen."
    ],
    "cta_primary": { "label": "Comprar el pack Vegano Fácil", "href": "/packs/vegano-facil" },
    "cta_secondary": { "label": "Añadir ingredientes al carrito", "action": "ADD_INGREDIENTS_TO_CART" }
  },
  {
    "type": "recipe",
    "title": "Cacao Eco estilo merienda (Kids)",
    "slug": "cacao-eco-merienda-kids",
    "pack_slug": "kids-eco",
    "time_minutes": 5,
    "difficulty": "Fácil",
    "servings": "1",
    "tags": ["kids", "merienda", "rapido", "eco"],
    "allergens": ["Lácteos (si leche)", "Frutos secos (posible)"],
    "excerpt": "Merienda sencilla: cacao puro y un snack kids del pack.",
    "ingredients": [
      "200–250 ml de bebida vegetal o leche",
      "1 cucharadita de cacao puro del pack",
      "1 snack/galleta kids del pack"
    ],
    "steps": [
      "Mezcla el cacao con un poco de líquido hasta disolver.",
      "Añade el resto del vaso y remueve bien.",
      "Acompaña con un snack/galleta del pack."
    ],
    "tips": [
      "Si quieres más cremoso, calienta 30–45 segundos.",
      "Endulza solo si hace falta y en poca cantidad."
    ],
    "cta_primary": { "label": "Comprar el pack Kids Eco", "href": "/packs/kids-eco" },
    "cta_secondary": { "label": "Añadir ingredientes al carrito", "action": "ADD_INGREDIENTS_TO_CART" }
  },
  {
    "type": "recipe",
    "title": "Spray multiusos eco (uso diario)",
    "slug": "spray-multiusos-eco-uso-diario",
    "pack_slug": "limpieza-ecologica",
    "time_minutes": 5,
    "difficulty": "Fácil",
    "servings": "1 botella",
    "tags": ["hogar", "limpieza", "diy", "eco"],
    "allergens": [],
    "excerpt": "Spray multiusos sencillo para superficies lavables.",
    "ingredients": [
      "250 ml de agua",
      "250 ml de vinagre blanco",
      "1 cucharadita de jabón suave (opcional)",
      "1 botella con spray"
    ],
    "steps": [
      "Mezcla agua y vinagre en la botella.",
      "Opcional: añade jabón suave y agita.",
      "Pulveriza en superficies lavables y pasa un paño."
    ],
    "tips": [
      "Seguridad: NO mezclar nunca con lejía ni amoníaco.",
      "Prueba primero en una zona pequeña si es una superficie delicada."
    ],
    "cta_primary": { "label": "Comprar el pack Limpieza Ecológica", "href": "/packs/limpieza-ecologica" },
    "cta_secondary": { "label": "Ver productos del pack", "href": "/packs/limpieza-ecologica" }
  },
  {
    "type": "recipe",
    "title": "Exfoliante corporal sencillo (azúcar + aceite)",
    "slug": "exfoliante-corporal-azucar-aceite",
    "pack_slug": "higiene-zero-waste",
    "time_minutes": 5,
    "difficulty": "Fácil",
    "servings": "1 tarro",
    "tags": ["higiene", "zero-waste", "diy", "eco"],
    "allergens": ["Frutos secos (según aceite)"],
    "excerpt": "Exfoliante casero simple para usar 1–2 veces por semana.",
    "ingredients": [
      "4 cucharadas de azúcar (o sal fina)",
      "2 cucharadas de aceite vegetal (oliva/coco, según prefieras)",
      "1 tarro pequeño"
    ],
    "steps": [
      "Mezcla azúcar y aceite hasta conseguir una textura húmeda.",
      "Guárdalo en un tarro limpio y seco.",
      "En ducha, aplica con movimientos suaves y aclara."
    ],
    "tips": [
      "No usar en piel irritada, recién depilada o con heridas.",
      "Evita que entre agua en el tarro para que dure más."
    ],
    "cta_primary": { "label": "Comprar el pack Higiene Zero Waste", "href": "/packs/higiene-zero-waste" },
    "cta_secondary": { "label": "Ver productos del pack", "href": "/packs/higiene-zero-waste" }
  },
  {
    "type": "recipe",
    "title": "Tabla “Gourmet Eco” en 10 minutos",
    "slug": "tabla-gourmet-eco-10-min",
    "pack_slug": "cesta-gourmet-eco",
    "time_minutes": 10,
    "difficulty": "Fácil",
    "servings": "2–4",
    "tags": ["gourmet", "regalo", "facil", "eco"],
    "allergens": ["Frutos secos", "Gluten (según crackers)", "Lácteos (si añades queso)"],
    "excerpt": "Una tabla rápida para regalar o improvisar una cena bonita.",
    "ingredients": [
      "Chocolate saludable del pack",
      "Frutos secos premium del pack",
      "Conserva gourmet del pack",
      "Té o café del pack (para acompañar)",
      "Opcional: crackers/pan y fruta"
    ],
    "steps": [
      "Coloca frutos secos y chocolate en un plato.",
      "Abre la conserva gourmet y sirve con crackers/pan (opcional).",
      "Prepara té o café para acompañar."
    ],
    "tips": [
      "Añade uvas o manzana en gajos para un toque fresco.",
      "Ideal para regalo: acompaña con una tarjeta y queda perfecto."
    ],
    "cta_primary": { "label": "Comprar la Cesta Gourmet Eco", "href": "/packs/cesta-gourmet-eco" },
    "cta_secondary": { "label": "Añadir al carrito", "action": "ADD_PACK_TO_CART" }
  }
]

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ed58516-154b-4517-8478-e441179f0b2d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
