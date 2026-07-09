import React from 'react';
import Link from 'next/link';
import { MercadoPagoLogo } from './TrustBadges';

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: '#212121', 
      color: '#F5F5F5', 
      padding: '3rem 2rem', 
      textAlign: 'center',
      marginTop: 'auto'
    }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '1rem' }}>
        LUNA TEIA COSMÉTICOS
      </h3>
      <p style={{ color: '#B0BEC5', marginBottom: '2rem' }}>
        Realzando tu belleza, un tono a la vez. Envíos seguros a todo México.
      </p>
      <p style={{ color: '#B0BEC5', marginBottom: '1rem', fontSize: '0.95rem' }}>
        Atención por WhatsApp: <a href="https://wa.me/526621252614" target="_blank" rel="noreferrer" style={{ color: '#81D4FA', textDecoration: 'underline' }}>+52 662 125 2614</a> · Horario: L a V 9:00 a 16:00, cerrado festivos.
      </p>

      {/* ── Badge Mercado Pago ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        marginBottom: '1.5rem',
        padding: '0.6rem 1rem',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '380px',
        margin: '0 auto 1.5rem',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="11" width="18" height="11" rx="2" fill="#4fc3f7" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="16" r="1.5" fill="white" />
        </svg>
        <span style={{ fontSize: '0.75rem', color: '#B0BEC5', fontWeight: '600' }}>
          Pagos procesados de forma segura por
        </span>
        <MercadoPagoLogo height={30} variant="light" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: '#B0BEC5', fontSize: '0.9rem', flexWrap: 'wrap' }}>
        <span>© 2026 Luna Teia</span>
        <span>|</span>
        <Link href="/politicas" style={{ textDecoration: 'underline', color: '#B0BEC5' }}>
          Políticas de Envío
        </Link>
        <span>|</span>
        <a href="https://wa.me/526621252614" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#B0BEC5' }}>
          Contacto
        </a>
      </div>
    </footer>
  );
}