import React from 'react';
import Link from 'next/link';

/* ── Logo Mercado Pago (versión clara para fondo oscuro) ── */
function MercadoPagoLogoLight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 656 188"
      height={20}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      aria-label="Mercado Pago"
    >
      <g fill="none">
        <path
          fill="#00BCFF"
          d="M96.5 0C60.8 0 29.3 18.5 11.5 47.2c-3.7 5.9-1.9 13.7 4 17.4 5.9 3.7 13.7 1.9 17.4-4C44.7 41.3 69.3 27 96.5 27c44.3 0 80.5 36.2 80.5 80.5 0 44.3-36.2 80.5-80.5 80.5-27.2 0-51.8-14.3-63.6-33.6-3.7-5.9-11.5-7.7-17.4-4-5.9 3.7-7.7 11.5-4 17.4C29.3 196.5 60.8 215 96.5 215c59.4 0 107.5-48.1 107.5-107.5S155.9 0 96.5 0z"
          transform="scale(.87)"
        />
        <path
          fill="#4fc3f7"
          d="M96.5 54c-24 0-44 16.5-49.6 38.8-.8 3.2.3 6.5 2.8 8.7l48.2 42.3c1.3 1.1 2.9 1.7 4.6 1.7h.1c1.7 0 3.4-.7 4.7-1.8l46.5-42.2c2.4-2.2 3.5-5.5 2.7-8.6C150.7 70.6 130.6 54 96.5 54z"
          transform="scale(.87)"
        />
      </g>
      <text
        x="195"
        y="120"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="52"
        fontWeight="700"
        fill="#e0e0e0"
        transform="scale(.87)"
      >
        mercado pago
      </text>
    </svg>
  );
}

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
        gap: '0.5rem',
        marginBottom: '1.5rem',
        padding: '0.6rem 1rem',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '360px',
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
        <MercadoPagoLogoLight />
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