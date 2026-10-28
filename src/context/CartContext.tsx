import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Pack, PackSize } from '@/data/packs';
import { Product } from '@/data/products';
import { CatalogProduct, CatalogPack } from '@/data/catalog';
import { supabase } from '@/integrations/supabase/client';

// Pack item in cart (original packs)
export interface PackCartItem {
  type: 'pack';
  pack: Pack;
  size: PackSize;
  quantity: number;
  isSubscription: boolean;
}

// Product item in cart (original products)
export interface ProductCartItem {
  type: 'product';
  product: Product;
  quantity: number;
}

// Catalog product item in cart (new individual products)
export interface CatalogProductCartItem {
  type: 'catalog-product';
  product: CatalogProduct;
  quantity: number;
}

// Catalog pack item in cart (new packs)
export interface CatalogPackCartItem {
  type: 'catalog-pack';
  pack: CatalogPack;
  quantity: number;
}

export type CartItem = PackCartItem | ProductCartItem | CatalogProductCartItem | CatalogPackCartItem;

interface CartContextType {
  items: CartItem[];
  addPack: (pack: Pack, size: PackSize, isSubscription?: boolean) => void;
  addProduct: (product: Product) => void;
  addCatalogProduct: (product: CatalogProduct) => void;
  addCatalogPack: (pack: CatalogPack) => void;
  removeItem: (itemId: string, size?: PackSize, type?: CartItem['type']) => void;
  updateQuantity: (itemId: string, quantity: number, size?: PackSize, type?: CartItem['type']) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('ecoland-cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart:', e);
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('ecoland-cart', JSON.stringify(items));
  }, [items]);

  const addPack = (pack: Pack, size: PackSize, isSubscription = false) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.type === 'pack' && item.pack.id === pack.id && item.size === size && item.isSubscription === isSubscription
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        (updated[existingIndex] as PackCartItem).quantity += 1;
        return updated;
      }

      return [...prev, { type: 'pack', pack, size, quantity: 1, isSubscription } as PackCartItem];
    });
    setIsOpen(true);
  };

  const addProduct = (product: Product) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.type === 'product' && item.product.id === product.id
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        (updated[existingIndex] as ProductCartItem).quantity += 1;
        return updated;
      }

      return [...prev, { type: 'product', product, quantity: 1 } as ProductCartItem];
    });
    setIsOpen(true);
  };

  const addCatalogProduct = (product: CatalogProduct) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.type === 'catalog-product' && item.product.id === product.id
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        (updated[existingIndex] as CatalogProductCartItem).quantity += 1;
        return updated;
      }

      return [...prev, { type: 'catalog-product', product, quantity: 1 } as CatalogProductCartItem];
    });
    setIsOpen(true);
  };

  const addCatalogPack = (pack: CatalogPack) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.type === 'catalog-pack' && item.pack.id === pack.id
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        (updated[existingIndex] as CatalogPackCartItem).quantity += 1;
        return updated;
      }

      return [...prev, { type: 'catalog-pack', pack, quantity: 1 } as CatalogPackCartItem];
    });
    setIsOpen(true);
  };

  const removeItem = (itemId: string, size?: PackSize, type?: CartItem['type']) => {
    setItems(prev => prev.filter(item => {
      if (item.type === 'pack') {
        return !(item.pack.id === itemId && item.size === size);
      }
      if (item.type === 'product') {
        return item.product.id !== itemId;
      }
      if (item.type === 'catalog-product') {
        return item.product.id !== itemId;
      }
      if (item.type === 'catalog-pack') {
        return item.pack.id !== itemId;
      }
      return true;
    }));
  };

  const updateQuantity = (itemId: string, quantity: number, size?: PackSize, type?: CartItem['type']) => {
    if (quantity <= 0) {
      removeItem(itemId, size, type);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.type === 'pack' && item.pack.id === itemId && item.size === size) {
          return { ...item, quantity };
        }
        if (item.type === 'product' && item.product.id === itemId) {
          return { ...item, quantity };
        }
        if (item.type === 'catalog-product' && item.product.id === itemId) {
          return { ...item, quantity };
        }
        if (item.type === 'catalog-pack' && item.pack.id === itemId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce((sum, item) => {
    if (item.type === 'pack') {
      const price = item.pack.prices[item.size];
      const discount = item.isSubscription ? 0.9 : 1;
      return sum + price * discount * item.quantity;
    }
    if (item.type === 'product') {
      return sum + item.product.price * item.quantity;
    }
    if (item.type === 'catalog-product') {
      return sum + item.product.price * item.quantity;
    }
    if (item.type === 'catalog-pack') {
      return sum + item.pack.price * item.quantity;
    }
    return sum;
  }, 0);

  const clearCart = useCallback(async () => {
    if (items.length > 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('abandoned_carts').insert({
            user_id: user.id,
            cart_items: items as any,
            total_price: totalPrice,
            item_count: totalItems,
          });
        }
      } catch (e) {
        console.error('Error saving abandoned cart:', e);
      }
    }
    setItems([]);
  }, [items, totalPrice, totalItems]);

  return (
    <CartContext.Provider
      value={{
        items,
        addPack,
        addProduct,
        addCatalogProduct,
        addCatalogPack,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
