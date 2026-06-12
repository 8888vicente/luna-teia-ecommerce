/**
 * lib/reparto/queries.ts
 * ───────────────────────────────────────────────────────────
 * Consultas de base de datos para la plataforma de reparto.
 * ───────────────────────────────────────────────────────────
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ActionResult } from '../crm/types';
import type { PedidoParaRuta, ResumenRuta } from './types';
import { parseGoogleMapsLink } from '../maps/parseCoords';

/**
 * Obtiene los pedidos asignados a un repartidor para su ruta de hoy.
 * Trae tanto pedidos activos (pendiente, en_ruta) como los ya procesados hoy
 * (entregado, cancelado, ausente con update_at hoy).
 */
export async function getPedidosParaRuta(
  supabase: SupabaseClient,
  repartidorId: string
): Promise<ActionResult<PedidoParaRuta[]>> {
  try {
    // Calculamos el inicio del día de hoy en hora local, convertido a ISO (UTC)
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const startOfDayISO = midnight.toISOString();

    // Consultamos pedidos asignados
    // Hacemos join con pedido_items y products para resolver los nombres de productos
    const { data, error } = await supabase
      .from('pedidos_central')
      .select(`
        *,
        pedido_items (
          id,
          producto_id,
          cantidad,
          precio_unitario,
          products:producto_id (
            name
          )
        )
      `)
      .eq('repartidor_assigned_id', repartidorId)
      // Filtramos: activos, o completados hoy
      .or(`estatus_pedido.in.(pendiente,en_ruta),and(estatus_pedido.in.(entregado,cancelado,ausente),updated_at.gte.${startOfDayISO})`)
      .order('orden_ruta', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) {
      return { ok: false, error: error.message, code: error.code };
    }

    // Mapeamos los datos al tipo PedidoParaRuta
    const pedidos: PedidoParaRuta[] = (data ?? []).map((p: any) => {
      // Intentamos parsear coordenadas del link de maps
      const coords = p.link_maps ? parseGoogleMapsLink(p.link_maps) : null;

      // Mapeamos productos resolviendo el nombre
      const productos = (p.pedido_items ?? []).map((item: any) => ({
        producto_id: item.producto_id,
        nombre: item.products?.name ?? item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: Number(item.precio_unitario),
      }));

      return {
        id: p.id,
        cliente_nombre: p.cliente_nombre,
        cliente_telefono: p.cliente_telefono,
        direccion: p.direccion,
        ciudad: p.ciudad,
        referencias: p.referencias,
        link_maps: p.link_maps,
        notas_repartidor: p.notas_repartidor,
        metodo_pago: p.metodo_pago,
        monto_pagado: Number(p.monto_pagado ?? 0),
        estatus_pedido: p.estatus_pedido,
        orden_ruta: p.orden_ruta,
        created_at: p.created_at,
        coords,
        productos,
      };
    });

    return { ok: true, data: pedidos };
  } catch (error) {
    console.error('Error al obtener pedidos para ruta:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Error desconocido al cargar pedidos para ruta',
    };
  }
}

/**
 * Obtiene el resumen de KPIs de la ruta de hoy.
 */
export async function getResumenDia(
  supabase: SupabaseClient,
  repartidorId: string
): Promise<ActionResult<ResumenRuta>> {
  const res = await getPedidosParaRuta(supabase, repartidorId);
  if (!res.ok) {
    return { ok: false, error: res.error, code: res.code };
  }

  const pedidos = res.data;

  let entregados = 0;
  let pendientes = 0;
  let cancelados = 0;
  let ausentes = 0;
  let monto_cobrado = 0;
  let monto_pendiente = 0;

  pedidos.forEach((p) => {
    // Calculamos el total del pedido sumando precio_unitario * cantidad de cada item
    const totalPedido = p.productos.reduce((acc, prod) => acc + prod.precio_unitario * prod.cantidad, 0);

    if (p.estatus_pedido === 'entregado') {
      entregados++;
      // Usamos el monto cobrado real de la base de datos si existe, o el calculado del pedido
      monto_cobrado += p.monto_pagado || totalPedido;
    } else if (p.estatus_pedido === 'pendiente' || p.estatus_pedido === 'en_ruta') {
      pendientes++;
      monto_pendiente += totalPedido;
    } else if (p.estatus_pedido === 'cancelado') {
      cancelados++;
    } else if (p.estatus_pedido === 'ausente') {
      ausentes++;
      // El ausente sigue teniendo cobro pendiente
      monto_pendiente += totalPedido;
    }
  });

  return {
    ok: true,
    data: {
      total_pedidos: pedidos.length,
      entregados,
      pendientes,
      cancelados,
      ausentes,
      monto_cobrado,
      monto_pendiente,
    },
  };
}
