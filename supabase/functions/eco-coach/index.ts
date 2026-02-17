import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Complete product catalog for the AI to reference
const CATALOG_SUMMARY = `
CATÁLOGO ECOLAND - Productos ecológicos disponibles:

CATEGORÍAS DE PRODUCTOS:
- Desayunos: mueslis, granolas, copos, cereales (El Granero, EcoSana, Turtle, Barnhouse)
- Superfoods: proteínas vegetales, matcha, espirulina, chlorella (Iswari, Drasanvi)
- Legumbres: lentejas, garbanzos, alubias, cremas (Gumendi, EcoSana)
- Salsas y fermentados: tamari, miso, chucrut, patés vegetales (Lima, Clearspring, NaturSoy)
- Endulzantes: sirope de arce, azúcar de coco, eritritol, xilitol
- Bebidas: cafés eco, chocolates, leches vegetales, kombucha, zumos (Álter Nativa, EcoMil, Komvida)
- Aceites y vinagres: oliva, sésamo, lino, aguacate, coco, vinagres (NaturGreen, El Lagar del Soto)
- Panadería: pan de centeno, tortitas, galletas, biscotes (NaturSoy, Biocop, Biogredos)
- Conservas del mar: atún, sardinas, caballa, bonito, melva (Pan do Mar, Ortiz)
- Cosmética natural y CBD: cremas, sérums, gel, champú (Drasanvi, Weleda)
- Granel: frutos secos, semillas, especias, algas, miel, mermeladas

PACKS DISPONIBLES (24 packs):
1. Vegano Desayuno Basic (21.25€) - Corn flakes, coco, mermelada, café, chía
2. Vegano Proteico Standard (55.40€) - Proteína vegetal, matcha, quinoa, tahín, sésamo
3. Vegetariano Cocina Base Basic (15.04€) - Lentejas, garbanzos, tomate, mostaza
4. Detox Basic (35.10€) - Detox, vinagre, zumo, infusión
5. Vientre Plano Standard (50.00€) - Chucrut, semillas, vinagres
6. Quema Grasa Standard (45.45€) - Termogénicos, garcinia, gummies
7. Umami Premium (89.85€) - Tamari, misos, umeboshi, gomasio
8. Mar Basic (15.00€) - Atún, sardinas, patés de mar
9. Mar Premium Norte (63.45€) - Bonito, ventresca, melva premium
10. Café Eco Basic (30.20€) - Café arábica, crema cacao, arce
11. Café Premium Explorador (80.40€) - Cafés de origen Colombia, Brasil, Etiopía
12. Inmunidad Basic (33.35€) - Ajo negro, miel, infusiones
13. Inmunidad Premium Viales (60.00€) - Jalea real, aceites esenciales
14. Cáñamo Facial Standard (67.15€) - Crema, sérum, gel cáñamo
15. CBD Premium Máximo (168.00€) - Óleo CBD 30%, aceite 10%, bálsamo
16. Rosa Mosqueta Ritual (67.15€) - Crema, sérum, gel rosa mosqueta
17. Argán Completo (70.40€) - Crema, sérum, champú argán
18. Árbol del Té (53.55€) - Crema, champú, gel árbol del té
19. Solar Basic (69.55€) - Protección SPF30/50, after sun
20. Solar Bebé Premium (73.75€) - Protección bebé SPF50+
21. Snack Healthy Basic (21.18€) - Pan, tortitas, galletas, colines
22. Cocina Saludable Standard (51.10€) - Aceites variados, vinagres premium
23. Oliva Premium Casa (108.00€) - AOVE 1L+2L+5L
24. Hidratación & Botellas Premium (64.25€) - Botellas reutilizables

INFORMACIÓN NUTRICIONAL CLAVE:
- Productos veganos: marcados con tag "vegano"
- Sin gluten: marcados con tag "sin-gluten"
- Altos en proteína: proteína de guisante, cáñamo, espirulina, legumbres, frutos secos
- Para perder peso: productos detox, termogénicos, vinagre de manzana, infusiones
- Para ganar masa: proteína vegetal, legumbres, frutos secos, crema de cacahuete
- Probióticos: kombucha, chucrut, miso, umeboshi
- Omega-3: aceite de lino, nueces, semillas de chía
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Eres el Eco-Coach de Ecoland, una tienda ecológica en Salamanca, España. Tu misión es crear dietas personalizadas usando EXCLUSIVAMENTE productos del catálogo de Ecoland.

PERSONALIDAD:
- Amable, cercano y experto en nutrición ecológica
- Usa emojis moderadamente
- Responde en español
- Sé conciso pero informativo

PROCESO PARA CREAR UNA DIETA:
1. Pregunta el OBJETIVO: ganar masa muscular, perder peso, mejorar digestión, energía, inmunidad, etc.
2. Pregunta las PREFERENCIAS: vegano, vegetariano, omnívoro
3. Pregunta RESTRICCIONES: sin gluten, sin lactosa, sin frutos secos, alergias específicas
4. Pregunta PRESUPUESTO: bajo, medio, alto
5. Pregunta RUTINA: si hace deporte, horarios de comida
6. Con toda la info, crea un PLAN SEMANAL con productos específicos de la tienda

FORMATO DE DIETA:
- Organiza por días y comidas (desayuno, almuerzo, merienda, cena)
- Incluye nombres exactos de productos del catálogo
- Sugiere packs relevantes cuando aplique
- Da cantidades aproximadas
- Incluye precio estimado semanal

REGLAS:
- SOLO recomienda productos del catálogo de Ecoland
- Si no hay producto adecuado, dilo honestamente
- No inventes productos que no existan en el catálogo
- Recuerda las alergias del usuario en todo momento
- Sugiere packs cuando sean más económicos que productos individuales

${CATALOG_SUMMARY}

Haz una pregunta a la vez. No abrumes al usuario. Empieza preguntando su objetivo principal.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del servicio AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("eco-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
