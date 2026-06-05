"use client";

import React, { useState, useEffect } from 'react';
import { Product, useCart } from '../context/CartContext';
import { getProductsByStore, getFamiliesByStore } from '../lib/productService';
import Coverflow from './Coverflow';
import ProductModal from './ProductModal';
import ProductImage from './ProductImage';

interface StoreNavItem { label: string; href: string; }
interface StoreTemplateProps {
  storeName: string;
  title: string;
  subtitle: string;
  gradient: string;
  navItems: StoreNavItem[];
}

export default function StoreTemplate({ storeName, title, subtitle, gradient, navItems }: StoreTemplateProps) {
  const { items, addItem } = useCart();
  const [viewMode, setViewMode] = useState<'coverflow' | 'grid'>('coverflow');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [families, setFamilies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const [prods, fams] = await Promise.all([
        getProductsByStore(storeName),
        getFamiliesByStore(storeName),
      ]);
      if (!cancel) {
        setProducts(prods);
        setFamilies(fams);
        setLoading(false);

        // Leer productId desde la URL para abrir modal automáticamente
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('productId');
        if (productId) {
          const target = prods.find(p => p.id === productId);
          if (target) {
            setSelectedProduct(target);
            setViewMode('grid');
          }
        }
      }
    })();
    setTimeout(() => { if (!cancel) setLoading(false); }, 4000);
    return () => { cancel = true; };
  }, [storeName]);

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E53935', borderTopColor: 'transparent', borderRadius: '50%', animation: 's 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
        <p style={{ color: '#757575', fontWeight: 600, fontSize: '0.85rem' }}>Cargando...</p>
      </div>
      <style>{`@keyframes s{to{transform:rotate(360deg)}}`}</style>
    </main>
  );

  const p = (s: string) => products.filter(x => x.family === s);

  return (
    <main style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      <header style={{ textAlign: 'center', padding: 'clamp(1rem,4vw,3rem) 0.75rem 0.75rem', background: gradient }}>
        <h1 style={{ fontSize: 'clamp(1.2rem,5vw,2.5rem)', fontWeight: 900, color: '#212121', margin: '0 0 0.25rem' }}>{title}</h1>
        <p style={{ fontSize: 'clamp(0.75rem,2vw,1rem)', color: '#616161', margin: '0 auto 0.5rem', padding: '0 0.5rem' }}>{subtitle}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {navItems.map(i => {
            const a = i.href === `/${storeName}`;
            return <a key={i.href} href={i.href} style={{ padding: '0.25rem 0.5rem', borderRadius: 6, background: a ? '#E53935' : '#757575', color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: 'clamp(0.55rem,1.5vw,0.7rem)', whiteSpace: 'nowrap' }}>{i.label}</a>;
          })}
        </div>
        {products.length > 1 && <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#ECEFF1', borderRadius: 9999, padding: '0.2rem', display: 'flex', gap: '0.2rem' }}>
            <button onClick={() => setViewMode('coverflow')} style={{ padding: '0.3rem 0.6rem', borderRadius: 9999, fontWeight: 'bold', fontSize: 'clamp(0.65rem,2vw,0.8rem)', background: viewMode === 'coverflow' ? '#FFF' : 'transparent', boxShadow: viewMode === 'coverflow' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none', color: viewMode === 'coverflow' ? '#E53935' : '#757575', border: 'none', cursor: 'pointer' }}>Carrusel</button>
            <button onClick={() => setViewMode('grid')} style={{ padding: '0.3rem 0.6rem', borderRadius: 9999, fontWeight: 'bold', fontSize: 'clamp(0.65rem,2vw,0.8rem)', background: viewMode === 'grid' ? '#FFF' : 'transparent', boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none', color: viewMode === 'grid' ? '#E53935' : '#757575', border: 'none', cursor: 'pointer' }}>Catálogo</button>
          </div>
        </div>}
      </header>

      <section style={{ paddingTop: '0.25rem', maxWidth: '100vw', overflow: 'hidden', background: gradient }}>
        {products.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#757575' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Sin productos</h3>
            <p style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>Pronto tendremos novedades.</p>
          </div>
        ) : viewMode === 'coverflow' ? (
          <Coverflow products={products} families={families} onProductClick={setSelectedProduct} />
        ) : (
          <div style={{ padding: '0.75rem 0.75rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
            {families.map(f => (
              <div key={f} style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: 'clamp(1.1rem,4.5vw,1.5rem)', fontWeight: '950', margin: '0 0 0.75rem 0.25rem', borderBottom: '3px solid #E53935', display: 'inline-block', color: '#212121', paddingBottom: '0.15rem' }}>{f}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(170px, 25vw, 240px), 1fr))', gap: '0.85rem' }}>
                  {p(f).map(pr => {
                    const q = items.find(i => i.id === pr.id)?.quantity ?? 0;
                    const av = pr.stock !== undefined ? Math.max(0, pr.stock - q) : undefined;
                    const so = av !== undefined && av <= 0;
                    return (
                      <div key={pr.id} style={{ border: '1px solid #ECEFF1', borderRadius: 16, padding: '0.85rem', textAlign: 'center', background: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.45rem', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                        <ProductImage
                          src={pr.imageUrl}
                          srcSecondary={pr.imageUrlSecondary}
                          alt={pr.name}
                          onClick={() => setSelectedProduct(pr)}
                          objectFit="contain"
                          style={{ width: '100%', height: 'clamp(140px, 30vw, 210px)', borderRadius: 10, border: '1px solid #E0E0E0', cursor: 'pointer', marginBottom: '0.2rem', background: '#F5F5F5' }}
                        />
                        <h3 style={{ fontSize: 'clamp(0.85rem,2vw,1.05rem)', fontWeight: 800, color: '#212121', margin: 0, minHeight: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1.25 }}>{pr.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: pr.colorHex, border: '1px solid #ddd', flexShrink: 0 }} />
                          <span style={{ fontSize: 'clamp(0.65rem,1.5vw,0.75rem)', color: '#9e9e9e', fontWeight: 600 }}>{pr.category}</span>
                        </div>
                        <p style={{ fontWeight: 900, fontSize: 'clamp(1rem,2.5vw,1.25rem)', color: '#E53935', margin: 0 }}>${pr.price} <span style={{ fontSize: '0.75rem', color: '#9e9e9e', fontWeight: '500' }}>MXN</span></p>
                        {av !== undefined && (
                          <span style={{ 
                            fontSize: 'clamp(0.65rem,1.5vw,0.75rem)', 
                            color: av > 0 ? '#4CAF50' : '#f44336', 
                            backgroundColor: av > 0 ? '#E8F5E9' : '#FFEBEE',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            fontWeight: 700,
                            display: 'inline-block',
                            margin: '0 auto'
                          }}>
                            {av > 0 ? `${av} disponibles` : 'Agotado'}
                          </span>
                        )}
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
                          <button onClick={() => setSelectedProduct(pr)} style={{ flex: 1, padding: '0.4rem 0.5rem', background: '#f5f5f5', color: '#424242', borderRadius: 8, fontWeight: 700, fontSize: 'clamp(0.7rem,1.5vw,0.8rem)', cursor: 'pointer', border: '1px solid #e0e0e0', transition: 'background 0.2s' }}>Ver</button>
                          {so ? <button disabled style={{ flex: 1, padding: '0.4rem 0.5rem', background: '#9e9e9e', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 'clamp(0.7rem,1.5vw,0.8rem)', border: 'none', opacity: 0.7 }}>Agotado</button>
                          : <button onClick={() => addItem(pr)} style={{ flex: 1, padding: '0.4rem 0.5rem', background: '#212121', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 'clamp(0.7rem,1.5vw,0.8rem)', cursor: 'pointer', border: 'none', transition: 'background 0.2s' }}>+ Carro</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          products={products.filter(p => p.family === selectedProduct.family)}
          onClose={() => setSelectedProduct(null)}
          onNavigate={(p) => setSelectedProduct(p)}
        />
      )}
    </main>
  );
}
