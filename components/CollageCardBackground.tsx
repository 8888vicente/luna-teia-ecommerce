"use client";

import React, { useState, useEffect } from 'react';

// Cuadrante individual que hace un crossfade suave entre sus imágenes
const CrossfadingQuadrant = ({ images, delay }: { images: string[], delay: number }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Iniciar con un retraso para que no todos los cuadrantes cambien al mismo tiempo
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrent(c => (c + 1) % images.length);
      }, 4000); // Cambia cada 4 segundos
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [images.length, delay]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {images.map((src, i) => (
        <div key={src} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${src}')`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: current === i ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out'
        }} />
      ))}
    </div>
  );
};

export default function CollageCardBackground() {
  // Dividimos 16 tonos en 4 grupos para los 4 cuadrantes
  const group1 = ['/Pasion.jpg', '/Rose.jpg', '/Moka.jpg', '/Coral.jpg'];
  const group2 = ['/Rosa Mx.jpg', '/Nature.jpg', '/Fiusha.jpg', '/Terra.jpg'];
  const group3 = ['/Chocolate.jpg', '/Cereza.jpg', '/Secret.jpg', '/Tangerin.jpg'];
  const group4 = ['/Palo Rosa.jpg', '/Marte.jpg', '/Moon.jpg', '/Expresso.jpg'];

  return (
    <div style={{ 
      position: 'absolute', 
      inset: 0, 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gridTemplateRows: '1fr 1fr',
      gap: '2px', // Pequeña separación entre fotos
      backgroundColor: '#FFF' // Fondo de las líneas divisorias
    }}>
      <CrossfadingQuadrant images={group1} delay={0} />
      <CrossfadingQuadrant images={group2} delay={1000} />
      <CrossfadingQuadrant images={group3} delay={2000} />
      <CrossfadingQuadrant images={group4} delay={3000} />
    </div>
  );
}
