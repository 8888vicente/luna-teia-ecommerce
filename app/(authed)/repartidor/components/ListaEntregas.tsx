'use client';

/**
 * ListaEntregas — Client Component
 * Renderiza los pedidos del repartidor y permite
 * cambiar el estatus a entregado/cancelado/ausente.
 *
 * - Pasa los datos al BotonEstatus que orquesta la mutación.
 * - Tras una mutación exitosa, refresca la ruta para
 *   que el server component vuelva a consultar la BD.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PedidoConItems, PedidoEstatus } from '@/lib/crm/types';
import {
  actualizarEstatusPedidoAction,
  preValidarStockAction,
} from '@/lib/crm/actions';
import { BotonEstatus } from './BotonEstatus';
import styles from './ListaEntregas.module.css';

type Props = {
  initialPedidos: PedidoConItems[];
  repartidorId: string;
};

export function ListaEntregas({ initialPedidos }: Props) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoConItems[]>(initialPedidos);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleEstatus(
    pedidoId: string,
    nuevoEstatus: PedidoEstatus
  ): Promise<{ ok: boolean; error?: string }> {
    setErrorGlobal(null);

    // Pre-validación de stock SOLO cuando va a 'entregado'.
    if (nuevoEstatus === 'entregado') {
      const validacion = await preValidarStockAction(pedidoId);
      if (validacion.ok) {
        const hayFaltante = validacion.data.some((d) => d.faltante > 0);
        if (hayFaltante) {
          const mensaje = validacion.data
            .filter((d) => d.faltante > 0)
            .map(
              (d) =>
                `Producto ${d.producto_id}: faltan ${d.faltante} pzas (tienes ${d.stock_disponible})`
            )
            .join('\n');
          return { ok: false, error: mensaje };
        }
      }
    }

    // Llamada real a la server action
    const res = await actualizarEstatusPedidoAction(pedidoId, nuevoEstatus);

    if (!res.ok) {
      return { ok: false, error: res.error };
    }

    // Quitamos el pedido de la lista activa localmente
    setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));

    // Refrescamos el server component
    startTransition(() => router.refresh());
    return { ok: true };
  }

  if (pedidos.length === 0) {
    return (
      <div className={styles.empty}>
        <p>🎉 No tienes entregas pendientes.</p>
      </div>
    );
  }

  return (
    <div>
      {errorGlobal && (
        <div className={styles.errorBanner} role="alert">
          {errorGlobal}
        </div>
      )}

      <ul className={styles.lista}>
        {pedidos.map((pedido) => (
          <li key={pedido.id} className={styles.card}>
            <header className={styles.cardHeader}>
              <span className={styles.badge}>
                {pedido.estatus_pedido.toUpperCase()}
              </span>
              {pedido.orden_ruta !== null && (
                <span className={styles.ordenRuta}>
                  Parada #{pedido.orden_ruta}
                </span>
              )}
            </header>

            <h2 className={styles.cliente}>{pedido.cliente_nombre}</h2>
            <p className={styles.direccion}>📍 {pedido.direccion}</p>
            <p className={styles.whatsapp}>💬 {pedido.whatsapp}</p>

            <div className={styles.items}>
              <strong>Productos:</strong>
              <ul>
                {pedido.pedido_items.map((item) => (
                  <li key={item.id}>
                    {item.cantidad}× {item.producto_id}{' '}
                    <span className={styles.precio}>
                      ${Number(item.precio_unitario).toFixed(2)} c/u
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.actions}>
              <BotonEstatus
                pedidoId={pedido.id}
                onConfirm={handleEstatus}
                disabled={isPending}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
