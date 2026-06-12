/**
 * Cliente de Supabase con SERVICE ROLE (bypassa RLS).
 *
 * ⚠️  PELIGRO: este cliente ignora TODAS las políticas RLS.
 *     Úsalo SOLO en:
 *       - Server Actions con validación de rol explícita.
 *       - Webhooks (MercadoPago, DHL, etc.).
 *       - Migraciones / scripts admin puntuales.
 *
 *     NUNCA importes este archivo desde un Client Component
 *     o una variable que termine en el bundle del navegador.
 *     La SUPABASE_SERVICE_ROLE_KEY es SERVER-ONLY.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serviceClient: SupabaseClient | null = null;

export function getSupabaseService(): SupabaseClient {
  if (serviceClient) return serviceClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY. Esta clave SOLO debe existir en el servidor.'
    );
  }

  serviceClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClient;
}

/**
 * Obtiene el cliente de servicio si la clave está configurada,
 * o cae al cliente fallback (con cookies RLS) si no lo está.
 * Esto evita caídas del servidor si falta la variable de entorno.
 */
export function getSupabaseAdminClient(fallbackClient: SupabaseClient): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return fallbackClient;
  }
  return getSupabaseService();
}
