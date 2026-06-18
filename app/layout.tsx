/**
 * app/layout.tsx
 * ───────────────────────────────────────────────────────────
 * Root Layout del CRM Luna Teia.
 *
 * Es la capa MÁS EXTERNA. Solo monta:
 *   - Fuentes (Inter + Fraunces vía next/font).
 *   - globals.css (variables CSS, reset, tipografía).
 *   - ToastProvider (provider global de notificaciones).
 *
 * NO monta Navbar/Footer/CartProvider. Esos son del
 * e-commerce público y viven en app/(public)/layout.tsx.
 *
 * El grupo (authed)/layout.tsx monta su propio sidebar
 * adaptado al rol, sin la Navbar de la tienda.
 * ───────────────────────────────────────────────────────────
 */

import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ToastProvider } from '@/lib/ui';
import './globals.css';

// ── Fuentes (auto-hospedadas por next/font) ─────────────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  // Cargamos los pesos que usa la app: títulos (500) y bold (600)
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Luna Teia Cosméticos',
  description:
    'Tienda en línea de Luna Teia Cosméticos. Descubre y compra nuestros increíbles productos de belleza, maquillaje y cuidado personal.',
  openGraph: {
    title: 'Luna Teia Cosméticos',
    description:
      'Tienda en línea de Luna Teia Cosméticos. Descubre y compra nuestros increíbles productos de belleza, maquillaje y cuidado personal.',
    url: 'https://lunateia.com',
    siteName: 'Luna Teia',
    images: [
      {
        url: 'https://lunateia.com/logo2.jpeg',
        width: 1200,
        height: 630,
        alt: 'Luna Teia Cosméticos',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luna Teia Cosméticos',
    description:
      'Tienda en línea de Luna Teia Cosméticos. Descubre y compra nuestros increíbles productos de belleza, maquillaje y cuidado personal.',
    images: ['https://lunateia.com/logo2.jpeg'],
  },
  verification: {
    // Meta (Facebook) - verificación de dominio lunateia.com
    other: {
      'facebook-domain-verification': 'pqlz2kipq0efoqncah8briy2q4ez6z',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}

