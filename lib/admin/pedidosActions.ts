/**
 * lib/admin/pedidosActions.ts
 * ───────────────────────────────────────────────────────────
 * Server Actions para la administración de Pedidos.
 * ───────────────────────────────────────────────────────────
 */

'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseService } from '@/lib/supabase/service';
import { requireRol } from '@/lib/auth';
import type { ActionResult, PedidoCentralUpdate } from '../crm/types';
import { getPedidosParaRuta } from '@/lib/reparto/queries';
import type { PedidoParaRuta } from '@/lib/reparto/types';

/**
 * Modifica cualquier detalle de un pedido o re-asigna su repartidor.
 */
export async function modificarPedidoAction(
  pedidoId: string,
  datos: PedidoCentralUpdate
): Promise<ActionResult<null>> {
  try {
    await requireRol('Administrador');
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const supabase = getSupabaseService();

  const updateData: PedidoCentralUpdate = { ...datos };

  if (datos.repartidor_assigned_id !== undefined) {
    if (datos.estatus_pedido === undefined) {
      if (datos.repartidor_assigned_id === null) {
        updateData.estatus_pedido = 'pendiente';
      } else {
        updateData.estatus_pedido = 'en_ruta';
      }
    }
  }

  const { error } = await supabase
    .from('pedidos_central')
    .update(updateData)
    .eq('id', pedidoId);

  if (error) {
    console.error('Error al modificar pedido:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/crm');
  return { ok: true, data: null };
}

/**
 * Cancela un pedido registrando un motivo en las notas del repartidor.
 */
export async function cancelarPedidoAdminAction(
  pedidoId: string,
  motivo: string
): Promise<ActionResult<null>> {
  try {
    await requireRol('Administrador');
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const supabase = getSupabaseService();

  const { data: pedido, error: fetchError } = await supabase
    .from('pedidos_central')
    .select('notas_repartidor')
    .eq('id', pedidoId)
    .single();

  if (fetchError) {
    return { ok: false, error: 'No se encontró el pedido a cancelar.' };
  }

  const notasAnteriores = pedido.notas_repartidor ? `${pedido.notas_repartidor} | ` : '';
  const nuevasNotas = `${notasAnteriores}Cancelado por Admin. Motivo: ${motivo}`;

  const { error } = await supabase
    .from('pedidos_central')
    .update({
      estatus_pedido: 'cancelado',
      notas_repartidor: nuevasNotas
    })
    .eq('id', pedidoId);

  if (error) {
    console.error('Error al cancelar pedido:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/crm');
  return { ok: true, data: null };
}

/**
 * Obtiene los pedidos asignados a un repartidor para supervisión del admin.
 */
export async function getPedidosParaSupervisorAction(
  repartidorId: string
): Promise<ActionResult<PedidoParaRuta[]>> {
  try {
    await requireRol('Administrador');
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const supabase = getSupabaseService();
  return getPedidosParaRuta(supabase, repartidorId);
}
