'use client';

import React, { useState, useEffect } from 'react';

const IMAGES = [
  '/logo2.jpeg',
  '/rostro/aniscompleto.png',
  '/rostro/cocoacompleto.png'
];

export default function HeroSliderBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Precargar imágenes
  useEffect(() => {
    IMAGES.forEach(src => {
      const img = new Image();
      img.onload = () => setImagesLoaded(prev => ({ ...prev, [src]: true }));
      img.onerror = () => setImagesLoaded(prev => ({ ...prev, [src]: false }));
      img.src = src;
    });
  }, []);

  // Cambiar slide automáticamente cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {IMAGES.map((src, index) => (
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
