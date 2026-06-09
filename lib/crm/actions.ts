/**
 * lib/crm/actions.ts
 * ───────────────────────────────────────────────────────────
 * Server Actions tipadas para el módulo CRM.
 * Estas funciones:
 *   - Se ejecutan SOLO en el servidor (Next App Router).
 *   - Validan la sesión / rol del usuario.
 *   - Devuelven ActionResult<T> para que el cliente
 *     tenga un contrato uniforme de éxito/error.
 *
 * Para usarlas desde un Client Component:
 *   import { accionX } from '@/lib/crm/actions';
 *   const res = await accionX(arg);   // se marshallea por RSC
 * ───────────────────────────────────────────────────────────
 */

'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseService } from '@/lib/supabase/service';
import { requireRepartidor, requireRol } from './session';
import {
  actualizarEstatusPedido as _actualizarEstatus,
  getInventarioCamioneta as _getInventario,
  getPedidosAsignados as _getPedidos,
  getValidacionStockPedido as _getValidacion,
} from './crm';
import type {
  ActionResult,
  InventarioConProducto,
  PedidoConItems,
  PedidoEstatus,
  ValidacionStockRow,
} from './types';

// =============================================
// ACCIÓN 1 — Repartidor: listar mis pedidos del día
// =============================================
export async function listarMisPedidosAction(
  soloActivos: boolean = true
): Promise<ActionResult<PedidoConItems[]>> {
  let repartidorId: string;
  try {
    ({ repartidorId } = await requireRepartidor());
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const supabase = await getSupabaseServer();
  return _getPedidos(supabase, repartidorId, { soloActivos });
}

// =============================================
// ACCIÓN 2 — Repartidor: marcar pedido como entregado/cancelado/ausente
//    Dispara el trigger de inventario (script 03).
// =============================================
export async function actualizarEstatusPedidoAction(
  pedidoId: string,
  nuevoEstatus: PedidoEstatus
): Promise<ActionResult<null>> {
  let repartidorId: string;
  try {
    ({ repartidorId } = await requireRepartidor());
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  if (!pedidoId) {
    return { ok: false, error: 'pedidoId es obligatorio.' };
  }

  const supabase = await getSupabaseServer();
  const res = await _actualizarEstatus(supabase, pedidoId, nuevoEstatus);

  if (res.ok) {
    // Refresca caches del server para que el siguiente
    // fetch vea los cambios en inventario y pedidos.
    revalidatePath('/repartidor');
    revalidatePath(`/repartidor/pedido/${pedidoId}`);
  }

  return res;
}

// =============================================
// ACCIÓN 3 — Repartidor: ver mi inventario en campo
// =============================================
export async function verMiInventarioAction(): Promise<
  ActionResult<InventarioConProducto[]>
> {
  let repartidorId: string;
  try {
    ({ repartidorId } = await requireRepartidor());
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const supabase = await getSupabaseServer();
  return _getInventario(supabase, repartidorId);
}

// =============================================
// ACCIÓN 4 — Repartidor: pre-validar stock antes de entregar
// =============================================
export async function preValidarStockAction(
  pedidoId: string
): Promise<ActionResult<ValidacionStockRow[]>> {
  try {
    await requireRepartidor();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const supabase = await getSupabaseServer();
  return _getValidacion(supabase, pedidoId);
}

// =============================================
// ACCIÓN 5 — Admin: asignar pedido a un repartidor
//    (Usa SERVICE ROLE para evitar bloqueos de RLS
//     si el admin no tiene fila propia en la tabla)
// =============================================
export async function asignarRepartidorAction(
  pedidoId: string,
  repartidorId: string | null,
  ordenRuta: number | null = null
): Promise<ActionResult<null>> {
  try {
    await requireRol('Administrador');
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  if (!pedidoId) {
    return { ok: false, error: 'pedidoId es obligatorio.' };
  }

  const supabase = getSupabaseService();

  const { error } = await supabase
    .from('pedidos_central')
    .update({
      repartidor_assigned_id: repartidorId,
      orden_ruta: ordenRuta,
      // Si se asigna un repartidor, el pedido pasa a 'en_ruta'
      // automáticamente (regla de negocio).
      estatus_pedido: repartidorId ? 'en_ruta' : 'pendiente',
    })
    .eq('id', pedidoId);

  if (error) {
    return { ok: false, error: error.message, code: error.code };
  }

  revalidatePath('/admin/crm');
  return { ok: true, data: null };
}
