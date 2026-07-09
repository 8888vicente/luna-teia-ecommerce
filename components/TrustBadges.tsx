"use client";

import React from 'react';

/**
 * TrustBadges – Componente reutilizable de confianza con logo de Mercado Pago.
 *
 * Variantes:
 *   - "horizontal" → Franja completa para Home / Checkout
 *   - "compact"    → Versión mini para el CartDrawer
 *
 * @param variant          – 'horizontal' | 'compact'
 * @param showShippingInfo – Muestra badge de envío
 * @param darkBackground   – Usa colores claros para fondos oscuros (footer)
 */

interface TrustBadgesProps {
  variant?: 'horizontal' | 'compact';
  showShippingInfo?: boolean;
  darkBackground?: boolean;
}

/* ── Logo SVG de Mercado Pago (mano azul simplificada) ── */
function MercadoPagoLogo({ height = 28 }: { height?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 656 188"
      height={height}
      style={{ display: 'block' }}
      aria-label="Mercado Pago"
    >
      <g fill="none">
        <path
          fill="#00BCFF"
          d="M96.5 0C60.8 0 29.3 18.5 11.5 47.2c-3.7 5.9-1.9 13.7 4 17.4 5.9 3.7 13.7 1.9 17.4-4C44.7 41.3 69.3 27 96.5 27c44.3 0 80.5 36.2 80.5 80.5 0 44.3-36.2 80.5-80.5 80.5-27.2 0-51.8-14.3-63.6-33.6-3.7-5.9-11.5-7.7-17.4-4-5.9 3.7-7.7 11.5-4 17.4C29.3 196.5 60.8 215 96.5 215c59.4 0 107.5-48.1 107.5-107.5S155.9 0 96.5 0z"
          transform="scale(.87)"
        />
        <path
          fill="#2D3277"
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
        fill="#2D3277"
        transform="scale(.87)"
      >
        mercado pago
      </text>
    </svg>
  );
}

/* ── Icono de Candado ── */
function LockIcon({ size = 16, color = '#2D3277' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" fill={color} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="16" r="1.5" fill="white" />
    </svg>
  );
}

/* ── Icono de Escudo ── */
function ShieldIcon({ size = 16, color = '#2D3277' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" fill={color} />
      <path d="M10 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TrustBadges({ variant = 'horizontal', showShippingInfo = false, darkBackground = false }: TrustBadgesProps) {
  const textColor = darkBackground ? '#e0e0e0' : '#37474F';
  const mutedColor = darkBackground ? '#b0b0b0' : '#607D8B';
  const bgColor = darkBackground ? 'rgba(255,255,255,0.05)' : '#f0f4ff';
  const borderColor = darkBackground ? 'rgba(255,255,255,0.1)' : '#d0dff0';
  const iconColor = darkBackground ? '#4fc3f7' : '#2D3277';

  if (variant === 'compact') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.6rem 0.75rem',
        backgroundColor: bgColor,
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        marginTop: '0.75rem',
      }}>
        <LockIcon size={14} color={iconColor} />
        <span style={{ fontSize: '0.7rem', color: textColor, fontWeight: '600' }}>
          Compra segura con
        </span>
        <MercadoPagoLogo height={16} />
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
          <MercadoPagoLogo height={22} />
        </div>

        {/* Separador */}
        <div style={{ width: '1px', height: '28px', backgroundColor: borderColor, flexShrink: 0 }} />

        {/* Badge: Compra Segura */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LockIcon size={16} color={iconColor} />
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: textColor }}>
            Compra 100% segura
          </span>
        </div>

        {/* Separador */}
        <div style={{ width: '1px', height: '28px', backgroundColor: borderColor, flexShrink: 0 }} />

        {/* Badge: Protección */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldIcon size={16} color={iconColor} />
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
        fontSize: '0.68rem',
        color: mutedColor,
        marginTop: '0.6rem',
        fontWeight: '500',
      }}>
        Tus pagos son procesados de forma segura por Mercado Pago. No almacenamos datos de tarjeta.
      </p>
    </section>
  );
}
