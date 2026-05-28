"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems, openCart, isCartHighlighted } = useCart();

  return (
    <>
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0.75rem 1rem', 
        backgroundColor: '#FFFFFF', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo1.jpeg" 
            alt="Luna Teia Cosméticos" 
            style={{ height: 'clamp(35px, 5vw, 45px)', width: 'auto', objectFit: 'contain', borderRadius: '4px' }}
          />
        </Link>
        
        <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1.5rem)', alignItems: 'center' }}>
          <Link href="/" style={{ fontWeight: '500', color: '#212121', fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>Inicio</Link>
          <button onClick={openCart} className={isCartHighlighted ? 'cart-button highlighted' : 'cart-button'} style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            backgroundColor: isCartHighlighted ? '#E53935' : '#212121',
            padding: 'clamp(0.4rem, 1.5vw, 0.75rem) clamp(0.6rem, 2vw, 1.25rem)',
            borderRadius: '9999px',
            fontWeight: 'bold',
            fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: isCartHighlighted ? '0 0 0 4px rgba(229,83,83,0.25), 0 6px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.1)',
            transform: isCartHighlighted ? 'scale(1.04)' : 'scale(1)',
            transition: 'all 0.25s ease',
            overflow: 'visible',
            zIndex: 1,
          }}>
            {isCartHighlighted && (
              <span className="fireworks">
                <span className="spark spark-1" />
                <span className="spark spark-2" />
                <span className="spark spark-3" />
                <span className="spark spark-4" />
              </span>
            )}
            🛒 {totalItems}
          </button>
        </div>
      </nav>
      <style dangerouslySetInnerHTML={{__html: `
        .fireworks {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          overflow: visible;
        }
        .spark {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          opacity: 0;
          box-shadow: 0 0 12px rgba(255,255,255,0.9);
          animation: spark-pop 0.9s ease-out forwards;
        }
        .spark-1 { left: 20%; top: 10%; animation: spark-pop-1 0.9s ease-out forwards; background: #ffd54f; }
        .spark-2 { left: 80%; top: 18%; animation: spark-pop-2 0.95s ease-out forwards; background: #ff8a65; }
        .spark-3 { left: 30%; top: 70%; animation: spark-pop-3 0.85s ease-out forwards; background: #4fc3f7; }
        .spark-4 { left: 75%; top: 65%; animation: spark-pop-4 0.9s ease-out forwards; background: #ce93d8; }
        @keyframes spark-pop-1 {
          0% { opacity: 1; transform: scale(0.3) translate(0, 0); }
          40% { opacity: 1; transform: scale(1.2) translate(-8px, -32px); }
          100% { opacity: 0; transform: scale(0.8) translate(-10px, -42px); }
        }
        @keyframes spark-pop-2 {
          0% { opacity: 1; transform: scale(0.3) translate(0, 0); }
          40% { opacity: 1; transform: scale(1.2) translate(12px, -28px); }
          100% { opacity: 0; transform: scale(0.8) translate(14px, -36px); }
        }
        @keyframes spark-pop-3 {
          0% { opacity: 1; transform: scale(0.3) translate(0, 0); }
          40% { opacity: 1; transform: scale(1.2) translate(-12px, 28px); }
          100% { opacity: 0; transform: scale(0.8) translate(-14px, 34px); }
        }
        @keyframes spark-pop-4 {
          0% { opacity: 1; transform: scale(0.3) translate(0, 0); }
          40% { opacity: 1; transform: scale(1.2) translate(16px, 24px); }
          100% { opacity: 0; transform: scale(0.8) translate(18px, 30px); }
        }
      `}} />
    </>
  );
}
