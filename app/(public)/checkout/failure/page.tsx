'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function FailureContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  return (
    <>
      <div style={{
        width: 64, height: 64,
          borderRadius: '50%',
          background: '#f44336',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '2rem',
          color: '#FFF',
          fontWeight: 900,
        }}>
          ✕
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#212121', margin: 0 }}>
          Pago No Completado
        </h1>
        <p style={{ color: '#757575', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
          El pago no pudo ser procesado. Puedes intentar de nuevo o elegir otro método de pago.
        </p>
        {paymentId && (
          <p style={{ color: '#9e9e9e', fontSize: '0.7rem', marginTop: '0.5rem' }}>
            ID de transacción: {paymentId}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/checkout"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#E53935',
              color: '#FFF',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}>
            Intentar de Nuevo
          </Link>
          <Link href="/"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f5f5f5',
              color: '#424242',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}>
            Volver a Tienda
          </Link>
        </div>
    </>
  );
}

export default function CheckoutFailurePage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#FAFAFA',
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
      }}>
        <Suspense fallback={<div style={{ padding: '2rem' }}>Cargando...</div>}>
          <FailureContent />
        </Suspense>
      </div>
    </main>
  );
}

