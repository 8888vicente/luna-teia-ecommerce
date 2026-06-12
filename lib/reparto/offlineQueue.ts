/**
 * lib/reparto/offlineQueue.ts
 * ───────────────────────────────────────────────────────────
 * Gestor de cola offline para guardar las entregas cuando el
 * repartidor no tiene señal de internet.
 * ───────────────────────────────────────────────────────────
 */

import { actualizarEstatusPedidoAction } from '../crm/actions';
import type { AccionOffline } from './types';

const QUEUE_KEY = 'lunateia_offline_delivery_queue';

/**
 * Obtiene la cola de acciones guardadas en localStorage.
 */
export function getOfflineQueue(): AccionOffline[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Guarda la cola de acciones en localStorage.
 */
export function saveOfflineQueue(queue: AccionOffline[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error al guardar cola offline en localStorage:', error);
  }
}

/**
 * Agrega una acción a la cola offline.
 * Si ya existía una acción para este mismo pedido, la sobrescribe con la más reciente.
 */
export function addOfflineAction(
  pedidoId: string,
  nuevoEstatus: 'entregado' | 'ausente' | 'cancelado'
): void {
  const queue = getOfflineQueue();
  
  // Eliminamos cualquier acción previa para el mismo pedido para evitar duplicados/conflictos
  const filtered = queue.filter((item) => item.pedidoId !== pedidoId);
  
  const newAction: AccionOffline = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36),
    pedidoId,
    nuevoEstatus,
    timestamp: Date.now(),
    synced: false,
  };

  filtered.push(newAction);
  saveOfflineQueue(filtered);
}

/**
 * Remueve un pedido específico de la cola offline.
 */
export function removeOfflineAction(pedidoId: string): void {
  const queue = getOfflineQueue();
  const filtered = queue.filter((item) => item.pedidoId !== pedidoId);
  saveOfflineQueue(filtered);
}

/**
 * Sincroniza la cola offline ejecutando las acciones pendientes en el servidor.
 *
 * @param onSuccess - Callback opcional llamado tras cada éxito
 * @param onFailure - Callback opcional llamado tras cada fallo
 * @returns Resumen de éxitos y fallos
 */
export async function syncOfflineQueue(
  onSuccess?: (pedidoId: string, nuevoEstatus: string) => void,
  onFailure?: (pedidoId: string, error: string) => void
): Promise<{ successCount: number; failedCount: number }> {
  const queue = getOfflineQueue();
  const pending = queue.filter((item) => !item.synced);
  
  if (pending.length === 0) {
    return { successCount: 0, failedCount: 0 };
  }

  let successCount = 0;
  let failedCount = 0;
  const currentQueue = [...queue];

  for (const action of pending) {
    try {
      // Llamamos a la server action existente
      const res = await actualizarEstatusPedidoAction(action.pedidoId, action.nuevoEstatus);
      
      if (res.ok) {
        successCount++;
        // Removemos de la cola persistente
        const idx = currentQueue.findIndex((q) => q.id === action.id);
        if (idx !== -1) {
          currentQueue.splice(idx, 1);
        }
        if (onSuccess) onSuccess(action.pedidoId, action.nuevoEstatus);
      } else {
        failedCount++;
        console.warn(`Sincronización fallida para pedido ${action.pedidoId}:`, res.error);
        if (onFailure) onFailure(action.pedidoId, res.error);
      }
    } catch (err) {
      failedCount++;
      const errorMsg = err instanceof Error ? err.message : 'Error de red / conexión';
      console.error(`Error de red al sincronizar pedido ${action.pedidoId}:`, err);
      if (onFailure) onFailure(action.pedidoId, errorMsg);
    }
  }

  // Guardamos la cola actualizada (solo con lo que no pudo sincronizarse)
  saveOfflineQueue(currentQueue);
  return { successCount, failedCount };
}
