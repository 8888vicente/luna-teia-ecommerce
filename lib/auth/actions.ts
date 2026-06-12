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

  // 2) Obtener el usuario DESPUES de que el Custom Access Token Hook
  //    haya inyectado app_metadata.role y app_metadata.repartidor_id
  //    en el JWT. signInWithPassword devuelve el usuario antes de
  //    que el hook se ejecute; getUser() hace un viaje de ida y vuelta
  //    al servidor de auth y recibe el JWT YA procesado por el hook.
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error:
        userError?.message ??
        "No se pudo verificar la sesion tras el login. Intenta de nuevo.",
    };
  }

  // El Custom Access Token Hook devuelve { claims: { app_metadata: { role, repartidor_id } } }
  // y Supabase mete ese objeto DENTRO de app_metadata existente, resultando en:
  //   user.app_metadata.app_metadata.role
  // Por eso NO leemos user.app_metadata.role directamente, sino que buscamos
  // en user.app_metadata.app_metadata.role como prioridad.
  const appMeta = (userData.user.app_metadata ?? {}) as Record<string, unknown>;
  const appMetaInner = (appMeta.app_metadata as Record<string, unknown> | undefined) ?? {};

  const rolRaw =
    (appMetaInner.role as string | null | undefined) ??
    (appMeta.role as string | null | undefined) ??
    null;

  if (!rolRaw) {
    // Logueado pero sin rol en app_metadata: lo deslogueamos
    // y devolvemos error. Esto puede pasar si:
    //   - El usuario no esta en crm_usuarios_roles (no tiene rol asignado)
    //   - El Custom Access Token Hook fallo (revisar logs en Dashboard)
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
    Almacen: "/almacen",
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