import type { AllergenId } from '@/data/catalog/productFacts';

/**
 * Necesidades de Ecoland Salud.
 * Niveles (informe Ecoland Salud): A seguridad, B restricción clara, C orientación nutricional,
 * D personalización clínica (solo información: requiere a un profesional sanitario).
 * Ningún texto atribuye a un alimento la propiedad de prevenir, tratar o curar (Reglamento CE 1924/2006).
 */

export type NeedLevel = 'A' | 'B' | 'C' | 'D' | 'P';

/** Tipos de alimento que se pueden reconocer por el nombre del producto */
export type FoodType =
  | 'legumbre' | 'cereal-integral' | 'fruto-seco' | 'semilla' | 'aove' | 'verdura' | 'fruta'
  | 'pescado-azul' | 'proteina-vegetal' | 'especia' | 'infusion'
  | 'azucarado' | 'embutido' | 'salado' | 'refinado';

export interface HealthNeed {
  id: string;
  title: string;
  /** Para quién es, en una línea */
  forWho: string;
  level: NeedLevel;
  group: 'seguridad' | 'restriccion' | 'preferencia' | 'orientacion' | 'clinica';
  /** Qué hace Ecoland por ti */
  howWeHelp: string;
  /** Lo que no podemos saber o no debemos simplificar */
  limits: string;
  /** Qué mirar en la etiqueta */
  labelTips: string[];
  /** Alimentos que suelen formar parte del patrón recomendado */
  baseFoods?: FoodType[];
  /** Alimentos que conviene moderar (no se ocultan, se señalan) */
  moderateFoods?: FoodType[];
  whenToConsult: string;
  sources: string[];
}

export const HEALTH_NEEDS: HealthNeed[] = [
  {
    id: 'alergias',
    title: 'Alergias alimentarias',
    forWho: 'Si tienes alergia a alguno de los 14 alérgenos de declaración obligatoria.',
    level: 'A',
    group: 'seguridad',
    howWeHelp: 'Marcamos en rojo los productos que contienen el alérgeno que eliges y nunca damos por seguro un producto: las trazas solo se pueden confirmar en el envase.',
    limits: 'Nuestros datos indican lo que el producto contiene por su naturaleza. "Puede contener trazas" depende de cada fábrica y solo aparece en el envase. Con riesgo de anafilaxia, revisa siempre la etiqueta.',
    labelTips: [
      'Los alérgenos aparecen resaltados (negrita o mayúsculas) en la lista de ingredientes.',
      '"Puede contener" no es lo mismo que "contiene": avisa de contaminación cruzada posible.',
      'Si cambias de marca o de formato, vuelve a leer la etiqueta.',
    ],
    whenToConsult: 'Ante cualquier reacción, o si no tienes un diagnóstico de alergia, consulta con tu alergólogo.',
    sources: ['Reglamento (UE) 1169/2011, anexo II (14 alérgenos)', 'EFSA — alergias alimentarias', 'AESAN — alérgenos'],
  },
  {
    id: 'celiaquia',
    title: 'Celiaquía o dieta sin gluten',
    forWho: 'Si tienes enfermedad celíaca, sensibilidad al gluten o alergia al trigo.',
    level: 'B',
    group: 'restriccion',
    howWeHelp: 'Solo marcamos en verde lo que el fabricante declara "sin gluten". Lo que no lleva gluten por naturaleza (arroz, legumbres…) aparece en amarillo, porque sin certificar puede tener trazas.',
    limits: '"Sin gluten" solo puede usarse con 20 mg/kg o menos. La avena únicamente es apta si se declara sin gluten. En productos a granel el riesgo de contaminación cruzada es mayor.',
    labelTips: [
      'Busca "sin gluten" o la Espiga Barrada.',
      'Trigo, espelta, kamut, cebada, centeno y sus derivados contienen gluten.',
      'Ojo con la avena, la malta, la salsa de soja y los productos a granel.',
    ],
    whenToConsult: 'Si sospechas celiaquía, no retires el gluten antes de hacerte las pruebas: consulta con tu médico.',
    sources: ['Reglamento de Ejecución (UE) 828/2014', 'FACE — Federación de Asociaciones de Celíacos de España'],
  },
  {
    id: 'lactosa',
    title: 'Intolerancia a la lactosa',
    forWho: 'Si la leche y algunos lácteos te sientan mal por la lactosa.',
    level: 'B',
    group: 'restriccion',
    howWeHelp: 'Marcamos los productos con leche y destacamos los declarados sin lactosa y las alternativas vegetales.',
    limits: 'La tolerancia a la lactosa varía mucho entre personas. Intolerancia a la lactosa no es lo mismo que alergia a la proteína de la leche: si tienes alergia, elige "Alergias".',
    labelTips: [
      'La leche aparece resaltada como alérgeno en los ingredientes.',
      'Los quesos curados y el yogur suelen tener menos lactosa que la leche.',
    ],
    whenToConsult: 'Si tienes molestias digestivas persistentes, consulta con tu médico antes de retirar alimentos.',
    sources: ['EFSA — Opinión científica sobre umbrales de lactosa (2010)', 'AESAN'],
  },
  {
    id: 'vegano',
    title: 'Alimentación vegana',
    forWho: 'Sin ingredientes de origen animal.',
    level: 'P',
    group: 'preferencia',
    howWeHelp: 'Separamos lo declarado vegano, lo que es vegetal por naturaleza (legumbres, cereales, frutos secos…) y lo que no podemos confirmar sin el envase.',
    limits: 'En productos elaborados (galletas, chocolates, salsas) solo el envase confirma que no hay leche, huevo o miel.',
    labelTips: ['Busca el sello vegano o revisa leche, huevo, miel, gelatina y colágeno en los ingredientes.'],
    baseFoods: ['legumbre', 'cereal-integral', 'proteina-vegetal', 'fruto-seco', 'semilla'],
    whenToConsult: 'Una alimentación vegana necesita suplemento de vitamina B12: consúltalo con un profesional.',
    sources: ['Academia de Nutrición y Dietética — postura sobre dietas vegetarianas (2016)'],
  },
  {
    id: 'vegetariano',
    title: 'Alimentación vegetariana',
    forWho: 'Sin carne ni pescado.',
    level: 'P',
    group: 'preferencia',
    howWeHelp: 'Marcamos carnes, embutidos, pescados y mariscos, y mostramos el resto según lo que sabemos.',
    limits: 'Algunos productos elaborados llevan gelatina o caldos animales: confírmalo en el envase.',
    labelTips: ['Revisa gelatina, colágeno, caldos y extractos de carne o pescado.'],
    baseFoods: ['legumbre', 'cereal-integral', 'proteina-vegetal', 'fruto-seco'],
    whenToConsult: 'Si tienes dudas sobre hierro o B12, consúltalo con un profesional.',
    sources: ['Academia de Nutrición y Dietética — postura sobre dietas vegetarianas (2016)'],
  },
  {
    id: 'azucar',
    title: 'Controlar el azúcar',
    forWho: 'Si tienes prediabetes o diabetes, o quieres tomar menos azúcar.',
    level: 'C',
    group: 'orientacion',
    howWeHelp: 'Te mostramos los alimentos que suelen formar parte de los patrones recomendados (legumbres, integrales, frutos secos, verduras) y señalamos los que conviene moderar. No hay productos "aptos para diabéticos": cada caso es distinto.',
    limits: 'No existe un reparto ideal de hidratos, grasas y proteínas para todas las personas con diabetes. Todavía no tenemos la tabla nutricional de cada producto: compara azúcares e hidratos en la etiqueta.',
    labelTips: [
      'Mira "hidratos de carbono" y "de los cuales azúcares" por 100 g y por ración.',
      'Más fibra y menos azúcares añadidos suele ser mejor elección.',
      'El azúcar aparece con muchos nombres: sirope, jarabe, dextrosa, miel, concentrado de frutas.',
    ],
    baseFoods: ['legumbre', 'cereal-integral', 'fruto-seco', 'semilla', 'verdura', 'aove'],
    moderateFoods: ['azucarado', 'refinado'],
    whenToConsult: 'Tu plan de alimentación debe ajustarlo tu equipo sanitario, sobre todo si usas insulina u otros medicamentos.',
    sources: ['ADA — Standards of Care in Diabetes 2026, sección 5', 'OMS — Alimentación sana (2026)'],
  },
  {
    id: 'sal',
    title: 'Tomar menos sal',
    forWho: 'Si tienes la tensión alta o te han pedido reducir la sal.',
    level: 'C',
    group: 'orientacion',
    howWeHelp: 'Destacamos alimentos básicos que no llevan sal añadida y especias para sazonar, y señalamos embutidos, salsas y conservas saladas.',
    limits: 'Todavía no tenemos la sal de cada producto: compárala en la etiqueta. La cantidad adecuada de sodio depende de tu caso.',
    labelTips: [
      'Bajo en sal: 0,3 g o menos por 100 g. Muy bajo: 0,1 g.',
      'Sal = sodio × 2,5.',
      'Embutidos, quesos, salsas de soja, caldos y conservas suelen aportar mucha sal.',
    ],
    baseFoods: ['legumbre', 'cereal-integral', 'verdura', 'fruta', 'fruto-seco', 'especia', 'aove'],
    moderateFoods: ['embutido', 'salado'],
    whenToConsult: 'Si tomas medicación para la tensión o tienes enfermedad renal, sigue las indicaciones de tu médico.',
    sources: ['Reglamento (CE) 1924/2006 (umbrales "bajo en sal")', 'OMS — Reducción del consumo de sal', 'Patrón DASH (NIH)'],
  },
  {
    id: 'corazon',
    title: 'Corazón y colesterol',
    forWho: 'Si quieres cuidar el colesterol o la salud cardiovascular.',
    level: 'C',
    group: 'orientacion',
    howWeHelp: 'Te enseñamos los alimentos típicos del patrón mediterráneo: aceite de oliva virgen extra, frutos secos, legumbres, integrales y pescado azul. Señalamos embutidos y productos con mucha grasa saturada.',
    limits: 'Ningún alimento por sí solo "baja el colesterol". Cuenta el conjunto de la dieta, la actividad física y, si la hay, la medicación.',
    labelTips: [
      'Compara "grasas saturadas" por 100 g.',
      'Evita las grasas parcialmente hidrogenadas.',
    ],
    baseFoods: ['aove', 'fruto-seco', 'legumbre', 'cereal-integral', 'pescado-azul', 'semilla'],
    moderateFoods: ['embutido', 'azucarado'],
    whenToConsult: 'Tu médico valorará tu riesgo cardiovascular y si necesitas tratamiento.',
    sources: ['Guías ESC/EAS de dislipemias', 'Estudio PREDIMED', 'AHA — recomendaciones dietéticas'],
  },
  {
    id: 'fibra',
    title: 'Más fibra',
    forWho: 'Si quieres comer más fibra o mejorar tu tránsito.',
    level: 'C',
    group: 'orientacion',
    howWeHelp: 'Reunimos legumbres, cereales integrales, semillas, frutos secos y fruta.',
    limits: 'Aumenta la fibra poco a poco y bebe agua. En algunas enfermedades digestivas la fibra se ajusta con un profesional.',
    labelTips: ['"Fuente de fibra": al menos 3 g por 100 g. "Alto contenido": 6 g.'],
    baseFoods: ['legumbre', 'cereal-integral', 'semilla', 'fruto-seco', 'fruta', 'verdura'],
    moderateFoods: ['refinado'],
    whenToConsult: 'Si tienes cambios en el ritmo intestinal que no se explican, consulta con tu médico.',
    sources: ['EFSA — valores dietéticos de referencia para fibra', 'Reglamento (CE) 1924/2006'],
  },
  {
    id: 'peso',
    title: 'Peso saludable',
    forWho: 'Si quieres cuidar tu peso sin dietas milagro.',
    level: 'C',
    group: 'orientacion',
    howWeHelp: 'Priorizamos alimentos poco procesados y saciantes: legumbres, verduras, integrales y proteína vegetal. No vendemos productos "quemagrasas" ni "detox".',
    limits: 'El peso depende de muchos factores. Desconfía de promesas rápidas.',
    labelTips: ['Compara la energía (kcal) por ración, no solo por 100 g.', 'Mira el tamaño de ración real que vas a comer.'],
    baseFoods: ['legumbre', 'verdura', 'cereal-integral', 'proteina-vegetal', 'fruta'],
    moderateFoods: ['azucarado', 'salado', 'refinado'],
    whenToConsult: 'Si necesitas perder peso por motivos de salud, hazlo con un médico o un dietista-nutricionista.',
    sources: ['OMS — Obesidad y sobrepeso', 'SEEDO'],
  },
  {
    id: 'renal',
    title: 'Riñón',
    forWho: 'Si tienes enfermedad renal crónica o estás en diálisis.',
    level: 'D',
    group: 'clinica',
    howWeHelp: 'Te ayudamos a encontrar productos, pero no te recomendamos ninguno automáticamente: el sodio, el potasio, el fósforo y las proteínas que necesitas dependen del estadio, tus análisis y tu tratamiento.',
    limits: 'Muchos alimentos "saludables" (legumbres, frutos secos) pueden no convenirte según tu caso. Los aditivos con fosfato se absorben mucho.',
    labelTips: ['Busca aditivos que empiecen por "fosfato" o E-338 a E-452.', 'Revisa el sodio.'],
    whenToConsult: 'Sigue siempre las indicaciones de tu nefrólogo y tu dietista renal.',
    sources: ['KDIGO 2024 — Guía de enfermedad renal crónica', 'NIDDK — Alimentación y nutrición en la ERC'],
  },
  {
    id: 'digestivo',
    title: 'Colon irritable, Crohn o colitis',
    forWho: 'Si tienes una enfermedad digestiva diagnosticada.',
    level: 'D',
    group: 'clinica',
    howWeHelp: 'Te explicamos cómo funciona y te ayudamos a encontrar los productos que ya sabes que toleras. No hay una lista universal de alimentos buenos y malos.',
    limits: 'La dieta baja en FODMAP tiene tres fases (reducción de 2 a 6 semanas, reintroducción y personalización) y debe guiarla un profesional. En Crohn y colitis no existe una dieta única, y restringir de más puede causar desnutrición.',
    labelTips: ['Apunta qué alimentos te sientan bien: es la información más útil para personalizar.'],
    whenToConsult: 'Hazlo siempre con tu gastroenterólogo o un dietista-nutricionista.',
    sources: ['Monash University — FODMAP', 'Crohn\'s & Colitis Foundation', 'ECCO/ESPEN'],
  },
];

export const EU_ALLERGENS: AllergenId[] = [
  'gluten', 'crustaceos', 'huevo', 'pescado', 'cacahuete', 'soja', 'leche',
  'frutos-cascara', 'apio', 'mostaza', 'sesamo', 'sulfitos', 'altramuz', 'moluscos',
];

export const NEED_GROUPS: { id: HealthNeed['group']; title: string; description: string }[] = [
  { id: 'seguridad', title: 'Seguridad', description: 'Un ingrediente puede ser un riesgo directo.' },
  { id: 'restriccion', title: 'Restricciones', description: 'Hay algo que necesitas evitar.' },
  { id: 'preferencia', title: 'Preferencias', description: 'Cómo eliges comer.' },
  { id: 'orientacion', title: 'Cuidarte', description: 'Orientación general, sin sustituir a tu médico.' },
  { id: 'clinica', title: 'Con tu profesional', description: 'Necesita un plan individual: te informamos y te ayudamos a buscar.' },
];

export const getNeed = (id: string) => HEALTH_NEEDS.find(n => n.id === id);
