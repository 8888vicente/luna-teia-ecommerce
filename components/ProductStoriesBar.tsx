"use client";

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  href?: string;
  colorHex?: string;
  imageUrl?: string;
}

interface ProductStoriesBarProps {
  products?: Product[];
}

export default function ProductStoriesBar({ products = [] }: ProductStoriesBarProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) {
    return null;
  }

  const handleClick = (product: Product) => {
    const target = `${product.href}?productId=${encodeURIComponent(product.id)}`;
    router.push(target);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

  return (
    <section style={{
      backgroundColor: '#fff',
      padding: '1.5rem 0',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <h2 style={{
        textAlign: 'center',
        fontSize: '0.85rem',
        fontWeight: '800',
        color: '#212121',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '1rem'
      }}>
        Acceso Rápido
      </h2>

      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Botón Izquierdo (Solo PC) */}
        <button 
          className="nav-arrow"
          onClick={scrollLeft}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#424242'
          }}
        >
          ‹
        </button>

        {/* Contenedor con Scroll */}
        <div 
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '0.5rem 1.5rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }} 
          className="hide-scrollbar"
        >
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleClick(product)}
              title={product.name}
              style={{
                flex: '0 0 auto',
                scrollSnapAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                gap: '0.5rem',
                width: '90px'
              }}
              className="story-item"
            >
              <div 
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundImage: `url(${product.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: `2.5px solid ${product.colorHex || '#EEE'}`,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#424242',
                textAlign: 'center',
                lineHeight: 1.2
              }}>
                {product.name}
              </span>
            </div>
          ))}
        </div>

        {/* Botón Derecho (Solo PC) */}
        <button 
          className="nav-arrow"
          onClick={scrollRight}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#424242'
          }}
        >
          ›
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .story-item:hover div {
          transform: scale(1.05);
          box-shadow: 0 6px 15px rgba(0,0,0,0.15);
        }
        .story-item:active div {
          transform: scale(0.95);
        }
        /* Ocultar flechas en dispositivos móviles (pantallas pequeñas y sin hover) */
        @media (max-width: 768px) {
          .nav-arrow {
            display: none !important;
          }
        }
      `}} />
    </section>
  );
}
