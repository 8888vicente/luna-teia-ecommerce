"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface FullscreenViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function FullscreenViewer({ src, alt, onClose }: FullscreenViewerProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastDistance = useRef<number | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [src]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (lastDistance.current !== null) {
        const delta = distance / lastDistance.current;
        setScale(prev => Math.min(5, Math.max(1, prev * delta)));
      }
      lastDistance.current = distance;
    } else if (e.touches.length === 1 && scale > 1) {
      const touch = e.touches[0];
      if (isDragging.current) {
        const dx = touch.clientX - dragStart.current.x;
        const dy = touch.clientY - dragStart.current.y;
        setTranslate({
          x: translateStart.current.x + dx,
          y: translateStart.current.y + dy,
        });
      }
    }
  }, [scale]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      translateStart.current = { ...translate };
    }
  }, [scale, translate]);

  const handleTouchEnd = useCallback(() => {
    lastDistance.current = null;
    isDragging.current = false;
    if (scale <= 1.05) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [scale]);

  const lastTap = useRef(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (scale > 1.5) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else {
        setScale(3);
      }
    }
    lastTap.current = now;
  }, [scale]);

  return (
    <div
      onClick={(e) => {
        if (scale <= 1) onClose();
        else handleTap();
        e.stopPropagation();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(0,0,0,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        animation: 'fsIn 0.25s ease-out',
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: 'absolute', top: '1rem', right: '1rem', zIndex: 2010,
          width: '40px', height: '40px', borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: 'white', fontSize: '1.3rem', fontWeight: 'bold',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}
      >×</button>

      {scale > 1 && (
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 2010, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.3rem 0.8rem',
          borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backdropFilter: 'blur(4px)',
        }}>
          {Math.round(scale * 100)}% · Toca para cerrar
        </div>
      )}

      <img
        src={src}
        alt={alt}
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
          handleTap();
        }}
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
          objectFit: 'contain',
          transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.2s ease-out',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />
    </div>
  );
}
