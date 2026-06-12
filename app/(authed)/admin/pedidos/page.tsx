import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/auth';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/service';
import { PedidosEditor } from './PedidosEditor';

export const dynamic = 'force-dynamic';

export default async function AdminPedidosPage() {
  const sesion = await getSesion();

  if (!sesion.rol || sesion.rol !== 'Administrador') {
    redirect('/login');
  }

  const serverClient = await getSupabaseServer();
  const supabase = getSupabaseAdminClient(serverClient);

  // Cargar los últimos 150 pedidos con sus productos asociados y detalles de producto
  const { data: pedidos, error: pedError } = await supabase
    .from('pedidos_central')
    .select('*, pedido_items(*, products:producto_id(name, color_hex, image_url, family))')
    .order('created_at', { ascending: false })
    .limit(150);

  // Cargar todos los repartidores activos para poder re-asignar pedidos
  const { data: repartidores, error: repError } = await supabase
    .from('repartidores')
    .select('*')
    .eq('activo', true)
    .order('nombre');

  if (pedError) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#ef4444' }}>Error al cargar pedidos</h1>
        <p>{pedError.message}</p>
      </main>
    );
  }

  return (
    <PedidosEditor
      initialPedidos={(pedidos ?? []) as any}
      repartidores={repartidores ?? []}
    />
  );
}
