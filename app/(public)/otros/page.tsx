"use client";

import StoreTemplate from "../../../components/StoreTemplate";

const NAV_ITEMS = [
  { label: "Labiales", href: "/labiales" },
  { label: "Sombras de Ceja", href: "/sombras" },
  { label: "Delineadores", href: "/delineadores" },
  { label: "Rímel & Máscara", href: "/brillo" },
  { label: "Otros Productos", href: "/otros" },
];
export default function OtrosStore() {
  return (
    <StoreTemplate
      storeName="otros"
      title="Otros Productos"
      subtitle="Complementa tu look con nuestro brillo labial hidratante y luminoso."
      gradient="linear-gradient(90deg, #ffe0b2 0%, #F5F5F5 40%, #F5F5F5 60%, #ffe0b2 100%)"
      navItems={NAV_ITEMS}
    />
  );
}

