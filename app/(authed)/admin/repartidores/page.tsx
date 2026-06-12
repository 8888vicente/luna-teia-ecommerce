import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/auth';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseService, getSupabaseAdminClient } from '@/lib/supabase/service';
import { RepartidoresList } from './RepartidoresList';

export const dynamic = 'force-dynamic';

export default async function AdminRepartidoresPage() {
  const sesion = await getSesion();

  if (!sesion.rol || sesion.rol !== 'Administrador') {
    redirect('/login');
  }

  const serverClient = await getSupabaseServer();
  const supabase = getSupabaseAdminClient(serverClient);

  // Consulta todos los repartidores ordenados por ciudad y nombre
  const { data: repartidores, error: repError } = await supabase
    .from('repartidores')
    .select('*')
    .order('ciudad')
    .order('nombre');

  if (repError) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#ef4444' }}>Error al cargar repartidores</h1>
        <p>{repError.message}</p>
      </main>
    );
  }

  // Consulta la lista de usuarios en Supabase Auth usando Service Role
  // para permitir asociar cuentas a los repartidores
  let authUsers: { id: string; email?: string; name?: string }[] = [];
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const supabaseService = getSupabaseService();
      const { data: { users }, error: authError } = await supabaseService.auth.admin.listUsers();
      if (!authError && users) {
        authUsers = users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.full_name || u.email,
        }));
      }
    } else {
      console.warn('SUPABASE_SERVICE_ROLE_KEY no está configurada en el servidor. Asignación de cuentas auth desactivada.');
    }
  } catch (err) {
    console.error('Error al listar usuarios de Supabase Auth en página admin:', err);
  }

  return (
    <RepartidoresList 
      initialRepartidores={repartidores ?? []} 
      authUsers={authUsers} 
    />
  );
}
