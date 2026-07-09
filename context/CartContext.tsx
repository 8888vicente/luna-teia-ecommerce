"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '../lib/ui/Toast';

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
  const toast = useToast();

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

    // ── Toast de Recomendación de Tonos ──
    try {
      const currentLipsticksCount = items.reduce((acc, item) => acc + item.quantity, 0);
      const newCount = currentLipsticksCount + 1;
      
      const nudes = ['terra', 'moka', 'palo rosa', 'naranja mate', 'rose'];
      const intensos = ['ciruela', 'blackberry', 'vino', 'expresso', 'purpura'];
      const clasicos = ['rojo', 'chocolate', 'marte', 'pasion', 'cereza'];
      
      const name = product.name.toLowerCase();
      let message = "💄 ¡Excelente elección! Agrega un tono contrastante para otra ocasión.";
      
      if (newCount >= 3) {
        message = "🎉 ¡Agregado al carrito! Tienes opciones para cualquier momento de tu semana.";
      } else if (nudes.some(n => name.includes(n))) {
        message = "🎉 ¡Agregado al carrito! Tono ideal de diario. ¡Agrega un intenso (como Vino o Ciruela) para la noche!";
      } else if (intensos.some(i => name.includes(i))) {
        message = "🎉 ¡Agregado al carrito! Increíble para eventos. ¿Qué tal un Nude suave para la oficina (como Moka o Rose)?";
      } else if (clasicos.some(c => name.includes(c))) {
        message = "🎉 ¡Agregado al carrito! ¡Un clásico infalible! Arma tu colección con uno de nuestros tonos en tendencia.";
      } else {
        message = `🎉 ¡Agregado al carrito! ${product.name} listo para brillar.`;
      }

      toast.show({ message, duration: 7000, tone: 'success' });
    } catch (e) {
      console.error('Error mostrando toast de recomendación:', e);
    }
  };

  const removeItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Lógica de envío de Luna Teia basada en subtotal (4 franjas unificadas)
  let shippingCost = 150;
  if (subtotal >= 400) {
    shippingCost = 0;      // Gratis desde $400
  } else if (subtotal >= 300) {
    shippingCost = 40;     // $40 entre $300 y $399 (sweet spot: 3 labiales)
  } else if (subtotal >= 200) {
    shippingCost = 80;     // $80 entre $200 y $299
  } else if (subtotal < 15) {
    shippingCost = 0;      // Pruebas / carrito vacío
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

