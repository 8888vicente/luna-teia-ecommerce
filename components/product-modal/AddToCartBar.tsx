"use client";

import { Product } from '../../context/CartContext';

interface AddToCartBarProps {
  product: Product;
  isSoldOut: boolean;
  onAddItem: (product: Product) => void;
  onClose: () => void;
}

export default function AddToCartBar({ product, isSoldOut, onAddItem, onClose }: AddToCartBarProps) {
  return (
    <div style={{
      flexShrink: 0,
      padding: '0.75rem 1.25rem',
      paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
      borderTop: '1px solid #f0f0f0',
      backgroundColor: '#fff',
    }}>
      <button
        onClick={() => { onAddItem(product); onClose(); }}
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
