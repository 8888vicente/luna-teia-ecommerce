"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems, openCart } = useCart();

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem', 
      backgroundColor: '#FFFFFF', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: '#E53935', letterSpacing: '0.5px' }}>
        LUNA TEIA
      </Link>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href="/" style={{ fontWeight: '500', color: '#212121' }}>Inicio</Link>
        <button onClick={openCart} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          backgroundColor: '#F5F5F5', 
          padding: '0.5rem 1rem', 
          borderRadius: '9999px',
          fontWeight: 'bold',
          color: '#E53935'
        }}>
          🛒 Carrito ({totalItems})
        </button>
      </div>
    </nav>
  );
}
