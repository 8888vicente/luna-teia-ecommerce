'use client';
import React, { useState, useEffect } from 'react';

const IMAGES = [
  '/logo2.jpeg',
  '/rostro/aniscompleto.png',
  '/rostro/cocoacompleto.png'
];

export default function HeroSliderBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
    }, 5000); // Cambia cada 5 segundos

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
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentIndex ? 1 : 0,
            // Efecto Ken Burns (Zoom in continuo)
            transform: index === currentIndex ? 'scale(1.05)' : 'scale(1)',
            transition: 'opacity 1.5s ease-in-out, transform 6s linear',
            zIndex: 0, // Queda en el fondo
          }}
        />
      ))}
      {/* Capa de oscurecimiento sutil para asegurar que el botón y textos sean legibles */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        zIndex: 1
      }} />
    </>
  );
}
