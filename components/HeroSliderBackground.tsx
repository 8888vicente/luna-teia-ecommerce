'use client';

import React, { useState, useEffect, useRef } from 'react';

interface HeroSliderBackgroundProps {
  images?: string[];
}

export default function HeroSliderBackground({ images = [] }: HeroSliderBackgroundProps) {
  // Estabilizar la referencia: solo recalcular si la lista REAL cambia
  const prevRef = useRef<string[]>([]);
  const stableImages = (() => {
    const incoming = images.length > 0 ? images : ['/logo2.jpeg'];
    // Comparar por valor, no por referencia
    if (
      prevRef.current.length === incoming.length &&
      prevRef.current.every((src, i) => src === incoming[i])
    ) {
      return prevRef.current; // misma data → misma referencia
    }
    prevRef.current = incoming;
    return incoming;
  })();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Precargar imágenes — solo cuando la lista realmente cambie
  useEffect(() => {
    let cancelled = false;
    setImagesLoaded({});
    stableImages.forEach(src => {
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setImagesLoaded(prev => ({ ...prev, [src]: true }));
      };
      img.onerror = () => {
        if (!cancelled) setImagesLoaded(prev => ({ ...prev, [src]: false }));
      };
      img.src = src;
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableImages]);

  // Cambiar slide automáticamente cada 5 segundos
  useEffect(() => {
    if (stableImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % stableImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [stableImages.length]);

  return (
    <>
      {stableImages.map((src, index) => (
        <div
          key={src}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: imagesLoaded[src] === true ? `url(${src})` : 'none',
            backgroundColor: index === 0 ? '#1a1a2e' : 'transparent',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentIndex ? 1 : 0,
            transform: index === currentIndex ? 'scale(1.05)' : 'scale(1)',
            transition: 'opacity 1.5s ease-in-out, transform 6s linear',
            zIndex: 0,
          }}
        />
      ))}
      {/* Gradiente decorativo que siempre se ve incluso sin imágenes */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, rgba(26,26,46,0.85) 0%, rgba(229,57,53,0.3) 50%, rgba(0,0,0,0.5) 100%)',
        zIndex: 1
      }} />
    </>
  );
}
