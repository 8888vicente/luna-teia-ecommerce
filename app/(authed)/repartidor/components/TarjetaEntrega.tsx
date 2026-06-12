'use client';

import { useState } from 'react';
import type { PedidoParaRuta } from '@/lib/reparto/types';
import type { PedidoEstatus } from '@/lib/crm/types';
import { buildSingleNavLink } from '@/lib/maps/routing';
import { BotonEstatus } from './BotonEstatus';
import { obtenerEnlaceWhatsApp } from '@/lib/notifications/whatsappService';
import styles from './TarjetaEntrega.module.css';

type Props = {
  pedido: PedidoParaRuta;
  isNext: boolean;
  onEstatusChange: (
    pedidoId: string,
    nuevoEstatus: 'entregado' | 'ausente' | 'cancelado'
  ) => Promise<{ ok: boolean; error?: string }>;
  isSelected?: boolean;
  onSelect?: () => void;
};

export function TarjetaEntrega({
  pedido,
  isNext,
  onEstatusChange,
  isSelected,
  onSelect,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const whatsappUrl = obtenerEnlaceWhatsApp(pedido.cliente_telefono, 'reparto', {
    cliente_nombre: pedido.cliente_nombre,
    direccion: pedido.direccion,
  });

  const navUrl = pedido.coords
    ? buildSingleNavLink(pedido.coords.lat, pedido.coords.lng)
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${pedido.direccion}, ${pedido.ciudad}, Mexico`
      )}`;

  const total = pedido.productos.reduce(
    (acc, p) => acc + p.precio_unitario * p.cantidad,
    0
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'entregado':
        return styles.badgeEntregado;
      case 'cancelado':
        return styles.badgeCancelado;
      case 'ausente':
        return styles.badgeAusente;
      case 'en_ruta':
        return styles.badgeEnRuta;
      default:
        return styles.badgePendiente;
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      case 'ausente':
        return 'Ausente';
      case 'en_ruta':
        return 'En Ruta';
      default:
        return 'Pendiente';
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    // Evitamos expandir si se hace clic en botones de acción o enlaces
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    setExpanded(!expanded);
    if (onSelect) onSelect();
  };

  const isCompleted = ['entregado', 'cancelado', 'ausente'].includes(
    pedido.estatus_pedido
  );

  return (
    <div
      className={[
        styles.card,
        isNext && !isCompleted ? styles.nextCard : '',
        isCompleted ? styles.completedCard : '',
        isSelected ? styles.selectedCard : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={toggleExpand}
    >
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {pedido.orden_ruta !== null && (
            <span className={styles.stopNum}>{pedido.orden_ruta}</span>
          )}
          <h3 className={styles.cliente}>{pedido.cliente_nombre}</h3>
        </div>
        <span className={[styles.badge, getStatusBadgeClass(pedido.estatus_pedido)].join(' ')}>
          {translateStatus(pedido.estatus_pedido)}
        </span>
      </header>

      <div className={styles.body}>
        <p className={styles.address}>📍 {pedido.direccion}</p>
        
        {isNext && !isCompleted && <span className={styles.nextTag}>⚠️ Siguiente Parada</span>}

        {expanded && (
          <div className={styles.details}>
            {pedido.referencias && (
              <p className={styles.references}>
                <strong>Referencias:</strong> {pedido.referencias}
              </p>
            )}
            {pedido.notas_repartidor && (
              <p className={styles.notes}>
                <strong>Notas:</strong> {pedido.notas_repartidor}
              </p>
            )}

            <div className={styles.products}>
              <strong>Productos ({pedido.productos.length}):</strong>
              <ul className={styles.prodList}>
                {pedido.productos.map((item, idx) => (
                  <li key={idx} className={styles.prodItem}>
                    <span>
                      {item.cantidad}× {item.nombre}
                    </span>
                    <span className={styles.price}>
                      ${(item.precio_unitario * item.cantidad).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className={styles.totalRow}>
                <span>Total a cobrar:</span>
                <span className={styles.totalVal}>${total.toFixed(2)}</span>
              </div>
              <p className={styles.paymentMethod}>
                Pago en: <strong>{pedido.metodo_pago.toUpperCase()}</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.links}>
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
          >
            🗺️ Navegar
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waLink}
          >
            💬 WhatsApp
          </a>
          <a href={`tel:${pedido.cliente_telefono}`} className={styles.telLink}>
            📞 Llamar
          </a>
        </div>

        {!isCompleted && (
          <div className={styles.actions}>
            <BotonEstatus
              pedidoId={pedido.id}
              onConfirm={async (id, est) => {
                // Forzar casteo de tipos para la interfaz
                return onEstatusChange(id, est as any);
              }}
            />
          </div>
        )}
      </footer>
    </div>
  );
}
