"use client";

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { items, subtotal, shippingCost } = useCart();
  const [isPaying, setIsPaying] = useState(false);
  const total = subtotal + shippingCost;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsPaying(true);
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(item => ({ id: item.id, quantity: item.quantity })) }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data?.message ?? 'No se pudo procesar el pago. Por favor intenta de nuevo.');
        setIsPaying(false);
        return;
      }

      // Prefer sandbox_init_point when está disponible (pruebas)
      const url = data.sandbox_init_point ?? data.init_point;
      if (!url) {
        alert('No se obtuvo una URL de pago. Intenta nuevamente.');
        setIsPaying(false);
        return;
      }

      // Abrir en ventana flotante (popup)
      const width = 900;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      window.open(url, 'mercadopago_checkout', `width=${width},height=${height},left=${left},top=${top}`);
      setIsPaying(false);
    } catch (error) {
      alert('Ocurrió un error al procesar el pago. Intenta más tarde.');
      setIsPaying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Tu carrito está vacío</h2>
        <p>Regresa a la tienda para agregar productos antes de pagar.</p>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <form className={styles.formSection} onSubmit={handlePayment}>
        <h2 className={styles.title}>Datos de Envío</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.inputGroup}>
            <label>Nombre Completo</label>
            <input type="text" required placeholder="María Pérez" />
          </div>
          <div className={styles.inputGroup}>
            <label>Teléfono (10 dígitos)</label>
            <input 
              type="tel" 
              required 
              placeholder="5512345678" 
              pattern="[0-9]{10}"
              maxLength={10}
              minLength={10}
              title="El número debe tener exactamente 10 dígitos"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) e.preventDefault();
              }}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Dirección (Calle y Número)</label>
          <input type="text" required placeholder="Av. Siempre Viva 123" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className={styles.inputGroup}>
            <label>Colonia</label>
            <input type="text" required />
          </div>
          <div className={styles.inputGroup}>
            <label>Ciudad</label>
            <input type="text" required />
          </div>
          <div className={styles.inputGroup}>
            <label>Código Postal</label>
            <input 
              type="text" 
              required 
              placeholder="00000" 
              pattern="[0-9]{5}"
              maxLength={5}
              minLength={5}
              title="El código postal debe tener exactamente 5 dígitos"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) e.preventDefault();
              }}
            />
          </div>
        </div>

        <h2 className={styles.title} style={{ marginTop: '2rem' }}>Método de Pago</h2>
        <p style={{ color: '#757575', marginBottom: '1rem' }}>
          Serás redirigido de forma segura a <strong>Mercado Pago</strong> para completar tu compra.
        </p>
        
        {/* Bloque MSI en Checkout */}
        {subtotal >= 1200 && (
          <div style={{
            margin: '1.5rem 0',
            padding: '1.25rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
            border: '1px solid #ffd70066',
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ffd700', letterSpacing: '2px', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
              💳 ¡Tu compra es elegible para Meses Sin Intereses!
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[{ plazo: '3 MSI', desde: 1200 }, { plazo: '6 MSI', desde: 2400 }, { plazo: '12 MSI', desde: 4800 }].map(op => (
                <div key={op.plazo} style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  backgroundColor: subtotal >= op.desde ? '#ffd700' : '#ffffff22',
                  color: subtotal >= op.desde ? '#1a1a2e' : '#ffffff66',
                  border: `1px solid ${subtotal >= op.desde ? '#ffd700' : '#ffffff22'}`,
                }}>
                  {op.plazo} {subtotal >= op.desde ? '✓' : `(desde $${op.desde})`}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.65rem', color: '#ffffff66', margin: '0.75rem 0 0 0' }}>
              * Los MSI se confirman al seleccionar tu tarjeta en Mercado Pago. Aplica con tarjetas participantes.
            </p>
          </div>
        )}

        <button type="submit" className={styles.payButton}>
          Pagar ${total} MXN
        </button>
      </form>

      <div className={styles.summarySection}>
        <h2 className={styles.title}>Resumen de Orden</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
          {items.map(item => (
            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>{item.quantity}x {item.name}</span>
              <span>${item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
        
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <span>${subtotal}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#757575' }}>
          <span>Envío (Paquetería Nacional)</span>
          <span>${shippingCost}</span>
        </div>
        <div style={{ borderTop: '2px solid #212121', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
          <span>Total</span>
          <span style={{ color: '#E53935' }}>${total} MXN</span>
        </div>
      </div>
    </div>
  );
}
