"use client";

import React, { useState, useEffect } from 'react';
import styles from "../labiales/page.module.css";
import { Product, useCart } from "../../context/CartContext";
import Coverflow from "../../components/Coverflow";
import ProductModal from "../../components/ProductModal";
import { useRouter } from 'next/navigation';

const PRODUCTS = [
  { id: 's1', name: 'Sombra Ceja Clara', family: 'Sombras de Ceja', category: 'Polvo Compacto', price: 95, colorHex: '#d7ccc8', imageUrl: '/sombra-ceja/sombra%20ceja%20clara.jpg' },
  { id: 's2', name: 'Sombra Ceja Media', family: 'Sombras de Ceja', category: 'Polvo Compacto', price: 95, colorHex: '#8d6e63', imageUrl: '/sombra-ceja/sombra%20ceja%20media.jpg' },
  { id: 's3', name: 'Sombra Ceja Negra', family: 'Sombras de Ceja', category: 'Polvo Compacto', price: 95, colorHex: '#4e342e', imageUrl: '/sombra-ceja/sombra%20ceja%20negra.png' },
  { id: 's4', name: 'Sombra Ceja Obscura', family: 'Sombras de Ceja', category: 'Polvo Compacto', price: 95, colorHex: '#212121', imageUrl: '/sombra-ceja/sombra%20ceja%20obscura.jpg' },
];

const FAMILIES = ['Sombras de Ceja'];

export default function SombrasStore() {
  const { addItem } = useCart();
  const [viewMode, setViewMode] = useState<'coverflow' | 'grid'>('coverflow');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pid = new URLSearchParams(window.location.search).get('productId');
    if (!pid) return;
    const prod = PRODUCTS.find(p => p.id === pid);
    if (prod) setSelectedProduct(prod);
  }, []);

  return (
    <main className={styles.main}>
      {/* DEBUG: mostrar producto seleccionado (temporal) */}
      {selectedProduct && (
        <div style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 9999, background: '#fff', padding: '0.5rem 0.75rem', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', fontSize: '0.85rem' }}>
          Seleccionado: {selectedProduct.name}
        </div>
      )}
      <header className={styles.hero} style={{ paddingBottom: '1rem' }}>
        <h1 className={styles.heroTitle}>Sombras de Ceja</h1>
        <p className={styles.heroSubtitle}>
          Define y perfila tu mirada con precisión.
        </p>
        
        {/* Navegación entre tiendas */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <a href="/labiales" style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', backgroundColor: '#757575', color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.75rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#616161'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#757575'}>
            Labiales
          </a>
          <a href="/sombras" style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', backgroundColor: '#E53935', color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.75rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C62828'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#E53935'}>
            Sombras de Ceja
          </a>
          <a href="/delineadores" style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', backgroundColor: '#757575', color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.75rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#616161'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#757575'}>
            Delineadores
          </a>
          <a href="/brillo" style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', backgroundColor: '#757575', color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.75rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#616161'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#757575'}>
            Rímel & Máscara
          </a>
          <a href="/otros" style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', backgroundColor: '#757575', color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.75rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#616161'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#757575'}>
            Otros Productos
          </a>
        </div>
        
        {/* Toggle de Vista */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div style={{ backgroundColor: '#ECEFF1', borderRadius: '9999px', padding: '0.25rem', display: 'flex', gap: '0.25rem', position: 'relative' }}>
            <button 
              onClick={() => setViewMode('coverflow')}
              style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 'bold', backgroundColor: viewMode === 'coverflow' ? '#FFF' : 'transparent', boxShadow: viewMode === 'coverflow' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none', color: viewMode === 'coverflow' ? '#E53935' : '#757575', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)', border: 'none', cursor: 'pointer', transform: viewMode === 'coverflow' ? 'scale(1.02)' : 'scale(1)', zIndex: viewMode === 'coverflow' ? 2 : 1 }}
            >
              Vista Interactiva
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 'bold', backgroundColor: viewMode === 'grid' ? '#FFF' : 'transparent', boxShadow: viewMode === 'grid' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none', color: viewMode === 'grid' ? '#E53935' : '#757575', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)', border: 'none', cursor: 'pointer', transform: viewMode === 'grid' ? 'scale(1.02)' : 'scale(1)', zIndex: viewMode === 'grid' ? 2 : 1 }}
            >
              Vista Clásica
            </button>
          </div>
        </div>
      </header>

      <section 
        id="catalogo" 
        className={styles.productsSection} 
        style={{ 
          paddingTop: '2rem', 
          maxWidth: '100vw', 
          overflow: 'hidden',
          background: 'linear-gradient(90deg, #d7ccc8 0%, #ffffff 40%, #ffffff 60%, #d7ccc8 100%)' // Degradado en tonos tierra/nude
        }}
      >
        {viewMode === 'coverflow' ? (
          <Coverflow products={PRODUCTS} families={FAMILIES} onProductClick={setSelectedProduct} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%', padding: '0 1rem' }}>
            {FAMILIES.map(family => (
              <div key={family} style={{ width: '100%' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '2px solid #E53935', display: 'inline-block' }}>
                  {family}
                </h2>
                
                {/* Carrusel Horizontal para Vista Clásica */}
                <div style={{ display: 'flex', overflowX: 'auto', gap: '1.5rem', paddingBottom: '1rem', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
                  {PRODUCTS.filter(p => p.family === family).map(product => (
                    <div key={product.id} style={{ minWidth: '250px', border: '1px solid #ECEFF1', borderRadius: '8px', padding: '1rem', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer', scrollSnapAlign: 'start', backgroundColor: '#FFF' }}>
                      <div
                        onClick={() => setSelectedProduct(product)}
                        style={{ width: '100%', height: '250px', backgroundColor: '#F5F5F5', borderRadius: '8px', marginBottom: '1rem', backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer', border: '1px solid #E0E0E0' }}
                      />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{product.name}</h3>
                      <p style={{ color: '#757575', marginBottom: '0.5rem', fontSize: '0.8rem' }}>{product.category}</p>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: product.colorHex, margin: '0 auto 1rem auto', border: '1px solid #ccc' }}></div>
                      <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#E53935' }}>${product.price} MXN</p>
                      <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          style={{ padding: '0.65rem 1rem', width: '100%', backgroundColor: '#F5F5F5', color: '#424242', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #E0E0E0' }}
                        >
                          Ver más
                        </button>
                        <button
                          onClick={() => addItem(product)}
                          style={{ padding: '0.65rem 1rem', width: '100%', backgroundColor: '#212121', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            try { router.replace('/sombras'); } catch (e) { /* noop */ }
          }}
        />
      )}
    </main>
  );
}
