import "./globals.css";
import Script from "next/script";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CartProvider } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import MsiBanner from "../components/MsiBanner";

export const metadata = {
  title: "Luna Teia Cosméticos",
  description: "Tienda en línea de cosméticos, labiales y más. Envío a todo México.",
};

export const viewport = {
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
    <html lang="es">
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
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CartProvider>
          {/* Announcement Bar Pequeña */}
          <div style={{ backgroundColor: '#212121', color: 'white', textAlign: 'center', padding: '0.25rem', fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 'bold' }}>
            🚚 ENVÍO GRATIS en compras de $500+ | Envío a $80 de $200 a $499 | Envío nacional $150
          </div>
          {/* Banner MSI deslizante */}
          <MsiBanner />
          <Navbar />
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
