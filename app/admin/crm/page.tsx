/**
 * Panel administrativo del CRM.
 * Server Component: lista pedidos pendientes y
 * repartidores disponibles, y pasa los datos al
 * componente cliente para asignación.
 */
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseService } from '@/lib/supabase/service';
import type { PedidoCentralRow, RepartidorRow } from '@/lib/crm/types';
import { TablaComisiones } from './components/TablaComisiones';
import { AsignarRepartidor } from './components/AsignarRepartidor';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminCrmPage() {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/admin/crm');

  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const rol = (appMeta.role as string | null) ?? null;

  if (rol !== 'Administrador') {
    return (
      <main className={styles.container}>
        <h1>Acceso restringido</h1>
        <p>Esta vista es exclusiva para administradores.</p>
      </main>
    );
  }

  // Usamos SERVICE ROLE aquí SOLO para joins agregados
  // (comisiones por repartidor) que requieren ver datos
  // cruzados. Las queries individuales de UI funcionan
  // con RLS usando el cliente del usuario.
  const svc = getSupabaseService();

  // 1) Pedidos pendientes (o en_ruta) para asignar
  const { data: pedidos, error: errPedidos } = await svc
    .from('pedidos_central')
    .select('*')
    .in('estatus_pedido', ['pendiente', 'en_ruta'])
    .order('created_at', { ascending: true })
    .limit(50);

  // 2) Repartidores activos para el dropdown
  const { data: repartidores, error: errReps } = await svc
    .from('repartidores')
    .select('*')
    .eq('estatus', 'activo')
    .order('nombre', { ascending: true });

  if (errPedidos || errReps) {
    return (
      <main className={styles.container}>
        <h1>Error al cargar datos</h1>
        <pre>{errPedidos?.message ?? errReps?.message}</pre>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>🛠️ CRM — Luna Teia</h1>
        <p className={styles.subtitle}>
          Asignación de pedidos y comisiones de repartidores.
        </p>
      </header>

      <section className={styles.section}>
        <h2>📦 Pedidos por asignar</h2>
        <AsignarRepartidor
          initialPedidos={(pedidos ?? []) as PedidoCentralRow[]}
          repartidores={(repartidores ?? []) as RepartidorRow[]}
        />
      </section>

      <section className={styles.section}>
        <h2>💰 Comisiones de la semana</h2>
        <TablaComisiones />
      </section>
    </main>
  );
}
