/**
 * app/(authed)/vendedor/layout.tsx
 *
 * Guard fino para rutas /vendedor/*: solo Vendedor.
 *
 * El guard general de sesion ya lo hace (authed)/layout.tsx
 * (este layout anida adentro). Aqui solo agregamos la
 * verificacion de rol especifico.
 *
 * Si el usuario esta logueado pero NO es Vendedor,
 * lo redirigimos a SU panel segun su rol.
 */

import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";

export default async function VendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await getSesion();

  if (!sesion.rol) {
    redirect("/login");
  }

  if (sesion.rol !== "Vendedor") {
    const fallback =
      sesion.rol === "Administrador"
        ? "/admin/crm"
        : sesion.rol === "Repartidor"
        ? "/repartidor"
        : "/login";
    redirect(fallback);
  }

  return <>{children}</>;
}
