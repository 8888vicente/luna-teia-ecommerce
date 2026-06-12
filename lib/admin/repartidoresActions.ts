/**
 * lib/admin/repartidoresActions.ts
 * ───────────────────────────────────────────────────────────
 * Server Actions para la administración de Repartidores.
 * ───────────────────────────────────────────────────────────
 */

'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseService } from '@/lib/supabase/service';
import { requireRol } from '@/lib/auth';
import type { ActionResult } from '../crm/types';

export type RepartidorInput = {
  nombre: string;
  telefono: string;
  ciudad: string;
  activo: boolean;
  user_id: string | null;
};

/**
 * Crea un nuevo repartidor en la base de datos.
 */
export async function crearRepartidorAction(
  data: RepartidorInput
): Promise<ActionResult<null>> {
  try {
    await requireRol('Administrador');
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const supabase = getSupabaseService();

  const { error } = await supabase
    .from('repartidores')
    .insert({
      nombre: data.nombre,
      telefono: data.telefono,
      ciudad: data.ciudad,
      activo: data.activo,
      user_id: data.user_id || null,
    });

  if (error) {
    console.error('Error al crear repartidor:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/repartidores');
  revalidatePath('/admin/crm');
  return { ok: true, data: null };
}

/**
 * Edita un repartidor existente en la base de datos.
 */
export async function editarRepartidorAction(
  id: string,
  data: RepartidorInput
): Promise<ActionResult<null>> {
  try {
    await requireRol('Administrador');
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const supabase = getSupabaseService();

  const { error } = await supabase
    .from('repartidores')
    .update({
      nombre: data.nombre,
      telefono: data.telefono,
      ciudad: data.ciudad,
      activo: data.activo,
      user_id: data.user_id || null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error al editar repartidor:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/repartidores');
  revalidatePath('/admin/crm');
  return { ok: true, data: null };
}
