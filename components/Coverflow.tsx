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
  const [isMobile, setIsMobile] = useState(false);
  const { addItem, items } = useCart();

  // Detectar mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const activeFamily = families[activeFamilyIndex];
  const familyProducts = products.filter(p => p.family === activeFamily);

  // Tamaños adaptables
  const bubbleSize = isMobile ? 100 : 160;
  const containerHeight = isMobile ? 150 : 220;
  const stepPx = isMobile ? 80 : 110;
  const centerScale = isMobile ? 1.3 : 1.5;

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
  const activeCartQuantity = items.find(item => item.id === activeProduct?.id)?.quantity ?? 0;
  const isActiveSoldOut = activeProduct?.stock !== undefined && activeCartQuantity >= (activeProduct?.stock ?? 0);

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
    
    if (diffX > 50) handleNext();
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
      {/* Category Tabs */}
      {families.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', padding: '0.4rem', backgroundColor: '#FFF', borderRadius: '9999px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 10, maxWidth: '95vw' }}>
          {families.map((family, idx) => (
            <button
              key={family}
              onClick={() => setActiveFamilyIndex(idx)}
              style={{
                padding: isMobile ? '0.4rem 1rem' : '0.6rem 1.5rem',
                fontSize: isMobile ? '0.75rem' : '0.95rem',
                borderRadius: '9999px',
                fontWeight: '900',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeFamilyIndex === idx ? '#E53935' : 'transparent',
                color: activeFamilyIndex === idx ? '#FFF' : '#757575',
                transition: 'all 0.3s ease',
                boxShadow: activeFamilyIndex === idx ? '0 4px 10px rgba(229,57,53,0.3)' : 'none',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}
            >
              {isMobile ? family.substring(0, 6) : family.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Coverflow */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: `${containerHeight}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: isMobile ? '600px' : '900px'
      }}>
        {familyProducts.map((product, index) => {
          let diff = index - activeIndex;
          if (diff < -Math.floor(familyProducts.length / 2)) diff += familyProducts.length;
          if (diff > Math.floor(familyProducts.length / 2)) diff -= familyProducts.length;

          if (Math.abs(diff) > 6) return null;

          const isCenter = diff === 0;
          const translateX = diff * stepPx;
          const scale = isCenter ? centerScale : Math.max(0.58, 1 - Math.abs(diff) * 0.04);
          const zIndex = 100 - Math.abs(diff);
          const opacity = isCenter ? 1 : Math.max(0.36, 1 - Math.abs(diff) * 0.115);
          const blur = isCenter ? 0 : Math.max(0, (Math.abs(diff) - 1) * 0.4);

          return (
            <div
              key={product.id}
              onClick={() => {
                  if (onProductClick) onProductClick(product);
                  else setActiveIndex(index);
                }}
              style={{
                position: 'absolute',
                transform: `translateX(${translateX}px) scale(${scale})`,
                zIndex,
                opacity,
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                cursor: 'pointer'
              }}
            >
              <div 
                className="bubble-fx"
                style={{
                  width: `${bubbleSize}px`,
                  height: `${bubbleSize}px`,
                  borderRadius: '50%',
                  backgroundColor: '#FFF',
                  backgroundImage: `url(${product.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow: isCenter ? `0 12px 24px ${product.colorHex}44, 0 4px 8px rgba(0,0,0,0.1)` : '0 3px 8px rgba(0,0,0,0.06)',
                  border: isCenter ? `3px solid ${product.colorHex}` : '1px solid #EEE',
                  filter: blur > 0 ? `blur(${blur}px)` : 'none',
                  transition: 'transform 0.4s ease-out, box-shadow 0.4s ease-out, filter 0.4s ease-out'
                }}
              />
            </div>
          );
        })}
        
        {/* Navigation Arrows */}
        <button onClick={handlePrev} style={{ 
          position: 'absolute', 
          left: isMobile ? '5%' : '10%', 
          zIndex: 200, 
          fontSize: isMobile ? '1rem' : '1.2rem', 
          color: '#212121', 
          background: 'rgba(255,255,255,0.8)', 
          border: 'none', 
          borderRadius: '50%', 
          width: isMobile ? '26px' : '30px', 
          height: isMobile ? '26px' : '30px', 
          cursor: 'pointer', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>&lt;</button>
        <button onClick={handleNext} style={{ 
          position: 'absolute', 
          right: isMobile ? '5%' : '10%', 
          zIndex: 200, 
          fontSize: isMobile ? '1rem' : '1.2rem', 
          color: '#212121', 
          background: 'rgba(255,255,255,0.8)', 
          border: 'none', 
          borderRadius: '50%', 
          width: isMobile ? '26px' : '30px', 
          height: isMobile ? '26px' : '30px', 
          cursor: 'pointer', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>&gt;</button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '0.5rem', animation: 'fadeIn 0.5s ease-in', padding: '0 1rem' }}>
        <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: '800', color: '#212121', marginBottom: '0.25rem' }}>{activeProduct.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
           <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: activeProduct.colorHex, border: '1px solid #ccc', flexShrink: 0 }} />
           <span style={{ fontSize: '0.9rem', color: '#757575', fontWeight: 'bold' }}>{activeProduct.category}</span>
           <span style={{ fontSize: '1.1rem', color: '#E53935', fontWeight: 'bold' }}>${activeProduct.price} MXN</span>
        </div>
        
        <button
          onClick={() => addItem(activeProduct)}
          disabled={isActiveSoldOut}
          style={{
            backgroundColor: isActiveSoldOut ? '#9e9e9e' : '#E53935',
            color: 'white',
            padding: isMobile ? '0.6rem 1.5rem' : '0.75rem 2rem',
            fontSize: isMobile ? '0.85rem' : '1rem',
            fontWeight: 'bold',
            borderRadius: '9999px',
            border: 'none',
            boxShadow: isActiveSoldOut ? 'none' : '0 4px 10px rgba(229, 57, 53, 0.3)',
            transition: 'transform 0.1s ease',
            cursor: isActiveSoldOut ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto',
            opacity: isActiveSoldOut ? 0.7 : 1,
          }}
          onMouseDown={e => { if (!isActiveSoldOut) e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={e => { if (!isActiveSoldOut) e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={e => { if (!isActiveSoldOut) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <span>[ + ]</span> {isActiveSoldOut ? 'AGOTADO' : 'AGREGAR'}
        </button>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bubble-fx:active {
          transform: scale(0.92) !important;
        }
      `}} />
    </div>
  );
}
