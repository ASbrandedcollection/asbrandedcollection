'use client';

import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { product_id: string } }
  | { type: 'UPDATE_QTY'; payload: { product_id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: CartItem[] };

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (product_id: string) => void;
  updateQty: (product_id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (product_id: string) => boolean;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.payload };

    case 'ADD_ITEM': {
      const exists = state.items.find(i => i.product_id === action.payload.product_id);
      if (exists) {
        return {
          items: state.items.map(i =>
            i.product_id === action.payload.product_id ? { ...i, quantity: i.quantity + action.payload.quantity } : i,
          ),
        };
      }
      return { items: [...state.items, action.payload] };
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.product_id !== action.payload.product_id) };

    case 'UPDATE_QTY': {
      if (action.payload.quantity <= 0) {
        return { items: state.items.filter(i => i.product_id !== action.payload.product_id) };
      }
      return {
        items: state.items.map(i =>
          i.product_id === action.payload.product_id ? { ...i, quantity: action.payload.quantity } : i,
        ),
      };
    }

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'store_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(stored) });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = state.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const value: CartContextValue = {
    items: state.items,
    itemCount,
    totalAmount,
    addItem: item => dispatch({ type: 'ADD_ITEM', payload: item }),
    removeItem: id => dispatch({ type: 'REMOVE_ITEM', payload: { product_id: id } }),
    updateQty: (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { product_id: id, quantity: qty } }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    isInCart: id => state.items.some(i => i.product_id === id),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
