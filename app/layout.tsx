import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CartProvider } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import MsiBanner from "../components/MsiBanner";

export const metadata = {
  title: "Luna Teia Cosméticos",
  description: "Tienda en línea de cosméticos, labiales y más. Envío a todo México.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CartProvider>
          {/* Announcement Bar Pequeña */}
          <div style={{ backgroundColor: '#212121', color: 'white', textAlign: 'center', padding: '0.25rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
            🎉 ENVÍO GRATIS a partir de $500 MXN | Envío especial a $50 en compras de $200 a $499
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
