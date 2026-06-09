/**
 * lib/crm/crm.ts
 * ───────────────────────────────────────────────────────────
 * Funciones core del CRM. Tipado estricto end-to-end.
 *
 * Reglas de uso:
 *   - Estas funciones reciben un cliente Supabase ya inicializado.
 *     NO crean clientes internamente (se inyectan para poder
 *     usarlas desde server actions, route handlers o tests).
 *   - El cliente debe estar autenticado (anon key + sesión
 *     del usuario) para que las políticas RLS apliquen.
 *   - Si necesitas bypassear RLS, usa getSupabaseService() y
 *     añade un comentario explícito en el callsite.
 *
 * Funciones expuestas:
 *   ✔ getPedidosAsignados(repartidorId)
 *   ✔ actualizarEstatusPedido(pedidoId, nuevoEstatus)
 *   ✔ getInventarioCamioneta(repartidorId)
 *   ✔ getValidacionStockPedido(pedidoId)  (helper script 03)
 * ───────────────────────────────────────────────────────────
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ActionResult,
  InventarioConProducto,
  PedidoConItems,
  PedidoEstatus,
  ValidacionStockRow,
} from './types';

// =============================================
// Utilidad interna: tipar errores de Supabase
// =============================================
type SupabaseErrorLike = { message: string; code?: string; details?: string };

function normalizeError(err: unknown): { message: string; code?: string } {
  if (!err) return { message: 'Error desconocido en Supabase.' };
  if (typeof err === 'object') {
    const e = err as SupabaseErrorLike;
    return { message: e.message ?? 'Error en Supabase', code: e.code };
  }
  return { message: String(err) };
}

// =============================================
// 1) getPedidosAsignados
//    Lista los pedidos de un repartidor con sus ítems.
//    Usa el cliente RLS-friendly: la política
//    repartidor_select_pedidos filtra automáticamente
//    si el JWT trae el repartidor_id correcto.
// =============================================
export async function getPedidosAsignados(
  supabase: SupabaseClient,
  repartidorId: string,
  options: { soloActivos?: boolean } = {}
): Promise<ActionResult<PedidoConItems[]>> {
  try {
    let query = supabase
      .from('pedidos_central')
      .select(
        `
        *,
        pedido_items (*)
      `
      )
      .eq('repartidor_assigned_id', repartidorId)
      .order('orden_ruta', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (options.soloActivos) {
      query = query.in('estatus_pedido', ['pendiente', 'en_ruta']);
    }

    const { data, error } = await query;

    if (error) {
      const e = normalizeError(error);
      return { ok: false, error: e.message, code: e.code };
    }

    return { ok: true, data: (data ?? []) as PedidoConItems[] };
  } catch (err) {
    const e = normalizeError(err);
    return { ok: false, error: e.message, code: e.code };
  }
}

// =============================================
// 2) actualizarEstatusPedido
//    ÚNICO punto por el cual la app del repartidor
//    cambia el estatus. Al ejecutarse, dispara el
//    trigger AFTER UPDATE OF estatus_pedido (script 03)
//    que ajusta inventario y kardex.
//
//    - Devuelve ActionResult<null> (sin payload).
//    - Si la BD lanza check_violation (stock insuficiente),
//      el code === '23514' permite al frontend mostrar
//      un mensaje específico sin parsear el texto.
// =============================================
export async function actualizarEstatusPedido(
  supabase: SupabaseClient,
  pedidoId: string,
  nuevoEstatus: PedidoEstatus
): Promise<ActionResult<null>> {
  // Validación cliente: evitamos round-trips innecesarios.
  const estatusValidos: PedidoEstatus[] = [
    'en_ruta',
    'entregado',
    'ausente',
    'cancelado',
  ];
  if (!estatusValidos.includes(nuevoEstatus)) {
    return {
      ok: false,
      error: `Estatus inválido: ${nuevoEstatus}. Permitidos: ${estatusValidos.join(', ')}`,
    };
  }

  try {
    const { error } = await supabase
      .from('pedidos_central')
      .update({ estatus_pedido: nuevoEstatus })
      .eq('id', pedidoId);

    if (error) {
      const e = normalizeError(error);
      return { ok: false, error: e.message, code: e.code };
    }

    return { ok: true, data: null };
  } catch (err) {
    const e = normalizeError(err);
    return { ok: false, error: e.message, code: e.code };
  }
}

// =============================================
// 3) getInventarioCamioneta
//    Devuelve el inventario en campo del repartidor,
//    opcionalmente con datos del producto (join).
//
//    Nota: usa `products(*)` para traer TODAS las columnas
//    de products. Si solo necesitas algunas, especifica:
//    products (name, color_hex, image_url, family)
// =============================================
export async function getInventarioCamioneta(
  supabase: SupabaseClient,
  repartidorId: string
): Promise<ActionResult<InventarioConProducto[]>> {
  try {
    const { data, error } = await supabase
      .from('inventario_campo')
      .select(
        `
        *,
        products:producto_id (name, color_hex, image_url, family)
      `
      )
      .eq('repartidor_id', repartidorId)
      .order('updated_at', { ascending: false });

    if (error) {
      const e = normalizeError(error);
      return { ok: false, error: e.message, code: e.code };
    }

    return { ok: true, data: (data ?? []) as unknown as InventarioConProducto[] };
  } catch (err) {
    const e = normalizeError(err);
    return { ok: false, error: e.message, code: e.code };
  }
}

// =============================================
// 4) getValidacionStockPedido (helper script 03)
//    Llama a la función SQL sp_crm_validar_stock_pedido().
//    Útil para mostrar un modal de "stock disponible"
//    antes de que el repartidor pulse "Entregado".
// =============================================
export async function getValidacionStockPedido(
  supabase: SupabaseClient,
  pedidoId: string
): Promise<ActionResult<ValidacionStockRow[]>> {
  try {
    const { data, error } = await supabase.rpc('sp_crm_validar_stock_pedido', {
      p_pedido_id: pedidoId,
    });

    if (error) {
      const e = normalizeError(error);
      return { ok: false, error: e.message, code: e.code };
    }

    return { ok: true, data: (data ?? []) as ValidacionStockRow[] };
  } catch (err) {
    const e = normalizeError(err);
    return { ok: false, error: e.message, code: e.code };
  }
}
