'use client';

import type { PedidoCentralRow, RepartidorRow } from '@/lib/crm/types';
import styles from './ActivityFeed.module.css';

type PedidoConRepartidor = PedidoCentralRow & {
  repartidor?: Pick<RepartidorRow, 'nombre'> | null;
};

type Props = {
  incidencias: PedidoConRepartidor[];
  repartidores: RepartidorRow[];
};

export function ActivityFeed({ incidencias, repartidores }: Props) {
  // Filtrar cancelaciones de hoy
  const cancelaciones = incidencias.filter((p) => p.estatus_pedido === 'cancelado');
  const totalCancelaciones = cancelaciones.length;

  return (
    <div className={styles.container}>
      {/* Alerta Roja Crítica */}
      {totalCancelaciones >= 3 && (
        <div className={styles.criticalAlert} role="alert">
          <span className={styles.alertIcon}>⚠️</span>
          <div className={styles.alertContent}>
            <strong>¡Atención Prioritaria!</strong>
            <p>Se han registrado {totalCancelaciones} cancelaciones el día de hoy. Revisa el estatus de las rutas y contacta a los repartidores para evitar merma o devoluciones innecesarias.</p>
          </div>
        </div>
      )}

      {/* Bitácora de incidencias */}
      <div className={styles.feedCard}>
        <header className={styles.feedHeader}>
          <h3>Bitácora de Incidencias de Hoy</h3>
          <span className={styles.countBadge}>
            {incidencias.length} {incidencias.length === 1 ? 'incidencia' : 'incidencias'}
          </span>
        </header>

        {incidencias.length === 0 ? (
          <div className={styles.empty}>
            ✨ No se han registrado cancelaciones o ausencias el día de hoy. ¡Excelente!
          </div>
        ) : (
          <div className={styles.list}>
            {incidencias.map((inc) => {
              const driver = inc.repartidor?.nombre || 
                repartidores.find((r) => r.id === inc.repartidor_assigned_id)?.nombre || 
                'Sin asignar';
              
              const updatedTime = new Date(inc.updated_at).toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <div key={inc.id} className={[styles.item, styles[inc.estatus_pedido]].join(' ')}>
                  <div className={styles.itemHeader}>
                    <span className={[styles.badge, styles[`badge_${inc.estatus_pedido}`]].join(' ')}>
                      {inc.estatus_pedido === 'cancelado' ? '❌ Cancelado' : '🚪 Ausente'}
                    </span>
                    <span className={styles.time}>{updatedTime}</span>
                  </div>

                  <p className={styles.itemTitle}>
                    Pedido <strong>#{inc.id.slice(0, 8)}</strong> — <strong>{inc.cliente_nombre}</strong>
                  </p>
                  
                  <div className={styles.itemMeta}>
                    <span>📍 {inc.ciudad}</span>
                    <span className={styles.separator}>•</span>
                    <span>🛵 Repartidor: <strong>{driver}</strong></span>
                  </div>

                  {inc.notas_repartidor && (
                    <div className={styles.notesBox}>
                      <strong>Notas/Motivo:</strong> {inc.notas_repartidor}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
