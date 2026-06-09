/**
 * lib/auth/session.ts
 * ───────────────────────────────────────────────────────────
 * Funciones para leer y validar la sesión del usuario actual
 * en el SERVIDOR (Server Components, Server Actions, Route
 * Handlers).
 *
 * Reglas de uso:
 *   - SIEMPRE usar estas funciones; NUNCA leer el cliente de
 *     Supabase directamente para temas de auth.
 *   - getSesion()   → devuelve la sesión actual (o anónima).
 *   - requireSesion() → lanza si NO hay sesión.
 *   - requireRol(r) → lanza si el rol no coincide.
 *
 * Si necesitas bypassear auth, ve a `lib/supabase/service.ts`
 * y déjalo explícito en el callsite.
 * ───────────────────────────────────────────────────────────
 */

import { getSupabaseServer } from '@/lib/supabase/server';
import { AuthError, type AppRol, type Sesion, type SesionApp } from './types';

/**
 * Roles válidos que el core reconoce. Cualquier otro string
 * que venga en `app_metadata.role` se considera "sin permisos"
 * y el guard mandará al usuario al login.
 */
const ROLES_VALIDOS: readonly AppRol[] = [
  'Administrador',
  'Vendedor',
  'Repartidor',
] as const;

/**
 * Deriva un nombre a mostrar a partir de metadata o email.
 * - Si tiene user_metadata.full_name → usa ese.
 * - Si no, usa la parte antes del @ del email.
 * - Si tampoco hay email, devuelve 'Invitado'.
 */
function deriveDisplayName(args: {
  fullName: string | null | undefined;
  email: string | null | undefined;
}): string {
  const fn = args.fullName?.trim();
  if (fn) return fn;
  if (!args.email) return 'Invitado';
  const local = args.email.split('@')[0] ?? '';
  // Capitaliza la primera letra: "vicente" → "Vicente"
  if (!local) return 'Invitado';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

/**
 * Lee la sesión actual del servidor.
 * - Si no hay usuario autenticado → { autenticado: false, ... }.
 * - Si hay usuario, devuelve { autenticado: true, userId, email,
 *   rol, repartidorId, displayName }.
 *
 * NUNCA lanza. Si necesitas una excepción, usa requireSesion().
 */
export async function getSesion(): Promise<Sesion> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      userId: null,
      email: null,
      rol: null,
      repartidorId: null,
      displayName: '',
    };
  }

  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const userMeta = (user.user_metadata ?? {}) as Record<string, unknown>;

  const rawRol = (appMeta.role as string | null | undefined) ?? null;
  const rol: AppRol | null =
    rawRol && (ROLES_VALIDOS as readonly string[]).includes(rawRol)
      ? (rawRol as AppRol)
      : null;

  const repartidorId =
    (appMeta.repartidor_id as string | null | undefined) ?? null;

  // Si el rol no es válido, NO construimos SesionApp: devolvemos
  // sesión anónima para que el guard mande al usuario a /login.
  if (!rol) {
    return {
      userId: null,
      email: null,
      rol: null,
      repartidorId: null,
      displayName: '',
    };
  }

  const sesion: SesionApp = {
    userId: user.id,
    email: user.email ?? null,
    rol,
    repartidorId: rol === 'Repartidor' ? repartidorId : null,
    displayName: deriveDisplayName({
      fullName: (userMeta.full_name as string | null | undefined) ?? null,
      email: user.email ?? null,
    }),
  };

  return sesion;
}

/**
 * Garantiza que hay una sesión válida. Lanza AuthError si no.
 */
export async function requireSesion(): Promise<SesionApp> {
  const sesion = await getSesion();
  if (!sesion.rol) {
    throw new AuthError('UNAUTHORIZED: sesión requerida.', 'UNAUTHENTICATED');
  }
  return sesion;
}

/**
 * Garantiza que la sesión tiene UNO de los roles indicados.
 *
 * Ej:
 *   await requireRol('Administrador');
 *   await requireRol(['Administrador', 'Vendedor']);
 */
export async function requireRol(
  rol: AppRol | readonly AppRol[]
): Promise<SesionApp> {
  const sesion = await requireSesion();
  const allowed = Array.isArray(rol) ? rol : [rol];
  if (!allowed.includes(sesion.rol)) {
    throw new AuthError(
      `FORBIDDEN: se requiere rol ${allowed.join(' o ')}. Actual: ${sesion.rol}.`,
      'FORBIDDEN'
    );
  }
  return sesion;
}

/**
 * Atajo para repartidores: además de validar el rol, garantiza
 * que el JWT trae el repartidor_id (sin él, el repartidor no
 * puede ver su propia ruta).
 */
export async function requireRepartidor(): Promise<
  SesionApp & { repartidorId: string }
> {
  const sesion = await requireRol('Repartidor');
  if (!sesion.repartidorId) {
    throw new AuthError(
      'INVALID_CLAIMS: el JWT no contiene repartidor_id. Pídele al admin que asigne el rol con sp_crm_asignar_rol.',
      'INVALID_CLAIMS'
    );
  }
  return sesion as SesionApp & { repartidorId: string };
}
