/**
 * lib/auth/index.ts
 *
 * PUERTA PARA SERVER COMPONENTS / SERVER ACTIONS / ROUTE HANDLERS.
 *
 * Importar este archivo desde un CLIENT COMPONENT rompe el build
 * porque arrastra ./session, que usa next/headers (cookies()).
 *
 * Si estas en un Client Component, usa en su lugar:
 *
 *   import { signInAction } from "@/lib/auth/client";
 *
 * Si estas en el servidor, sigue usando:
 *
 *   import { getSesion, requireRol } from "@/lib/auth";
 *
 * Por que existen dos puertas? Porque cuando un Client Component
 * hace `import { signInAction } from "@/lib/auth"` y el barrel
 * tambien reexporta `./session`, el bundler de Next no puede
 * tree-shakear de forma confiable y termina metiendo el codigo
 * de next/headers en el bundle del cliente. La separacion
 * garantiza que el cliente solo ve la action, no la session.
 */

export type { AppRol, Sesion, SesionApp, SesionAnonima } from "./types";
export { AuthError } from "./types";

export {
  getSesion,
  requireSesion,
  requireRol,
  requireRepartidor,
} from "./session";