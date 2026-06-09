/**
 * lib/crm/session.ts
 * ───────────────────────────────────────────────────────────
 * DEPRECADO: este archivo se conserva temporalmente para que
 * el código existente siga compilando. Toda la lógica vive
 * ahora en `lib/auth/`. Reexporta desde ahí.
 *
 * TODO: cuando todos los callsites importen desde '@/lib/auth',
 * eliminar este archivo.
 * ───────────────────────────────────────────────────────────
 */

export {
  getSesion as getSesionCrm,
  requireRol,
  requireRepartidor,
} from '@/lib/auth';

export { AuthError } from '@/lib/auth';
export type { AppRol as CrmRol, Sesion as SesionCrm } from '@/lib/auth';
