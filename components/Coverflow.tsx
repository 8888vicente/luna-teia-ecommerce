"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useCart, Product } from '../context/CartContext';

interface CoverflowProps {
  products: Product[];
  families: string[];
  onProductClick?: (product: Product) => void;
}

export default function Coverflow({ products, families, onProductClick }: CoverflowProps) {
  const [activeFamilyIndex, setActiveFamilyIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const { addItem } = useCart();

  const activeFamily = families[activeFamilyIndex];
  const familyProducts = products.filter(p => p.family === activeFamily);

  // Reset horizontal index when changing family
  useEffect(() => {
    setActiveIndex(0);
  }, [activeFamilyIndex]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % familyProducts.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + familyProducts.length) % familyProducts.length);
  };

  const handleUp = () => {
    setActiveFamilyIndex((prev) => (prev - 1 + families.length) % families.length);
  };

  const handleDown = () => {
    setActiveFamilyIndex((prev) => (prev + 1) % families.length);
  };

  const activeProduct = familyProducts[activeIndex];

  // Prevent default scroll when hovering the coverflow
  // Se eliminó el cambio de familia con scroll del mouse a petición del usuario.
  // El usuario ahora usará los botones de categoría.

  // Gestos táctiles (Swipe)
  const touchStart = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStart.current.x - touchEndX;
    
    // Deslizar izquierda -> siguiente
    if (diffX > 50) handleNext();
    // Deslizar derecha -> anterior
    else if (diffX < -50) handlePrev();
  };

  if (!activeProduct) return null;

  return (
    <div 
      id="coverflow-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 0',
        overflow: 'hidden'
      }}
    >
      {/* Category Tabs (Resaltados) */}
      {families.length > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto', padding: '0.5rem', backgroundColor: '#FFF', borderRadius: '9999px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 10 }}>
          {families.map((family, idx) => (
            <button
              key={family}
              onClick={() => setActiveFamilyIndex(idx)}
              style={{
                padding: '0.6rem 1.5rem',
                fontSize: '0.95rem',
                borderRadius: '9999px',
                fontWeight: '900',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeFamilyIndex === idx ? '#E53935' : 'transparent',
                color: activeFamilyIndex === idx ? '#FFF' : '#757575',
                transition: 'all 0.3s ease',
                boxShadow: activeFamilyIndex === idx ? '0 4px 10px rgba(229,57,53,0.3)' : 'none',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
            >
              {family.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Up Arrow (Solo si hay más de 1 familia) */}
      {families.length > 1 && (
        <button onClick={handleUp} style={{ marginBottom: '0.25rem', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#B0BEC5' }}>▲</button>
      )}

      {/* Coverflow */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '170px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: '900px'
      }}>
        {familyProducts.map((product, index) => {
          let diff = index - activeIndex;
          if (diff < -Math.floor(familyProducts.length / 2)) diff += familyProducts.length;
          if (diff > Math.floor(familyProducts.length / 2)) diff -= familyProducts.length;

          // Solo renderizar hasta 6 a cada lado
          if (Math.abs(diff) > 6) return null;

          const isCenter = diff === 0;
          // Separación de 72px por paso → 6 pasos = 432px a cada lado
          const translateX = diff * 72;
          // Escala: baja 6% por paso. diff=1→0.94, diff=5→0.70
          const scale = isCenter ? 1.22 : Math.max(0.58, 1 - Math.abs(diff) * 0.062);
          const zIndex = 100 - Math.abs(diff);
          // Opacidad suave: diff=1→86%, diff=5→43% (misma curva que el banner)
          const opacity = isCenter ? 1 : Math.max(0.36, 1 - Math.abs(diff) * 0.115);
          // Blur: empieza en diff=2, muy ligero
          const blur = isCenter ? 0 : Math.max(0, (Math.abs(diff) - 1) * 0.4);

          return (
            <div
              key={product.id}
              onClick={() => {
                if (isCenter && onProductClick) onProductClick(product);
                else setActiveIndex(index);
              }}
              style={{
                position: 'absolute',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#FFF',
                backgroundImage: `url(${product.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: isCenter ? `0 12px 24px ${product.colorHex}44, 0 4px 8px rgba(0,0,0,0.1)` : '0 3px 8px rgba(0,0,0,0.06)',
                border: isCenter ? `3px solid ${product.colorHex}` : '1px solid #EEE',
                transform: `translateX(${translateX}px) scale(${scale})`,
                filter: blur > 0 ? `blur(${blur}px)` : 'none',
                zIndex,
                opacity,
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                cursor: 'pointer'
              }}
            />
          );
        })}
        
        {/* Navigation Arrows */}
        <button onClick={handlePrev} style={{ position: 'absolute', left: '10%', zIndex: 200, fontSize: '1.2rem', color: '#212121', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>&lt;</button>
        <button onClick={handleNext} style={{ position: 'absolute', right: '10%', zIndex: 200, fontSize: '1.2rem', color: '#212121', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>&gt;</button>
      </div>

      {/* Down Arrow (Solo si hay más de 1 familia) */}
      {families.length > 1 && (
        <button onClick={handleDown} style={{ marginTop: '0.25rem', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#B0BEC5' }}>▼</button>
      )}

      <div style={{ textAlign: 'center', marginTop: '0.5rem', animation: 'fadeIn 0.5s ease-in' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#212121', marginBottom: '0.25rem' }}>{activeProduct.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
           <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: activeProduct.colorHex, border: '1px solid #ccc' }} />
           <span style={{ fontSize: '0.9rem', color: '#757575', fontWeight: 'bold' }}>{activeProduct.category}</span>
           <span style={{ fontSize: '1.1rem', color: '#E53935', fontWeight: 'bold' }}>${activeProduct.price} MXN</span>
        </div>
        
        <button
          onClick={() => addItem(activeProduct)}
          style={{
            backgroundColor: '#E53935',
            color: 'white',
            padding: '0.75rem 2rem', // Botón más pequeño (aprox 15-20% menos)
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '9999px',
            border: 'none',
            boxShadow: '0 4px 10px rgba(229, 57, 53, 0.3)',
            transition: 'transform 0.1s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span>[ + ]</span> AGREGAR AL CARRITO
        </button>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
