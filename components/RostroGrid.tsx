'use client';

import React, { useState, useEffect } from 'react';

const ROSTRO_IMAGES = [
  '/images/rostro/aniscomred.webp',
  '/images/rostro/Chocolatecomred.webp',
  '/images/rostro/cocoacomred.webp',
  '/images/rostro/mameycomred.webp',
  '/images/rostro/martecomred.webp',
  '/images/rostro/pasioncomred.webp',
  '/images/rostro/purpuracomred.webp',
  '/images/rostro/rojoqcomred.webp',
  '/images/rostro/rosamxcomred.webp',
  '/images/rostro/terracomred.webp',
];

export default function RostroGrid() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cambiar imagen automáticamente cada 3 segundos con fade
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ROSTRO_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(200px, 40vw, 350px)',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
      }}
    >
      {ROSTRO_IMAGES.map((src, index) => (
        <div
          key={src}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
          }}
        />
      ))}

      {/* Gradiente overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 70%, rgba(250,250,250,1) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
