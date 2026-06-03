"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Product = {
  id: string;
  name: string;
  category: string;
  family?: string;
  price: number;
  colorHex: string;
  imageUrl: string;
  imageUrlSecondary?: string;
  stock?: number;
};

type CartItem = Product & { quantity: number };

type CartContextType = {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  isCartHighlighted: boolean;
};

const CART_STORAGE_KEY = 'luna-teia-cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartHighlighted, setIsCartHighlighted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const highlightTimeout = React.useRef<number | null>(null);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Error cargando carrito del localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      if (existingItem) {
        return currentItems.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentItems, { ...product, quantity: 1 }];
    });

    setIsCartHighlighted(true);
    if (highlightTimeout.current) {
      window.clearTimeout(highlightTimeout.current);
    }
    highlightTimeout.current = window.setTimeout(() => {
      setIsCartHighlighted(false);
      highlightTimeout.current = null;
    }, 1200);
  };

  const removeItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Lógica de envío de Luna Teia
  let shippingCost = 150;
  if (subtotal >= 500) {
    shippingCost = 0;      // Gratis desde $500
  } else if (subtotal >= 200) {
    shippingCost = 80;     // Subsidiado entre $200 y $499
  } else if (subtotal < 15) {
    shippingCost = 0;      // Pruebas: gratis si < $15
  }

  return (
    <CartContext.Provider value={{ items, isCartOpen, openCart, closeCart, addItem, removeItem, totalItems, subtotal, shippingCost, isCartHighlighted }}>
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

