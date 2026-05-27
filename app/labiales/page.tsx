"use client";

import React, { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { Product, useCart } from "../../context/CartContext";
import { PRODUCTS, FAMILIES } from "../../data/products";
import Coverflow from "../../components/Coverflow";
import ProductModal from "../../components/ProductModal";
import { useRouter, useSearchParams } from 'next/navigation';

export default function LabialesStore() {
  const { addItem } = useCart();
  const [viewMode, setViewMode] = useState<'coverflow' | 'grid'>('coverflow');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const pid = searchParams?.get?.('productId');
    if (!pid) return;
    const prod = PRODUCTS.find(p => p.id === pid);
    if (prod) setSelectedProduct(prod);
  }, [searchParams]);

  return (
    <main className={styles.main}>
      {/* DEBUG: mostrar producto seleccionado (temporal) */}
      {selectedProduct && (
        <div style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 9999, background: '#fff', padding: '0.5rem 0.75rem', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', fontSize: '0.85rem' }}>
          Seleccionado: {selectedProduct.name}
        </div>
      )}
      <header className={styles.hero} style={{ paddingBottom: '1rem' }}>
        <h1 className={styles.heroTitle}>Catálogo de Labiales</h1>
        <p className={styles.heroSubtitle}>
          Realza tu belleza con nuestros tonos irresistibles.
        </p>
        
        {/* Toggle de Vista */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
          <div style={{ backgroundColor: '#ECEFF1', borderRadius: '9999px', padding: '0.25rem', display: 'flex', gap: '0.25rem' }}>
            <button 
              onClick={() => setViewMode('coverflow')}
              style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 'bold', backgroundColor: viewMode === 'coverflow' ? '#FFF' : 'transparent', boxShadow: viewMode === 'coverflow' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', color: viewMode === 'coverflow' ? '#E53935' : '#757575', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }}
            >
              Vista Interactiva
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 'bold', backgroundColor: viewMode === 'grid' ? '#FFF' : 'transparent', boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', color: viewMode === 'grid' ? '#E53935' : '#757575', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }}
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
          paddingTop: '0.5rem', 
          maxWidth: '100vw', 
          overflow: 'hidden',
          background: 'linear-gradient(90deg, #E0E0E0 0%, #F5F5F5 40%, #F5F5F5 60%, #E0E0E0 100%)'
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
                
                <div style={{ display: 'flex', overflowX: 'auto', gap: '1.5rem', paddingBottom: '1rem', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
                  {PRODUCTS.filter(p => p.family === family).map(product => (
                    <div
                      key={product.id}
                      style={{ minWidth: '220px', maxWidth: '220px', border: '1px solid #ECEFF1', borderRadius: '16px', padding: '1rem', textAlign: 'center', scrollSnapAlign: 'start', backgroundColor: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                    >
                      <div
                        onClick={() => setSelectedProduct(product)}
                        style={{ width: '130px', height: '130px', borderRadius: '50%', margin: '0 auto 0.5rem', backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: `0 6px 16px ${product.colorHex}44`, border: `3px solid ${product.colorHex}`, cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.06)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
                      />
                      <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#212121', margin: 0 }}>{product.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: product.colorHex, border: '1px solid #ddd', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.7rem', color: '#9e9e9e', fontWeight: '600' }}>{product.category}</span>
                      </div>
                      <p style={{ fontWeight: '800', fontSize: '1.1rem', color: '#E53935', margin: 0 }}>${product.price} MXN</p>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          style={{ flex: 1, padding: '0.45rem 0.5rem', backgroundColor: '#f5f5f5', color: '#424242', borderRadius: '8px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', border: '1px solid #e0e0e0', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eeeeee'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        >
                          Ver más
                        </button>
                        <button
                          onClick={() => addItem(product)}
                          style={{ flex: 1, padding: '0.45rem 0.5rem', backgroundColor: '#212121', color: 'white', borderRadius: '8px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', border: 'none', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E53935'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#212121'}
                        >
                          + Agregar
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
            // limpiar query sin navegar fuera de la tienda
            try { router.replace('/labiales'); } catch (e) { /* noop */ }
          }}
        />
      )}
    </main>
  );
}