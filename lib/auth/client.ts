/**
 * lib/auth/client.ts
 *
 * PUERTA PARA CLIENT COMPONENTS.
 *
 * Solo expone las Server Actions. Importar este archivo
 * desde un Client Component es SEGURO: el bundler de Next
 * sabe cortar el codigo de la action y dejar en el cliente
 * solo una referencia opaca.
 *
 *   "use client";
 *   import { signInAction } from "@/lib/auth/client";
 *
 * NO importes desde este archivo nada que termine en
 * ./session (que usa next/headers) o ./types si los tipos
 * dependen de algo del servidor.
 */

export { signInAction, signOutAction } from "./actions";
export type { SignInResult } from "./actions";

export type { AppRol } from "./types";