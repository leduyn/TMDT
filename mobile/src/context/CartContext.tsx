import React, { createContext, useContext, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProductDTO, CartItem } from '../types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; product: ProductDTO; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: number }
  | { type: 'UPDATE_QUANTITY'; productId: number; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; items: CartItem[] };

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductDTO, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

const CART_KEY = 'cart_items';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + action.quantity }
              : i,
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: action.quantity }] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.product.id !== action.productId) };
    case 'UPDATE_QUANTITY':
      return {
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i,
        ),
      };
    case 'CLEAR':
      return { items: [] };
    case 'LOAD':
      return { items: action.items };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  React.useEffect(() => {
    AsyncStorage.getItem(CART_KEY).then(val => {
      if (val) {
        try { dispatch({ type: 'LOAD', items: JSON.parse(val) }); } catch {}
      }
    });
  }, []);

  const persist = useCallback(async (items: CartItem[]) => {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  }, []);

  const addItem = useCallback(async (product: ProductDTO, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', product, quantity });
    const newItems = [...state.items];
    const idx = newItems.findIndex(i => i.product.id === product.id);
    if (idx >= 0) {
      newItems[idx].quantity += quantity;
    } else {
      newItems.push({ product, quantity });
    }
    await persist(newItems);
  }, [state.items, persist]);

  const removeItem = useCallback(async (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
    const newItems = state.items.filter(i => i.product.id !== productId);
    await persist(newItems);
  }, [state.items, persist]);

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
    const newItems = state.items.map(i =>
      i.product.id === productId ? { ...i, quantity } : i,
    );
    await persist(newItems);
  }, [state.items, persist, removeItem]);

  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR' });
    await AsyncStorage.removeItem(CART_KEY);
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = state.items.reduce((sum, i) => sum + (i.product.appliedPrice ?? i.product.price) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        loading: false,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
