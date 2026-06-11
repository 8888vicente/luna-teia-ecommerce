/**
 * app/(authed)/admin/crm/page.tsx
 *
 * Panel principal del CRM (Administrador).
 * Server Component: carga datos resumidos de pedidos,
 * repartidores y comisiones, y pasa los datos a los
 * componentes cliente para interaccion.
 *
 * Las subsecciones:
 *   1. Tarjetas de resumen (KPI)
 *   2. Pedidos pendientes de asignar
 *   3. Comisiones de la semana
 */

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSesion } from "@/lib/auth";
import { AsignarRepartidor } from "../components/AsignarRepartidor";
import { TablaComisiones } from "../components/TablaComisiones";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCrmPage() {
  const sesion = await getSesion();

  if (!sesion.rol || sesion.rol !== "Administrador") {
    redirect("/login");
  }

  const supabase = await getSupabaseServer();

  // ── 1. Cargar KPIs ─────────────────────────
  const [resPendientes, resEnRuta, resEntregadosHoy, resRepartidores, resPedidos, resRepActivos] =
    await Promise.all([
      // Pedidos pendientes (sin repartidor asignado)
      supabase
        .from("pedidos_central")
        .select("id", { count: "exact", head: true })
        .eq("estatus_pedido", "pendiente")
        .is("repartidor_assigned_id", null),

      // Pedidos en ruta
      supabase
        .from("pedidos_central")
        .select("id", { count: "exact", head: true })
        .eq("estatus_pedido", "en_ruta"),

      // Entregados hoy
      supabase
        .from("pedidos_central")
        .select("id", { count: "exact", head: true })
        .eq("estatus_pedido", "entregado")
        .gte("updated_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),

      // Repartidores activos
      supabase
        .from("repartidores")
        .select("id", { count: "exact", head: true })
        .eq("activo", true),

      // Pedidos pendientes + en_ruta (COMPLETOS para el componente AsignarRepartidor)
      supabase
        .from("pedidos_central")
        .select("*")
        .in("estatus_pedido", ["pendiente", "en_ruta"])
        .order("created_at", { ascending: false })
        .limit(50),

      // Repartidores activos (COMPLETOS para el componente AsignarRepartidor)
      supabase
        .from("repartidores")
        .select("*")
        .eq("activo", true)
        .order("nombre"),
    ]);

  const kpi = {
    pendientes: resPendientes.count ?? 0,
    enRuta: resEnRuta.count ?? 0,
    entregadosHoy: resEntregadosHoy.count ?? 0,
    repartidoresActivos: resRepartidores.count ?? 0,
  };

  const pedidos = resPedidos.data ?? [];
  const repartidores = resRepActivos.data ?? [];

  return (
    <main className={styles.container}>
      {/* ── Header ─────────────────────────── */}
      <header className={styles.header}>
        <h1>Panel de control</h1>
        <p className={styles.subtitle}>
          Bienvenido, <strong>{sesion.displayName}</strong>. Resumen general del
          d&iacute;a.
        </p>
      </header>

      {/* ── KPIs ───────────────────────────── */}
      <section className={styles.kpiGrid}>
        <article className={styles.kpiCard}>
          <span className={styles.kpiValue}>{kpi.pendientes}</span>
          <span className={styles.kpiLabel}>Pendientes</span>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiValue}>{kpi.enRuta}</span>
          <span className={styles.kpiLabel}>En ruta</span>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiValue}>{kpi.entregadosHoy}</span>
          <span className={styles.kpiLabel}>Entregados hoy</span>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiValue}>{kpi.repartidoresActivos}</span>
          <span className={styles.kpiLabel}>Repartidores activos</span>
        </article>
      </section>

      {/* ── Asignar repartidor ──────────────── */}
      <section className={styles.section}>
        <h2>Asignar repartidor</h2>
        <AsignarRepartidor
          initialPedidos={pedidos as any}
          repartidores={repartidores as any}
        />
      </section>

      {/* ── Comisiones ─────────────────────── */}
      <section className={styles.section}>
        <h2>Comisiones (&uacute;ltimos 7 d&iacute;as)</h2>
        <TablaComisiones />
      </section>
    </main>
  );
}
