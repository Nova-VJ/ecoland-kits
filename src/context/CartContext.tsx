import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pack, PackSize } from '@/data/packs';
import { Product } from '@/data/products';

// Pack item in cart
export interface PackCartItem {
  type: 'pack';
  pack: Pack;
  size: PackSize;
  quantity: number;
  isSubscription: boolean;
}

// Product item in cart
export interface ProductCartItem {
  type: 'product';
  product: Product;
  quantity: number;
}

export type CartItem = PackCartItem | ProductCartItem;

interface CartContextType {
  items: CartItem[];
  addPack: (pack: Pack, size: PackSize, isSubscription?: boolean) => void;
  addProduct: (product: Product) => void;
  removeItem: (itemId: string, size?: PackSize) => void;
  updateQuantity: (itemId: string, quantity: number, size?: PackSize) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ecoland-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

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

  const removeItem = (itemId: string, size?: PackSize) => {
    setItems(prev => prev.filter(item => {
      if (item.type === 'pack') {
        return !(item.pack.id === itemId && item.size === size);
      }
      return item.product.id !== itemId;
    }));
  };

  const updateQuantity = (itemId: string, quantity: number, size?: PackSize) => {
    if (quantity <= 0) {
      removeItem(itemId, size);
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
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce((sum, item) => {
    if (item.type === 'pack') {
      const price = item.pack.prices[item.size];
      const discount = item.isSubscription ? 0.9 : 1;
      return sum + price * discount * item.quantity;
    }
    return sum + item.product.price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addPack,
        addProduct,
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
