import React from 'react';
import ProductStoriesBar from '../components/ProductStoriesBar';
import FacebookReviews from '../components/FacebookReviews';
import HeroSliderBackground from '../components/HeroSliderBackground';
import HeroButton from '../components/HeroButton';
import CategoriesGrid from '../components/CategoriesGrid';
import { getProductsByStore } from '../lib/productService';

const DEFAULT_CATEGORIES = [
  { id: 'labiales',     title: 'Labiales',       icon: '💄', href: '/labiales' },
  { id: 'sombras',      title: 'Sombras de Ceja', icon: '👁️', href: '/sombras' },
  { id: 'delineadores', title: 'Delineadores',    icon: '🖌️', href: '/delineadores' },
  { id: 'brillo',       title: 'Rímel',           icon: '✨', href: '/brillo' },
  { id: 'otros',        title: 'Otros',           icon: '📦', href: '/otros' },
];

async function getCategoryImages() {
  const categories = await Promise.all(
    DEFAULT_CATEGORIES.map(async (cat) => {
      try {
        const products = await getProductsByStore(cat.id);
        const image = products[0]?.imageUrl || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80';
        return { ...cat, image };
      } catch {
        return { ...cat, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80' };
      }
    })
  );
  return categories;
}

async function getHeroImages() {
  try {
    const stores = ['labiales', 'sombras', 'delineadores', 'brillo', 'otros'];
    const images = await Promise.all(
      stores.map(async (store) => {
        try {
          const products = await getProductsByStore(store);
          return products[Math.floor(Math.random() * Math.min(3, products.length))]?.imageUrl;
        } catch {
          return undefined;
        }
      })
    );
    return images.filter((img) => img !== undefined) as string[];
  } catch {
    return [];
  }
}

async function getAllProducts() {
  try {
    const stores = ['labiales', 'sombras', 'delineadores', 'brillo', 'otros'];
    const allProducts = await Promise.all(
      stores.map(async (store) => {
        try {
          const products = await getProductsByStore(store);
          return products.map(p => ({
            id: p.id,
            name: p.name,
            href: `/${store}`,
            colorHex: p.colorHex,
            imageUrl: p.imageUrl
          }));
        } catch {
          return [];
        }
      })
    );
    return allProducts.flat();
  } catch {
    return [];
  }
}

export default async function Home() {
  const [categories, heroImages, storyProducts] = await Promise.all([
    getCategoryImages(),
    getHeroImages(),
    getAllProducts()
  ]);
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>

      {/* ── BANNER DE BURBUJAS tipo Coverflow ── */}
      <ProductStoriesBar products={storyProducts} />

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
        <HeroSliderBackground images={heroImages} />
        
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
            Luna Teia Cosméticos
          </h1>
          <p style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
            Descubre nuestra colección exclusiva de cosméticos diseñados para resaltar tu belleza única en cada ocasión.
          </p>
        </div>

        <div style={{ position: 'absolute', left: '50%', bottom: 'clamp(1.5rem, 3vw, 3rem)', transform: 'translateX(-50%) translateY(0)', zIndex: 3 }}>
          <HeroButton />
        </div>
      </section>

      <CategoriesGrid categories={categories} />

      {/* ── SECCIÓN DE RESEÑAS DE FACEBOOK ── */}
      <FacebookReviews />

    </main>
  );
}
