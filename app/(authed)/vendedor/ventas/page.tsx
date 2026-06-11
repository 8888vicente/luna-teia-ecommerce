/**
 * app/(authed)/vendedor/ventas/page.tsx
 *
 * Vista de ventas capturadas con filtros por ciudad,
 * repartidor y estatus.
 */

import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";
import {
  getUltimosPedidos,
  getRepartidoresActivos,
  getCiudadesConVentas,
} from "@/lib/ventas/queries";
import { TablaVentas } from "../components/TablaVentas";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function VentasPage() {
  const sesion = await getSesion();

  if (!sesion.rol || sesion.rol !== "Vendedor") {
    redirect("/login");
  }

  const [pedidos, repartidores, ciudades] = await Promise.all([
    getUltimosPedidos(50),
    getRepartidoresActivos(),
    getCiudadesConVentas(),
  ]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Ver ventas</h1>
        <p className={styles.subtitle}>
          {pedidos.length} pedidos registrados &mdash; filtr&aacute; por ciudad,
          repartidor o estatus.
        </p>
      </header>

      <section className={styles.section}>
        <TablaVentas
          pedidos={pedidos as any}
          repartidores={repartidores}
          ciudades={ciudades}
        />
      </section>
    </main>
  );
}
