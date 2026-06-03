'use client';

import React, { useState } from 'react';

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
  const hasSecondary = Boolean(srcSecondary && srcSecondary !== src);

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
          opacity: isHovered && hasSecondary ? 0 : 1,
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
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}
    </div>
  );
}
