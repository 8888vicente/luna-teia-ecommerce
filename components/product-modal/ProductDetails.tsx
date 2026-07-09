"use client";

import { useCart, Product } from '../../context/CartContext';

interface ProductDetailsProps {
  product: Product;
  products: Product[];
  description: string;
  availableQuantity: number | undefined;
  currentIndex: number;
  onNavigate: (product: Product) => void;
}

export default function ProductDetails({
  product,
  products,
  description,
  availableQuantity,
  currentIndex,
  onNavigate,
}: ProductDetailsProps) {
  const { addItem } = useCart();
  
  return (
    <div style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          backgroundColor: product.colorHex, border: '2px solid #fff',
          boxShadow: `0 3px 10px ${product.colorHex}66`,
          marginTop: '0.1rem',
        }} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#212121', margin: 0, lineHeight: 1.2 }}>
            {product.name}
          </h2>
          <p style={{
            fontSize: '0.72rem', color: '#9e9e9e', fontWeight: '600',
            letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0.2rem 0 0',
          }}>
            {product.category} · Mia Terra
          </p>
          <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#4CAF50', fontWeight: '700', margin: 0 }}>
              ✓ Miles de clientas atendidas desde 2018
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6A1B9A', fontWeight: '700', margin: 0 }}>
              ✓ Las clientas suelen elegir entre 3 y 5 tonos por pedido
            </p>
            <p style={{ fontSize: '0.75rem', color: '#E65100', fontWeight: '700', margin: 0 }}>
              🚚 Al comprar 3 labiales tu envío es de solo $40
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.75rem 0' }}>
        <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#E53935' }}>
          ${product.price}
        </span>
        <span style={{ fontSize: '0.85rem', color: '#9e9e9e', fontWeight: '500' }}>MXN</span>
        {availableQuantity !== undefined && availableQuantity <= 0 && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.75rem', fontWeight: '700',
            color: '#f44336',
            backgroundColor: '#FFEBEE',
            padding: '0.2rem 0.5rem', borderRadius: '9999px',
          }}>
            Agotado
          </span>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '0 0 0.75rem' }} />

      <p style={{
        fontSize: '0.9rem', lineHeight: '1.55', color: '#424242', margin: '0 0 0.75rem',
      }}>
        {description}
      </p>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0 0 1rem' }}>
        {['🌿 Natural', '🐰 Vegano', '✨ Sin Parabenos'].map(tag => (
          <span key={tag} style={{
            fontSize: '0.68rem', fontWeight: '700',
            padding: '0.25rem 0.6rem', borderRadius: '9999px',
            backgroundColor: '#f1f8e9', color: '#558b2f',
            border: '1px solid #c5e1a5',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Badges Dinámicos */}
      {(() => {
        const topSellers = ['Ciruela', 'Terra', 'Marte', 'Chocolate', 'Rojo', 'Anis', 'Blackberry'];
        const trending = ['Rose', 'Expresso', 'Moka', 'Purpura', 'Naranja Mate'];
        
        if (topSellers.some(t => product.name.toLowerCase().includes(t.toLowerCase()))) {
          return (
            <div style={{ margin: '0 0 1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', backgroundColor: '#FFF3E0', color: '#E65100', padding: '0.3rem 0.8rem', borderRadius: '9999px', border: '1px solid #FFCC80' }}>
                🏆 Favorito histórico
              </span>
            </div>
          );
        }
        if (trending.some(t => product.name.toLowerCase().includes(t.toLowerCase()))) {
          return (
            <div style={{ margin: '0 0 1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', backgroundColor: '#FCE4EC', color: '#C2185B', padding: '0.3rem 0.8rem', borderRadius: '9999px', border: '1px solid #F48FB1' }}>
                🔥 Tendencia actual
              </span>
            </div>
          );
        }
        return null;
      })()}

      {/* Upsell Automático */}
      {(() => {
        const upsellMap: Record<string, string> = {
          'chocolate': 'Terra',
          'ciruela': 'Marte',
          'anis': 'Chocolate',
          'expresso': 'Blackberry',
          'naranja mate': 'Rojo',
          'rojo quemado': 'Blackberry',
          'purpura': 'Blackberry',
          'marte': 'Ciruela',
          'blackberry': 'Ciruela',
          'vino': 'Blackberry'
        };

        const targetToneName = Object.keys(upsellMap).find(k => product.name.toLowerCase().includes(k));
        if (!targetToneName) return null;
        
        const upsellTone = upsellMap[targetToneName];
        const upsellProduct = products.find(p => p.name.toLowerCase().includes(upsellTone.toLowerCase()));
        
        if (!upsellProduct) return null;

        return (
          <div style={{ backgroundColor: '#F3E5F5', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem', border: '1px solid #E1BEE7' }}>
            <p style={{ fontSize: '0.85rem', color: '#6A1B9A', fontWeight: '700', margin: '0 0 0.5rem' }}>
              ✨ Combinación popular:
            </p>
            <p style={{ fontSize: '0.8rem', color: '#4A148C', margin: '0 0 0.5rem' }}>
              💄 Elegido frecuentemente por nuestras clientas junto con <strong>{product.name}</strong>.
            </p>
            <button 
              onClick={(e) => {
                e.preventDefault();
                addItem(upsellProduct);
              }}
              style={{
                backgroundColor: '#9C27B0', color: 'white', padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', width: '100%'
              }}>
              Agregar {upsellProduct.name} (+${upsellProduct.price})
            </button>
          </div>
        );
      })()}

      {products.length > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem', margin: '0 0 0.5rem',
          padding: '0.5rem', borderRadius: '12px',
          backgroundColor: '#fafafa',
        }}>
          <button
            onClick={() => currentIndex > 0 && onNavigate(products[currentIndex - 1])}
            disabled={currentIndex <= 0}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: currentIndex > 0 ? '#f0f0f0' : 'transparent',
              border: 'none', cursor: currentIndex > 0 ? 'pointer' : 'default',
              fontSize: '1rem', color: currentIndex > 0 ? '#424242' : '#e0e0e0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >‹</button>
          <span style={{ fontSize: '0.72rem', color: '#9e9e9e', fontWeight: '600' }}>
            {currentIndex + 1} / {products.length} · Desliza para navegar
          </span>
          <button
            onClick={() => currentIndex < products.length - 1 && onNavigate(products[currentIndex + 1])}
            disabled={currentIndex >= products.length - 1}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: currentIndex < products.length - 1 ? '#f0f0f0' : 'transparent',
              border: 'none', cursor: currentIndex < products.length - 1 ? 'pointer' : 'default',
              fontSize: '1rem', color: currentIndex < products.length - 1 ? '#424242' : '#e0e0e0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >›</button>
        </div>
      )}
    </div>
  );
}
