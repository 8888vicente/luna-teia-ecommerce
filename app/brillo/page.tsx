"use client";

import StoreTemplate from "../../components/StoreTemplate";

const NAV_ITEMS = [
  { label: "Labiales", href: "/labiales" },
  { label: "Sombras de Ceja", href: "/sombras" },
  { label: "Delineadores", href: "/delineadores" },
  { label: "Rímel & Máscara", href: "/brillo" },
  { label: "Otros Productos", href: "/otros" },
];
export default function BrilloStore() {
  return (
    <StoreTemplate
      storeName="brillo"
      title="Rímel & Máscara"
      subtitle="Pestañas largas, voluminosas y definidas. La mirada que siempre quisiste."
      gradient="linear-gradient(90deg, #b0bec5 0%, #F5F5F5 40%, #F5F5F5 60%, #b0bec5 100%)"
      navItems={NAV_ITEMS}
    />
  );
}

