/**
 * Cliente de Supabase para uso en el navegador (Client Components).
 *
 * - Respeta la sesión del usuario (RLS activo).
 * - Singleton: se inicializa una sola vez por instancia del navegador.
 * - Usar en: componentes con "use client", hooks, event handlers.
 *
 * NO usar para:
 *   - Operaciones administrativas (usa lib/supabase/service.ts).
 *   - Server Components / Server Actions (usa lib/supabase/server.ts).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan las env vars públicas de Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).'
    );
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
