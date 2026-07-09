"use client";

import React from 'react';

/**
 * TrustBadges – Componente reutilizable de confianza con el logo oficial de Mercado Pago.
 *
 * Variantes:
 *   - "horizontal" → Franja completa para Home / Checkout
 *   - "compact"    → Versión mini para el CartDrawer
 *
 * @param variant          – 'horizontal' | 'compact'
 * @param showShippingInfo – Muestra badge de envío
 * @param darkBackground   – Colores de texto adaptados
 */

interface TrustBadgesProps {
  variant?: 'horizontal' | 'compact';
  showShippingInfo?: boolean;
  darkBackground?: boolean;
}

/* ── Logo Oficial de Mercado Pago (Imagen Proporcionada) ── */
export function MercadoPagoLogo({ width = 100 }: { width?: number }) {
  return (
    <img
      src="/images/mercadopago.webp"
      alt="Mercado Pago"
      width={width}
      style={{ display: 'inline-block', verticalAlign: 'middle', height: 'auto' }}
    />
  );
}

export default function TrustBadges({ variant = 'horizontal', showShippingInfo = false, darkBackground = false }: TrustBadgesProps) {
  const textColor = darkBackground ? '#e0e0e0' : '#37474F';
  const mutedColor = darkBackground ? '#b0b0b0' : '#607D8B';
  const bgColor = darkBackground ? 'rgba(255,255,255,0.05)' : '#f0f4ff';
  const borderColor = darkBackground ? 'rgba(255,255,255,0.1)' : '#d0dff0';
  const checkColor = '#00b1ea'; // Azul Mercado Pago para los checks

  if (variant === 'compact') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        padding: '0.5rem 0.75rem',
        backgroundColor: bgColor,
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        marginTop: '0.75rem',
      }}>
        <span style={{ fontSize: '0.72rem', color: textColor, fontWeight: '700' }}>
          Compra segura mediante
        </span>
        <MercadoPagoLogo width={55} />
      </div>
    );
  }

  // variant === 'horizontal'
  return (
    <section style={{
      backgroundColor: bgColor,
      borderTop: `1px solid ${borderColor}`,
      borderBottom: `1px solid ${borderColor}`,
      padding: '1.25rem 1rem',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(1rem, 3vw, 2rem)',
        flexWrap: 'wrap',
      }}>
        {/* Logo Mercado Pago */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <MercadoPagoLogo width={80} />
        </div>

        {/* Separador */}
        <div style={{ width: '1px', height: '28px', backgroundColor: borderColor, flexShrink: 0 }} />

        {/* Badge: Compra Segura */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: checkColor, fontWeight: 'bold' }}>✓</span>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: textColor }}>
            Compra 100% segura
          </span>
        </div>

        {/* Separador */}
        <div style={{ width: '1px', height: '28px', backgroundColor: borderColor, flexShrink: 0 }} />

        {/* Badge: Protección */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: checkColor, fontWeight: 'bold' }}>✓</span>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: textColor }}>
            Datos protegidos
          </span>
        </div>

        {/* Badge: Envío (opcional) */}
        {showShippingInfo && (
          <>
            <div style={{ width: '1px', height: '28px', backgroundColor: borderColor, flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>📦</span>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: textColor }}>
                Envíos con rastreo nacional
              </span>
            </div>
          </>
        )}

        {/* Badge: Desde 2018 */}
        <div style={{ width: '1px', height: '28px', backgroundColor: borderColor, flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>✨</span>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: textColor }}>
            Desde 2018 en México
          </span>
        </div>
      </div>

      {/* Subtexto */}
      <p style={{
        textAlign: 'center',
        fontSize: '0.72rem',
        color: mutedColor,
        marginTop: '0.6rem',
        fontWeight: '600',
      }}>
        Tus pagos son procesados de forma segura por Mercado Pago.
      </p>
    </section>
  );
}
