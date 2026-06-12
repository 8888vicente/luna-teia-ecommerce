'use client';

import type { PedidoParaRuta } from '@/lib/reparto/types';
import { TarjetaEntrega } from './TarjetaEntrega';
import styles from './ListaParadas.module.css';

type Props = {
  pedidos: PedidoParaRuta[];
  onEstatusChange: (
    pedidoId: string,
    nuevoEstatus: 'entregado' | 'ausente' | 'cancelado'
  ) => Promise<{ ok: boolean; error?: string }>;
  activePedidoId: string | null;
  onSelectPedido: (pedidoId: string) => void;
};

export function ListaParadas({
  pedidos,
  onEstatusChange,
  activePedidoId,
  onSelectPedido,
}: Props) {
  // Encontramos el primer pedido incompleto para marcarlo como la siguiente parada
  const nextPedido = pedidos.find((p) =>
    ['pendiente', 'en_ruta'].includes(p.estatus_pedido)
  );

  if (pedidos.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay entregas asignadas para hoy.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {pedidos.map((pedido) => (
        <TarjetaEntrega
          key={pedido.id}
          pedido={pedido}
          isNext={pedido.id === nextPedido?.id}
          onEstatusChange={onEstatusChange}
          isSelected={pedido.id === activePedidoId}
          onSelect={() => onSelectPedido(pedido.id)}
        />
      ))}
    </div>
  );
}
