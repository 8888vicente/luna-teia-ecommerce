/**
 * lib/admin/almacenActions.ts
 * ───────────────────────────────────────────────────────────
 * Server Actions para el módulo de Almacén y Empaque.
 * ───────────────────────────────────────────────────────────
 */

'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/service';
import { requireRol } from '@/lib/auth';
import type { ActionResult } from '../crm/types';

/**
 * Actualiza el estado de empaque de un pedido y opcionalmente su número de guía.
 */
export async function actualizarEstatusEmpaqueAction(
  pedidoId: string,
  nuevoEstatus: 'pendiente' | 'en_proceso' | 'completado',
  trackingNumber?: string
): Promise<ActionResult<null>> {
  try {
    // Permitir acceso a Administrador o Almacen
    await requireRol(['Administrador', 'Almacen']);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  if (!pedidoId) {
    return { ok: false, error: 'pedidoId es obligatorio' };
  }

  const serverClient = await getSupabaseServer();
  const supabase = getSupabaseAdminClient(serverClient);

  const updateData: Record<string, any> = {
    estatus_empaque: nuevoEstatus,
  };

  if (nuevoEstatus === 'completado' && trackingNumber !== undefined) {
    updateData.dhl_tracking_number = trackingNumber.trim() || null;
  }

  const { error } = await supabase
    .from('pedidos_central')
    .update(updateData)
    .eq('id', pedidoId);

  if (error) {
    console.error('Error al actualizar estatus de empaque:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/almacen');
  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/crm');
  return { ok: true, data: null };
}
