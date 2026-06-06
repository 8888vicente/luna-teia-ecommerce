"use client";

import React, { useCallback, useRef } from 'react';

interface ProductGalleryProps {
  productName: string;
  productImages: string[];
  imageGalleryIndex: number;
  setImageGalleryIndex: React.Dispatch<React.SetStateAction<number>>;
  onOpenFullscreen: (src: string) => void;
}

export default function ProductGallery({
  productName,
  productImages,
  imageGalleryIndex,
  setImageGalleryIndex,
  onOpenFullscreen,
}: ProductGalleryProps) {
  const galleryTouchStart = useRef<{ x: number; t: number } | null>(null);

  const handleGalleryTouchStart = useCallback((e: React.TouchEvent) => {
    if (productImages.length <= 1) return;
    galleryTouchStart.current = { x: e.touches[0].clientX, t: Date.now() };
    e.stopPropagation();
  }, [productImages.length]);

  const handleGalleryTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!galleryTouchStart.current || productImages.length <= 1) return;
    e.stopPropagation();
    const dx = galleryTouchStart.current.x - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
      if (dx > 0 && imageGalleryIndex < productImages.length - 1) {
        setImageGalleryIndex(prev => prev + 1);
      } else if (dx < 0 && imageGalleryIndex > 0) {
        setImageGalleryIndex(prev => prev - 1);
      }
    }
    galleryTouchStart.current = null;
  }, [productImages.length, imageGalleryIndex, setImageGalleryIndex]);

  return (
    <div
      onTouchStart={handleGalleryTouchStart}
      onTouchEnd={handleGalleryTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        backgroundColor: '#fafafa',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        width: `${productImages.length * 100}%`,
        height: '100%',
        transform: `translateX(-${imageGalleryIndex * (100 / productImages.length)}%)`,
        transition: 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
      }}>
        {productImages.map((src, i) => (
          <div
            key={i}
            onClick={() => onOpenFullscreen(src)}
            style={{
              width: `${100 / productImages.length}%`,
              height: '100%',
              cursor: 'zoom-in',
              flexShrink: 0,
            }}
          >
            <img
              src={src}
              alt={`${productName} - vista ${i + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: '0.75rem', right: '0.75rem',
        background: 'rgba(0,0,0,0.5)', color: 'white',
        padding: '0.25rem 0.5rem', borderRadius: '6px',
        fontSize: '0.65rem', fontWeight: '700',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', gap: '0.25rem',
      }}>
        🔍 Toca para ampliar
      </div>

      {productImages.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '0.4rem', zIndex: 5,
        }}>
          {productImages.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setImageGalleryIndex(i); }}
              style={{
                width: i === imageGalleryIndex ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: i === imageGalleryIndex ? '#E53935' : 'rgba(0,0,0,0.25)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
