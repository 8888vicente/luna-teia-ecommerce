'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PedidoCentralRow, PedidoItemRow } from '@/lib/crm/types';
import { actualizarEstatusEmpaqueAction } from '@/lib/admin/almacenActions';
import { EtiquetaImpresion } from './EtiquetaImpresion';
import { obtenerEnlaceWhatsApp } from '@/lib/notifications/whatsappService';
import styles from './EmpaqueDashboard.module.css';

type PedidoItemConProducto = PedidoItemRow & {
  products: {
    name: string;
    color_hex: string;
    image_url: string;
    family: string;
  } | null;
};

type PedidoCompuesto = PedidoCentralRow & {
  pedido_items: PedidoItemConProducto[];
};

type Props = {
  initialPedidos: PedidoCompuesto[];
};

export function EmpaqueDashboard({ initialPedidos }: Props) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoCompuesto[]>(initialPedidos);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modales
  const [trackingModalPedido, setTrackingModalPedido] = useState<PedidoCompuesto | null>(null);
  const [formTrackingNumber, setFormTrackingNumber] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Previsualización de Impresión
  const [printingPedido, setPrintingPedido] = useState<PedidoCompuesto | null>(null);

  // Sincronizar initialPedidos si cambian
  if (initialPedidos !== pedidos && isPending === false) {
    setPedidos(initialPedidos);
  }

  // Cambia el estado del empaque
  const handleStartPacking = (pedidoId: string) => {
    startTransition(async () => {
      const res = await actualizarEstatusEmpaqueAction(pedidoId, 'en_proceso');
      if (res.ok) {
        router.refresh();
      } else {
        alert(`Error al iniciar empaque: ${res.error}`);
      }
    });
  };

  const handleOpenCompleteModal = (p: PedidoCompuesto) => {
    setTrackingModalPedido(p);
    setFormTrackingNumber(p.dhl_tracking_number || '');
    setFormError(null);
  };

  const handleConfirmPacked = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalPedido) return;

    startTransition(async () => {
      const res = await actualizarEstatusEmpaqueAction(
        trackingModalPedido.id,
        'completado',
        formTrackingNumber
      );

      if (res.ok) {
        setTrackingModalPedido(null);
        setFormTrackingNumber('');
        router.refresh();
      } else {
        setFormError(res.error || 'Error al completar empaque');
      }
    });
  };

  const triggerPrint = (p: PedidoCompuesto) => {
    setPrintingPedido(p);
    // Esperar un milisegundo a que se monte el componente y ejecutar print nativo del navegador
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Filtrado de pedidos
  const filteredPedidos = pedidos.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      p.cliente_nombre.toLowerCase().includes(searchLower) ||
      p.direccion.toLowerCase().includes(searchLower) ||
      p.id.toLowerCase().includes(searchLower) ||
      (p.dhl_tracking_number && p.dhl_tracking_number.toLowerCase().includes(searchLower));

    const currentEstatus = p.estatus_empaque || 'pendiente';
    const matchesStatus = statusFilter === '' || currentEstatus === statusFilter;
    const matchesDelivery = deliveryFilter === '' || p.tipo_entrega === deliveryFilter;

    return matchesSearch && matchesStatus && matchesDelivery;
  });

  // Estadísticas del día
  const stats = {
    total: pedidos.length,
    pendientes: pedidos.filter((p) => (p.estatus_empaque || 'pendiente') === 'pendiente').length,
    enProceso: pedidos.filter((p) => p.estatus_empaque === 'en_proceso').length,
    completados: pedidos.filter((p) => p.estatus_empaque === 'completado').length,
  };

  return (
    <main className={styles.container}>
      {/* Resumen Superior */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Pedidos</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={[styles.statCard, styles.pending].join(' ')}>
          <span className={styles.statLabel}>⏳ Pendientes</span>
          <span className={styles.statValue}>{stats.pendientes}</span>
        </div>
        <div className={[styles.statCard, styles.inProgress].join(' ')}>
          <span className={styles.statLabel}>📦 En Empaque</span>
          <span className={styles.statValue}>{stats.enProceso}</span>
        </div>
        <div className={[styles.statCard, styles.completed].join(' ')}>
          <span className={styles.statLabel}>✅ Listos / Creados</span>
          <span className={styles.statValue}>{stats.completados}</span>
        </div>
      </section>

      {/* Controles de Filtros */}
      <section className={styles.filtersBar}>
        <input
          type="text"
          placeholder="Buscar por cliente, dirección, ID o guía..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.selects}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">Todos los empaques</option>
            <option value="pendiente">⏳ Pendiente</option>
            <option value="en_proceso">📦 En Proceso</option>
            <option value="completado">✅ Completado</option>
          </select>
          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">Todas las entregas</option>
            <option value="reparto_local">📍 Reparto Local</option>
            <option value="paqueteria_nacional">📦 Paquetería</option>
          </select>
        </div>
      </section>

      {/* Listado de Pedidos */}
      <section className={styles.ordersGrid}>
        {filteredPedidos.length === 0 ? (
          <div className={styles.empty}>
            📭 No hay pedidos pendientes de empacar con los filtros actuales.
          </div>
        ) : (
          filteredPedidos.map((p) => {
            const currentEstatus = p.estatus_empaque || 'pendiente';
            const totalItems = p.pedido_items.reduce((sum, item) => sum + item.cantidad, 0);

            return (
              <article key={p.id} className={[styles.orderCard, styles[`card_${currentEstatus}`]].join(' ')}>
                <header className={styles.cardHeader}>
                  <div>
                    <span className={styles.orderId}>#{p.id.slice(0, 8)}</span>
                    <span className={styles.orderDate}>
                      {new Date(p.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={[styles.badge, styles[currentEstatus]].join(' ')}>
                    {currentEstatus === 'pendiente' && '⏳ Pendiente'}
                    {currentEstatus === 'en_proceso' && '📦 Empacando'}
                    {currentEstatus === 'completado' && '✅ Creado'}
                  </span>
                </header>

                <div className={styles.cardBody}>
                  <strong className={styles.clientName}>{p.cliente_nombre}</strong>
                  <p className={styles.address}>📍 {p.direccion} ({p.ciudad})</p>
                  
                  <div className={styles.meta}>
                    <span className={p.tipo_entrega === 'reparto_local' ? styles.tagLocal : styles.tagNacional}>
                      {p.tipo_entrega === 'reparto_local' ? '🛵 Reparto Local' : '📦 Nacional'}
                    </span>
                    <span className={styles.itemsCount}>🛒 {totalItems} piezas</span>
                  </div>

                  {p.dhl_tracking_number && (
                    <div className={styles.trackingInfo}>
                      <span><strong>Guía:</strong> {p.dhl_tracking_number}</span>
                      <a
                        href={obtenerEnlaceWhatsApp(p.cliente_telefono, 'guia', {
                          cliente_nombre: p.cliente_nombre,
                          folio: `LTC-${p.id.slice(0, 8).toUpperCase()}`,
                          tracking_number: p.dhl_tracking_number,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.whatsappLink}
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  )}

                  {/* Listado de productos breve */}
                  <div className={styles.itemsPreview}>
                    <ul>
                      {p.pedido_items.map((item) => (
                        <li key={item.id}>
                          {item.cantidad}x {item.products?.name || item.producto_id}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <footer className={styles.cardActions}>
                  <button 
                    onClick={() => triggerPrint(p)} 
                    className={styles.printBtn}
                    title="Imprimir Etiqueta Térmica"
                  >
                    🖨️ Imprimir
                  </button>

                  {currentEstatus === 'pendiente' && (
                    <button 
                      onClick={() => handleStartPacking(p.id)} 
                      className={styles.actionBtn}
                      disabled={isPending}
                    >
                      📦 Empacar
                    </button>
                  )}

                  {currentEstatus === 'en_proceso' && (
                    <button 
                      onClick={() => handleOpenCompleteModal(p)} 
                      className={[styles.actionBtn, styles.completeBtn].join(' ')}
                      disabled={isPending}
                    >
                      ✔ Pedido Creado
                    </button>
                  )}

                  {currentEstatus === 'completado' && (
                    <button 
                      onClick={() => handleOpenCompleteModal(p)} 
                      className={styles.editGuideBtn}
                      disabled={isPending}
                    >
                      ✏️ Editar Guía
                    </button>
                  )}
                </footer>
              </article>
            );
          })
        )}
      </section>

      {/* Modal para ingresar Guía de Rastreo (Tracking Number) */}
      {trackingModalPedido && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <h3>Registrar Pedido Creado</h3>
              <button 
                onClick={() => setTrackingModalPedido(null)} 
                className={styles.closeBtn}
              >
                ×
              </button>
            </header>
            
            <form onSubmit={handleConfirmPacked} className={styles.form}>
              {formError && (
                <div className={styles.formError}>
                  ⚠️ {formError}
                </div>
              )}
              
              <p className={styles.modalWarning}>
                Estás a punto de marcar el pedido de <strong>{trackingModalPedido.cliente_nombre}</strong> como <strong>Completado (Creado)</strong>.
              </p>

              <div className={styles.formGroup}>
                <label htmlFor="tracking_number">Número de Guía / Tracking (Opcional)</label>
                <input
                  type="text"
                  id="tracking_number"
                  placeholder="Ej: DHL1234567890"
                  value={formTrackingNumber}
                  onChange={(e) => setFormTrackingNumber(e.target.value)}
                  disabled={isPending}
                />
                <small className={styles.helpText}>
                  Ingresa el código si es envío por paquetería nacional. Déjalo en blanco si es reparto local.
                </small>
              </div>

              <footer className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setTrackingModalPedido(null)}
                  className={styles.cancelBtn}
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isPending}
                >
                  {isPending ? 'Guardando...' : 'Confirmar Completado'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Contenedor Oculto en Pantalla y Visible al Imprimir */}
      {printingPedido && (
        <div className={styles.printOnlyContainer}>
          <EtiquetaImpresion pedido={printingPedido} />
        </div>
      )}
    </main>
  );
}
