import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Product, CartItem } from '../types';
import { useAuth } from './AuthContext';
import {
  addCartItem,
  clearCartApi,
  fetchCart,
  mergeAnonymousCart,
  removeCartItem,
} from '../services/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartEntry = CartItem & { id: string };

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CartEntry[]>([]);

  const loadCart = async () => {
    try {
      const cart = await fetchCart();
      setEntries(cart.items as CartEntry[]);
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function syncCart() {
      if (user) {
        try {
          await mergeAnonymousCart();
        } catch {
          // Si no había carrito anónimo o ya se fusionó, seguimos.
        }
      }

      if (!cancelled) {
        await loadCart();
      }
    }

    syncCart();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const items = useMemo(() => entries.map(({ id: _id, ...item }) => item), [entries]);

  const addToCart = async (product: Product) => {
    const updatedCart = await addCartItem(product.id, 1);
    setEntries(updatedCart.items as CartEntry[]);
  };

  const removeFromCart = async (productId: string) => {
    const entry = entries.find(item => item.product.id === productId);
    if (!entry) {
      return;
    }

    await removeCartItem(entry.id);
    await loadCart();
  };

  const clearCart = async () => {
    await clearCartApi();
    setEntries([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
