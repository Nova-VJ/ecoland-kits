// Exportaciones centralizadas del catálogo Ecoland
export * from './categories';
export * from './individual-products';
export * from './packs-catalog';

// Tipos unificados para el carrito
export type CartItemType = 'product' | 'pack' | 'catalog-product' | 'catalog-pack';

export interface UnifiedCartItem {
  id: string;
  type: CartItemType;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string; // Para packs con tallas S/M/L/XL
}
