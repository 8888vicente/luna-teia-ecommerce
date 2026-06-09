/**
 * Cliente de Supabase para uso en el servidor (App Router).
 *
 * - Lee las cookies de la request para rehidratar la sesión del usuario.
 * - Cumple las políticas RLS del usuario autenticado.
 * - Usar en: Server Components, Server Actions, Route Handlers.
 *
 * Patrón basado en la guía oficial de Supabase para Next.js App Router.
 * Como el proyecto usa cookies nativas de Next 14+ (cookies() await),
 * NO depende de next/headers dinámico (compatible con Next 16).
 */
import { cookies } from 'next/headers';
import { createServerClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan env vars de Supabase para el cliente servidor. Revisa .env.local.'
  );

}
export async function getSupabaseServer(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Se ignora si se llama desde un Server Component (read-only).
          // Las cookies solo pueden modificarse desde Server Actions / Route Handlers.
        }
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
