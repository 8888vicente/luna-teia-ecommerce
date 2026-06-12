import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/auth';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/service';
import { EmpaqueDashboard } from './EmpaqueDashboard';

export const dynamic = 'force-dynamic';

export default async function AlmacenPage() {
  const sesion = await getSesion();

  // Permitir solo a Administrador o Almacen
  if (!sesion.rol || !['Administrador', 'Almacen'].includes(sesion.rol)) {
    redirect('/login');
  }

  const serverClient = await getSupabaseServer();
  const supabase = getSupabaseAdminClient(serverClient);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Consulta de pedidos:
  // Cargamos todos los que NO estén empaquetados (pendiente/en proceso), 
  // más los creados hoy (aunque ya estén listos, para control de histórico de hoy).
  const { data: pedidos, error } = await supabase
    .from('pedidos_central')
    .select('*, pedido_items(*, products:producto_id(name, color_hex, image_url, family))')
    .or(`estatus_empaque.neq.completado,created_at.gte.${todayStart.toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#ef4444' }}>Error al cargar pedidos del almacén</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <EmpaqueDashboard
      initialPedidos={pedidos as any}
    />
  );
}
