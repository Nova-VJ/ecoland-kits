import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pack, PackSize } from '@/data/packs';

export interface CartItem {
  pack: Pack;
  size: PackSize;
  quantity: number;
  isSubscription: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (pack: Pack, size: PackSize, isSubscription?: boolean) => void;
  removeItem: (packId: string, size: PackSize) => void;
  updateQuantity: (packId: string, size: PackSize, quantity: number) => void;
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

  const addItem = (pack: Pack, size: PackSize, isSubscription = false) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.pack.id === pack.id && item.size === size && item.isSubscription === isSubscription
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prev, { pack, size, quantity: 1, isSubscription }];
    });
    setIsOpen(true);
  };

  const removeItem = (packId: string, size: PackSize) => {
    setItems(prev => prev.filter(item => !(item.pack.id === packId && item.size === size)));
  };

  const updateQuantity = (packId: string, size: PackSize, quantity: number) => {
    if (quantity <= 0) {
      removeItem(packId, size);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.pack.id === packId && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce((sum, item) => {
    const price = item.pack.prices[item.size];
    const discount = item.isSubscription ? 0.9 : 1; // 10% off for subscriptions
    return sum + price * discount * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
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
