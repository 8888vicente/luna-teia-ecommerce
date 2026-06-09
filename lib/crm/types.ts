/**
 * Tipos estrictos del módulo CRM.
 * Reflejan el schema SQL de los 4 archivos de migración.
 *
 * Convención: usamos `type` (no `interface`) para que sean
 * interseccibles y compatibles con utility types de TS.
 */

// =============================================
// ENUMS (espejo de los CHECK constraints de SQL)
// =============================================
export type RepartidorEstatus = 'postulado' | 'activo' | 'inactivo';

export type PedidoOrigenVenta = 'facebook' | 'ecommerce' | 'kiosk';

export type PedidoTipoEntrega = 'reparto_local' | 'paqueteria_nacional';

export type PedidoEstatus = 'pendiente' | 'en_ruta' | 'entregado' | 'ausente' | 'cancelado';

export type TipoMovimientoInventario =
  | 'carga_dhl'
  | 'venta_entregada'
  | 'devolucion_cancelado'
  | 'ajuste_auditoria';

export type CrmRol = 'Administrador' | 'Repartidor';

// =============================================
// CIUDADES (restricción CHECK de repartidores.ciudad)
// =============================================
export type CiudadOperacion = 'Mexicali' | 'Hermosillo';

// =============================================
// FILAS DE TABLAS (Insert / Row / Update)
// =============================================
export type RepartidorRow = {
  id: string;
  nombre: string;
  telefono: string;
  ciudad: CiudadOperacion;
  estatus: RepartidorEstatus;
  doc_ine_url: string | null;
  doc_licencia_url: string | null;
  doc_antecedentes_url: string | null;
  created_at: string;
  updated_at: string;
};

export type RepartidorInsert = Omit<RepartidorRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type RepartidorUpdate = Partial<RepartidorInsert>;

export type PedidoCentralRow = {
  id: string;
  cliente_nombre: string;
  whatsapp: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  origen_venta: PedidoOrigenVenta;
  tipo_entrega: PedidoTipoEntrega;
  estatus_pedido: PedidoEstatus;
  orden_ruta: number | null;
  dhl_tracking_number: string | null;
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
  // Join con la tabla products del e-commerce.
  // Si la columna no existe en tu `products`, elimina este campo.
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
// RESPUESTAS GENÉRICAS (para Server Actions)
// =============================================
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

// =============================================
// CLAIMS DEL JWT (app_metadata inyectado en script 04)
// =============================================
export type CrmClaims = {
  role: CrmRol | null;
  repartidor_id: string | null;
};

// =============================================
// DASHBOARD ADMIN — Tipos para el panel /admin/crm
// =============================================

/**
 * Pedido global con sus items y, opcionalmente, los
 * datos del repartidor asignado (join externo vía repartidores).
 */
export type PedidoGlobal = PedidoCentralRow & {
  pedido_items: PedidoItemRow[];
  repartidor: Pick<RepartidorRow, 'id' | 'nombre' | 'ciudad' | 'telefono'> | null;
  total_pedido: number;
};

/**
 * Resumen de comisiones por repartidor en un periodo.
 * Una fila = un repartidor activo.
 */
export type ComisionResumenRow = {
  repartidor_id: string;
  repartidor_nombre: string;
  ciudad: CiudadOperacion;
  pedidos_entregados: number;
  total_vendido: number;        // SUM(precio_unitario * cantidad) de pedidos 'entregado'
  comision_total: number;       // SUM(comision_repartidor) — calculada por trigger script 02
};

/**
 * Gran total agregado del panel financiero.
 */
export type ComisionResumenTotales = {
  total_vendido_global: number;
  total_comisiones_global: number;
  utilidad_bruta: number;       // total_vendido - total_comisiones
  pedidos_entregados_global: number;
};

/**
 * Rango temporal aceptado por getResumenComisiones().
 *  - 'mes_actual'         : desde el día 1 del mes corriente.
 *  - 'ultimos_7_dias'     : últimos 7 días naturales.
 *  - 'ultimos_30_dias'    : últimos 30 días naturales.
 */
export type ComisionPeriodo = 'mes_actual' | 'ultimos_7_dias' | 'ultimos_30_dias';

/**
 * Estructura completa que devuelve getResumenComisiones().
 */
export type ResumenComisiones = {
  periodo: ComisionPeriodo;
  rango: { desde: string; hasta: string };
  por_repartidor: ComisionResumenRow[];
  totales: ComisionResumenTotales;
};

