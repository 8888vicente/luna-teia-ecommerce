import React from 'react';
import Link from 'next/link';

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