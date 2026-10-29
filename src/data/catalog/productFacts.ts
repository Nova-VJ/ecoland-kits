import rawFacts from './product-facts.json';

// Datos verificados de cada producto, generados a partir del nombre y el formato.
// Lo que no se puede saber sin ver el envase queda como null / 'desconocido': nunca se convierte en certeza.

export type ProductKind = 'alimento' | 'bebida-alcoholica' | 'suplemento' | 'cosmetica' | 'hogar';

export type AllergenId =
  | 'gluten' | 'crustaceos' | 'huevo' | 'pescado' | 'cacahuete' | 'soja' | 'leche'
  | 'frutos-cascara' | 'apio' | 'mostaza' | 'sesamo' | 'sulfitos' | 'altramuz' | 'moluscos';

export interface ProductFacts {
  kind: ProductKind;
  vegano: boolean | null;
  vegetariano: boolean | null;
  /** declarado = lo indica el producto; inferido = se deduce de qué es el producto */
  veganoFuente: 'declarado' | 'inferido' | 'desconocido';
  sinGluten: boolean | null;
  glutenFuente: 'declarado' | 'inferido' | 'naturalmente-sin-gluten' | 'desconocido';
  sinLactosa: boolean | null;
  /** Alérgenos UE que el producto contiene por su propia naturaleza (no incluye trazas) */
  alergenos: AllergenId[];
  /** Otros formatos (tamaños) del mismo producto */
  formatos?: string[];
}

const facts = rawFacts as unknown as Record<string, ProductFacts>;

const UNKNOWN: ProductFacts = {
  kind: 'alimento', vegano: null, vegetariano: null, veganoFuente: 'desconocido',
  sinGluten: null, glutenFuente: 'desconocido', sinLactosa: null, alergenos: [],
};

export const getProductFacts = (productId: string): ProductFacts => facts[productId] ?? UNKNOWN;

export const ALLERGEN_LABELS: Record<AllergenId, string> = {
  gluten: 'Gluten', crustaceos: 'Crustáceos', huevo: 'Huevo', pescado: 'Pescado', cacahuete: 'Cacahuete',
  soja: 'Soja', leche: 'Leche', 'frutos-cascara': 'Frutos de cáscara', apio: 'Apio', mostaza: 'Mostaza',
  sesamo: 'Sésamo', sulfitos: 'Sulfitos', altramuz: 'Altramuz', moluscos: 'Moluscos',
};
