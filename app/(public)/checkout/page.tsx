"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../../context/CartContext';
import styles from './page.module.css';
import { trackInitiateCheckout } from '../../../lib/metaPixel';
import TrustBadges, { MercadoPagoLogo } from '../../../components/TrustBadges';

export default function CheckoutPage() {
  const { items, subtotal, shippingCost } = useCart();
  const [isPaying, setIsPaying] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',  // agregamos email
    street: '',
    suburb: '',
    city: '',
    state: '',
    zip: '',
  });

  const total = subtotal + shippingCost;
  const trackedInitiateCheckout = useRef(false);

  useEffect(() => {
    if (items.length > 0 && !trackedInitiateCheckout.current) {
      trackInitiateCheckout(items, total);
      trackedInitiateCheckout.current = true;
    }
  }, [items, total]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Validar campos requeridos
    const required = ['name', 'phone', 'email', 'street', 'suburb', 'city', 'state', 'zip'];
    for (const field of required) {
      if (!formData[field as keyof typeof formData]?.trim()) {
        alert('Por favor completa todos los campos de envío.');
        return;
      }
    }

    setIsPaying(true);
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          shipping_info: formData,
          total: total,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data?.message ?? 'No se pudo procesar el pago. Por favor intenta de nuevo.');
        setIsPaying(false);
        return;
      }

      window.location.href = data.init_point;
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
            <input type="text" name="name" required placeholder="María Pérez" value={formData.name} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label>Teléfono (10 dígitos)</label>
            <input 
              type="tel" name="phone" required placeholder="5512345678" 
              pattern="[0-9]{10}" maxLength={10} minLength={10}
              title="El número debe tener exactamente 10 dígitos"
              value={formData.phone} onChange={handleChange}
              onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Correo Electrónico</label>
          <input type="email" name="email" required placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} />
        </div>

        <div className={styles.inputGroup}>
          <label>Dirección (Calle y Número)</label>
          <input type="text" name="street" required placeholder="Av. Siempre Viva 123" value={formData.street} onChange={handleChange} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.inputGroup}>
            <label>Colonia</label>
            <input type="text" name="suburb" required value={formData.suburb} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label>Ciudad</label>
            <input type="text" name="city" required value={formData.city} onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.inputGroup}>
            <label>Estado</label>
            <input type="text" name="state" required placeholder="Ej. CDMX" value={formData.state} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label>Código Postal</label>
            <input 
              type="text" name="zip" required placeholder="00000" 
              pattern="[0-9]{5}" maxLength={5} minLength={5}
              title="El código postal debe tener exactamente 5 dígitos"
              value={formData.zip} onChange={handleChange}
              onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
            />
          </div>
        </div>

        <h2 className={styles.title} style={{ marginTop: '2rem' }}>Método de Pago</h2>
        
        {/* Sección de confianza Mercado Pago */}
        <div style={{
          padding: '1.25rem',
          borderRadius: '12px',
          backgroundColor: '#f0f4ff',
          border: '1px solid #d0dff0',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <p style={{ color: '#37474F', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '600' }}>
            Compra segura mediante
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <MercadoPagoLogo width={90} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start', width: '100%', maxWidth: '240px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#37474F', fontWeight: '600' }}>
              <span style={{ color: '#00b1ea', fontWeight: 'bold' }}>✓</span>
              <span>Tarjetas de crédito y débito</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#37474F', fontWeight: '600' }}>
              <span style={{ color: '#00b1ea', fontWeight: 'bold' }}>✓</span>
              <span>Transferencias bancarias</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#37474F', fontWeight: '600' }}>
              <span style={{ color: '#00b1ea', fontWeight: 'bold' }}>✓</span>
              <span>Protección de Mercado Pago</span>
            </div>
          </div>
        </div>

        <button type="submit" className={styles.payButton} disabled={isPaying}>
          {isPaying ? 'Procesando...' : `Pagar $${total} MXN`}
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
          <span>{shippingCost === 0 ? '🚚 GRATIS' : `$${shippingCost}`}</span>
        </div>
        <div style={{ borderTop: '2px solid #212121', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
          <span>Total</span>
          <span style={{ color: '#E53935' }}>${total} MXN</span>
        </div>
        {/* Trust Badges */}
        <div style={{ marginTop: '1.5rem' }}>
          <TrustBadges variant="compact" />
        </div>
      </div>
    </div>
  );
}
