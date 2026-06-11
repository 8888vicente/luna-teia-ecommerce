/**
 * Tipos estrictos del módulo CRM.
 * Reflejan el schema REAL de la BD de Luna Teia
 * (verificado en information_schema el 2026-06-09).
 */

// =============================================
// ENUMS (espejo de los CHECK constraints de SQL)
// =============================================
export type PedidoEstatus = 'pendiente' | 'en_ruta' | 'entregado' | 'ausente' | 'cancelado';

export type PedidoTipoEntrega = 'reparto_local' | 'paqueteria_nacional';

export type PedidoMetodoPago = 'efectivo' | 'transferencia' | 'tarjeta_mercado_pago';

export type TipoMovimientoInventario =
  | 'carga_dhl'
  | 'venta_entregada'
  | 'devolucion_cancelado'
  | 'ajuste_auditoria';

export type CrmRol = 'Administrador' | 'Vendedor' | 'Repartidor';

export type EstatusReparto = 'pendiente' | 'asignado' | 'en_camino' | 'entregado' | 'fallido';

// =============================================
// CIUDADES
// =============================================
export type CiudadOperacion = string;

// =============================================
// REPARTIDORES (schema real de la BD)
// =============================================
export type RepartidorRow = {
  id: string;
  nombre: string;
  telefono: string;
  ciudad: CiudadOperacion;
  activo: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type RepartidorInsert = Omit<RepartidorRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type RepartidorUpdate = Partial<RepartidorInsert>;

// =============================================
// PEDIDOS CENTRAL (schema real de la BD)
// =============================================
export type PedidoCentralRow = {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  direccion: string;
  ciudad: string;
  referencias: string | null;
  link_maps: string | null;
  metodo_pago: PedidoMetodoPago;
  notas_repartidor: string | null;
  estatus_pedido: PedidoEstatus;
  tipo_entrega: PedidoTipoEntrega;
  estatus_reparto: EstatusReparto;
  orden_ruta: number | null;
  monto_pagado: number | null;
  fecha_pago: string | null;
  envio_id: string | null;
  repartidor_assigned_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PedidoCentralInsert = Omit<PedidoCentralRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PedidoCentralUpdate = Partial<PedidoCentralInsert>;

// =============================================
// PEDIDO ITEMS
// =============================================
export type PedidoItemRow = {
  id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  comision_repartidor: number | null;
  created_at: string;
};

export type PedidoItemInsert = Omit<PedidoItemRow, 'id' | 'created_at' | 'comision_repartidor'> & {
  id?: string;
  created_at?: string;
  comision_repartidor?: number | null;
};

// =============================================
// INVENTARIO / MOVIMIENTOS
// =============================================
export type InventarioCampoRow = {
  id: string;
  repartidor_id: string;
  producto_id: string;
  cantidad: number;
  created_at: string;
  updated_at: string;
};

export type MovimientoInventarioRow = {
  id: string;
  repartidor_id: string;
  producto_id: string;
  cantidad: number;
  tipo_movimiento: TipoMovimientoInventario;
  motivo: string | null;
  created_at: string;
};

// =============================================
// TIPOS COMPUESTOS (joins para la UI)
// =============================================
export type PedidoConItems = PedidoCentralRow & {
  pedido_items: PedidoItemRow[];
};

export type InventarioConProducto = InventarioCampoRow & {
  products?: {
    name: string;
    color_hex: string;
    image_url: string;
    family: string;
  } | null;
};

// =============================================
// RESULTADOS DE FUNCIONES RPC
// =============================================
export type ValidacionStockRow = {
  producto_id: string;
  cantidad_requerida: number;
  stock_disponible: number;
  faltante: number;
};

// =============================================
// RESPUESTAS GENÉRICAS
// =============================================
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

// =============================================
// CLAIMS DEL JWT
// =============================================
export type CrmClaims = {
  role: CrmRol | null;
  repartidor_id: string | null;
};

// =============================================
// DASHBOARD ADMIN — Tipos para /admin/crm
// =============================================
export type PedidoGlobal = PedidoCentralRow & {
  pedido_items: PedidoItemRow[];
  repartidor: Pick<RepartidorRow, 'id' | 'nombre' | 'ciudad' | 'telefono'> | null;
  total_pedido: number;
};

export type ComisionResumenRow = {
  repartidor_id: string;
  repartidor_nombre: string;
  ciudad: CiudadOperacion;
  pedidos_entregados: number;
  total_vendido: number;
  comision_total: number;
};

export type ComisionResumenTotales = {
  total_vendido_global: number;
  total_comisiones_global: number;
  utilidad_bruta: number;
  pedidos_entregados_global: number;
};

export type ComisionPeriodo = 'mes_actual' | 'ultimos_7_dias' | 'ultimos_30_dias';

export type ResumenComisiones = {
  periodo: ComisionPeriodo;
  rango: { desde: string; hasta: string };
  por_repartidor: ComisionResumenRow[];
  totales: ComisionResumenTotales;
};
