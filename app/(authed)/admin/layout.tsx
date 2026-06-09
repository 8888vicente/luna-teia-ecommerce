/**
 * app/(authed)/admin/layout.tsx
 *
 * Guard fino para rutas /admin/*: solo Administrador.
 *
 * El guard general de sesion ya lo hace (authed)/layout.tsx
 * (este layout anida adentro). Aqui solo agregamos la
 * verificacion de rol especifico.
 *
 * Si el usuario esta logueado pero NO es Administrador,
 * lo redirigimos a SU panel segun su rol (no a /login).
 */

import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await getSesion();

  // (authed)/layout.tsx ya filtra no-logueados, pero por
  // defensa en profundidad validamos otra vez.
  if (!sesion.rol) {
    redirect("/login");
  }

  if (sesion.rol !== "Administrador") {
    // Redirigir al panel que SÍ le corresponde
    const fallback =
      sesion.rol === "Repartidor" ? "/repartidor" : "/login";
    redirect(fallback);
  }

  return <>{children}</>;
}