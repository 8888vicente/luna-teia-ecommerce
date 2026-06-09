/**
 * app/(authed)/repartidor/layout.tsx
 *
 * Guard fino para rutas /repartidor/*: solo Repartidor.
 *
 * El guard general de sesion ya lo hace (authed)/layout.tsx
 * (este layout anida adentro). Aqui solo agregamos la
 * verificacion de rol especifico y, lo mas importante,
 * garantizamos que el JWT trae repartidor_id (sin el, no
 * podriamos cargar sus pedidos).
 *
 * Si el usuario esta logueado pero NO es Repartidor,
 * lo redirigimos a SU panel segun su rol.
 */

import { redirect } from "next/navigation";
import { getSesion, requireRepartidor } from "@/lib/auth";

export default async function RepartidorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await getSesion();

  // Defensa en profundidad: si no hay sesion, al login.
  if (!sesion.rol) {
    redirect("/login");
  }

  if (sesion.rol !== "Repartidor") {
    const fallback =
      sesion.rol === "Administrador" ? "/admin/crm" : "/login";
    redirect(fallback);
  }

  // Validacion extra: el JWT debe traer repartidor_id.
  // requireRepartidor() lanza si falta; lo capturamos para
  // mostrar un mensaje claro en vez de un 500.
  try {
    await requireRepartidor();
  } catch (err) {
    console.error("[repartidor/layout] repartidor_id faltante:", err);
    redirect("/login?error=" + encodeURIComponent("Tu cuenta no tiene repartidor asignado. Contacta al administrador."));
  }

  return <>{children}</>;
}