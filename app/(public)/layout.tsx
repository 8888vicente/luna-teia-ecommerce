/**
 * app/(public)/layout.tsx
 * ───────────────────────────────────────────────────────────
 * Layout del GRUPO (public):
 *   - Envuelve todas las páginas del e-commerce (landing,
 *     categorías, checkout, etc.).
 *   - Aquí viven: Navbar, Footer, MsiBanner, CartDrawer,
 *     Meta Pixel, CartProvider.
 *
 * Migrado desde el antiguo RootLayout cuando se introdujo
 * el CRM. NO incluye el ToastProvider (ya está en root).
 * ───────────────────────────────────────────────────────────
 */

import Script from 'next/script';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CartProvider } from '../../context/CartContext';
import CartDrawer from '../../components/CartDrawer';
import MsiBanner from '../../components/MsiBanner';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Meta Pixel - Facebook */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1633994451033463');
            fbq('track', 'PageView');
          `,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CartProvider>
          {/* Announcement Bar */}
          <div
            style={{
              backgroundColor: '#212121',
              color: 'white',
              textAlign: 'center',
              padding: '0.25rem',
              fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)',
              fontWeight: 'bold',
            }}
          >
            🚚 ENVÍO GRATIS en compras de $500+ | Envío a $80 de $200 a $499 | Envío nacional $150
          </div>
          <MsiBanner />
          <Navbar />
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
      </div>
    </>
  );
}
