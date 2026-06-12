/**
 * lib/reparto/types.ts
 * ───────────────────────────────────────────────────────────
 * Tipos del módulo de Reparto.
 *
 * Estos tipos son compartidos entre servidor y cliente:
 *   - PedidoParaRuta: pedido enriquecido con coordenadas y productos
 *   - ResumenRuta: agregados de la ruta del día
 *   - AccionOffline: estructura para la cola offline del repartidor
 *
 * NO importar módulos server-only aquí (este archivo se usa
 * también desde componentes cliente).
 * ───────────────────────────────────────────────────────────
 */

/**
 * Pedido enriquecido para la vista de ruta del repartidor.
 * Incluye coordenadas resueltas y lista de productos con nombre.
 */
export type PedidoParaRuta = {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  direccion: string;
  ciudad: string;
  referencias: string | null;
  link_maps: string | null;
  notas_repartidor: string | null;
  metodo_pago: string;
  monto_pagado: number;
  estatus_pedido: string;
  orden_ruta: number | null;
  created_at: string;
  /** Coordenadas extraídas del link_maps o geocodificadas; null si no se pudieron resolver */
  coords: { lat: number; lng: number } | null;
  /** Productos del pedido con nombre resuelto desde la tabla products */
  productos: {
    producto_id: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
  }[];
};

/**
 * Resumen estadístico de la ruta del día para el repartidor.
 */
export type ResumenRuta = {
  /** Total de pedidos asignados hoy */
  total_pedidos: number;
  /** Pedidos con estatus "entregado" */
  entregados: number;
  /** Pedidos con estatus "pendiente" o "en_ruta" */
  pendientes: number;
  /** Pedidos con estatus "cancelado" */
  cancelados: number;
  /** Pedidos con estatus "ausente" */
  ausentes: number;
  /** Suma de monto_pagado de pedidos entregados */
  monto_cobrado: number;
  /** Suma de monto_pagado de pedidos pendientes/en_ruta */
  monto_pendiente: number;
};

/**
 * Acción encolada localmente cuando el repartidor está sin conexión.
 * Se persiste en localStorage y se sincroniza cuando vuelve la red.
 */
export type AccionOffline = {
  /** UUID generado en el cliente */
  id: string;
  /** ID del pedido afectado */
  pedidoId: string;
  /** Nuevo estatus a aplicar */
  nuevoEstatus: 'entregado' | 'ausente' | 'cancelado';
  /** Timestamp epoch (ms) de cuando se encoló */
  timestamp: number;
  /** Si ya se sincronizó con el servidor */
  synced: boolean;
};
