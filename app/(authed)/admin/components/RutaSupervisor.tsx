'use client';

import { useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import type { PedidoParaRuta } from '@/lib/reparto/types';
import type { RepartidorRow } from '@/lib/crm/types';
import { getPedidosParaSupervisorAction } from '@/lib/admin/pedidosActions';
import styles from './RutaSupervisor.module.css';

// Dynamically import the map to avoid Leaflet SSR window errors
const MapaRutaSupervisor = dynamic(() => import('./MapaRutaSupervisor'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading}>
      <span className={styles.spinner} />
      <p>Cargando mapa de supervisión...</p>
    </div>
  ),
});

type Props = {
  repartidores: RepartidorRow[];
};

export function RutaSupervisor({ repartidores }: Props) {
  const [selectedRepartidorId, setSelectedRepartidorId] = useState('');
  const [pedidos, setPedidos] = useState<PedidoParaRuta[]>([]);
  const [activePedidoId, setActivePedidoId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRepartidorChange = (repartidorId: string) => {
    setSelectedRepartidorId(repartidorId);
    setPedidos([]);
    setActivePedidoId(null);
    setErrorMessage(null);

    if (!repartidorId) {
      setStatus('idle');
      return;
    }

    setStatus('loading');
    startTransition(async () => {
      const res = await getPedidosParaSupervisorAction(repartidorId);
      if (res.ok) {
        setPedidos(res.data ?? []);
        setStatus('success');
      } else {
        setErrorMessage(res.error || 'Error al obtener pedidos del repartidor');
        setStatus('error');
      }
    });
  };

  // Resumen rápido de la ruta
  const kpis = {
    total: pedidos.length,
    entregados: pedidos.filter((p) => p.estatus_pedido === 'entregado').length,
    pendientes: pedidos.filter((p) => ['pendiente', 'en_ruta'].includes(p.estatus_pedido)).length,
    cancelados: pedidos.filter((p) => p.estatus_pedido === 'cancelado').length,
    ausentes: pedidos.filter((p) => p.estatus_pedido === 'ausente').length,
    montoCobrado: pedidos.reduce((acc, p) => p.estatus_pedido === 'entregado' ? acc + (p.monto_pagado || 0) : acc, 0),
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.selectorGroup}>
          <label htmlFor="repartidor-select">Supervisar Repartidor:</label>
          <select
            id="repartidor-select"
            value={selectedRepartidorId}
            onChange={(e) => handleRepartidorChange(e.target.value)}
            disabled={isPending}
            className={styles.select}
          >
            <option value="">-- Seleccionar repartidor --</option>
            {repartidores.map((r) => (
              <option key={r.id} value={r.id}>
                👤 {r.nombre} ({r.ciudad})
              </option>
            ))}
          </select>
        </div>

        {isPending && <span className={styles.loadingSpinner}>⏳ Cargando ruta...</span>}
      </header>

      {status === 'error' && (
        <div className={styles.errorBox}>
          ⚠️ Error al cargar la ruta: {errorMessage}
        </div>
      )}

      {status === 'idle' && (
        <div className={styles.idleState}>
          Selecciona un repartidor del menú para visualizar su ruta activa, entregas realizadas e incidencias del día en tiempo real.
        </div>
      )}

      {status === 'success' && pedidos.length === 0 && (
        <div className={styles.emptyState}>
          📭 Este repartidor no tiene entregas programadas o ruta optimizada para el día de hoy.
        </div>
      )}

      {status === 'success' && pedidos.length > 0 && (
        <div className={styles.workspace}>
          {/* Resumen de la ruta */}
          <section className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Total entregas</span>
              <span className={styles.kpiValue}>{kpis.total}</span>
            </div>
            <div className={[styles.kpiCard, styles.successCard].join(' ')}>
              <span className={styles.kpiLabel}>Entregados</span>
              <span className={styles.kpiValue}>{kpis.entregados}</span>
            </div>
            <div className={[styles.kpiCard, styles.pendingCard].join(' ')}>
              <span className={styles.kpiLabel}>Restantes</span>
              <span className={styles.kpiValue}>{kpis.pendientes}</span>
            </div>
            <div className={[styles.kpiCard, styles.errorCard].join(' ')}>
              <span className={styles.kpiLabel}>Cancelados</span>
              <span className={styles.kpiValue}>{kpis.cancelados}</span>
            </div>
            <div className={[styles.kpiCard, styles.absentCard].join(' ')}>
              <span className={styles.kpiLabel}>Ausentes</span>
              <span className={styles.kpiValue}>{kpis.ausentes}</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}>Cobrado real</span>
              <span className={styles.kpiValue}>${kpis.montoCobrado}</span>
            </div>
          </section>

          {/* Mapa y listado lateral */}
          <div className={styles.mapSection}>
            <div className={styles.mapContainer}>
              <MapaRutaSupervisor
                pedidos={pedidos}
                activePedidoId={activePedidoId}
                onSelectPedido={setActivePedidoId}
              />
            </div>

            {/* Listado lateral rápido de paradas */}
            <aside className={styles.stopsList}>
              <header className={styles.listHeader}>
                <h4>Detalle de Paradas</h4>
              </header>
              <div className={styles.listContent}>
                {pedidos.map((p) => {
                  const isActive = p.id === activePedidoId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActivePedidoId(p.id)}
                      className={[
                        styles.stopItem,
                        isActive ? styles.activeStop : '',
                        styles[`stop_${p.estatus_pedido}`],
                      ].join(' ')}
                    >
                      <div className={styles.stopNum}>
                        {p.orden_ruta !== null ? `#${p.orden_ruta}` : '—'}
                      </div>
                      <div className={styles.stopInfo}>
                        <strong className={styles.stopName}>{p.cliente_nombre}</strong>
                        <span className={styles.stopAddress}>{p.direccion}</span>
                      </div>
                      <span className={[styles.statusBadge, styles[p.estatus_pedido]].join(' ')}>
                        {p.estatus_pedido === 'pendiente' || p.estatus_pedido === 'en_ruta' ? '⏳' : 
                         p.estatus_pedido === 'entregado' ? '✅' : 
                         p.estatus_pedido === 'ausente' ? '🚪' : '❌'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
