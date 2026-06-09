'use client';

import Link from 'next/link';

export default function CheckoutPendingPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#FFF8E1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: '#FFF',
        borderRadius: 24,
        padding: '2.5rem 2rem',
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        border: '1px solid #FFE082',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#FFA000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '2rem',
          color: '#FFF',
          fontWeight: 900,
        }}>
          ⏳
        </div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#212121', margin: 0 }}>
          Pago en Proceso
        </h1>
        <p style={{ color: '#757575', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
          Si ya realizaste el pago, puede tardar unos minutos en reflejarse.
        </p>
        <Link href="/"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '0.75rem 2rem',
            background: '#E53935',
            color: '#FFF',
            borderRadius: 9999,
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}>
          Volver a la Tienda
        </Link>
      </div>
    </main>
  );
}
