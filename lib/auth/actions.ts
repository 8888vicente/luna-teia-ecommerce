/**
 * lib/auth/actions.ts
 *
 * Server Actions para autenticacion (login, signout, etc.).
 * Se ejecutan SOLO en el servidor (Next App Router).
 * Devuelven ActionResult<T> para contrato uniforme ok/error.
 * NUNCA exponen secretos ni la SERVICE_KEY al bundle.
 *
 * Para usarlas desde un Client Component:
 *   "use client";
 *   import { signInAction } from "@/lib/auth";
 *   const res = await signInAction(formData);
 */

"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";
import type { ActionResult, AppRol } from "./types";

/**
 * Resultado del login. Si ok=true, el `redirect` ya se
 * habra ejecutado y este return nunca se alcanza.
 * Si ok=false, devolvemos el mensaje de error para el form.
 */
export type SignInResult = ActionResult<{ rol: AppRol }>;

/**
 * Server Action: iniciar sesion con email + password.
 *
 * Flujo:
 *   1. Validar campos no vacios.
 *   2. signInWithPassword con el cliente del usuario (crea cookie).
 *   3. Leer app_metadata.role con el cliente SERVICE.
 *   4. Determinar la ruta de destino segun el rol.
 *   5. redirect() (lanza NEXT_REDIRECT, no retorna).
 *
 * Si algo falla, devolvemos { ok: false, error }.
 */
export async function signInAction(formData: FormData): Promise<SignInResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim() || null;

  if (!email || !password) {
    return { ok: false, error: "Email y contrasena son obligatorios." };
  }

  const supabase = await getSupabaseServer();

  // 1) Login con el cliente del usuario (respeta RLS, crea cookie)
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

  // 2) Leer el rol desde app_metadata con cliente SERVICE
  const svc = getSupabaseService();
  const { data: userRow, error: userError } = await svc.auth.admin.getUserById(
    signInData.user.id
  );

  if (userError || !userRow?.user) {
    return {
      ok: false,
      error: "Sesion iniciada pero no se pudo leer el rol del usuario.",
    };
  }

  const appMeta = (userRow.user.app_metadata ?? {}) as Record<string, unknown>;
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
  //    Si vino un `next` valido (misma app, ruta interna), se respeta.
  //    Si no, mandamos al panel por defecto del rol.
  const targetByRol: Record<string, string> = {
    Administrador: "/admin",
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
 * Server Action: cerrar sesion. Llamable desde el header
 * (que es server component) o desde un client component.
 */
export async function signOutAction(): Promise<never> {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Whitelist de `next` aceptable: solo rutas internas que
 * empiezan con `/` y NO con `//` (protocolo-relativo).
 * Evita open-redirect: ?next=https://evil.com.
 */
function isSafeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  if (next.startsWith("/login")) return null; // evita loop login
  return next;
}