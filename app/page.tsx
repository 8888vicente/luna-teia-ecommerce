"use client";

import React from 'react';
import Link from 'next/link';
import ProductStoriesBar from '../components/ProductStoriesBar';
import CollageCardBackground from '../components/CollageCardBackground';
import FacebookReviews from '../components/FacebookReviews';
import HeroSliderBackground from '../components/HeroSliderBackground';

const categories = [
  { id: 'labiales',     title: 'Labiales',       icon: '💄', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80', href: '/labiales' },
  { id: 'sombras',      title: 'Sombras de Ceja', icon: '👁️', image: '/sombra-ceja/scnmt.jpg', href: '/sombras' },
  { id: 'delineadores', title: 'Delineadores',    icon: '🖌️', image: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=600&q=80', href: '/delineadores' },
  { id: 'brillo',       title: 'Rímel',           icon: '✨', image: 'https://images.unsplash.com/photo-1512496015851-a1c8d4f051c0?w=600&q=80', href: '/brillo' },
  { id: 'otros',        title: 'Otros',           icon: '📦', image: 'https://images.unsplash.com/photo-1617220828111-eb2412353ec8?w=600&q=80', href: '/otros' },
];

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>

      {/* ── BANNER DE BURBUJAS tipo Coverflow ── */}
      <ProductStoriesBar />

      {/* ── HERO BANNER ── */}
      <section style={{
        position: 'relative',
        height: 'clamp(60vh, 75vh, 100vh)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 1rem',
        overflow: 'hidden',
        backgroundColor: '#1a1a2e'
      }}>
        <HeroSliderBackground />
        
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <img 
            src="/logo1.jpeg" 
            alt="Luna Teia Cosméticos" 
            style={{ 
              height: 'clamp(60px, 15vw, 140px)', 
              width: 'auto', 
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              backgroundColor: 'rgba(255,255,255,0.95)',
              padding: '0.4rem',
              maxWidth: '80vw'
            }} 
          />
          <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
            Luna Teia Cosméticos
          </h1>
          <p style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
            Descubre nuestra colección exclusiva de cosméticos diseñados para resaltar tu belleza única en cada ocasión.
          </p>
          <button
            onClick={() => document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ backgroundColor: '#E53935', color: 'white', padding: 'clamp(0.7rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', fontWeight: 'bold', borderRadius: '9999px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(229, 57, 53, 0.4)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Explorar Tienda
          </button>
        </div>
      </section>

      {/* ── GRID DE CATEGORÍAS ── */}
      <section id="categorias" style={{ padding: 'clamp(2rem, 5vw, 4rem) 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '800', textAlign: 'center', marginBottom: 'clamp(1.5rem, 3vw, 3rem)', color: '#212121' }}>
          Nuestras Categorías
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 40vw, 280px), 1fr))', gap: 'clamp(0.75rem, 2vw, 2rem)' }}>
          {categories.map(cat => (
            <Link key={cat.id} href={cat.href} style={{ textDecoration: 'none' }}>
              <div
                style={{ position: 'relative', height: 'clamp(220px, 40vw, 350px)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'; }}
              >
                {cat.id === 'labiales' ? (
                  <CollageCardBackground />
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${cat.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                )}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', color: '#FFF' }}>
                  <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: '800', margin: 0 }}>{cat.title}</h3>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffcdd2', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    Ver productos →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN DE RESEÑAS DE FACEBOOK ── */}
      <FacebookReviews />

    </main>
  );
}
