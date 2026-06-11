/**
 * app/(authed)/inventario/layout.tsx
 *
 * Guard para /inventario: solo Administrador y Vendedor.
 */
import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth";

export default async function InventarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await getSesion();

  if (!sesion.rol || !["Administrador", "Vendedor"].includes(sesion.rol)) {
    redirect("/login");
  }

  return <>{children}</>;
}
