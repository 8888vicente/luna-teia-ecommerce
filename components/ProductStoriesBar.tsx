"use client";

import React, { useState, useCallback } from 'react';
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
  const ALL_PRODUCTS = products;
  const [activeIndex, setActiveIndex] = useState(Math.floor(Math.max(1, ALL_PRODUCTS.length) / 2));
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const router = useRouter();

  // Si no hay productos, no renderizar la barra
  if (ALL_PRODUCTS.length === 0) {
    return null;
  }

  const handlePrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + ALL_PRODUCTS.length) % ALL_PRODUCTS.length);
  }, [ALL_PRODUCTS.length]);

  const handleNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % ALL_PRODUCTS.length);
  }, [ALL_PRODUCTS.length]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const touchEndX = event.changedTouches[0]?.clientX;
    if (touchEndX === undefined) return;

    const delta = touchStartX - touchEndX;
    const threshold = 40;

    if (Math.abs(delta) > threshold) {
      if (delta > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    setTouchStartX(null);
  }, [touchStartX, handleNext, handlePrev]);

  const handleClick = (index: number) => {
    if (index === activeIndex) {
      // Si ya está seleccionado, navegar a la tienda y abrir el producto específico
      const p = ALL_PRODUCTS[index];
      const target = `${p.href}?productId=${encodeURIComponent(p.id)}`;
      router.push(target);
    } else {
      // Si no, solo seleccionarlo como el del centro
      setActiveIndex(index);
    }
  };

  // Mostrar 6 a cada lado (13 total en pantalla)
  const VISIBLE_RANGE = 6;

  return (
    <section style={{
      backgroundColor: '#fff',
      padding: '1rem 0 1.25rem',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden'
    }}>
      <p style={{
        textAlign: 'center',
        fontSize: '0.65rem',
        fontWeight: '700',
        letterSpacing: '2px',
        color: '#bdbdbd',
        textTransform: 'uppercase',
        marginBottom: '0.75rem'
      }}>
        Acceso Rápido · Toca para ver · Toca dos veces para ir
      </p>

      {/* Contenedor Coverflow */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: '120px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          perspective: '900px',
          overflow: 'hidden'
        }}>

        {/* Flecha Izquierda */}
        <button
          onClick={handlePrev}
          style={{
            position: 'absolute', left: '1rem', zIndex: 300,
            background: 'rgba(255,255,255,0.9)', border: 'none',
            borderRadius: '50%', width: '28px', height: '28px',
            fontSize: '1rem', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ‹
        </button>

        {/* Burbujas en modo Coverflow */}
        {ALL_PRODUCTS.map((product, index) => {
          let diff = index - activeIndex;
          // Loop circular
          if (diff < -Math.floor(ALL_PRODUCTS.length / 2)) diff += ALL_PRODUCTS.length;
          if (diff > Math.floor(ALL_PRODUCTS.length / 2)) diff -= ALL_PRODUCTS.length;

          // Solo renderizar los que están en rango visible
          if (Math.abs(diff) > VISIBLE_RANGE) return null;

          const isCenter = diff === 0;
          // Separación: 56px por paso → 6 pasos = 336px a cada lado. Centro (78px*1.2=94px) + 672px = ~766px total
          const translateX = diff * 56;
          // Escala: baja suavemente 6% por paso. diff=1→0.94, diff=6→0.64
          const scale = isCenter ? 1.20 : Math.max(0.60, 1 - Math.abs(diff) * 0.062);
          const zIndex = 200 - Math.abs(diff) * 10;
          // Opacidad: curva lineal suave. diff=1→86%, diff=6→42%
          const opacity = isCenter ? 1 : Math.max(0.38, 1 - Math.abs(diff) * 0.115);
          // Blur muy ligero — solo los más alejados tienen algo de difuminado
          const blur = isCenter ? 0 : Math.max(0, (Math.abs(diff) - 1) * 0.35);
          const size = 78; // px — tamaño base de la burbuja

          return (
            <div
              key={product.id}
              onClick={() => handleClick(index)}
              title={isCenter ? `Ir a ${product.name}` : product.name}
              style={{
                position: 'absolute',
                transform: `translateX(${translateX}px) scale(${scale})`,
                zIndex,
                opacity,
                transition: 'all 0.38s cubic-bezier(0.25, 0.8, 0.25, 1)',
                cursor: 'pointer',
              }}
            >
              <div 
                className="bubble-fx-small"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: '50%',
                  backgroundImage: `url(${product.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: isCenter
                    ? `3px solid ${product.colorHex}`
                    : '1.5px solid #EEE',
                  boxShadow: isCenter
                    ? `0 8px 24px ${product.colorHex}55, 0 2px 8px rgba(0,0,0,0.15)`
                    : '0 2px 6px rgba(0,0,0,0.06)',
                  filter: `blur(${blur}px)`,
                  transition: 'transform 0.4s ease-out, box-shadow 0.4s ease-out, filter 0.4s ease-out',
                }}
              />
            </div>
          );
        })}

        {/* Flecha Derecha */}
        <button
          onClick={handleNext}
          style={{
            position: 'absolute', right: '1rem', zIndex: 300,
            background: 'rgba(255,255,255,0.9)', border: 'none',
            borderRadius: '50%', width: '28px', height: '28px',
            fontSize: '1rem', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ›
        </button>
      </div>

      {/* Nombre del producto central + categoría */}
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#212121' }}>
          {ALL_PRODUCTS[activeIndex].name}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#bdbdbd', marginLeft: '0.5rem' }}>
          — toca de nuevo para ir →
        </span>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar { display: none; }
        .bubble-fx-small:hover {
          transform: scale(1.03);
          box-shadow: 0 6px 15px rgba(0,0,0,0.1), 0 0 10px rgba(255,255,255,0.4) !important;
          filter: brightness(1.04) !important;
        }
        .bubble-fx-small:active {
          transform: scale(0.9);
          box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
        }
      `}} />
    </section>
  );
}
