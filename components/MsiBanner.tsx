"use client";

import React from 'react';

// Mensajes de confianza y envío — sin MSI
const TICKER_MESSAGES = [
  '💄 AL COMPRAR 3 LABIALES TU ENVÍO ES DE SOLO $40',
  '🚚 ENVÍO GRATIS EN PEDIDOS DE $400+',
  '🔒 COMPRA 100% SEGURA · PROTEGIDA POR MERCADO PAGO',
  '✨ DESDE 2018 ENVIANDO BELLEZA A TODO MÉXICO',
  '📦 ENVÍOS CON RASTREO · PAQUETERÍA NACIONAL SEGURA',
];

export default function MsiBanner() {
  // Duplicamos los mensajes para crear un loop seamless
  const allMessages = [...TICKER_MESSAGES, ...TICKER_MESSAGES];

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

      {/* Track del ticker — width: max-content + duplicado = loop perfecto */}
      <div style={{
        display: 'flex',
        width: 'max-content',
        animation: 'ticker 40s linear infinite',
        whiteSpace: 'nowrap',
      }}>
        {allMessages.map((msg, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0',
              fontSize: '0.78rem',
              fontWeight: '700',
              letterSpacing: '1.5px',
              color: i % 5 === 0
                ? '#ffd700'     // dorado para el mensaje estrella (3 labiales)
                : i % 5 === 2
                  ? '#4fc3f7'   // azul claro para Mercado Pago
                  : '#ffffff',  // blanco para el resto
              paddingRight: '3rem',
            }}
          >
            {msg}
            {/* Separador tipo diamante entre mensajes */}
            <span style={{ marginLeft: '3rem', color: '#ffd70066', fontSize: '0.6rem' }}>◆</span>
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
