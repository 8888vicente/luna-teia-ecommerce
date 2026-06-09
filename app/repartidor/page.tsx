/**
 * Vista principal del Repartidor.
 * Server Component: lista los pedidos asignados al
 * repartidor autenticado y pasa los datos al
 * componente cliente para interacción.
 */
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getPedidosAsignados } from '@/lib/crm/crm';
import { ListaEntregas } from './components/ListaEntregas';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function RepartidorPage() {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/repartidor');
  }

  // claims vienen en app_metadata
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const repartidorId = (appMeta.repartidor_id as string | null) ?? null;
  const rol = (appMeta.role as string | null) ?? null;

  if (rol !== 'Repartidor' || !repartidorId) {
    return (
      <main className={styles.container}>
        <h1>Acceso restringido</h1>
        <p>Esta vista es exclusiva para usuarios con rol Repartidor.</p>
      </main>
    );
  }

  const res = await getPedidosAsignados(supabase, repartidorId, {
    soloActivos: true,
  });

  if (!res.ok) {
    return (
      <main className={styles.container}>
        <h1>Error al cargar pedidos</h1>
        <p>{res.error}</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Entregas del día</h1>
        <p className={styles.subtitle}>
          Tienes <strong>{res.data.length}</strong> pedidos en ruta.
        </p>
      </header>

      <ListaEntregas initialPedidos={res.data} repartidorId={repartidorId} />
    </main>
  );
}
