# Luna Teia - Estado del proyecto CRM

> Documento de continuacion. Si pierdes el chat o arrancas una
> conversacion nueva, lee este archivo PRIMERO.

## Donde quedamos

**ULTIMO LOGRO: INVENTARIO SINCRONIZADO EN TIEMPO REAL.** 🎉🎉🎉

El bug critico de inventario fue resuelto. Ahora:
- `products.in_stock` se descuenta correctamente al crear pedido
- `inventario_almacen` se sincroniza automaticamente via trigger
- `inventario_campo` del repartidor suma las piezas
- La pagina web (ecommerce) sigue funcionando sin tocarse

---

## Arquitectura del inventario (SOLUCIONADO)

Hay 3 tablas, UNA sola fuente de verdad (`products.in_stock`):

```
products.in_stock  (FUENTE DE VERDAD - la usa la web + webhook MP)
       │
       └──> trigger trg_sincronizar_inventario_almacen
                  │
                  ▼
          inventario_almacen  (copia para el CRM, lectura)

inventario_campo  (lo que lleva el repartidor en la camioneta)
```

**Reglas:**
- Webhook de MP descuenta de `products.in_stock` → trigger sincroniza
- `crearPedidoAction` descuenta de `products.in_stock` → trigger sincroniza
- `inventario_campo` se suma al asignar pedido, se descuenta al entregar
- Las cancelaciones NO regresan stock al almacen (se quedan en `inventario_campo`)

**Pendiente:** Las funciones SQL `decrementar_inventario_almacen` y `incrementar_inventario_campo` ya no se usan pero estan en BD (no molestan).

---

## Lo que esta HECHO y funciona

### Backend (BD en Supabase)
- Tablas core: `repartidores`, `inventario_campo`, `pedidos_central`
- Tablas detalle: `pedido_items`, `movimientos_inventario_campo`
- Tablas de 05a: `clientes`, `zonas`, `envios`, `evidencias_pago`
- `crm_usuarios_roles`: 6 registros (1 Admin, 2 Vendedor, 3 Repartidor)
- `repartidores`: 3 filas (Juarez, Saltillo, Hermosillo)
- `inventario_almacen`: tabla sincronizada con products.in_stock via trigger
- `products.in_stock`: fuente de verdad del stock
- Custom Access Token Hook: Activo en Postgres
- RLS: Politicas para Administrador, Vendedor, Repartidor
- Triggers de comision e inventario funcionales
- Webhook Mercado Pago: sigue funcionando (descuento via `decrement_stock`)

### Codigo frontend
- `lib/auth/` - sesion, guards, server actions (login OK)
- `lib/ui/` - 6 componentes reusables
- `app/(public)/` - tienda completa + login + Suspense para useSearchParams
- `app/(authed)/` - shell autenticado con sidebar por rol
- `app/(authed)/admin/crm/` - panel admin con KPIs, asignacion, comisiones
- `app/(authed)/vendedor/` - captura de venta + ver ventas (con filtros)
- `app/(authed)/vendedor/ventas/` - tabla filtrable por ciudad/repartidor/estatus
- `app/(authed)/repartidor/` - pagina de entregas
- `app/(authed)/inventario/` - vista dual (almacen + campo) con filtros
- `app/api/auth/signout/` - operativo
- `app/api/payment/` - webhook Mercado Pago (INTACTO)

### Server Actions nuevas
- `crearPedidoAction` (lib/ventas/actions.ts) - crea pedido, descuenta de products, pasa a inventario_campo
- `asignarRepartidorVentaAction` (obsoleta, ya no se usa)

### Componentes cliente
- `CapturarPedido.tsx` - formulario completo de venta
- `TablaVentas.tsx` - tabla filtrable de pedidos
- `InventarioView.tsx` - vista dual con filtros

---

## Rutas creadas
| Ruta | Quien entra | Estado |
|---|---|---|
| `/admin/crm` | Administrador | OK - KPIs, asignar repartidor, comisiones |
| `/vendedor` | Vendedor | OK - captura con repartidor obligatorio |
| `/vendedor/ventas` | Vendedor | OK - tabla filtrable de pedidos |
| `/inventario` | Admin, Vendedor | OK - stock almacen + stock campo |
| `/repartidor` | Repartidor | OK - lista de entregas |

---

## Usuarios de prueba
| Email | Password | Rol |
|---|---|---|
| `admin@lunateia.com` | `Admin123!` | Administrador |
| `vendedora1@lunateia.com` | `Vend123!` | Vendedor |
| `vendedora2@lunateia.com` | `Vend123!` | Vendedor |
| `repartidor.juarez@lunateia.com` | `Rep123!` | Repartidor (Juarez) |
| `repartidor.saltillo@lunateia.com` | `Rep123!` | Repartidor (Saltillo) |
| `repartidor.hermosillo@lunateia.com` | `Rep123!` | Repartidor (Hermosillo) |

---

## PENDIENTE (orden de prioridad)

### 1. Accion de entrega de pedido (repartidor marca "entregado")
- Server action: `marcarEntregadoAction(pedidoId)`
- Descuenta de `inventario_campo` del repartidor
- Cambia `estatus_pedido` a "entregado"
- Registra movimiento de tipo `venta_entregada`

### 2. Accion de cancelacion de pedido
- Server action: `cancelarPedidoAction(pedidoId)`
- Cambia `estatus_pedido` a "cancelado"
- **NO** regresa stock al almacen (se queda en `inventario_campo`)
- Registra movimiento de tipo `devolucion_cancelado`

### 3. CRUD de repartidores (admin)
- `app/(authed)/admin/repartidores/page.tsx`
- Crear/activar/desactivar repartidores
- Asignar ciudad

### 4. Programacion de envios (admin)
- `app/(authed)/admin/envios/page.tsx`
- Para pedidos paqueteria nacional

### 5. Rol Almacen (futuro)
- Ver pedidos web pagados pendientes de empacar
- Marcar como empacado y descontar de `inventario_almacen`
- Gestionar envios DHL/paqueteria

### 6. Kiosco (futuro, independiente)
- Inventario_kiosco separado
- No afecta el flujo actual

---

## Convenciones del proyecto
- `import { getSesion, requireRol } from "@/lib/auth"` -> server components
- `import { signInAction, signOutAction } from "@/lib/auth/client"` -> client components
- NUNCA importar `@/lib/auth` desde un client component
- Server actions usan `getSesion()` directamente (no `requireRol`) por bug en service role
- SQL: las acciones en BD usan el ENUM `tipo_movimiento_inventario`: `carga_dhl`, `venta_entregada`, `devolucion_cancelado`, `ajuste_auditoria`

## Mensaje para retomar

```
Hola, continuamos el CRM de Luna Teia.
Lee ESTADO_PROYECTO.md para contexto completo.

INVENTARIO YA FUNCIONA Y ESTA SINCRONIZADO.

Siguiente paso logico: implementar la accion de entrega
de pedido (repartidor marca "entregado") y la accion
de cancelacion, para cerrar el ciclo completo de un pedido.
```
