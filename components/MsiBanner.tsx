"use client";

import React from 'react';

// Mensajes que se repiten en el ticker
const TICKER_MESSAGES = [
  '💳 3 MESES SIN INTERESES · DESDE $1,200 MXN',
  '✨ 6 MSI EN COMPRAS MAYORES A $2,400 MXN',
  '🌟 12 MSI EN COMPRAS MAYORES A $4,800 MXN',
  '💄 PAGA HOY, LUCE MAÑANA · LUNA TEIA',
  '📦 ENVÍO GRATIS EN COMPRAS MAYORES A $500 MXN',
  '💳 3 MESES SIN INTERESES · DESDE $1,200 MXN',
  '✨ 6 MSI EN COMPRAS MAYORES A $2,400 MXN',
  '🌟 12 MSI EN COMPRAS MAYORES A $4,800 MXN',
  '💄 PAGA HOY, LUCE MAÑANA · LUNA TEIA',
  '📦 ENVÍO GRATIS EN COMPRAS MAYORES A $500 MXN',
];

export default function MsiBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      overflow: 'hidden',
      padding: '0.75rem 0',
      position: 'relative',
    }}>
      {/* Brillo sutil en el borde superior */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #ffd700, transparent)',
      }} />

      {/* Track del ticker */}
      <div style={{
        display: 'flex',
        gap: '0',
        animation: 'ticker 35s linear infinite',
        whiteSpace: 'nowrap',
      }}>
        {TICKER_MESSAGES.map((msg, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0',
              fontSize: '0.78rem',
              fontWeight: '700',
              letterSpacing: '1.5px',
              color: i % 5 === 0 || i % 5 === 1 || i % 5 === 2
                ? '#ffd700'   // dorado para MSI
                : '#ffffff',  // blanco para otros mensajes
              paddingRight: '4rem',
            }}
          >
            {msg}
            {/* Separador tipo diamante entre mensajes */}
            <span style={{ marginLeft: '4rem', color: '#ffd70066', fontSize: '0.6rem' }}>◆</span>
          </span>
        ))}
      </div>

      {/* Degradados en los bordes para efecto de fade */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, bottom: 0,
        width: '80px',
        background: 'linear-gradient(to right, #1a1a2e, transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: '80px',
        background: 'linear-gradient(to left, #0f3460, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Brillo sutil en el borde inferior */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #ffd70066, transparent)',
      }} />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
