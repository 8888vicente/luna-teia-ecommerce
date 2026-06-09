/**
 * lib/auth/actions.ts
 *
 * Server Actions para autenticacion (login, signout, etc.).
 * Se ejecutan SOLO en el servidor (Next App Router).
 *
 * NOTA: este modulo NO usa el cliente SERVICE (service role).
 * Para leer el rol del usuario tras el login usamos
 * supabase.auth.getUser(), que respeta la sesion recien creada
 * y nos da el app_metadata.role sin necesidad de bypassear RLS.
 */

"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ActionResult, AppRol } from "./types";

export type SignInResult = ActionResult<{ rol: AppRol }>;

/**
 * Server Action: iniciar sesion con email + password.
 *
 * Flujo:
 *   1. Validar campos no vacios.
 *   2. signInWithPassword con el cliente del usuario (crea cookie).
 *   3. Leer el rol desde signInData.user.app_metadata.role
 *      (NO usamos service role: el cliente del usuario ya
 *      conoce su propio app_metadata tras el signIn).
 *   4. Decidir ruta de destino segun el rol.
 *   5. redirect() (lanza NEXT_REDIRECT, no retorna).
 */
export async function signInAction(formData: FormData): Promise<SignInResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim() || null;

  if (!email || !password) {
    return { ok: false, error: "Email y contrasena son obligatorios." };
  }

  const supabase = await getSupabaseServer();

  // 1) Login normal (crea cookie de sesion)
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError || !signInData.user) {
    return {
      ok: false,
      error:
        signInError?.message ??
        "No se pudo iniciar sesion. Verifica tus credenciales.",
    };
  }

  // 2) Leer el rol desde app_metadata del usuario recien logueado.
  //    El cliente del usuario YA conoce su app_metadata tras signIn.
  const appMeta = (signInData.user.app_metadata ?? {}) as Record<string, unknown>;
  const rolRaw = (appMeta.role as string | null | undefined) ?? null;

  if (!rolRaw) {
    // Logueado pero sin rol: lo deslogueamos y devolvemos error
    await supabase.auth.signOut();
    return {
      ok: false,
      error:
        "Tu cuenta aun no tiene un rol asignado. Pidele al administrador que te asigne uno.",
    };
  }

  // 3) Decidir ruta de destino.
  const targetByRol: Record<string, string> = {
    Administrador: "/admin/crm",
    Vendedor: "/vendedor",
    Repartidor: "/repartidor",
  };

  const fallback = targetByRol[rolRaw] ?? "/login";
  const safeNext = isSafeNext(next);
  const target = safeNext ?? fallback;

  // 4) Redirect (lanza NEXT_REDIRECT; no retorna)
  redirect(target);
}

/**
 * Server Action: cerrar sesion.
 */
export async function signOutAction(): Promise<never> {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Whitelist de `next` aceptable: solo rutas internas que
 * empiezan con `/` y NO con `//` (protocolo-relativo).
 * Evita open-redirect.
 */
function isSafeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  if (next.startsWith("/login")) return null;
  return next;
}