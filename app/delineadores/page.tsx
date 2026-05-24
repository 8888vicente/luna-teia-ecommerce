"use client";

import React, { useState } from 'react';
import styles from "../labiales/page.module.css";
import { useCart } from "../../context/CartContext";
import Coverflow from "../../components/Coverflow";

const PRODUCTS = [
  { id: 'd1', name: 'Delineador Negro', family: 'Delineadores', category: 'Líquido Indeleble', price: 85, colorHex: '#000000', imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400&q=80' },
  { id: 'd2', name: 'Delineador Azul', family: 'Delineadores', category: 'Líquido Indeleble', price: 85, colorHex: '#0d47a1', imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400&q=80' },
  { id: 'd3', name: 'Delineador Plata', family: 'Delineadores', category: 'Líquido Indeleble', price: 85, colorHex: '#e0e0e0', imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400&q=80' },
  { id: 'd4', name: 'Delineador Gris', family: 'Delineadores', category: 'Líquido Indeleble', price: 85, colorHex: '#757575', imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400&q=80' },
  { id: 'd5', name: 'Delineador Oro', family: 'Delineadores', category: 'Líquido Indeleble', price: 85, colorHex: '#ffd700', imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400&q=80' },
];

const FAMILIES = ['Delineadores'];

export default function DelineadoresStore() {
  const { addItem } = useCart();
  const [viewMode, setViewMode] = useState<'coverflow' | 'grid'>('coverflow');

  return (
    <main className={styles.main}>
      <header className={styles.hero} style={{ paddingBottom: '1rem' }}>
        <h1 className={styles.heroTitle}>Ojos que Impactan</h1>
        <p className={styles.heroSubtitle}>
          Descubre nuestra línea de delineadores y rímel para una mirada inolvidable.
        </p>
        
        {/* Toggle de Vista */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
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
          paddingTop: '2rem', 
          maxWidth: '100vw', 
          overflow: 'hidden',
          // Degradado en tonos azul grisáceo (ideal para ojos)
          background: 'linear-gradient(90deg, #cfd8dc 0%, #ffffff 40%, #ffffff 60%, #cfd8dc 100%)' 
        }}
      >
        {viewMode === 'coverflow' ? (
          <Coverflow products={PRODUCTS} families={FAMILIES} />
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
                      <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#F5F5F5', borderRadius: '50%', marginBottom: '1rem', backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}></div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{product.name}</h3>
                      <p style={{ color: '#757575', marginBottom: '0.5rem', fontSize: '0.8rem' }}>{product.category}</p>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: product.colorHex, margin: '0 auto 1rem auto', border: '1px solid #ccc' }}></div>
                      <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#E53935' }}>${product.price} MXN</p>
                      <button 
                        onClick={() => addItem(product)}
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem', width: '100%', backgroundColor: '#212121', color: 'white', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                      >
                        Agregar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
