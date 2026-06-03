'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ProductImageProps {
  src: string;
  srcSecondary?: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  objectFit?: React.CSSProperties['objectFit'];
}

export default function ProductImage({ src, srcSecondary, alt, style, className, onClick, objectFit = 'cover' }: ProductImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSecondary = Boolean(srcSecondary && srcSecondary !== src);

  // Detectar si es dispositivo móvil/touch
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // En móvil, alternar automáticamente entre imágenes cada 2.5 segundos
  useEffect(() => {
    if (!isMobile || !hasSecondary) return;

    const toggleImage = () => {
      setShowSecondary(prev => !prev);
    };

    timerRef.current = setInterval(toggleImage, 2500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isMobile, hasSecondary]);

  const showSecondaryImage = hasSecondary && (isMobile ? showSecondary : isHovered);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          display: 'block',
          transition: 'opacity 400ms ease-in-out',
          opacity: showSecondaryImage ? 0 : 1,
        }}
      />
      {hasSecondary && (
        <img
          src={srcSecondary}
          alt={`${alt} (otra vista)`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit,
            display: 'block',
            transition: 'opacity 400ms ease-in-out',
            opacity: showSecondaryImage ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}
