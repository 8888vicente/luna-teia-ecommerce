# Luna Teia - Estado del proyecto CRM

> Documento de continuacion. Si pierdes el chat o arrancas una
> conversacion nueva, lee este archivo PRIMERO.

## Donde quedamos

Hoy (jornada actual) armamos:
- Core del CRM (auth, login, shell autenticado, guards por rol)
- Reubicamos el e-commerce a `app/(public)/`
- Creamos las pantallas `app/(public)/login/` y `app/(authed)/`
- Analizamos a fondo el Módulo de Ventas (roles, flujo, datos)
- Corrimos 2 scripts SQL en Supabase

## Lo que esta HECHO y funciona

### Codigo (ya en el repo, con commit)
- `lib/auth/` con sesion, guards y server actions
- `lib/ui/` con 6 componentes reusables (Tabla, Tag, Money, Modal, Spinner, Toast)
- `app/globals.css` con paleta nueva + alias de compat (la tienda se ve intacta)
- `app/layout.tsx` con fuentes Inter + Fraunces
- `app/(public)/` con la tienda completa (landing, labiales, checkout, etc.)
- `app/(public)/login/` con form de login
- `app/(authed)/` con shell autenticado y guards por rol
- `app/api/auth/signout/` operativo

### Scripts SQL corridos en Supabase (en orden)
- `01_crm_core.sql` (tablas: repartidores, inventario_campo, pedidos_central)
- `02_crm_logistica_detalles.sql` (tablas: pedido_items, movimientos_inventario_campo)
- `03_crm_automatizacion_inventario.sql` (triggers y funciones de inventario)
- `04_crm_seguridad_jwt.sql` (crm_usuarios_roles, inyeccion de claims al JWT)
- `05a_schema_agregados.sql` (NUEVO - ya corrio - agrega: user_id a repartidores,
  relaja CHECK de ciudad, crea tablas clientes/zonas/envios/evidencias_pago,
  agrega columnas a pedidos_central, RLS para Vendedor y Repartidor en tablas nuevas)

## Usuarios de prueba (ya creados en Supabase Auth)

| Email | Password | UID | Rol que se le asignara |
|---|---|---|---|
| `admin@lunateia.com` | `Admin123!` | `243e0306-92ea-4906-8c35-62b6a6b89ca4` | Administrador |
| `vendedora1@lunateia.com` | `Vend123!` | `57796f2c-c67e-4cd1-9a13-563bd70467b9` | Vendedor |
| `vendedora2@lunateia.com` | `Vend123!` | `9b671297-1fe3-47b2-8046-3a5e999e4750` | Vendedor |
| `repartidor.juarez@lunateia.com` | `Rep123!` | `fa82a04b-5c16-415c-b485-4029d46ad460` | Repartidor (Cd. Juarez) |
| `repartidor.saltillo@lunateia.com` | `Rep123!` | `b62d7795-2797-484e-8ab2-f938a6aa368e` | Repartidor (Saltillo) |
| `repartidor.hermosillo@lunateia.com` | `Rep123!` | `a5333554-b1d9-4fdc-ab3d-b15b66b9ee02` | Repartidor (Hermosillo) |

> **Contrasenas solo para pruebas.** Cambiar antes de usuarios reales.

> Repartidores tendran estos datos: Juan Juarez (6620000001),
> Sofia Saltillo (6620000002), Luis Hermosillo (6620000003).
> Comision: 30% del total, solo si se entrego.

## PENDIENTE (siguiente chat arranca aqui)

### 1. Correr Script B de asignacion de roles
- Ya lo tienes en la conversacion anterior (es un `INSERT INTO repartidores ...`
  + 6 `CALL sp_crm_asignar_rol(...)`)
- Al correrlo, el trigger del script 04 inyecta los claims en el JWT automaticamente

### 2. Probar el login
- Ir a `localhost:3000/login`
- Entrar con `admin@lunateia.com` / `Admin123!` -> deberia mandar a `/admin/crm`
- Entrar con `vendedora1@lunateia.com` / `Vend123!` -> deberia mandar a `/vendedor` (404 probable, OK)
- Entrar con `repartidor.juarez@lunateia.com` / `Rep123!` -> deberia mandar a `/repartidor` (404 probable, OK)

### 3. Crear las rutas del Módulo de Ventas (en este orden)
- `app/(authed)/vendedor/` (captura de ventas)
- `app/(authed)/repartidor/` (vista del repartidor)
- `app/(authed)/admin/envios/` (programar envios)
- `app/(authed)/admin/repartidores/` (CRUD de repartidores)
- `app/(authed)/inventario/` (vista del almacen)

## Modulo de Ventas - contexto acordado

### Roles (5 en total)
- **Dios 1**: Vicente (admin) - ve todo, configura, asigna repartidores, cobra a repartidores
- **Dios 2**: esposa (admin) - mismo que Dios 1
- **Vendedor 1**: vendedora que **tambien reparte** en Hermosillo, Obregon, Nogales
- **Vendedor 2**: vendedora que solo captura
- **Almacen**: usa login de admin o vendedor para armar envios (no hay rol propio aun)
- **Repartidor N**: 1 por ciudad (Juarez, Saltillo, Hermosillo, y los que se sumen)

### Flujo de una venta
1. Clienta escribe por Facebook Messenger
2. Vendedor 1 o 2 chatea, acuerda productos
3. Vendedor CAPTURA en la app (PC o celular, libre como bloc de notas):
   - Clienta (buscar por telefono o crear)
   - Ciudad destino (texto libre)
   - Zona (opcional, se determina en proceso de ventas)
   - Productos (los 30 tonos de labiales como productos independientes)
   - Total
   - Nota opcional
4. Pedido queda con `estatus_reparto = "pendiente"` + ciudad + sin envio asignado
5. Vendedor manda screenshot del pedido a la clienta por WhatsApp/Facebook
   (NO mensaje automatico, copy-paste manual)
6. Se acumulan pedidos por ciudad durante la semana
7. Admin programa envio: (ciudad, zona, fecha_entrega, repartidor)
8. Almacen arma los paquetes, etiqueta, manda a paqueteria
9. Repartidor entra a la app y ve su lista de entregas
10. Repartidor cobra efectivo, marca entregado o no-entregado
11. NO-ENTREGADO: el trigger del script 03 ya reintegra inventario_campo automaticamente
12. Al terminar, repartidor sube foto del recibo de deposito (evidencias_pago)

### Mensaje a la clienta (simbolo, no template)
Solo lleva: **[NOMBRE_PRODUCTO] - [NUMERO_PEDIDO]**
Ejemplo: "Labial Rosa Palo - LTC-123"
La vendedora lo manda por Facebook, no se genera automaticamente.

### Ciudades y zonas
- Ciudades: **LIBRES** (sin CHECK constraint, ya relajado)
- Zonas: **CONFIGURABLES** (tabla `zonas`, vacia al inicio, se llena a mano)
- Ejemplo real: en Juarez se entrega Zona Norte viernes, Zona Sur sabado

### Comision del repartidor
- **30% del total de la venta** (configurable en `repartidores.comision_pct`)
- Solo se gana si se entrego el pedido (el trigger del script 02 ya lo calcula
  en `pedido_items.comision_repartidor` cuando `tipo_entrega = "reparto_local"`)
- Repartidor reporta al final: total cobrado, su comision, deposita la diferencia

## Convenciones del proyecto

### Puertas del modulo auth
- `import { getSesion, requireRol } from "@/lib/auth"` -> en server components
- `import { signInAction, signOutAction } from "@/lib/auth/client"` -> en client components
- **NUNCA** importar `@/lib/auth` desde un client component (rompe el build por next/headers)

### Variables CSS
- **Nuevas (CRM)**: `--color-fondo`, `--color-texto`, `--color-acento`, `--color-exito`,
  `--sp-1`..`--sp-7`, `--radius-sm`..`--radius-pill`, `--fs-xs`..`--fs-2xl`
- **Alias de compat (e-commerce viejo)**: `--color-primary`, `--color-text`,
  `--spacing-xs`..`--spacing-xxl`, `--border-radius-sm`..`--border-radius-pill`
- **Regla**: ambos coexisten, no borrar el bloque de alias

### Estructura de carpetas
```
app/
  (public)/      <- tienda, login
  (authed)/      <- CRM (admin, vendedor, repartidor)
  api/           <- route handlers
  globals.css
  layout.tsx
lib/
  auth/          <- sesion, guards, actions
  crm/           <- queries y actions del CRM actual
  ui/            <- componentes reusables
  ventas/        <- (por crear) modulo de ventas
  repartos/      <- (por crear) modulo de repartos
  envios/        <- (por crear) modulo de envios
supabase/
  migrations/    <- 01 a 05a aplicados, 05b pendiente (roles)
```

## Mensaje para retomar en un chat nuevo

```
Hola, continuamos el CRM de Luna Teia.
Lee el archivo ESTADO_PROYECTO.md de la raiz
del proyecto para contexto completo.
El ultimo paso fue correr 2 scripts SQL en Supabase
(05a_schema_agregados.sql y el de asignacion de roles).
Los 6 usuarios de prueba ya tienen rol asignado.
Siguiente paso: probar el login en localhost:3000/login
y luego correr el Script B de asignacion (que NO corrio
por el error de user_id, ya esta corregido).
```