import { supabase } from './supabase';
import { Product, ProductFamily } from '../data/products';
import { PRODUCTS as LOCAL_PRODUCTS } from '../data/products';

// Convierte el formato de Supabase (snake_case) al formato del app (camelCase)
// NOTA: in_stock ahora es int4 (cantidad de piezas disponibles)
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

// Fallback local SOLO para labiales (el resto viene de Supabase)
function getLocalProducts(store: string): Product[] {
  if (store === 'labiales') return LOCAL_PRODUCTS.map(p => ({ ...p, stock: 5 }));
    return [];
  }

// SUPABASE PRIMERO, fallback local después
export async function getProductsByStore(store: string): Promise<Product[]> {
  try {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store', store)
      .gt('in_stock', 0)
    .order('id');
    if (!error && data && data.length > 0) {
      return data.map(mapRow);
  }
    if (error) console.warn('Supabase error:', error.message);
  } catch (e) {
    console.warn('Supabase error (catch):', e);
}
  // Fallback solo si Supabase falla
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
  } catch {}
  const local = getLocalProducts(store);
  return Array.from(new Set(local.map(p => p.family)));
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

