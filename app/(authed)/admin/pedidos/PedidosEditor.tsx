'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PedidoCentralRow, PedidoItemRow, RepartidorRow } from '@/lib/crm/types';
import { modificarPedidoAction, cancelarPedidoAdminAction } from '@/lib/admin/pedidosActions';
import styles from './PedidosEditor.module.css';

// Tipo compuesto recibido de Supabase
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
  repartidores: RepartidorRow[];
};

const CIUDADES_PREDEFINIDAS = ['Cd. Juarez', 'Saltillo', 'Hermosillo', 'Chihuahua', 'Monterrey'];

export function PedidosEditor({ initialPedidos, repartidores }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modal de edición
  const [editingPedido, setEditingPedido] = useState<PedidoCompuesto | null>(null);

  // Form State
  const [formClienteNombre, setFormClienteNombre] = useState('');
  const [formClienteTelefono, setFormClienteTelefono] = useState('');
  const [formCiudad, setFormCiudad] = useState('');
  const [formDireccion, setFormDireccion] = useState('');
  const [formReferencias, setFormReferencias] = useState('');
  const [formLinkMaps, setFormLinkMaps] = useState('');
  const [formMetodoPago, setFormMetodoPago] = useState<any>('efectivo');
  const [formMontoPagado, setFormMontoPagado] = useState<number>(0);
  const [formNotasRepartidor, setFormNotasRepartidor] = useState('');
  const [formRepartidorId, setFormRepartidorId] = useState('');
  const [formEstatusPedido, setFormEstatusPedido] = useState<any>('pendiente');
  const [formError, setFormError] = useState<string | null>(null);

  // Modal Cancelación
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState('');

  const handleOpenEdit = (p: PedidoCompuesto) => {
    setEditingPedido(p);
    setFormClienteNombre(p.cliente_nombre);
    setFormClienteTelefono(p.cliente_telefono);
    setFormCiudad(p.ciudad);
    setFormDireccion(p.direccion);
    setFormReferencias(p.referencias || '');
    setFormLinkMaps(p.link_maps || '');
    setFormMetodoPago(p.metodo_pago);
    setFormMontoPagado(p.monto_pagado || 0);
    setFormNotasRepartidor(p.notas_repartidor || '');
    setFormRepartidorId(p.repartidor_assigned_id || '');
    setFormEstatusPedido(p.estatus_pedido);
    setFormError(null);
  };

  const handleCloseEdit = () => {
    setEditingPedido(null);
    setShowCancelModal(false);
    setCancelMotivo('');
  };

  const handleDriverChange = (val: string) => {
    setFormRepartidorId(val);
    // Regla de negocio: Si se asigna chofer y el estatus era 'pendiente', pasa automáticamente a 'en_ruta'
    if (val && formEstatusPedido === 'pendiente') {
      setFormEstatusPedido('en_ruta');
    } else if (!val && formEstatusPedido === 'en_ruta') {
      setFormEstatusPedido('pendiente');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPedido) return;
    setFormError(null);

    if (!formClienteNombre.trim()) return setFormError('El nombre del cliente es obligatorio');
    if (!formClienteTelefono.trim()) return setFormError('El teléfono es obligatorio');
    if (!formDireccion.trim()) return setFormError('La dirección es obligatoria');
    if (!formCiudad.trim()) return setFormError('La ciudad es obligatoria');

    const updateData = {
      cliente_nombre: formClienteNombre.trim(),
      cliente_telefono: formClienteTelefono.trim(),
      ciudad: formFormatedCity(formCiudad),
      direccion: formDireccion.trim(),
      referencias: formReferencias.trim() || null,
      link_maps: formLinkMaps.trim() || null,
      metodo_pago: formMetodoPago,
      monto_pagado: Number(formMontoPagado) || null,
      notas_repartidor: formNotasRepartidor.trim() || null,
      repartidor_assigned_id: formRepartidorId || null,
      estatus_pedido: formEstatusPedido,
    };

    startTransition(async () => {
      const res = await modificarPedidoAction(editingPedido.id, updateData);
      if (res.ok) {
        handleCloseEdit();
        router.refresh();
      } else {
        setFormError(res.error || 'Error al guardar cambios');
      }
    });
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPedido) return;
    if (!cancelMotivo.trim()) return setFormError('Especifica el motivo de la cancelación');

    startTransition(async () => {
      const res = await cancelarPedidoAdminAction(editingPedido.id, cancelMotivo.trim());
      if (res.ok) {
        handleCloseEdit();
        router.refresh();
      } else {
        setFormError(res.error || 'Error al cancelar pedido');
      }
    });
  };

  const formFormatedCity = (city: string) => {
    return city.trim();
  };

  // Cálculo de subtotales
  const calculateTotal = (p: PedidoCompuesto) => {
    return p.pedido_items.reduce((sum, item) => sum + item.cantidad * Number(item.precio_unitario), 0);
  };

  // Filtrado de pedidos
  const filteredPedidos = initialPedidos.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      p.cliente_nombre.toLowerCase().includes(searchLower) ||
      p.cliente_telefono.includes(searchLower) ||
      p.direccion.toLowerCase().includes(searchLower) ||
      p.id.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === '' || p.estatus_pedido === statusFilter;
    const matchesCity = cityFilter === '' || p.ciudad === cityFilter;
    const matchesDriver =
      driverFilter === '' ||
      (driverFilter === 'unassigned' && !p.repartidor_assigned_id) ||
      p.repartidor_assigned_id === driverFilter;

    return matchesSearch && matchesStatus && matchesCity && matchesDriver;
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Gestión de Pedidos</h1>
          <p className={styles.subtitle}>
            Monitorea, reasigna, cancela o modifica cualquier pedido registrado en la tienda.
          </p>
        </div>
      </header>

      {/* Barra de Filtros */}
      <section className={styles.filtersBar}>
        <input
          type="text"
          placeholder="Buscar por cliente, teléfono, dirección o ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.selectsGrid}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">Todos los estatus</option>
            <option value="pendiente">⏳ Pendiente</option>
            <option value="en_ruta">🏍️ En ruta</option>
            <option value="entregado">✅ Entregado</option>
            <option value="ausente">🚪 Ausente</option>
            <option value="cancelado">❌ Cancelado</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">Todas las ciudades</option>
            {CIUDADES_PREDEFINIDAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">Todos los repartidores</option>
            <option value="unassigned">⚠️ Sin asignar</option>
            {repartidores.map((r) => (
              <option key={r.id} value={r.id}>
                👤 {r.nombre} ({r.ciudad})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Tabla de Pedidos */}
      <section className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Ubicación</th>
              <th>Repartidor</th>
              <th>Estatus</th>
              <th>Pago</th>
              <th>Total</th>
              <th className={styles.textRight}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  No se encontraron pedidos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredPedidos.map((p) => {
                const driver = repartidores.find((r) => r.id === p.repartidor_assigned_id);
                const orderTotal = calculateTotal(p);
                return (
                  <tr key={p.id} className={styles.row}>
                    <td className={styles.orderId} title={p.id}>
                      #{p.id.slice(0, 8)}
                    </td>
                    <td>
                      <div className={styles.clientCell}>
                        <strong>{p.cliente_nombre}</strong>
                        <span>📞 {p.cliente_telefono}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.locationCell}>
                        <span className={styles.cityBadge}>{p.ciudad}</span>
                        <p className={styles.addressText} title={p.direccion}>{p.direccion}</p>
                      </div>
                    </td>
                    <td>
                      {driver ? (
                        <span className={styles.driverActive}>👤 {driver.nombre}</span>
                      ) : (
                        <span className={styles.driverUnassigned}>⚠️ Sin asignar</span>
                      )}
                    </td>
                    <td>
                      <span className={[styles.statusBadge, styles[p.estatus_pedido]].join(' ')}>
                        {p.estatus_pedido.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className={styles.paymentCell}>
                        <span className={styles.paymentMethod}>{p.metodo_pago.replace(/_/g, ' ')}</span>
                        {p.monto_pagado && <span className={styles.paidAmount}>${p.monto_pagado}</span>}
                      </div>
                    </td>
                    <td>
                      <strong className={styles.totalAmount}>${orderTotal}</strong>
                    </td>
                    <td className={[styles.textRight, styles.actionsCell].join(' ')}>
                      <button onClick={() => handleOpenEdit(p)} className={styles.editBtn}>
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {/* Modal Editar Pedido */}
      {editingPedido && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <div>
                <h2>Editar Pedido #{editingPedido.id.slice(0, 8)}</h2>
                <span className={styles.modalDate}>
                  Creado: {new Date(editingPedido.created_at).toLocaleString('es-MX')}
                </span>
              </div>
              <button onClick={handleCloseEdit} className={styles.closeBtn} disabled={isPending}>
                ×
              </button>
            </header>

            {formError && (
              <div className={styles.formError} role="alert">
                ⚠️ {formError}
              </div>
            )}

            {!showCancelModal ? (
              <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.formGrid}>
                  {/* Datos del Cliente */}
                  <div className={styles.formGroup}>
                    <label htmlFor="cliente_nombre">Nombre del Cliente</label>
                    <input
                      type="text"
                      id="cliente_nombre"
                      value={formClienteNombre}
                      onChange={(e) => setFormClienteNombre(e.target.value)}
                      disabled={isPending}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cliente_telefono">Teléfono (WhatsApp)</label>
                    <input
                      type="tel"
                      id="cliente_telefono"
                      value={formClienteTelefono}
                      onChange={(e) => setFormClienteTelefono(e.target.value)}
                      disabled={isPending}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="ciudad">Ciudad</label>
                    <select
                      id="ciudad"
                      value={formCiudad}
                      onChange={(e) => setFormCiudad(e.target.value)}
                      disabled={isPending}
                    >
                      {CIUDADES_PREDEFINIDAS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="metodo_pago">Método de Pago</label>
                    <select
                      id="metodo_pago"
                      value={formMetodoPago}
                      onChange={(e) => setFormMetodoPago(e.target.value)}
                      disabled={isPending}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta_mercado_pago">Tarjeta Mercado Pago</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="monto_pagado">Monto Pagado ($)</label>
                    <input
                      type="number"
                      id="monto_pagado"
                      value={formMontoPagado}
                      onChange={(e) => setFormMontoPagado(Number(e.target.value))}
                      disabled={isPending}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="repartidor">Asignar Repartidor</label>
                    <select
                      id="repartidor"
                      value={formRepartidorId}
                      onChange={(e) => handleDriverChange(e.target.value)}
                      disabled={isPending}
                    >
                      <option value="">-- Sin Asignar --</option>
                      {repartidores.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre} ({r.ciudad})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="estatus">Estatus de Pedido</label>
                    <select
                      id="estatus"
                      value={formEstatusPedido}
                      onChange={(e) => setFormEstatusPedido(e.target.value)}
                      disabled={isPending}
                    >
                      <option value="pendiente">⏳ Pendiente</option>
                      <option value="en_ruta">🏍️ En ruta</option>
                      <option value="entregado">✅ Entregado</option>
                      <option value="ausente">🚪 Ausente</option>
                      <option value="cancelado">❌ Cancelado</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="link_maps">Link de Google Maps</label>
                    <input
                      type="text"
                      id="link_maps"
                      value={formLinkMaps}
                      onChange={(e) => setFormLinkMaps(e.target.value)}
                      disabled={isPending}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>

                  <div className={[styles.formGroup, styles.fullWidth].join(' ')}>
                    <label htmlFor="direccion">Dirección completa</label>
                    <textarea
                      id="direccion"
                      rows={2}
                      value={formDireccion}
                      onChange={(e) => setFormDireccion(e.target.value)}
                      disabled={isPending}
                    />
                  </div>

                  <div className={[styles.formGroup, styles.fullWidth].join(' ')}>
                    <label htmlFor="referencias">Referencias de Domicilio</label>
                    <textarea
                      id="referencias"
                      rows={2}
                      value={formReferencias}
                      onChange={(e) => setFormReferencias(e.target.value)}
                      disabled={isPending}
                      placeholder="Ej: Portón café, frente al parque..."
                    />
                  </div>

                  <div className={[styles.formGroup, styles.fullWidth].join(' ')}>
                    <label htmlFor="notas">Notas / Bitácora del Repartidor</label>
                    <textarea
                      id="notas"
                      rows={2}
                      value={formNotasRepartidor}
                      onChange={(e) => setFormNotasRepartidor(e.target.value)}
                      disabled={isPending}
                      placeholder="Comentarios ingresados por el repartidor..."
                    />
                  </div>
                </div>

                {/* Resumen de Productos */}
                <div className={styles.itemsSection}>
                  <h3>Detalle de Artículos</h3>
                  <div className={styles.itemsList}>
                    {editingPedido.pedido_items.map((item) => (
                      <div key={item.id} className={styles.itemRow}>
                        <div className={styles.itemDetails}>
                          <span className={styles.itemName}>
                            {item.products?.name || `Producto ID: ${item.producto_id}`}
                          </span>
                          <span className={styles.itemMeta}>
                            Family: {item.products?.family || 'General'}
                          </span>
                        </div>
                        <div className={styles.itemPricing}>
                          <span>{item.cantidad} x ${item.precio_unitario}</span>
                          <strong>${item.cantidad * Number(item.precio_unitario)}</strong>
                        </div>
                      </div>
                    ))}
                    <div className={styles.itemsTotal}>
                      <span>Total de la Orden:</span>
                      <strong>${calculateTotal(editingPedido)}</strong>
                    </div>
                  </div>
                </div>

                <footer className={styles.modalActions}>
                  {editingPedido.estatus_pedido !== 'cancelado' && (
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(true)}
                      className={styles.cancelOrderBtn}
                      disabled={isPending}
                    >
                      🛑 Cancelar Pedido
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className={styles.cancelBtn}
                    disabled={isPending}
                  >
                    Salir
                  </button>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={isPending}
                  >
                    {isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </footer>
              </form>
            ) : (
              /* Submodal o formulario para ingresar motivo de cancelación */
              <form onSubmit={handleConfirmCancel} className={styles.form}>
                <div className={styles.cancelConfirmContainer}>
                  <p className={styles.cancelWarningText}>
                    ¿Estás seguro de que deseas cancelar la orden de <strong>{editingPedido.cliente_nombre}</strong>?
                    Esta acción devolverá los artículos al inventario del repartidor de manera automática.
                  </p>

                  <div className={styles.formGroup}>
                    <label htmlFor="motivo_cancelacion">Motivo de Cancelación</label>
                    <textarea
                      id="motivo_cancelacion"
                      rows={4}
                      value={cancelMotivo}
                      onChange={(e) => setCancelMotivo(e.target.value)}
                      placeholder="Ej: El cliente canceló antes de la entrega, datos incorrectos..."
                      disabled={isPending}
                      required
                    />
                  </div>
                </div>

                <footer className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className={styles.cancelBtn}
                    disabled={isPending}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className={styles.confirmCancelBtn}
                    disabled={isPending}
                  >
                    {isPending ? 'Procesando...' : 'Confirmar Cancelación'}
                  </button>
                </footer>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
