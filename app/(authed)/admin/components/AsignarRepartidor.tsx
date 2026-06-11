'use client';

/**
 * AsignarRepartidor — Client Component
 * Tabla con los pedidos pendientes y un dropdown
 * para asignarlos a un repartidor activo.
 * Usa la server action 'asignarRepartidorAction'.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PedidoCentralRow, RepartidorRow } from '@/lib/crm/types';
import { asignarRepartidorAction } from '@/lib/crm/actions';
import styles from './AsignarRepartidor.module.css';

type Props = {
  initialPedidos: PedidoCentralRow[];
  repartidores: RepartidorRow[];
};

type EstadoFila = 'idle' | 'saving' | 'ok' | 'error';

export function AsignarRepartidor({ initialPedidos, repartidores }: Props) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoCentralRow[]>(initialPedidos);
  const [estado, setEstado] = useState<Record<string, EstadoFila>>({});
  const [isPending, startTransition] = useTransition();

  async function handleAsignar(pedidoId: string, repartidorId: string) {
    if (!repartidorId) return;
    setEstado((e) => ({ ...e, [pedidoId]: 'saving' }));

    const res = await asignarRepartidorAction(pedidoId, repartidorId, null);

    if (!res.ok) {
      setEstado((e) => ({ ...e, [pedidoId]: 'error' }));
      alert(`Error al asignar: ${res.error}`);
      return;
    }

    setEstado((e) => ({ ...e, [pedidoId]: 'ok' }));
    // Quitamos de la lista visible (ahora está en_ruta)
    setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
    startTransition(() => router.refresh());
  }

  if (pedidos.length === 0) {
    return (
      <div className={styles.empty}>
        ✅ No hay pedidos pendientes por asignar.
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cliente</th>


            <th>Tel&eacute;fono</th>
            <th>Ciudad</th>
            <th>Tipo entrega</th>
            <th>Asignar a</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => {
            const e = estado[p.id] ?? 'idle';
            return (
              <tr key={p.id} className={isPending ? styles.dim : ''}>
                <td>
                  <strong>{p.cliente_nombre}</strong>
                  <br />
                  <small>{p.direccion}</small>
                </td>
                <td>{p.cliente_telefono}</td>
                <td>{p.ciudad}</td>
                <td>
                  <span className={`${styles.tag} ${styles[p.tipo_entrega]}`}>
                    {p.tipo_entrega === 'reparto_local'
                      ? '📍 Local'
                      : '📦 Paquetería'}
                  </span>
                </td>
                <td>
                  <select
                    disabled={e === 'saving' || p.tipo_entrega !== 'reparto_local'}
                    defaultValue=""
                    onChange={(ev) => handleAsignar(p.id, ev.target.value)}
                    className={styles.select}
                  >
                    <option value="" disabled>
                      {p.tipo_entrega === 'reparto_local'
                        ? 'Seleccionar…'
                        : 'N/A (paquetería)'}
                    </option>
                    {repartidores.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre} — {r.ciudad}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {e === 'saving' && '⏳'}
                  {e === 'ok' && '✅'}
                  {e === 'error' && '❌'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
