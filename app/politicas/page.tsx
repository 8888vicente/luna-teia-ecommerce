import React from 'react';

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
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: '#B0BEC5', fontSize: '0.9rem' }}>
        <span>© 2026 Luna Teia</span>
        <span>|</span>
        <a href="/politicas" style={{ textDecoration: 'underline', color: '#B0BEC5' }}>
          Políticas de Envío
        </a>
        <span>|</span>
        <a href="/#contacto" style={{ textDecoration: 'underline', color: '#B0BEC5' }}>
          Contacto
        </a>
      </div>
    </footer>
  );
}