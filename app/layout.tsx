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
  title: 'Luna Teia',
  description:
    'Sistema de gestión de ventas, repartos y comisiones de Luna Teia Cosméticos.',
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
      </body>
    </html>
  );
}
