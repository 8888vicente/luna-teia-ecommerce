"use client";

import React from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { isCartOpen, closeCart, items, removeItem, subtotal, shippingCost, totalItems } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

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
          
          {/* Barra de Progreso de Envío */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: shippingCost === 0 ? '#E8F5E9' : '#FFF3E0', borderRadius: '8px', border: `1px solid ${shippingCost === 0 ? '#C8E6C9' : '#FFE0B2'}` }}>
            <p style={{ fontSize: '0.9rem', textAlign: 'center', color: shippingCost === 0 ? '#2E7D32' : '#E65100', fontWeight: 'bold' }}>
              {subtotal === 0 && "Agrega $200 para envío subsidiado"}
              {subtotal > 0 && subtotal < 200 && `¡Agrega $${200 - subtotal} más para envío subsidiado a $50!`}
              {subtotal >= 200 && subtotal < 500 && `¡Agrega $${500 - subtotal} más para ENVÍO GRATIS!`}
              {subtotal >= 500 && "¡Felicidades! Tienes ENVÍO NACIONAL GRATIS 🎉"}
            </p>
          </div>

          {/* Bloque MSI */}
          {subtotal >= 1200 && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              border: '1px solid #ffd70055',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ffd700', letterSpacing: '1px', margin: 0 }}>
                💳 ¡ELEGIBLE PARA MESES SIN INTERESES!
              </p>
              <p style={{ fontSize: '0.7rem', color: '#ffffff99', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                {subtotal >= 4800 ? '3, 6 o 12 MSI disponibles' :
                 subtotal >= 2400 ? '3 o 6 MSI disponibles' :
                 '3 MSI disponibles'} al proceder al pago
              </p>
            </div>
          )}
          {subtotal > 0 && subtotal < 1200 && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              background: '#f5f5f5',
              border: '1px dashed #e0e0e0',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.7rem', color: '#9e9e9e', margin: 0 }}>
                ¡Agrega <strong style={{ color: '#212121' }}>${1200 - subtotal} MXN más</strong> para acceder a meses sin intereses
              </p>
            </div>
          )}

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
              cursor: items.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Proceder al Pago
          </button>
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
