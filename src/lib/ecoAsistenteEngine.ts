import { allCatalogProducts, CatalogProduct } from '@/data/catalog/individual-products';
import { catalogPacks } from '@/data/catalog/packs-catalog';

export interface AssistantResponse {
  content: string;
  suggestedSlugs: string[];
}

export function generateEcoAsistenteResponse(query: string): AssistantResponse {
  const q = query.toLowerCase().trim();

  // 1. Ganar masa muscular / Alta proteína
  if (q.includes('masa') || q.includes('muscul') || q.includes('proteina') || q.includes('proteína') || q.includes('fuerza')) {
    const proteinProducts = allCatalogProducts.filter(p => 
      p.tags.includes('proteina') || p.name.toLowerCase().includes('protein') || p.slug.includes('protein')
    ).slice(0, 3);

    const slugs = proteinProducts.map(p => p.slug);
    if (!slugs.includes('iswari-super-vegan-protein-250gr')) slugs.unshift('iswari-super-vegan-protein-250gr');
    if (!slugs.includes('ecosana-copos-de-avena-sin-gluten-1k')) slugs.push('ecosana-copos-de-avena-sin-gluten-1k');

    return {
      content: `### 🏋️ Plan Nutricional de Alta Proteína y Fuerza Bio

Para optimizar la síntesis proteica y el desarrollo muscular con nutrición 100% ecológica, el secreto está en combinar **proteínas vegetales de alto valor biológico** con carbohidratos complejos de absorción lenta.

#### 💡 Estrategia Nutricional recomendada:
1. **Desayuno y Post-entreno:** Batido recuperador con proteína vegana aislada (guisante y cáñamo) + copos de avena integrales para reponer glucógeno.
2. **Comidas principales:** Mezcla siempre cereal integral + legumbre (por ejemplo arroz de Calasparra con garbanzos o lentejas) para obtener el aminograma completo (lisina + metionina).
3. **Grasas saludables:** Semillas de chía, frutos secos y aceite de oliva virgen extra para el soporte hormonal natural.

#### 🛒 Productos recomendados disponibles en Ecoland:
[[product:iswari-super-vegan-protein-250gr]]
[[product:ecosana-copos-de-avena-sin-gluten-1k]]
[[product:gumendi-garbanzo-cocido-660gr]]

¿Te gustaría que te prepare un menú detallado de 3 días con estas cantidades calculadas?`,
      suggestedSlugs: slugs
    };
  }

  // 2. Sin gluten / Celíacos
  if (q.includes('gluten') || q.includes('celiac') || q.includes('celíac')) {
    return {
      content: `### 🌾 Guía 100% Sin Gluten y Seguridad Celíaca

En Ecoland nos tomamos la seguridad alimentaria con el máximo rigor. Todos los productos recomendados cuentan con **certificación libre de gluten garantizada**, sin riesgo de contaminación cruzada en molienda.

#### 💡 Alimentos estrella para tu despensa sin gluten:
* **Avena certificada sin gluten:** Desayunos saciantes ricos en betaglucanos para cuidar la microbiota intestinal.
* **Pseudocereales limpios:** Quinoa real y trigo sarraceno (naturalmente libres de gluten y ricos en minerales como magnesio y zinc).
* **Legumbres bio en conserva de cristal:** Garbanzos y lentejas naturales seleccionados sin harinas añadidas.

#### 🛒 Selección segura con stock real en tienda:
[[product:ecosana-copos-de-avena-sin-gluten-1k]]
[[product:gumendi-garbanzo-cocido-660gr]]
[[product:el-granero-integral-quinoa-bio-500gr-granero]]

Puedes activar el filtro **"Sin Gluten"** en la tienda para navegar únicamente entre productos seguros.`,
      suggestedSlugs: [
        'ecosana-copos-de-avena-sin-gluten-1k',
        'gumendi-garbanzo-cocido-660gr',
        'el-granero-integral-quinoa-bio-500gr-granero'
      ]
    };
  }

  // 3. Vegano / 100% Plant-Based
  if (q.includes('vegan') || q.includes('vegetari')) {
    return {
      content: `### 🌱 Nutrición Vegana Completa y Saludable

Una alimentación vegetal bien planificada es increíblemente antiinflamatoria, rica en antioxidantes y sostenible. Para que sea plena, nos enfocamos en densidad nutricional, hierro vegetal, zinc y ácidos grasos esenciales.

#### 💡 Tus imprescindibles diarios:
1. **Proteínas vegetales limpias:** Legumbres cocidas Gumendi y proteína bio Iswari sin azúcares ni aditivos.
2. **Superalimentos y micronutrientes:** Açaí, té matcha ecológico y semillas ricas en Omega-3.
3. **Condimentos fermentados tradicionales:** Salsa de soja Tamari pura (sin trigo) para potenciar el sabor umami de tus platos.

#### 🛒 Cesta vegana destacada de Ecoland:
[[product:iswari-super-vegan-protein-250gr]]
[[product:gumendi-lentejas-con-verduras-720gr]]
[[product:drasanvi-acai-en-polvo-70gr]]

¿Quieres que te sugiera una cena rápida de 15 minutos con estos ingredientes?`,
      suggestedSlugs: [
        'iswari-super-vegan-protein-250gr',
        'gumendi-lentejas-con-verduras-720gr',
        'drasanvi-acai-en-polvo-70gr'
      ]
    };
  }

  // 4. Presupuesto bajo / Optimización de coste (menos de 20€ / 30€)
  if (q.includes('presupuesto') || q.includes('barato') || q.includes('econom') || q.includes('30') || q.includes('20') || q.includes('euro')) {
    return {
      content: `### 💶 Menú Inteligente: Máxima Nutrición por Euro

Comer ecológico no tiene por qué ser caro si priorizamos los **alimentos básicos de máxima densidad nutricional**: legumbres, cereales enteros en formato grande y conservas limpias de cristal.

#### 📊 Cesta optimizada de alto rendimiento (~15€ - 20€):
1. **Copos de Avena Sin Gluten 1 kg (5,90€):** Desayunos para más de 20 días (~0,29€ por ración).
2. **Garbanzos Cocidos Extra Bio Gumendi 660g (3,10€):** Proteína vegetal saciante lista para consumir en ensaladas o guisos.
3. **Lentejas Estofadas con Verduras Bio Gumendi 720g (3,50€):** Plato completo de cuchara sin conservantes para 2 personas.

#### 🛒 Añadir cesta económica directamente al carrito:
[[product:ecosana-copos-de-avena-sin-gluten-1k]]
[[product:gumendi-garbanzo-cocido-660gr]]
[[product:gumendi-lentejas-con-verduras-720gr]]

Con estos 3 productos cubres desayunos y varias comidas completas con certificación bio europea.`,
      suggestedSlugs: [
        'ecosana-copos-de-avena-sin-gluten-1k',
        'gumendi-garbanzo-cocido-660gr',
        'gumendi-lentejas-con-verduras-720gr'
      ]
    };
  }

  // 5. Perder peso / Saciedad / Control calórico
  if (q.includes('peso') || q.includes('adelgazar') || q.includes('grasa') || q.includes('caloria') || q.includes('caloría')) {
    return {
      content: `### ⚖️ Gestión Saludable del Peso y Saciedad Natural

La clave para regular el peso corporal sin pasar hambre ni sufrir rebotes es la **densidad de fibra prebiótica y el volumen nutricional**: alimentos que estabilizan la glucosa y prolongan la saciedad durante horas.

#### 💡 Hábitos clave respaldados por la evidencia:
* **Prioriza la fibra soluble:** Los betaglucanos de la avena y las legumbres forman un gel natural en el estómago que reduce los antojos de dulce.
* **Antioxidantes matutinos:** Sustituye el café torrefacto convencional por **Té Matcha ecológico ceremonial**, rico en EGCG y L-teanina para una energía limpia y sostenida.
* **Cenas ligeras y tempranas:** Caldos biológicos de verduras y salteados con grasas nobles en crudo.

#### 🛒 Aliados saciantes con stock en Ecoland:
[[product:ecosana-copos-de-avena-sin-gluten-1k]]
[[product:drasanvi-te-matcha-70gr]]
[[product:gumendi-lentejas-con-verduras-720gr]]`,
      suggestedSlugs: [
        'ecosana-copos-de-avena-sin-gluten-1k',
        'drasanvi-te-matcha-70gr',
        'gumendi-lentejas-con-verduras-720gr'
      ]
    };
  }

  // 6. Búsqueda por coincidencia de texto en el catálogo
  const matched = allCatalogProducts.filter(p => {
    const text = (p.name + ' ' + p.brand + ' ' + (p.description || '')).toLowerCase();
    const words = q.split(/\s+/).filter(w => w.length > 3);
    return words.some(w => text.includes(w));
  }).slice(0, 3);

  if (matched.length > 0) {
    const cards = matched.map(m => `[[product:${m.slug}]]`).join('\n');
    return {
      content: `### 🌿 Opciones disponibles en nuestra tienda

He analizado tu consulta en nuestro inventario en tiempo real. Aquí tienes los productos ecológicos recomendados que mejor encajan con lo que buscas:

${cards}

¿Deseas conocer más detalles sobre sus ingredientes, alérgenos o cómo combinarlos en una receta?`,
      suggestedSlugs: matched.map(m => m.slug)
    };
  }

  // Default helpful response
  return {
    content: `### 🌿 Hola, soy tu Eco-Coach de Ecoland

Puedo ayudarte a diseñar tu alimentación ecológica a medida con los productos de nuestra tienda física y online. 

#### Puedes consultarme sobre:
* 🎯 **"Quiero desayunos sin gluten y ricos en fibra"**
* 💪 **"¿Cómo aumentar mi consumo de proteína vegetal?"**
* 🥗 **"Cena saludable para 2 personas con legumbres"**
* 💶 **"Tengo 20€ de presupuesto para comer 3 días"**
* 🍃 **"¿Qué superalimentos me recomiendas para la energía matutina?"**

Aquí tienes algunos de los alimentos más valorados por nuestros clientes:
[[product:ecosana-copos-de-avena-sin-gluten-1k]]
[[product:gumendi-garbanzo-cocido-660gr]]
[[product:drasanvi-te-matcha-70gr]]

¿Cuál es tu principal objetivo de salud o alimentación en este momento?`,
    suggestedSlugs: [
      'ecosana-copos-de-avena-sin-gluten-1k',
      'gumendi-garbanzo-cocido-660gr',
      'drasanvi-te-matcha-70gr'
    ]
  };
}
