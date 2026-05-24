"use client";

import React from 'react';
import Link from 'next/link';
import ProductStoriesBar from '../components/ProductStoriesBar';

const categories = [
  { id: 'labiales',     title: 'Labiales',       icon: '💄', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80', href: '/labiales' },
  { id: 'sombras',      title: 'Sombras de Ceja', icon: '👁️', image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&q=80', href: '/sombras' },
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
        height: '60vh',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFF',
        padding: '0 2rem'
      }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
          Luna Teia
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', marginBottom: '2rem', lineHeight: '1.6' }}>
          Descubre nuestra colección exclusiva de cosméticos diseñados para resaltar tu belleza única en cada ocasión.
        </p>
        <button
          onClick={() => document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ backgroundColor: '#E53935', color: 'white', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '9999px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(229, 57, 53, 0.4)', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Explorar Tienda
        </button>
      </section>

      {/* ── GRID DE CATEGORÍAS ── */}
      <section id="categorias" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '3rem', color: '#212121' }}>
          Nuestras Categorías
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {categories.map(cat => (
            <Link key={cat.id} href={cat.href} style={{ textDecoration: 'none' }}>
              <div
                style={{ position: 'relative', height: '350px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${cat.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', color: '#FFF' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>{cat.icon}</span>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>{cat.title}</h3>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffcdd2', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    Ver productos →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
