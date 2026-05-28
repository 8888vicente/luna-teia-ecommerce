-- =============================================
-- LUNA TEIA - Setup completo (versión actualizada)
-- in_stock = int4 (cantidad de piezas disponibles)
-- =============================================

-- Si la tabla no existe, créala
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  family      TEXT NOT NULL,
  category    TEXT NOT NULL,
  price       NUMERIC NOT NULL DEFAULT 100,
  color_hex   TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  store       TEXT NOT NULL DEFAULT 'labiales',
  in_stock    INTEGER NOT NULL DEFAULT 5,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política pública de lectura
CREATE POLICY IF NOT EXISTS "Public can read products"
  ON products FOR SELECT USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_store    ON products(store);
CREATE INDEX IF NOT EXISTS idx_products_family   ON products(family);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- =============================================
-- FUNCIÓN: descontar piezas de stock al confirmar venta
-- =============================================
CREATE OR REPLACE FUNCTION decrement_stock(product_id TEXT, qty INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE products
  SET in_stock = GREATEST(in_stock - qty, 0)
  WHERE id = product_id AND in_stock >= qty
  RETURNING 1 INTO updated_rows;

  RETURN COALESCE(updated_rows, 0);
END;
$$;

-- Política para ejecutar la función
GRANT EXECUTE ON FUNCTION decrement_stock(TEXT, INTEGER) TO anon, authenticated;

-- =============================================
-- TABLA DE ÓRDENES (para llevar historial de compras)
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items        JSONB NOT NULL,
  total        NUMERIC NOT NULL DEFAULT 0,
  shipping_info JSONB DEFAULT '{}',
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política pública de inserción (cualquiera puede crear una orden)
CREATE POLICY IF NOT EXISTS "Public can insert orders"
  ON orders FOR INSERT WITH CHECK (true);

-- Política pública de lectura (para que el admin pueda verlas)
CREATE POLICY IF NOT EXISTS "Public can read orders"
  ON orders FOR SELECT USING (true);

-- =============================================
-- INSERTAR / ACTUALIZAR todos los productos
-- in_stock = 5 piezas para pruebas
-- =============================================

-- LABIALES
INSERT INTO products (id, name, family, category, price, color_hex, image_url, store, in_stock) VALUES
  ('r1',  'Pasion',       'Rojos',  'Labial Indeleble Mate', 100, '#d50000', '/Pasion.jpg',       'labiales', 5),
  ('r2',  'Cereza',       'Rojos',  'Labial Indeleble Mate', 100, '#c62828', '/Cereza.jpg',       'labiales', 5),
  ('r3',  'Rojo Quemado', 'Rojos',  'Labial Indeleble Mate', 100, '#b71c1c', '/Rojo_Quemado.jpg', 'labiales', 5),
  ('r4',  'Marte',        'Rojos',  'Labial Indeleble Mate', 100, '#8b1a1a', '/Marte.jpg',        'labiales', 5),
  ('r5',  'Fresa',        'Rojos',  'Labial Indeleble Mate', 100, '#e53935', '/Fresa.jpg',        'labiales', 5),
  ('r6',  'Coral',        'Rojos',  'Labial Indeleble Mate', 100, '#ff7043', '/Coral.jpg',        'labiales', 5),
  ('r7',  'Naranja',      'Rojos',  'Labial Indeleble Mate', 100, '#f4511e', '/Naranja.jpg',      'labiales', 5),
  ('r8',  'Naranja Mate', 'Rojos',  'Labial Indeleble Mate', 100, '#e64a19', '/Naranja_Mate.jpg', 'labiales', 5),
  ('r9',  'Tangerin',     'Rojos',  'Labial Indeleble Mate', 100, '#ff6d00', '/Tangerin.jpg',     'labiales', 5),
  ('r10', 'Mamey',        'Rojos',  'Labial Indeleble Mate', 100, '#d84315', '/Mamey_.jpg',       'labiales', 5),
  ('p1',  'Fiusha',       'Rosas',  'Labial Indeleble Mate', 100, '#e91e8c', '/Fiusha.jpg',       'labiales', 5),
  ('p2',  'Fiusha Mate',  'Rosas',  'Labial Indeleble Mate', 100, '#c2185b', '/Fiusha_mate.jpg',  'labiales', 5),
  ('p3',  'Rosa Neon',    'Rosas',  'Labial Indeleble Mate', 100, '#f50057', '/Rosa_Neon.jpg',    'labiales', 5),
  ('p4',  'Rosa Mx',      'Rosas',  'Labial Indeleble Mate', 100, '#ec407a', '/Rosa_Mx.jpg',      'labiales', 5),
  ('p5',  'Rose',         'Rosas',  'Labial Indeleble Mate', 100, '#f06292', '/Rose.jpg',         'labiales', 5),
  ('p6',  'Rosa Seda',    'Rosas',  'Labial Indeleble Mate', 100, '#f48fb1', '/Rosa_Seda.jpg',    'labiales', 5),
  ('p7',  'Palo Rosa',    'Rosas',  'Labial Indeleble Mate', 100, '#f8bbd0', '/Palo_Rosa.jpg',    'labiales', 5),
  ('p8',  'Bugambilia',   'Rosas',  'Labial Indeleble Mate', 100, '#ad1457', '/Bugambilia.jpg',   'labiales', 5),
  ('p9',  'Anis',         'Rosas',  'Labial Indeleble Mate', 100, '#d81b60', '/Anis_.jpg',        'labiales', 5),
  ('p10', 'Moon',         'Rosas',  'Labial Indeleble Mate', 100, '#e8a0bf', '/Moon.jpg',         'labiales', 5),
  ('v1',  'Nature',       'Varios', 'Labial Indeleble Mate', 100, '#d7ccc8', '/Nature.jpg',       'labiales', 5),
  ('v2',  'Secret',       'Varios', 'Labial Indeleble Mate', 100, '#bcaaa4', '/Secret.jpg',       'labiales', 5),
  ('v3',  'Terra',        'Varios', 'Labial Indeleble Mate', 100, '#a1887f', '/Terra.jpg',        'labiales', 5),
  ('v4',  'Caramelo',     'Varios', 'Labial Indeleble Mate', 100, '#bf8c6a', '/Caramelo.jpg',     'labiales', 5),
  ('v5',  'Moka',         'Varios', 'Labial Indeleble Mate', 100, '#795548', '/Moka.jpg',         'labiales', 5),
  ('v6',  'Chocolate',    'Varios', 'Labial Indeleble Mate', 100, '#5d4037', '/Chocolate.jpg',    'labiales', 5),
  ('v7',  'Expresso',     'Varios', 'Labial Indeleble Mate', 100, '#4e342e', '/Expresso.jpg',     'labiales', 5),
  ('v8',  'Cocoa',        'Varios', 'Labial Indeleble Mate', 100, '#6d4c41', '/Cocoa.jpg',        'labiales', 5),
  ('v9',  'Ciruela',      'Varios', 'Labial Indeleble Mate', 100, '#6a1b9a', '/Ciruela.jpg',      'labiales', 5),
  ('v10', 'Blackberry',   'Varios', 'Labial Indeleble Mate', 100, '#4a148c', '/Blackberry_.jpg',  'labiales', 5),
  ('x1',  'Purpura',      'Varios', 'Labial Indeleble Mate', 100, '#7b1fa2', '/Purpura.jpg',      'labiales', 5),
  ('x2',  'Piñon',        'Varios', 'Labial Indeleble Mate', 100, '#8d6e63', '/Piñon.jpg',        'labiales', 5),
  ('x3',  'Oro Sol',      'Rojos',  'Labial Indeleble Mate', 100, '#ffd54f', '/Oro_Sol.jpg',      'labiales', 5)
ON CONFLICT (id) DO UPDATE SET in_stock = 5;

-- SOMBRAS
INSERT INTO products (id, name, family, category, price, color_hex, image_url, store, in_stock) VALUES
  ('s1', 'Sombra Ceja Clara',   'Sombras de Ceja', 'Polvo Compacto', 95, '#d7ccc8', '/sombra-ceja/sombra%20ceja%20clara.jpg',   'sombras', 5),
  ('s2', 'Sombra Ceja Media',   'Sombras de Ceja', 'Polvo Compacto', 95, '#8d6e63', '/sombra-ceja/sombra%20ceja%20media.jpg',   'sombras', 5),
  ('s3', 'Sombra Ceja Negra',   'Sombras de Ceja', 'Polvo Compacto', 95, '#4e342e', '/sombra-ceja/sombra%20ceja%20negra.png',   'sombras', 5),
  ('s4', 'Sombra Ceja Obscura', 'Sombras de Ceja', 'Polvo Compacto', 95, '#212121', '/sombra-ceja/sombra%20ceja%20obscura.jpg', 'sombras', 5)
ON CONFLICT (id) DO UPDATE SET in_stock = 5;

-- DELINEADORES
INSERT INTO products (id, name, family, category, price, color_hex, image_url, store, in_stock) VALUES
  ('d1', 'Delineador Negro', 'Delineadores', 'Líquido Indeleble', 85, '#000000', '/delineadores/delineador-negro.jpg', 'delineadores', 5),
  ('d2', 'Delineador Azul',  'Delineadores', 'Líquido Indeleble', 85, '#0d47a1', '/delineadores/delineador-azul.jpg',  'delineadores', 5),
  ('d3', 'Delineador Plata', 'Delineadores', 'Líquido Indeleble', 85, '#e0e0e0', '/delineadores/delineador-plata.jpg', 'delineadores', 5),
  ('d4', 'Delineador Gris',  'Delineadores', 'Líquido Indeleble', 85, '#757575', '/delineadores/delineador-gris.jpg',  'delineadores', 5),
  ('d5', 'Delineador Oro',   'Delineadores', 'Líquido Indeleble', 85, '#ffd700', '/delineadores/delineador-oro.jpg',   'delineadores', 5)
ON CONFLICT (id) DO UPDATE SET in_stock = 5;

-- RÍMEL
INSERT INTO products (id, name, family, category, price, color_hex, image_url, store, in_stock) VALUES
  ('m1', 'Rímel Voluminizador', 'Máscara de Pestañas', 'A prueba de agua', 120, '#212121', '/rimel/rimel-voluminizador.jpg', 'brillo', 5),
  ('m2', 'Rímel Alargador',    'Máscara de Pestañas', 'A prueba de agua', 120, '#000000', '/rimel/rimel-alargador.jpg',    'brillo', 5),
  ('m3', 'Rímel Rizador',      'Máscara de Pestañas', 'Efecto curvador',  120, '#1a237e', '/rimel/rimel-rizador.jpg',      'brillo', 5)
ON CONFLICT (id) DO UPDATE SET in_stock = 5;

-- OTROS
INSERT INTO products (id, name, family, category, price, color_hex, image_url, store, in_stock) VALUES
  ('b1', 'Brillo Rosa Crystal', 'Brillo Labial', 'Brillo Hidratante', 80, '#f48fb1', '/otros/brillo-rosa-crystal.jpg', 'otros', 5),
  ('b2', 'Brillo Nude Glass',   'Brillo Labial', 'Brillo Hidratante', 80, '#ffccbc', '/otros/brillo-nude-glass.jpg',   'otros', 5)
ON CONFLICT (id) DO UPDATE SET in_stock = 5;

-- =============================================
-- VERIFICAR INVENTARIO FINAL
-- =============================================
SELECT store, COUNT(*) as productos, SUM(in_stock) as piezas_totales
FROM products
GROUP BY store
ORDER BY store;
