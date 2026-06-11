/**
 * app/(authed)/inventario/page.tsx
 *
 * Vista de inventario. Accesible para Admin, Vendedor y
 * (futuro) Almacen.
 * Muestra el inventario en almacen y el inventario en campo
 * (por repartidor) con filtros basicos.
 */

import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";
import { getSupabaseService } from "@/lib/supabase/service";
import { InventarioView } from "./InventarioView";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const sesion = await getSesion();

  if (!sesion.rol || !["Administrador", "Vendedor"].includes(sesion.rol)) {
    redirect("/login");
  }

  const supabase = getSupabaseService();

  // Cargar desde las vistas que ya tienen joins
  const { data: almacen } = await supabase
    .from("vista_inventario_almacen")
    .select("*")
    .order("producto_nombre");
  const { data: campo } = await supabase
    .from("vista_inventario_campo")
    .select("*")
    .order("repartidor_nombre")
    .order("producto_nombre");

  // Productos con stock bajo
  const { data: stockBajo } = await supabase
    .from("vista_inventario_almacen")
    .select("*")
    .lt("cantidad", 10)
    .gt("cantidad", 0)
    .order("cantidad");

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Inventario</h1>
        <p className={styles.subtitle}>
          Resumen general de existencias en almac&eacute;n y en manos de repartidores.
        </p>
      </header>

      {/* ── Alertas ───────────────────── */}
      {stockBajo && stockBajo.length > 0 && (
        <div className={styles.alert}>
          <span className={styles.alertIcon}>&#x26A0;&#xFE0F;</span>
          <div>
            <strong>{stockBajo.length} productos con stock bajo</strong>
            <ul className={styles.alertList}>
              {stockBajo.map((s: any) => (
                <li key={s.producto_id}>
                  {s.producto_nombre}: {s.cantidad} restantes
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <InventarioView
        almacen={(almacen ?? []) as any}
        campo={(campo ?? []) as any}
      />
    </main>
  );
}

