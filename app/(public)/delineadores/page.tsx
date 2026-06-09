"use client";

import StoreTemplate from "../../../components/StoreTemplate";

const NAV_ITEMS = [
  { label: "Labiales", href: "/labiales" },
  { label: "Sombras de Ceja", href: "/sombras" },
  { label: "Delineadores", href: "/delineadores" },
  { label: "Rímel & Máscara", href: "/brillo" },
  { label: "Otros Productos", href: "/otros" },
];
export default function DelineadoresStore() {
  return (
    <StoreTemplate
      storeName="delineadores"
      title="Ojos que Impactan"
      subtitle="Descubre nuestra línea de delineadores para una mirada inolvidable."
      gradient="linear-gradient(90deg, #cfd8dc 0%, #F5F5F5 40%, #F5F5F5 60%, #cfd8dc 100%)"
      navItems={NAV_ITEMS}
    />
  );
}

