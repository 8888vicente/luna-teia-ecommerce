"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Todos los productos con sus imágenes REALES de las tiendas
const ALL_PRODUCTS = [
  // ── ROJOS & INTENSOS ──
  { id: 'r1',  name: 'Pasion',        href: '/labiales', colorHex: '#d50000', imageUrl: '/Pasion.jpg' },
  { id: 'r2',  name: 'Cereza',        href: '/labiales', colorHex: '#c62828', imageUrl: '/Cereza.jpg' },
  { id: 'r3',  name: 'Rojo Quemado',  href: '/labiales', colorHex: '#b71c1c', imageUrl: '/Rojo_Quemado.jpg' },
  { id: 'r4',  name: 'Marte',         href: '/labiales', colorHex: '#8b1a1a', imageUrl: '/Marte.jpg' },
  { id: 'r5',  name: 'Fresa',         href: '/labiales', colorHex: '#e53935', imageUrl: '/Fresa.jpg' },
  { id: 'r6',  name: 'Coral',         href: '/labiales', colorHex: '#ff7043', imageUrl: '/Coral.jpg' },
  { id: 'r7',  name: 'Naranja',       href: '/labiales', colorHex: '#f4511e', imageUrl: '/Naranja.jpg' },
  { id: 'r8',  name: 'Naranja Mate',  href: '/labiales', colorHex: '#e64a19', imageUrl: '/Naranja_Mate.jpg' },
  { id: 'r9',  name: 'Tangerin',      href: '/labiales', colorHex: '#ff6d00', imageUrl: '/Tangerin.jpg' },
  { id: 'r10', name: 'Mamey',         href: '/labiales', colorHex: '#d84315', imageUrl: '/Mamey_.jpg' },
  { id: 'r11', name: 'Oro Sol',       href: '/labiales', colorHex: '#ffd54f', imageUrl: '/Oro_Sol.jpg' },
  // ── ROSAS & FUCSIAS ──
  { id: 'p1',  name: 'Fiusha',        href: '/labiales', colorHex: '#e91e8c', imageUrl: '/Fiusha.jpg' },
  { id: 'p2',  name: 'Fiusha Mate',   href: '/labiales', colorHex: '#c2185b', imageUrl: '/Fiusha_mate.jpg' },
  { id: 'p3',  name: 'Rosa Neon',     href: '/labiales', colorHex: '#f50057', imageUrl: '/Rosa_Neon.jpg' },
  { id: 'p4',  name: 'Rosa Mx',       href: '/labiales', colorHex: '#ec407a', imageUrl: '/Rosa_Mx.jpg' },
  { id: 'p5',  name: 'Rose',          href: '/labiales', colorHex: '#f06292', imageUrl: '/Rose.jpg' },
  { id: 'p6',  name: 'Rosa Seda',     href: '/labiales', colorHex: '#f48fb1', imageUrl: '/Rosa_Seda.jpg' },
  { id: 'p7',  name: 'Palo Rosa',     href: '/labiales', colorHex: '#f8bbd0', imageUrl: '/Palo_Rosa.jpg' },
  { id: 'p8',  name: 'Bugambilia',    href: '/labiales', colorHex: '#ad1457', imageUrl: '/Bugambilia.jpg' },
  { id: 'p9',  name: 'Anis',          href: '/labiales', colorHex: '#d81b60', imageUrl: '/Anis_.jpg' },
  { id: 'p10', name: 'Moon',          href: '/labiales', colorHex: '#e8a0bf', imageUrl: '/Moon.jpg' },
  // ── VARIOS: NUDES, OSCUROS & ESPECIALES ──
  { id: 'v1',  name: 'Nature',        href: '/labiales', colorHex: '#d7ccc8', imageUrl: '/Nature.jpg' },
  { id: 'v2',  name: 'Secret',        href: '/labiales', colorHex: '#bcaaa4', imageUrl: '/Secret.jpg' },
  { id: 'v3',  name: 'Terra',         href: '/labiales', colorHex: '#a1887f', imageUrl: '/Terra.jpg' },
  { id: 'v4',  name: 'Caramelo',      href: '/labiales', colorHex: '#bf8c6a', imageUrl: '/Caramelo.jpg' },
  { id: 'v5',  name: 'Moka',          href: '/labiales', colorHex: '#795548', imageUrl: '/Moka.jpg' },
  { id: 'v6',  name: 'Chocolate',     href: '/labiales', colorHex: '#5d4037', imageUrl: '/Chocolate.jpg' },
  { id: 'v7',  name: 'Expresso',      href: '/labiales', colorHex: '#4e342e', imageUrl: '/Expresso.jpg' },
  { id: 'v8',  name: 'Cocoa',         href: '/labiales', colorHex: '#6d4c41', imageUrl: '/Cocoa.jpg' },
  { id: 'v9',  name: 'Ciruela',       href: '/labiales', colorHex: '#6a1b9a', imageUrl: '/Ciruela.jpg' },
  { id: 'v10', name: 'Blackberry',    href: '/labiales', colorHex: '#4a148c', imageUrl: '/Blackberry_.jpg' },
  { id: 'v11', name: 'Purpura',       href: '/labiales', colorHex: '#7b1fa2', imageUrl: '/Purpura.jpg' },
  { id: 'v12', name: 'Piñon',         href: '/labiales', colorHex: '#8d6e63', imageUrl: '/Piñon.jpg' },
  // ── SOMBRAS DE CEJA (4 tonos) ──
  { id: 's1', name: 'Sombra Ceja Clara',  href: '/sombras',      colorHex: '#d7ccc8', imageUrl: '/sombra-ceja/sombra%20ceja%20clara.jpg' },
  { id: 's2', name: 'Sombra Ceja Media',  href: '/sombras',      colorHex: '#8d6e63', imageUrl: '/sombra-ceja/sombra%20ceja%20media.jpg' },
  { id: 's3', name: 'Sombra Ceja Oscura', href: '/sombras',      colorHex: '#4e342e', imageUrl: '/sombra-ceja/sombra%20ceja%20obscura.jpg' },
  { id: 's4', name: 'Sombra Ceja Negra',  href: '/sombras',      colorHex: '#212121', imageUrl: '/sombra-ceja/sombra%20ceja%20negra.png' },
  // ── DELINEADORES (5 tonos) ──
  { id: 'd1', name: 'Deli. Negro',   href: '/delineadores', colorHex: '#000000', imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400&q=80' },
  { id: 'd2', name: 'Deli. Azul',    href: '/delineadores', colorHex: '#0d47a1', imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400&q=80' },
  { id: 'd3', name: 'Deli. Plata',   href: '/delineadores', colorHex: '#bdbdbd', imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400&q=80' },
  { id: 'd4', name: 'Deli. Gris',    href: '/delineadores', colorHex: '#757575', imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400&q=80' },
  { id: 'd5', name: 'Deli. Oro',     href: '/delineadores', colorHex: '#ffd700', imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400&q=80' },
  // ── RÍMEL (3 tipos) ──
  { id: 'rl1', name: 'Rímel Volumen', href: '/brillo', colorHex: '#212121', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a1c8d4f051c0?w=400&q=80' },
  { id: 'rl2', name: 'Rímel Largo',   href: '/brillo', colorHex: '#000000', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a1c8d4f051c0?w=400&q=80' },
  { id: 'rl3', name: 'Rímel Rizador', href: '/brillo', colorHex: '#1a237e', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a1c8d4f051c0?w=400&q=80' },
  // ── BRILLO LABIAL (2 tonos) ──
  { id: 'b1', name: 'Brillo Rosa', href: '/otros', colorHex: '#f48fb1', imageUrl: 'https://images.unsplash.com/photo-1617220828111-eb2412353ec8?w=400&q=80' },
  { id: 'b2', name: 'Brillo Nude', href: '/otros', colorHex: '#ffccbc', imageUrl: 'https://images.unsplash.com/photo-1617220828111-eb2412353ec8?w=400&q=80' },
];

export default function ProductStoriesBar() {
  const [activeIndex, setActiveIndex] = useState(3); // Empieza en el centro
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const router = useRouter();

  const handlePrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + ALL_PRODUCTS.length) % ALL_PRODUCTS.length);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % ALL_PRODUCTS.length);
  }, []);

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
