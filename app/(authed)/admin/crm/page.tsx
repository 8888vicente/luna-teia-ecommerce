/**
 * app/(authed)/admin/crm/page.tsx
 *
 * Panel principal del CRM (Administrador).
 * Server Component: carga datos resumidos de pedidos,
 * repartidores, incidencias y comisiones, y pasa los datos a los
 * componentes cliente para interacción.
 */

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/service";
import { getSesion } from "@/lib/auth";
import { AsignarRepartidor } from "../components/AsignarRepartidor";
import { TablaComisiones } from "../components/TablaComisiones";
import { RutaSupervisor } from "../components/RutaSupervisor";
import { ActivityFeed } from "../components/ActivityFeed";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCrmPage() {
  const sesion = await getSesion();

  if (!sesion.rol || sesion.rol !== "Administrador") {
    redirect("/login");
  }

  const serverClient = await getSupabaseServer();
  const supabase = getSupabaseAdminClient(serverClient);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Cargar datos en paralelo para optimizar performance
  const [
    resPendientes,
    resEnRuta,
    resEntregadosHoy,
    resRepartidores,
    resPedidos,
    resRepActivos,
    resIncidencias
  ] = await Promise.all([
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
      .gte("updated_at", todayStart.toISOString()),

    // Repartidores activos (conteo)
    supabase
      .from("repartidores")
      .select("id", { count: "exact", head: true })
      .eq("activo", true),

    // Pedidos pendientes + en_ruta para AsignarRepartidor
    supabase
      .from("pedidos_central")
      .select("*")
      .in("estatus_pedido", ["pendiente", "en_ruta"])
      .order("created_at", { ascending: false })
      .limit(50),

    // Repartidores activos para dropdowns y supervisor
    supabase
      .from("repartidores")
      .select("*")
      .eq("activo", true)
      .order("nombre"),

    // Incidencias de hoy (cancelaciones o ausentes) con repartidor cargado
    supabase
      .from("pedidos_central")
      .select("*, repartidor:repartidor_assigned_id(nombre)")
      .in("estatus_pedido", ["cancelado", "ausente"])
      .gte("updated_at", todayStart.toISOString())
      .order("updated_at", { ascending: false })
  ]);

  const kpi = {
    pendientes: resPendientes.count ?? 0,
    enRuta: resEnRuta.count ?? 0,
    entregadosHoy: resEntregadosHoy.count ?? 0,
    repartidoresActivos: resRepartidores.count ?? 0,
  };

  const pedidos = resPedidos.data ?? [];
  const repartidores = resRepActivos.data ?? [];
  const incidencias = resIncidencias.data ?? [];

  return (
    <main className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Panel de control</h1>
        <p className={styles.subtitle}>
          Bienvenido, <strong>{sesion.displayName}</strong>. Resumen general del día.
        </p>
      </header>

      {/* KPIs */}
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

      {/* Alertas rojas y bitácora de incidencias */}
      <section className={styles.section}>
        <ActivityFeed incidencias={incidencias as any} repartidores={repartidores} />
      </section>

      {/* Mapa de supervisión de rutas */}
      <section className={styles.section}>
        <h2>Supervisión de Rutas en Vivo</h2>
        <RutaSupervisor repartidores={repartidores} />
      </section>

      {/* Asignar repartidor */}
      <section className={styles.section}>
        <h2>Asignar repartidor</h2>
        <AsignarRepartidor
          initialPedidos={pedidos as any}
          repartidores={repartidores as any}
        />
      </section>

      {/* Comisiones */}
      <section className={styles.section}>
        <h2>Comisiones (últimos 7 días)</h2>
        <TablaComisiones />
      </section>
    </main>
  );
}
