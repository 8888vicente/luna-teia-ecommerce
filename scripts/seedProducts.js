/*
  Seed script for Supabase products table.
  Usage:
    1) npm install @supabase/supabase-js
    2) Set env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role key required to insert safely)
    3) node scripts/seedProducts.js

  WARNING: Don't share your service role key. Run locally or in a protected CI step.
*/

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const products = [
  { id: 'r1',  name: 'Pasion',       family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#d50000', image_url: '/Pasion.jpg',       store: 'labiales', in_stock: 5 },
  { id: 'r2',  name: 'Cereza',       family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#c62828', image_url: '/Cereza.jpg',       store: 'labiales', in_stock: 5 },
  { id: 'r3',  name: 'Rojo Quemado', family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#b71c1c', image_url: '/Rojo_Quemado.jpg', store: 'labiales', in_stock: 5 },
  { id: 'r4',  name: 'Marte',        family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#8b1a1a', image_url: '/Marte.jpg',        store: 'labiales', in_stock: 5 },
  { id: 'r5',  name: 'Fresa',        family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#e53935', image_url: '/Fresa.jpg',        store: 'labiales', in_stock: 5 },
  { id: 'r6',  name: 'Coral',        family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#ff7043', image_url: '/Coral.jpg',        store: 'labiales', in_stock: 5 },
  { id: 'r7',  name: 'Naranja',      family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#f4511e', image_url: '/Naranja.jpg',      store: 'labiales', in_stock: 5 },
  { id: 'r8',  name: 'Naranja Mate', family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#e64a19', image_url: '/Naranja_Mate.jpg', store: 'labiales', in_stock: 5 },
  { id: 'r9',  name: 'Tangerin',     family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#ff6d00', image_url: '/Tangerin.jpg',     store: 'labiales', in_stock: 5 },
  { id: 'r10', name: 'Mamey',        family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#d84315', image_url: '/Mamey_.jpg',       store: 'labiales', in_stock: 5 },
  { id: 'p1',  name: 'Fiusha',       family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#e91e8c', image_url: '/Fiusha.jpg',       store: 'labiales', in_stock: 5 },
  { id: 'p2',  name: 'Fiusha Mate',  family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#c2185b', image_url: '/Fiusha_mate.jpg',  store: 'labiales', in_stock: 5 },
  { id: 'p3',  name: 'Rosa Neon',    family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#f50057', image_url: '/Rosa_Neon.jpg',    store: 'labiales', in_stock: 5 },
  { id: 'p4',  name: 'Rosa Mx',      family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#ec407a', image_url: '/Rosa_Mx.jpg',      store: 'labiales', in_stock: 5 },
  { id: 'p5',  name: 'Rose',         family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#f06292', image_url: '/Rose.jpg',         store: 'labiales', in_stock: 5 },
  { id: 'p6',  name: 'Rosa Seda',    family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#f48fb1', image_url: '/Rosa_Seda.jpg',    store: 'labiales', in_stock: 5 },
  { id: 'p7',  name: 'Palo Rosa',    family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#f8bbd0', image_url: '/Palo_Rosa.jpg',    store: 'labiales', in_stock: 5 },
  { id: 'p8',  name: 'Bugambilia',   family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#ad1457', image_url: '/Bugambilia.jpg',   store: 'labiales', in_stock: 5 },
  { id: 'p9',  name: 'Anis',         family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#d81b60', image_url: '/Anis_.jpg',        store: 'labiales', in_stock: 5 },
  { id: 'p10', name: 'Moon',         family: 'Rosas',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#e8a0bf', image_url: '/Moon.jpg',         store: 'labiales', in_stock: 5 },
  { id: 'v1',  name: 'Nature',       family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#d7ccc8', image_url: '/Nature.jpg',       store: 'labiales', in_stock: 5 },
  { id: 'v2',  name: 'Secret',       family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#bcaaa4', image_url: '/Secret.jpg',       store: 'labiales', in_stock: 5 },
  { id: 'v3',  name: 'Terra',        family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#a1887f', image_url: '/Terra.jpg',        store: 'labiales', in_stock: 5 },
  { id: 'v4',  name: 'Caramelo',     family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#bf8c6a', image_url: '/Caramelo.jpg',     store: 'labiales', in_stock: 5 },
  { id: 'v5',  name: 'Moka',         family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#795548', image_url: '/Moka.jpg',         store: 'labiales', in_stock: 5 },
  { id: 'v6',  name: 'Chocolate',    family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#5d4037', image_url: '/Chocolate.jpg',    store: 'labiales', in_stock: 5 },
  { id: 'v7',  name: 'Expresso',     family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#4e342e', image_url: '/Expresso.jpg',     store: 'labiales', in_stock: 5 },
  { id: 'v8',  name: 'Cocoa',        family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#6d4c41', image_url: '/Cocoa.jpg',        store: 'labiales', in_stock: 5 },
  { id: 'v9',  name: 'Ciruela',      family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#6a1b9a', image_url: '/Ciruela.jpg',      store: 'labiales', in_stock: 5 },
  { id: 'v10', name: 'Blackberry',   family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#4a148c', image_url: '/Blackberry_.jpg',  store: 'labiales', in_stock: 5 },
  { id: 'x1',  name: 'Purpura',      family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#7b1fa2', image_url: '/Purpura.jpg',      store: 'labiales', in_stock: 5 },
  { id: 'x2',  name: 'Piñon',        family: 'Varios', category: 'Labial Indeleble Mate', price: 100, color_hex: '#8d6e63', image_url: '/Piñon.jpg',        store: 'labiales', in_stock: 5 },
  { id: 'x3',  name: 'Oro Sol',      family: 'Rojos',  category: 'Labial Indeleble Mate', price: 100, color_hex: '#ffd54f', image_url: '/Oro_Sol.jpg',      store: 'labiales', in_stock: 5 },
  { id: 's1', name: 'Sombra Ceja Clara',   family: 'Sombras de Ceja', category: 'Polvo Compacto', price: 95, color_hex: '#d7ccc8', image_url: '/sombra-ceja/sombra%20ceja%20clara.jpg',   store: 'sombras', in_stock: 5 },
  { id: 's2', name: 'Sombra Ceja Media',   family: 'Sombras de Ceja', category: 'Polvo Compacto', price: 95, color_hex: '#8d6e63', image_url: '/sombra-ceja/sombra%20ceja%20media.jpg',   store: 'sombras', in_stock: 5 },
  { id: 's3', name: 'Sombra Ceja Negra',   family: 'Sombras de Ceja', category: 'Polvo Compacto', price: 95, color_hex: '#4e342e', image_url: '/sombra-ceja/sombra%20ceja%20negra.png',   store: 'sombras', in_stock: 5 },
  { id: 's4', name: 'Sombra Ceja Obscura', family: 'Sombras de Ceja', category: 'Polvo Compacto', price: 95, color_hex: '#212121', image_url: '/sombra-ceja/sombra%20ceja%20obscura.jpg', store: 'sombras', in_stock: 5 },
  { id: 'd1', name: 'Delineador Negro', family: 'Delineadores', category: 'Líquido Indeleble', price: 85, color_hex: '#000000', image_url: '/delineadores/delineador-negro.jpg', store: 'delineadores', in_stock: 5 },
  { id: 'd2', name: 'Delineador Azul',  family: 'Delineadores', category: 'Líquido Indeleble', price: 85, color_hex: '#0d47a1', image_url: '/delineadores/delineador-azul.jpg',  store: 'delineadores', in_stock: 5 },
  { id: 'd3', name: 'Delineador Plata', family: 'Delineadores', category: 'Líquido Indeleble', price: 85, color_hex: '#e0e0e0', image_url: '/delineadores/delineador-plata.jpg', store: 'delineadores', in_stock: 5 },
  { id: 'd4', name: 'Delineador Gris',  family: 'Delineadores', category: 'Líquido Indeleble', price: 85, color_hex: '#757575', image_url: '/delineadores/delineador-gris.jpg',  store: 'delineadores', in_stock: 5 },
  { id: 'd5', name: 'Delineador Oro',   family: 'Delineadores', category: 'Líquido Indeleble', price: 85, color_hex: '#ffd700', image_url: '/delineadores/delineador-oro.jpg',   store: 'delineadores', in_stock: 5 },
  { id: 'm1', name: 'Rímel Voluminizador', family: 'Máscara de Pestañas', category: 'A prueba de agua', price: 120, color_hex: '#212121', image_url: '/rimel/rimel-voluminizador.jpg', store: 'brillo', in_stock: 5 },
  { id: 'm2', name: 'Rímel Alargador',    family: 'Máscara de Pestañas', category: 'A prueba de agua', price: 120, color_hex: '#000000', image_url: '/rimel/rimel-alargador.jpg',    store: 'brillo', in_stock: 5 },
  { id: 'm3', name: 'Rímel Rizador',      family: 'Máscara de Pestañas', category: 'Efecto curvador',  price: 120, color_hex: '#1a237e', image_url: '/rimel/rimel-rizador.jpg',      store: 'brillo', in_stock: 5 },
  { id: 'b1', name: 'Brillo Rosa Crystal', family: 'Brillo Labial', category: 'Brillo Hidratante', price: 80, color_hex: '#f48fb1', image_url: '/otros/brillo-rosa-crystal.jpg', store: 'otros', in_stock: 5 },
  { id: 'b2', name: 'Brillo Nude Glass',   family: 'Brillo Labial', category: 'Brillo Hidratante', price: 80, color_hex: '#ffccbc', image_url: '/otros/brillo-nude-glass.jpg',   store: 'otros', in_stock: 5 }
];

async function seed() {
  console.log('Inserting', products.length, 'products...');
  const { data, error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'id' });

  if (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
  console.log('Inserted/updated rows:', data.length);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
