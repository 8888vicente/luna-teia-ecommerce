'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const paymentId = searchParams.get('payment_id');
  useEffect(() => {
    const timer = setTimeout(() => setStatus('success'), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {status === 'checking' ? (
        <>
            <div style={{
            width: 48, height: 48,
            border: '4px solid #E53935',
            borderTopColor: 'transparent',
              borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
          }} />
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#212121', margin: 0 }}>
            Confirmando tu pago...
            </h1>
          <p style={{ color: '#757575', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Por favor espera unos segundos.
            </p>
          </>
      ) : (
        <>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: '#4CAF50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2rem',
            color: '#FFF',
            fontWeight: 900,
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#212121', margin: 0 }}>
            ¡Pago Exitoso!
          </h1>
          <p style={{ color: '#757575', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
            Gracias por tu compra en <strong>Luna Teia Cosméticos</strong>.
            Recibirás un correo con los detalles de tu pedido y el número de seguimiento.
          </p>
          {paymentId && (
            <p style={{ color: '#9e9e9e', fontSize: '0.7rem', marginTop: '0.5rem' }}>
              ID de pago: {paymentId}
            </p>
          )}
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
              boxShadow: '0 4px 12px rgba(229,57,53,0.3)',
            }}>
            Volver a la Tienda
          </Link>
        </>
      )}
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
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
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <Suspense fallback={
          <div style={{ padding: '2rem' }}>
            <div style={{
              width: 36, height: 36,
              border: '3px solid #E53935',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto',
            }} />
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}

