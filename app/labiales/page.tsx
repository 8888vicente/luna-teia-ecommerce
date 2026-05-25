"use client";

import React, { useState } from 'react';
import styles from "./page.module.css";
import { useCart } from "../../context/CartContext";
import Coverflow from "../../components/Coverflow";
import ProductModal from "../../components/ProductModal";
import { Product } from "../../context/CartContext";

// Catálogo Agrupado (Simulación de la Base de Datos - 10 por categoría)
const PRODUCTS = [
  // ── ROJOS & INTENSOS ──
  { id: 'r1',  name: 'Pasion',        family: 'Rojos', category: 'Labial Indeleble Mate', price: 100, colorHex: '#d50000', imageUrl: '/Pasion.jpg' },
  { id: 'r2',  name: 'Cereza',        family: 'Rojos', category: 'Labial Indeleble Mate', price: 100, colorHex: '#c62828', imageUrl: '/Cereza.jpg' },
  { id: 'r3',  name: 'Rojo Quemado', family: 'Rojos', category: 'Labial Indeleble Mate', price: 100, colorHex: '#b71c1c', imageUrl: '/Rojo Quemado.jpg' },
  { id: 'r4',  name: 'Marte',         family: 'Rojos', category: 'Labial Indeleble Mate', price: 100, colorHex: '#8b1a1a', imageUrl: '/Marte.jpg' },
  { id: 'r5',  name: 'Fresa',         family: 'Rojos', category: 'Labial Indeleble Mate', price: 100, colorHex: '#e53935', imageUrl: '/Fresa.jpg' },
  { id: 'r6',  name: 'Coral',         family: 'Rojos', category: 'Labial Indeleble Mate', price: 100, colorHex: '#ff7043', imageUrl: '/Coral.jpg' },
  { id: 'r7',  name: 'Naranja',       family: 'Rojos', category: 'Labial Indeleble Mate', price: 100, colorHex: '#f4511e', imageUrl: '/Naranja.jpg' },
  { id: 'r8',  name: 'Naranja Mate',  family: 'Rojos', category: 'Labial Indeleble Mate', price: 100, colorHex: '#e64a19', imageUrl: '/Naranja Mate.jpg' },
  { id: 'r9',  name: 'Tangerin',      family: 'Rojos', category: 'Labial Indeleble Mate', price: 100, colorHex: '#ff6d00', imageUrl: '/Tangerin.jpg' },
  { id: 'r10', name: 'Mamey',         family: 'Rojos', category: 'Labial Indeleble Mate', price: 100, colorHex: '#d84315', imageUrl: '/Mamey_.jpg' },
  // ── ROSAS & FUCSIAS ──
  { id: 'p1',  name: 'Fiusha',        family: 'Rosas', category: 'Labial Indeleble Mate', price: 100, colorHex: '#e91e8c', imageUrl: '/Fiusha.jpg' },
  { id: 'p2',  name: 'Fiusha Mate',   family: 'Rosas', category: 'Labial Indeleble Mate', price: 100, colorHex: '#c2185b', imageUrl: '/Fiusha mate.jpg' },
  { id: 'p3',  name: 'Rosa Neon',     family: 'Rosas', category: 'Labial Indeleble Mate', price: 100, colorHex: '#f50057', imageUrl: '/Rosa Neon.jpg' },
  { id: 'p4',  name: 'Rosa Mx',       family: 'Rosas', category: 'Labial Indeleble Mate', price: 100, colorHex: '#ec407a', imageUrl: '/Rosa Mx.jpg' },
  { id: 'p5',  name: 'Rose',          family: 'Rosas', category: 'Labial Indeleble Mate', price: 100, colorHex: '#f06292', imageUrl: '/Rose.jpg' },
  { id: 'p6',  name: 'Rosa Seda',     family: 'Rosas', category: 'Labial Indeleble Mate', price: 100, colorHex: '#f48fb1', imageUrl: '/Rosa Seda.jpg' },
  { id: 'p7',  name: 'Palo Rosa',     family: 'Rosas', category: 'Labial Indeleble Mate', price: 100, colorHex: '#f8bbd0', imageUrl: '/Palo Rosa.jpg' },
  { id: 'p8',  name: 'Bugambilia',    family: 'Rosas', category: 'Labial Indeleble Mate', price: 100, colorHex: '#ad1457', imageUrl: '/Bugambilia.jpg' },
  { id: 'p9',  name: 'Anis',          family: 'Rosas', category: 'Labial Indeleble Mate', price: 100, colorHex: '#d81b60', imageUrl: '/Anis_.jpg' },
  { id: 'p10', name: 'Moon',          family: 'Rosas', category: 'Labial Indeleble Mate', price: 100, colorHex: '#e8a0bf', imageUrl: '/Moon.jpg' },
  // ── VARIOS: NUDES, OSCUROS & ESPECIALES ──
  { id: 'v1',  name: 'Nature',        family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#d7ccc8', imageUrl: '/Nature.jpg' },
  { id: 'v2',  name: 'Secret',        family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#bcaaa4', imageUrl: '/Secret.jpg' },
  { id: 'v3',  name: 'Terra',         family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#a1887f', imageUrl: '/Terra.jpg' },
  { id: 'v4',  name: 'Caramelo',      family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#bf8c6a', imageUrl: '/Caramelo.jpg' },
  { id: 'v5',  name: 'Moka',          family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#795548', imageUrl: '/Moka.jpg' },
  { id: 'v6',  name: 'Chocolate',     family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#5d4037', imageUrl: '/Chocolate.jpg' },
  { id: 'v7',  name: 'Expresso',      family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#4e342e', imageUrl: '/Expresso.jpg' },
  { id: 'v8',  name: 'Cocoa',         family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#6d4c41', imageUrl: '/Cocoa.jpg' },
  { id: 'v9',  name: 'Ciruela',       family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#6a1b9a', imageUrl: '/Ciruela.jpg' },
  { id: 'v10', name: 'Blackberry',    family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#4a148c', imageUrl: '/Blackberry_.jpg' },
  // Tonos extra que no entran en 10x3 pero están en tu catálogo real
  { id: 'x1',  name: 'Purpura',       family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#7b1fa2', imageUrl: '/Purpura.jpg' },
  { id: 'x2',  name: 'Piñon',         family: 'Varios', category: 'Labial Indeleble Mate', price: 100, colorHex: '#8d6e63', imageUrl: '/Piñon.jpg' },
  { id: 'x3',  name: 'Oro Sol',       family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, colorHex: '#ffd54f', imageUrl: '/Oro Sol.jpg' },
];

const FAMILIES = ['Rojos', 'Rosas', 'Varios'];


export default function LabialesStore() {
  const { addItem } = useCart();
  const [viewMode, setViewMode] = useState<'coverflow' | 'grid'>('coverflow');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <main className={styles.main}>
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
          background: 'linear-gradient(90deg, #E0E0E0 0%, #F5F5F5 40%, #F5F5F5 60%, #E0E0E0 100%)' // Degradado gris suave
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
                    <div
                      key={product.id}
                      style={{ minWidth: '220px', maxWidth: '220px', border: '1px solid #ECEFF1', borderRadius: '16px', padding: '1rem', textAlign: 'center', scrollSnapAlign: 'start', backgroundColor: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                    >
                      {/* Foto circular */}
                      <div
                        onClick={() => setSelectedProduct(product)}
                        style={{ width: '130px', height: '130px', borderRadius: '50%', margin: '0 auto 0.5rem', backgroundImage: `url(${product.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: `0 6px 16px ${product.colorHex}44`, border: `3px solid ${product.colorHex}`, cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.06)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
                      />
                      {/* Nombre */}
                      <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#212121', margin: 0 }}>{product.name}</h3>
                      {/* Burbuja de color + categoría */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: product.colorHex, border: '1px solid #ddd', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.7rem', color: '#9e9e9e', fontWeight: '600' }}>{product.category}</span>
                      </div>
                      {/* Precio */}
                      <p style={{ fontWeight: '800', fontSize: '1.1rem', color: '#E53935', margin: 0 }}>${product.price} MXN</p>
                      {/* Botones */}
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

      {/* Modal de descripción */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}
