/**
 * lib/ventas/queries.ts
 *
 * Funciones del servidor para obtener datos del modulo de ventas.
 * Se usan exclusivamente desde Server Components.
 *
 * IMPORTANTE: Usamos getSupabaseService() (service role) para bypasear
 * RLS, porque las politicas no pueden leer el JWT anidado del
 * Custom Access Token Hook. El acceso por rol se valida en la
 * server action o en el guard del layout antes de llamar a estas
 * funciones.
 */

import { getSupabaseService } from "@/lib/supabase/service";

/**
 * Producto del catalogo para el formulario de captura.
 */
export type CatalogoProducto = {
  id: string;
  name: string;
  price: number;
  color_hex: string;
  family: string;
};

/**
 * Pedido resumido para la tabla de ultimos pedidos.
 */
export type PedidoResumen = {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  ciudad: string;
  monto_pagado: number;
  estatus_pedido: string;
  repartidor_nombre: string | null;
  created_at: string;
};

/**
 * Repartidor para la asignacion.
 */
export type RepartidorResumen = {
  id: string;
  nombre: string;
  ciudad: string;
};

/**
 * Obtiene todos los productos activos del catalogo.
 */
export async function getCatalogoProductos(): Promise<CatalogoProducto[]> {
  const supabase = getSupabaseService();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, color_hex, family")
    .order("family", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    console.error("[ventas/getCatalogoProductos] error:", error?.message);
    return [];
  }

  return data as CatalogoProducto[];
}

/**
 * Obtiene los ultimos N pedidos (independientemente del vendedor
 * ya que aun no hay columna capturado_por).
 * Incluye el nombre del repartidor via join.
 */
export async function getUltimosPedidos(
  limite: number = 10
): Promise<PedidoResumen[]> {
  const supabase = getSupabaseService();

  const { data, error } = await supabase
    .from("pedidos_central")
    .select(
      `id, cliente_nombre, cliente_telefono, ciudad, monto_pagado, estatus_pedido, created_at,
       repartidor:repartidor_assigned_id ( nombre )`
    )
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error || !data) {
    console.error("[ventas/getUltimosPedidos] error:", error?.message);
    return [];
  }

  // Aplastar el join anidado de Supabase
  return (data as any[]).map((p) => ({
    id: p.id,
    cliente_nombre: p.cliente_nombre,
    cliente_telefono: p.cliente_telefono,
    ciudad: p.ciudad,
    monto_pagado: p.monto_pagado,
    estatus_pedido: p.estatus_pedido,
    repartidor_nombre: p.repartidor?.nombre ?? null,
    created_at: p.created_at,
  })) as PedidoResumen[];
}

/**
 * Obtiene los repartidores activos para asignar pedidos.
 */
export async function getRepartidoresActivos(): Promise<RepartidorResumen[]> {
  const supabase = getSupabaseService();

  const { data, error } = await supabase
    .from("repartidores")
    .select("id, nombre, ciudad")
    .eq("activo", true)
    .order("nombre");

  if (error || !data) {
    console.error("[ventas/getRepartidoresActivos] error:", error?.message);
    return [];
  }

  return data as RepartidorResumen[];
}

/**
 * Obtiene la lista de ciudades que tienen ventas registradas.
 */
export async function getCiudadesConVentas(): Promise<string[]> {
  const supabase = getSupabaseService();

  const { data, error } = await supabase
    .from("pedidos_central")
    .select("ciudad")
    .not("ciudad", "is", null)
    .order("ciudad");

  if (error || !data) {
    return [];
  }

  const unicas = Array.from(new Set(data.map((r: any) => r.ciudad).filter(Boolean)));
  return unicas.sort();
}

