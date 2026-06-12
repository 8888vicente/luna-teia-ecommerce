/**
 * lib/reparto/actions.ts
 * ───────────────────────────────────────────────────────────
 * Server Actions para el módulo de Reparto.
 * ───────────────────────────────────────────────────────────
 */

'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';
import { requireRepartidor } from '@/lib/auth';
import type { ActionResult } from '../crm/types';

/**
 * Guarda el orden de ruta optimizado para los pedidos de un repartidor.
 *
 * @param rutas - Array de objetos con el ID del pedido y su correspondiente orden_ruta
 */
export async function guardarOrdenRutaAction(
  rutas: { id: string; orden_ruta: number }[]
): Promise<ActionResult<null>> {
  let repartidorId: string;
  try {
    ({ repartidorId } = await requireRepartidor());
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const supabase = await getSupabaseServer();

  try {
    // Ejecutamos las actualizaciones en paralelo en el servidor.
    // Para seguridad, agregamos el filtro .eq('repartidor_assigned_id', repartidorId)
    // para evitar que un repartidor modifique el orden de pedidos ajenos.
    const updates = rutas.map((r) =>
      supabase
        .from('pedidos_central')
        .update({ orden_ruta: r.orden_ruta })
        .eq('id', r.id)
        .eq('repartidor_assigned_id', repartidorId)
    );

    const results = await Promise.all(updates);

    // Validamos si alguno falló
    const failedUpdate = results.find((res) => res.error);
    if (failedUpdate) {
      throw new Error(failedUpdate.error?.message ?? 'Error desconocido al guardar ruta en Supabase');
    }

    revalidatePath('/repartidor');
    return { ok: true, data: null };
  } catch (error) {
    console.error('Error al guardar el orden de ruta:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Error desconocido al guardar orden de ruta',
    };
  }
}
