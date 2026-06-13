import React from 'react';
export const revalidate = 0;
import ProductStoriesBar from '../../components/ProductStoriesBar';
import FacebookReviews from '../../components/FacebookReviews';
import HeroSliderBackground from '../../components/HeroSliderBackground';
import CategoriesGrid from '../../components/CategoriesGrid';
import { getProductsByStore } from '../../lib/productService';

const DEFAULT_CATEGORIES = [
  { id: 'labiales',     title: 'Labiales',        icon: '💄', href: '/labiales' },
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
        const images = products.map((p) => p.imageUrl);
        const image =
          images[0] ||
          'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80';
        return { ...cat, image, images };
      } catch {
        return {
          ...cat,
          image:
            'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80',
          images: [],
        };
      }
    })
  );
  return categories.filter(cat => cat.images.length > 0);
}

async function getAllProducts() {
  try {
    const stores = ['labiales', 'sombras', 'delineadores', 'brillo', 'otros'];
    const allProducts = await Promise.all(
      stores.map(async (store) => {
        try {
          const products = await getProductsByStore(store);
          return products.map((p) => ({
            id: p.id,
            name: p.name,
            href: `/${store}`,
            colorHex: p.colorHex,
            imageUrl: p.imageUrl,
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
  const [categories, storyProducts] = await Promise.all([
    getCategoryImages(),
    getAllProducts(),
  ]);
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* ── BANNER DE BURBUJAS tipo Coverflow ── */}
      <ProductStoriesBar products={storyProducts} />

      {/* ── HERO BANNER ── */}
      <section
        style={{
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
          backgroundColor: '#1a1a2e',
        }}
      >
        <HeroSliderBackground />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 'clamp(1.5rem, 3vw, 3rem)',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0 1rem',
          }}
        >
          <h1
            style={{
              color: 'white',
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 900,
              textShadow: '0 4px 12px rgba(0,0,0,0.5)',
              margin: 0,
              letterSpacing: '-1px',
            }}
          >
            Luna Teia Cosméticos
          </h1>
          <p
            style={{
              color: '#f5f5f5',
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              maxWidth: '600px',
              fontWeight: 500,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              margin: '0 auto',
            }}
          >
            Descubre nuestra colección exclusiva de cosméticos diseñados para
            resaltar tu belleza única en cada ocasión.
          </p>
        </div>
      </section>

      <CategoriesGrid categories={categories} />

      {/* ── SECCIÓN DE RESEÑAS DE FACEBOOK ── */}
      <FacebookReviews />
    </main>
  );
}
