/**
 * lib/auth/types.ts
 * ───────────────────────────────────────────────────────────
 * Tipos del módulo de autenticación.
 *
 * Este módulo es el CORE de la app: cualquier server component,
 * server action o route handler que necesite saber quién es el
 * usuario DEBE pasar por aquí (getSesion, requireRol, etc.).
 *
 * La fuente de verdad del rol y el repartidor_id es el campo
 * `app_metadata` del usuario de Supabase, poblado por la
 * migración 04_crm_seguridad_jwt.sql.
 * ───────────────────────────────────────────────────────────
 */

/**
 * Roles reconocidos por el core de la app.
 * Coinciden con los strings que el script 04 inyecta en
 * `auth.users.app_metadata.role`.
 *
 *   - 'Administrador'  : el dueño y su socio. Ven todo.
 *   - 'Vendedor'       : capturistas de Facebook. Solo crean
 *                        pedidos desde la conversación.
 *   - 'Repartidor'     : mensajeros. Solo ven su ruta y su
 *                        cartera (comisiones y pagos).
 *
 * NOTA: 'Cajero' y 'Almacen' se agregarán a este tipo cuando
 * se construyan sus módulos (YAGNI).
 */
export type AppRol = 'Administrador' | 'Vendedor' | 'Repartidor';

/**
 * Estructura mínima que necesita la app sobre el usuario actual.
 * NO incluye tokens ni datos sensibles.
 */
export type SesionApp = {
  /** ID del usuario en auth.users (UUID). */
  userId: string;
  /** Email de la cuenta. */
  email: string | null;
  /** Rol extraído de app_metadata.role. */
  rol: AppRol;
  /**
   * ID del repartidor asociado, solo presente cuando rol === 'Repartidor'.
   * Lo escribe el script 04 al asignar el rol.
   */
  repartidorId: string | null;
  /**
   * Display name para el header. Prioriza metadata.full_name,
   * luego la parte local del email.
   */
  displayName: string;
};

/**
 * Variante "no autenticado" para que el guard del layout
 * pueda diferenciar sin lanzar excepciones.
 */
export type SesionAnonima = {
  userId: null;
  email: null;
  rol: null;
  repartidorId: null;
  displayName: '';
};

/** Unión discriminated para getSesion(): */
export type Sesion = SesionApp | SesionAnonima;

/** Tipo de guardia. Si no se cumple, se lanza este error. */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'INVALID_CLAIMS'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };
