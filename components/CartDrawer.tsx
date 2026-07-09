"use client";

import React from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import TrustBadges from './TrustBadges';

export default function CartDrawer() {
  const { isCartOpen, closeCart, items, removeItem, subtotal, shippingCost, totalItems } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  // ── Shipping progress bar logic ──
  const tiers = [
    { min: 0,   cost: 150, label: '$150', next: 200 },
    { min: 200, cost: 80,  label: '$80',  next: 300 },
    { min: 300, cost: 40,  label: '$40',  next: 400 },
    { min: 400, cost: 0,   label: 'GRATIS', next: null },
  ];
  const currentTierIndex = subtotal >= 400 ? 3 : subtotal >= 300 ? 2 : subtotal >= 200 ? 1 : 0;
  const nextTier = tiers[currentTierIndex].next;
  const amountToNext = nextTier ? nextTier - subtotal : 0;

  // Progress percentage within the bar (0-100)
  const progressPercent = subtotal >= 400 ? 100
    : subtotal >= 300 ? 75 + (25 * (subtotal - 300) / 100)
    : subtotal >= 200 ? 50 + (25 * (subtotal - 200) / 100)
    : Math.min(50, (subtotal / 200) * 50);

  // Shipping message
  let shippingMessage = '';
  let shippingBg = '#FFF3E0';
  let shippingBorder = '#FFE0B2';
  let shippingColor = '#E65100';

  if (subtotal < 200) {
    shippingMessage = subtotal > 0
      ? `📦 Agrega $${200 - subtotal} más para que tu envío baje a $80`
      : '📦 Agrega productos para empezar tu pedido';
  } else if (subtotal < 300) {
    shippingMessage = `🎯 ¡Tu envío bajó a $80! Agrega $${300 - subtotal} más para envío a solo $40`;
  } else if (subtotal < 400) {
    shippingMessage = `✅ ¡Envío a solo $40! Agrega $${400 - subtotal} más para envío GRATIS`;
    shippingBg = '#E3F2FD';
    shippingBorder = '#BBDEFB';
    shippingColor = '#1565C0';
  } else {
    shippingMessage = '🎉 ¡Felicidades! Tienes envío GRATIS';
    shippingBg = '#E8F5E9';
    shippingBorder = '#C8E6C9';
    shippingColor = '#2E7D32';
  }

  return (
    <>
      <div 
        onClick={closeCart}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#FFFFFF',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
        animation: 'slideIn 0.3s ease-out forwards'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #ECEFF1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tu Carrito</h2>
          <button onClick={closeCart} style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#757575', marginTop: '2rem' }}>Tu carrito está vacío.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.map(item => (
                <li key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#F5F5F5', borderRadius: '4px', backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#757575' }}>Cant: {item.quantity}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', color: '#E53935' }}>${item.price * item.quantity}</p>
                    <button onClick={() => removeItem(item.id)} style={{ fontSize: '0.8rem', color: '#757575', textDecoration: 'underline', marginTop: '0.5rem' }}>Quitar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #ECEFF1', backgroundColor: '#FAFAFA' }}>
          
          {/* ── Barra de Progreso de Envío — 4 niveles ── */}
          <div style={{
            marginBottom: '1.25rem',
            padding: '1rem',
            backgroundColor: shippingBg,
            borderRadius: '10px',
            border: `1px solid ${shippingBorder}`,
          }}>
            {/* Mensaje principal */}
            <p style={{
              fontSize: '0.85rem',
              textAlign: 'center',
              color: shippingColor,
              fontWeight: 'bold',
              marginBottom: '0.75rem',
            }}>
              {shippingMessage}
            </p>

            {/* Barra visual de progreso */}
            <div style={{
              position: 'relative',
              height: '6px',
              backgroundColor: '#e0e0e0',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginBottom: '0.5rem',
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: subtotal >= 400
                  ? 'linear-gradient(90deg, #66BB6A, #43A047)'
                  : 'linear-gradient(90deg, #FFB74D, #FF9800)',
                borderRadius: '9999px',
                transition: 'width 0.5s ease',
              }} />
            </div>

            {/* Labels de los 4 niveles */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.6rem',
              fontWeight: '700',
              color: '#9e9e9e',
            }}>
              {tiers.map((tier, i) => (
                <span key={i} style={{
                  color: i <= currentTierIndex ? shippingColor : '#bdbdbd',
                  transition: 'color 0.3s',
                }}>
                  {tier.label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
            <span>Subtotal:</span>
            <span>${subtotal} MXN</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#757575', marginBottom: '1rem', textAlign: 'center' }}>
            Costo de envío estimado: {shippingCost === 0 ? 'Gratis' : `$${shippingCost} MXN`}
          </p>
          <button 
            onClick={handleCheckout}
            disabled={items.length === 0}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              backgroundColor: items.length === 0 ? '#B0BEC5' : '#212121', 
              color: 'white', 
              fontWeight: 'bold', 
              borderRadius: '4px',
              cursor: items.length === 0 ? 'not-allowed' : 'pointer',
              marginBottom: '0.5rem'
            }}
          >
            Proceder al Pago
          </button>
          
          {/* ── Trust Badge con Mercado Pago ── */}
          <TrustBadges variant="compact" />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </>
  );
}
