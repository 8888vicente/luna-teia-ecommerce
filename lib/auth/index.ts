/**
 * lib/auth/index.ts
 *
 * PUERTA UNICA del modulo de autenticacion.
 *
 * Regla de oro: el resto de la app NUNCA importa desde
 * `lib/auth/session.ts` ni `lib/auth/types.ts` directamente.
 * Siempre desde aqui:
 *
 *   import { getSesion, requireRol } from "@/lib/auth";
 *
 * Esto nos permite reorganizar el modulo sin romper nada.
 */

export type { AppRol, Sesion, SesionApp, SesionAnonima } from "./types";
export { AuthError } from "./types";

export { getSesion, requireSesion, requireRol, requireRepartidor } from "./session";

export { signInAction, signOutAction } from "./actions";
export type { SignInResult } from "./actions";