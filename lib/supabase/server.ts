/**
 * Cliente de Supabase para uso en el SERVIDOR (App Router).
 *
 * Construido con @supabase/ssr, el helper oficial de Supabase
 * para Next.js App Router. Maneja cookies automaticamente.
 *
 * Usar en: Server Components, Server Actions, Route Handlers.
 *
 * API expuesta: getSupabaseServer() -> SupabaseClient
 * (from, auth, etc. - misma API que supabase-js, asi que el
 * codigo existente que llama .from() no cambia).
 */

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Faltan env vars de Supabase para el cliente servidor. Revisa .env.local."
  );
}

export async function getSupabaseServer(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: CookieOptions }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Se ignora si se llama desde un Server Component (read-only).
          // Las cookies solo pueden modificarse desde
          // Server Actions / Route Handlers.
        }
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }) as unknown as SupabaseClient;
}