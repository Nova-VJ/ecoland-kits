import type { CatalogProduct } from '@/data/catalog/individual-products';
import { ALLERGEN_LABELS, getProductFacts, type AllergenId } from '@/data/catalog/productFacts';
import { getNeed, type FoodType } from '@/data/salud/needs';

/**
 * Motor de compatibilidad de Ecoland Salud: compara el perfil de una persona con lo que sabemos de cada producto.
 * Nunca convierte una deducción en certeza: si falta información, lo dice.
 */

export interface HealthProfile {
  needs: string[];
  avoidAllergens: AllergenId[];
}

export type MatchStatus = 'compatible' | 'revisar' | 'conflicto' | 'sin-datos';

export interface MatchResult {
  status: MatchStatus;
  /** Motivos legibles, del más importante al menos */
  reasons: string[];
  /** Tipos de alimento del patrón recomendado que cumple (para ordenar) */
  baseMatches: number;
}

export const EMPTY_PROFILE: HealthProfile = { needs: [], avoidAllergens: [] };

const normalize = (s: string) =>
  ' ' + s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ';

const productName = (p: CatalogProduct) => {
  const parts = p.name.split('–');
  return parts.length > 1 ? parts[1] : p.name;
};

// Palabras del nombre que identifican cada tipo de alimento ("x*" = empieza por x)
const FOOD_TYPE_WORDS: Record<FoodType, string[]> = {
  legumbre: ['garbanzo*', 'lenteja*', 'alubia*', 'judia*', 'azuki', 'frijol*', 'hummus', 'legumbre*'],
  'cereal-integral': ['integral*', 'avena', 'quinoa', 'quinua', 'trigo sarraceno', 'sarraceno', 'mijo', 'amaranto', 'bulgur', 'centeno', 'cebada'],
  'fruto-seco': ['almendra*', 'nuez', 'nueces', 'avellana*', 'anacardo*', 'pistacho*', 'cacahuete*', 'macadamia*', 'pecana*', 'pinon*'],
  semilla: ['semilla*', 'chia', 'lino', 'sesamo', 'pipas'],
  aove: ['aceite de oliva virgen extra', 'aove', 'aceite oliva virgen', 'aceite de oliva virgen'],
  verdura: ['tomate*', 'alcachofa*', 'esparrago*', 'pimiento*', 'verdura*', 'menestra', 'espinaca*', 'acelga*', 'calabacin', 'zanahoria*', 'remolacha', 'puerro*', 'champinon*', 'seta*', 'gazpacho', 'pisto', 'cebolla*', 'brocoli', 'coliflor'],
  fruta: ['manzana*', 'platano*', 'fruta*', 'datil*', 'higo*', 'pasas', 'orejones', 'arandano*', 'goji', 'ciruela*', 'pera*', 'naranja*'],
  'pescado-azul': ['sardina*', 'caballa', 'bonito', 'atun', 'anchoa*', 'salmon', 'melva', 'boqueron*'],
  'proteina-vegetal': ['tofu', 'tempeh', 'seitan', 'soja texturizada', 'proteina de guisante', 'proteina vegetal'],
  especia: ['pimienta', 'curcuma', 'comino', 'oregano', 'pimenton', 'canela', 'especia*', 'curry', 'masala', 'hierbas', 'ajo granulado', 'nuez moscada', 'jengibre', 'tomillo', 'romero', 'laurel'],
  infusion: ['te', 'infusion*', 'manzanilla', 'rooibos', 'melisa', 'kukicha', 'poleo'],
  azucarado: ['azucar*', 'sirope*', 'jarabe*', 'miel', 'chocolate*', 'galleta*', 'caramelo*', 'mermelada*', 'bombon*', 'cornflakes', 'corn flakes', 'crema de cacao', 'turron*', 'golosina*', 'gummies', 'bolleria', 'bizcocho*', 'magdalena*', 'cacao a la taza'],
  embutido: ['chorizo', 'salchich*', 'jamon', 'embutido*', 'lomo', 'fuet', 'salchichon', 'crema de chorizo'],
  salado: ['sal', 'salsa de soja', 'tamari', 'shoyu', 'miso', 'caldo*', 'anchoa*', 'aceituna*', 'olivas', 'encurtido*', 'snack*', 'nachos', 'patatas fritas', 'crackers', 'gomasio', 'umeboshi', 'fleur de sel'],
  refinado: ['harina de trigo', 'harina blanca', 'pan blanco', 'arroz blanco', 'basmati blanco', 'harina de centeno blanca'],
};

const matches = (text: string, words: string[]) =>
  words.some(w => (w.endsWith('*') ? text.includes(' ' + w.slice(0, -1)) : text.includes(' ' + w + ' ')));

export function foodTypesOf(product: CatalogProduct): FoodType[] {
  if (getProductFacts(product.id).kind !== 'alimento') return [];
  const text = normalize(productName(product));
  const types = (Object.keys(FOOD_TYPE_WORDS) as FoodType[]).filter(t => matches(text, FOOD_TYPE_WORDS[t]));
  // "integral" solo cuenta como cereal integral si no es un dulce
  return types.includes('azucarado') ? types.filter(t => t !== 'cereal-integral') : types;
}

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  legumbre: 'Legumbre', 'cereal-integral': 'Cereal integral', 'fruto-seco': 'Fruto seco', semilla: 'Semillas',
  aove: 'Aceite de oliva virgen extra', verdura: 'Verdura', fruta: 'Fruta', 'pescado-azul': 'Pescado azul',
  'proteina-vegetal': 'Proteína vegetal', especia: 'Especias para sazonar', infusion: 'Infusión',
  azucarado: 'Suele llevar azúcar', embutido: 'Embutido', salado: 'Suele llevar sal', refinado: 'Harina o grano refinado',
};

const MODERATE_REASON: Partial<Record<FoodType, string>> = {
  azucarado: 'Suele aportar azúcar: compara los azúcares en la etiqueta',
  embutido: 'Los embutidos suelen tener mucha sal y grasa saturada',
  salado: 'Suele aportar bastante sal: compárala en la etiqueta',
  refinado: 'Grano refinado: la versión integral aporta más fibra',
};

const RANK: Record<MatchStatus, number> = { conflicto: 0, 'sin-datos': 1, revisar: 2, compatible: 3 };

export function evaluateProduct(product: CatalogProduct, profile: HealthProfile): MatchResult {
  const f = getProductFacts(product.id);
  const conflicts: string[] = [];
  const unknowns: string[] = [];
  const reviews: string[] = [];
  const positives: string[] = [];
  const needs = new Set(profile.needs);

  if (f.kind !== 'alimento') {
    return { status: 'sin-datos', reasons: ['No es un alimento'], baseMatches: 0 };
  }

  // Seguridad: alérgenos. Nunca damos un producto por seguro: las trazas solo están en el envase.
  for (const a of profile.avoidAllergens) {
    if (f.alergenos.includes(a)) conflicts.push(`Contiene ${ALLERGEN_LABELS[a].toLowerCase()}`);
    else if (a === 'gluten' && f.sinGluten === true) positives.push('Declarado sin gluten');
    else reviews.push(`Confirma en el envase que no lleva ${ALLERGEN_LABELS[a].toLowerCase()} ni trazas`);
  }

  if (needs.has('celiaquia')) {
    if (f.sinGluten === false) conflicts.push('Contiene gluten');
    else if (f.glutenFuente === 'declarado') positives.push('Declarado sin gluten');
    else if (f.glutenFuente === 'naturalmente-sin-gluten') reviews.push('Sin gluten por naturaleza, pero sin certificar: puede tener trazas');
    else unknowns.push('No sabemos si lleva gluten: revisa el envase');
  }

  if (needs.has('vegano')) {
    if (f.vegano === false) conflicts.push('Tiene ingredientes de origen animal');
    else if (f.vegano === true) positives.push(f.veganoFuente === 'declarado' ? 'Declarado vegano' : 'Vegetal por naturaleza');
    else unknowns.push('No podemos confirmar que sea vegano sin el envase');
  } else if (needs.has('vegetariano')) {
    if (f.vegetariano === false) conflicts.push('Lleva carne o pescado');
    else if (f.vegetariano === true) positives.push('Vegetariano');
    else unknowns.push('No podemos confirmar que sea vegetariano sin el envase');
  }

  if (needs.has('lactosa')) {
    if (f.sinLactosa === false || f.alergenos.includes('leche')) conflicts.push('Contiene leche');
    else if (f.sinLactosa === true) positives.push('Declarado sin lactosa');
    else if (f.vegano === true) positives.push('Sin lácteos por naturaleza');
    else unknowns.push('No sabemos si lleva leche: revisa el envase');
  }

  // Orientación: patrones recomendados (no son "aptos para" ninguna enfermedad)
  const types = foodTypesOf(product);
  let baseMatches = 0;
  for (const needId of profile.needs) {
    const need = getNeed(needId);
    if (!need || need.level !== 'C') continue;
    for (const t of types) {
      if (need.moderateFoods?.includes(t) && MODERATE_REASON[t]) reviews.push(MODERATE_REASON[t]!);
      if (need.baseFoods?.includes(t)) baseMatches++;
    }
  }
  for (const t of types) {
    if (!MODERATE_REASON[t] && profile.needs.some(id => getNeed(id)?.baseFoods?.includes(t))) positives.push(FOOD_TYPE_LABELS[t]);
  }

  const status: MatchStatus = conflicts.length ? 'conflicto' : unknowns.length ? 'sin-datos' : reviews.length ? 'revisar' : 'compatible';
  const reasons = [...new Set([...conflicts, ...unknowns, ...reviews, ...positives])];
  return { status, reasons, baseMatches };
}

/** Productos que mejor encajan con el perfil: primero compatibles, luego los que hay que revisar */
export function recommendProducts(products: CatalogProduct[], profile: HealthProfile, limit = 24) {
  const hasGuidance = profile.needs.some(id => getNeed(id)?.level === 'C');
  return products
    .filter(p => p.price > 0)
    .map(product => ({ product, match: evaluateProduct(product, profile) }))
    .filter(({ match }) => match.status === 'compatible' || match.status === 'revisar')
    // Con objetivos de orientación, mostramos solo alimentos del patrón recomendado
    .filter(({ match }) => !hasGuidance || match.baseMatches > 0)
    .sort((a, b) =>
      RANK[b.match.status] - RANK[a.match.status] ||
      b.match.baseMatches - a.match.baseMatches ||
      Number(b.product.inStock) - Number(a.product.inStock))
    .slice(0, limit);
}

/** Revisión de la cesta: avisa (sin bloquear) de los productos que no encajan con el perfil */
export function reviewCart(products: CatalogProduct[], profile: HealthProfile) {
  return products
    .map(product => ({ product, match: evaluateProduct(product, profile) }))
    .filter(({ match }) => match.status === 'conflicto');
}

export const isProfileEmpty = (p: HealthProfile) => p.needs.length === 0 && p.avoidAllergens.length === 0;
