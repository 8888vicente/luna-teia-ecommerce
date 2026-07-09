"use client";

import { useCart, Product } from '../../context/CartContext';
import { trackAddToCart } from '../../lib/metaPixel';
import { useToast } from '../../lib/ui/Toast';

interface AddToCartBarProps {
  product: Product;
  isSoldOut: boolean;
  onAddItem: (product: Product) => void;
  onClose: () => void;
}

export default function AddToCartBar({ product, isSoldOut, onAddItem, onClose }: AddToCartBarProps) {
  const { items } = useCart();
  const toast = useToast();

  return (
    <div style={{
      flexShrink: 0,
      padding: '0.75rem 1.25rem',
      paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
      borderTop: '1px solid #f0f0f0',
      backgroundColor: '#fff',
    }}>
      <div style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#E65100', backgroundColor: '#FFF3E0', padding: '0.4rem', borderRadius: '8px', margin: 0, border: '1px solid #FFE0B2' }}>
          📦 Al comprar 3 labiales tu envío es de solo $40 · GRATIS en $400+
        </p>
      </div>
      <button
        onClick={() => { 
          try {
            onAddItem(product); 
            trackAddToCart(product);
          } catch (e) {
            console.error('Error adding to cart:', e);
          } finally {
            onClose(); 
          }
        }}
        disabled={isSoldOut}
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: isSoldOut ? '#9e9e9e' : '#E53935',
          color: 'white', border: 'none', borderRadius: '14px',
          fontSize: '1rem', fontWeight: '800', letterSpacing: '0.5px',
          cursor: isSoldOut ? 'not-allowed' : 'pointer',
          boxShadow: isSoldOut ? 'none' : '0 4px 16px rgba(229,57,53,0.4)',
          opacity: isSoldOut ? 0.7 : 1,
          transition: 'transform 0.1s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}
        onMouseDown={e => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(0.97)'; }}
        onMouseUp={e => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(1)'; }}
        onTouchStart={e => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(0.97)'; }}
        onTouchEnd={e => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <span style={{ fontSize: '1.1rem' }}>🛒</span>
        {isSoldOut ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
      </button>
    </div>
  );
}
