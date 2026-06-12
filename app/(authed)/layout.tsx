/**
 * app/(authed)/layout.tsx
 *
 * Shell autenticado de Luna Teia.
 *
 * Responsabilidades:
 *   1. Guard de sesion: si no hay sesion, redirige a
 *      /login?next=<ruta actual>.
 *   2. Sidebar adaptado al rol (Admin ve mas links que Vendedor).
 *   3. Header con nombre del usuario, su rol y boton de logout.
 *   4. Guarda el orden del sidebar como una constante que
 *      vive SOLO en este archivo (futuro modulo de navegacion).
 *
 * Es un Server Component (no usa estado del cliente).
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getSesion } from "@/lib/auth";
import type { AppRol } from "@/lib/auth";
import styles from "./layout.module.css";

// =============================================
// Tipos del menu
// =============================================
type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles: readonly AppRol[];
};

const NAV: readonly NavItem[] = [




  { href: "/admin/crm", label: "Panel general",  icon: "\u{1F4CA}", roles: ["Administrador"] },
  { href: "/admin/crm", label: "Pedidos",        icon: "\u{1F4E6}", roles: ["Administrador"] },
  { href: "/admin/repartidores", label: "Repartidores",   icon: "\u{1F697}", roles: ["Administrador"] },
  { href: "/admin/envios", label: "Env&iacute;os",       icon: "\u{1F69A}", roles: ["Administrador"] },
  { href: "/admin/crm", label: "Finanzas",       icon: "\u{1F4B0}", roles: ["Administrador"] },
  { href: "/vendedor",   label: "Capturar venta", icon: "\u{1F4DD}", roles: ["Vendedor"] },
  { href: "/vendedor/ventas", label: "Ver ventas",    icon: "\u{1F4CA}", roles: ["Vendedor"] },
  { href: "/inventario",  label: "Ver inventario", icon: "\u{1F4E6}", roles: ["Administrador", "Vendedor"] },
  { href: "/repartidor", label: "Mi ruta",        icon: "\u{1F5FA}", roles: ["Repartidor"] },
  { href: "/repartidor/inventario", label: "Mi inventario", icon: "\u{1F4E6}", roles: ["Repartidor"] },
  { href: "/repartidor", label: "Mi cartera",     icon: "\u{1F4B5}", roles: ["Repartidor"] },
];


// =============================================
// Initials helper para el avatar
// =============================================
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

// =============================================
// Layout
// =============================================
export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Guard de sesion ──────────────────────────
  const sesion = await getSesion();

  if (!sesion.rol) {
    // Construimos el next a partir del header referer (no perfecto
    // pero suficiente para devolver al usuario a donde iba).
    const hdrs = await headers();
    const current = hdrs.get("x-pathname") ?? hdrs.get("referer") ?? "/admin";
    const next = encodeURIComponent(current);
    redirect(`/login?next=${next}`);
  }

  const itemsVisibles = NAV.filter((n) => n.roles.includes(sesion.rol));

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ─────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">LT</div>
          <div className={styles.brandText}>
            <strong>Luna Teia</strong>
            <span>CRM interno</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {itemsVisibles.map((item, idx) => (
            <Link key={idx} href={item.href} className={styles.navItem}>
              <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.userBox}>
          <div className={styles.avatar} aria-hidden="true">
            {initials(sesion.displayName)}
          </div>
          <div className={styles.userInfo}>
            <strong>{sesion.displayName}</strong>
            <span className={styles.userRol}>{sesion.rol}</span>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────── */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.crumb}>Luna Teia</span>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCurrent}>
              {sesion.rol === "Administrador"
                ? "Panel"
                : sesion.rol === "Vendedor"
                ? "Captura"
                : "Mi ruta"}
            </span>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className={styles.logout}>
              Salir
            </button>
          </form>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}