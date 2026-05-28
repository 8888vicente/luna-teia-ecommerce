"use client";

import StoreTemplate from "../../components/StoreTemplate";

const NAV_ITEMS = [
  { label: "Labiales", href: "/labiales" },
  { label: "Sombras de Ceja", href: "/sombras" },
  { label: "Delineadores", href: "/delineadores" },
  { label: "Rímel & Máscara", href: "/brillo" },
  { label: "Otros Productos", href: "/otros" },
];
export default function SombrasStore() {
  return (
    <StoreTemplate
      storeName="sombras"
      title="Sombras de Ceja"
      subtitle="Define y perfila tu mirada con precisión."
      gradient="linear-gradient(90deg, #d7ccc8 0%, #F5F5F5 40%, #F5F5F5 60%, #d7ccc8 100%)"
      navItems={NAV_ITEMS}
    />
  );
}

