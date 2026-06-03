'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  title: string;
  icon: string;
  image: string;
  images?: string[];
  href: string;
}

function CategoryCard({ cat }: { cat: Category }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allImages = cat.images && cat.images.length > 0 ? cat.images : [cat.image];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % allImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  const currentImage = allImages[currentIndex];

  return (
    <Link href={cat.href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          position: 'relative',
          height: 'clamp(220px, 40vw, 350px)',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        {allImages.map((img, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: idx === currentIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
            }}
          />
        ))}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', color: '#FFF' }}>
          <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: '800', margin: 0 }}>{cat.title}</h3>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffcdd2', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            Ver productos →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CategoriesGrid({ categories }: { categories: Category[] }) {
  return (
    <section id="categorias" style={{ padding: 'clamp(2rem, 5vw, 4rem) 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '800', textAlign: 'center', marginBottom: 'clamp(1.5rem, 3vw, 3rem)', color: '#212121' }}>
        Nuestras Categorías
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 40vw, 280px), 1fr))', gap: 'clamp(0.75rem, 2vw, 2rem)' }}>
        {categories.map(cat => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}
      </div>
    </section>
  );
}
