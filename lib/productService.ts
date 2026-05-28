import { supabase } from './supabase';
import { Product, ProductFamily } from '../data/products';
import { PRODUCTS as LOCAL_PRODUCTS } from '../data/products';

function mapRow(row: Record<string, unknown>): Product {
  return {
    id:        row.id as string,
    name:      row.name as string,
    family:    row.family as ProductFamily,
    category:  row.category as string,
    price:     Number(row.price),
    colorHex:  row.color_hex as string,
    imageUrl:  row.image_url as string,
    stock:     row.in_stock !== undefined ? Number(row.in_stock) : undefined,
  };
}

// Fallback local solo cuando Supabase falla
function getLocalProducts(store: string): Product[] {
  if (store === 'labiales') return LOCAL_PRODUCTS.map(p => ({ ...p, stock: 5 }));
  const mock: Record<string, Product[]> = {
    sombras: [
      { id: 's1', name: 'Sombra Ceja Clara',   family: 'Sombras', category: 'Polvo Compacto', price: 95,  colorHex: '#d7ccc8', imageUrl: '/sombra-ceja/sombra%20ceja%20clara.jpg',   stock: 5 },
      { id: 's2', name: 'Sombra Ceja Media',   family: 'Sombras', category: 'Polvo Compacto', price: 95,  colorHex: '#8d6e63', imageUrl: '/sombra-ceja/sombra%20ceja%20media.jpg',   stock: 5 },
      { id: 's3', name: 'Sombra Ceja Negra',   family: 'Sombras', category: 'Polvo Compacto', price: 95,  colorHex: '#4e342e', imageUrl: '/sombra-ceja/sombra%20ceja%20negra.png',   stock: 5 },
      { id: 's4', name: 'Sombra Ceja Obscura', family: 'Sombras', category: 'Polvo Compacto', price: 95,  colorHex: '#212121', imageUrl: '/sombra-ceja/sombra%20ceja%20obscura.jpg', stock: 5 },
    ],
    delineadores: [
      { id: 'd1', name: 'Delineador Negro', family: 'Delineadores', category: 'Líquido', price: 85,  colorHex: '#000000', imageUrl: '/delineadores/delineador-negro.jpg', stock: 5 },
      { id: 'd2', name: 'Delineador Azul',  family: 'Delineadores', category: 'Líquido', price: 85,  colorHex: '#0d47a1', imageUrl: '/delineadores/delineador-azul.jpg',  stock: 5 },
      { id: 'd3', name: 'Delineador Plata', family: 'Delineadores', category: 'Líquido', price: 85,  colorHex: '#e0e0e0', imageUrl: '/delineadores/delineador-plata.jpg', stock: 5 },
      { id: 'd4', name: 'Delineador Gris',  family: 'Delineadores', category: 'Líquido', price: 85,  colorHex: '#757575', imageUrl: '/delineadores/delineador-gris.jpg',  stock: 5 },
      { id: 'd5', name: 'Delineador Oro',   family: 'Delineadores', category: 'Líquido', price: 85,  colorHex: '#ffd700', imageUrl: '/delineadores/delineador-oro.jpg',   stock: 5 },
    ],
    brillo: [
      { id: 'm1', name: 'Rímel Voluminizador', family: 'Pestañas', category: 'Pestañas', price: 120, colorHex: '#212121', imageUrl: '/rimel/rimel-voluminizador.jpg', stock: 5 },
      { id: 'm2', name: 'Rímel Alargador',     family: 'Pestañas', category: 'Pestañas', price: 120, colorHex: '#000000', imageUrl: '/rimel/rimel-alargador.jpg',    stock: 5 },
    ],
    otros: [
      { id: 'b1', name: 'Brillo Rosa', family: 'Brillos', category: 'Brillo', price: 80, colorHex: '#f48fb1', imageUrl: '/otros/brillo-rosa-crystal.jpg', stock: 5 },
    ],
  };
  return mock[store] || [];
}

function getLocalFamilies(store: string): string[] {
  const prods = getLocalProducts(store);
  return Array.from(new Set(prods.map(p => p.family)));
}

// SUPABASE PRIMERO, mock solo como fallback
export async function getProductsByStore(store: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store', store)
      .gt('in_stock', 0)
      .order('id');
    if (!error && data && data.length > 0) return data.map(mapRow);
  } catch (e) {
    console.warn('Supabase error, usando fallback local:', e);
  }
  return getLocalProducts(store);
}

export async function getFamiliesByStore(store: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('family')
      .eq('store', store)
      .gt('in_stock', 0);
    if (!error && data && data.length > 0) {
      return Array.from(new Set(data.map(r => r.family as string)));
    }
  } catch (e) {
    console.warn('Supabase error families, usando fallback local:', e);
  }
  return getLocalFamilies(store);
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (!error && data) return mapRow(data);
  } catch {}
  return getLocalProducts('labiales').find(p => p.id === id) || null;
}

export async function decrementStock(id: string, quantity = 1): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('decrement_stock', { product_id: id, qty: quantity });
    if (error) return false;
    return Number(data) === 1;
  } catch { return false; }
}
