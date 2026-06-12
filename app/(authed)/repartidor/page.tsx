import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getPedidosParaRuta } from '@/lib/reparto/queries';
import { RepartidorDashboard } from './components/RepartidorDashboard';
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

  // claims vienen en app_metadata, pero el Custom Access Token Hook
  // los anida dentro de app_metadata.app_metadata.
  // Buscamos en ambos niveles.
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;

  const appMetaInner = (appMeta.app_metadata as Record<string, unknown> | undefined) ?? {};

  const rol =
    (appMetaInner.role as string | null | undefined) ??
    (appMeta.role as string | null | undefined) ??
    null;

  const repartidorId =
    (appMetaInner.repartidor_id as string | null | undefined) ??
    (appMeta.repartidor_id as string | null | undefined) ??
    null;

  if (rol !== 'Repartidor' || !repartidorId) {
    return (
      <main className={styles.container}>
        <h1>Acceso restringido</h1>
        <p>Esta vista es exclusiva para usuarios con rol Repartidor.</p>
      </main>
    );
  }

  const res = await getPedidosParaRuta(supabase, repartidorId);

  if (!res.ok) {
    return (
      <main className={styles.container}>
        <h1>Error al cargar pedidos</h1>
        <p>{res.error}</p>
      </main>
    );
  }

  return (
    <div className={styles.fullscreen}>
      <RepartidorDashboard initialPedidos={res.data} repartidorId={repartidorId} />
    </div>
  );
}

