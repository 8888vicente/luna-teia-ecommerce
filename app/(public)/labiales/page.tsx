"use client";

import StoreTemplate from "../../../components/StoreTemplate";

const NAV_ITEMS = [
  { label: "Labiales", href: "/labiales" },
  { label: "Sombras de Ceja", href: "/sombras" },
  { label: "Delineadores", href: "/delineadores" },
  { label: "Rímel & Máscara", href: "/brillo" },
  { label: "Otros Productos", href: "/otros" },
];
export default function LabialesStore() {
  return (
    <StoreTemplate
      storeName="labiales"
      title="Catálogo de Labiales"
      subtitle="Realza tu belleza con nuestros tonos irresistibles."
      gradient="linear-gradient(90deg, #E0E0E0 0%, #F5F5F5 40%, #F5F5F5 60%, #E0E0E0 100%)"
      navItems={NAV_ITEMS}
    />
  );
}
