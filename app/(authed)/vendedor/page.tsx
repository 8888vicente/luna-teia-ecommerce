/**
 * app/(authed)/vendedor/page.tsx
 *
 * Vista principal del Vendedor.
 * Solo el formulario de captura. La seccion "Ver ventas"
 * esta en /vendedor/ventas con acceso desde el menu lateral.
 */

import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";
import { getCatalogoProductos, getRepartidoresActivos } from "@/lib/ventas/queries";
import { CapturarPedido } from "./components/CapturarPedido";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function VendedorPage() {
  const sesion = await getSesion();

  if (!sesion.rol || sesion.rol !== "Vendedor") {
    redirect("/login");
  }

  const [catalogo, repartidores] = await Promise.all([
    getCatalogoProductos(),
    getRepartidoresActivos(),
  ]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Capturar venta</h1>
        <p className={styles.subtitle}>
          Hola, <strong>{sesion.displayName}</strong>. Captur&aacute; los
          pedidos que llegan por Facebook Messenger y asignalos a un repartidor.
        </p>
      </header>

      <section className={styles.section}>
            <CapturarPedido
              catalogo={catalogo}
              repartidores={repartidores}
            />
      </section>
    </main>
  );
}

