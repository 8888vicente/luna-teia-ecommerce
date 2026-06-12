/**
 * lib/ventas/actions.ts
 *
 * Server Actions para el modulo de captura de ventas.
 * Las funciones se ejecutan SOLO en el servidor y validan
 * que el usuario autenticado tenga rol Vendedor.
 *
 * ESQUEMA REAL DE LA BD (verificada en information_schema):
 *   pedidos_central: cliente_nombre, cliente_telefono, direccion,
 *                    ciudad, referencias, link_maps, metodo_pago,
 *                    notas_repartidor, monto_pagado, estatus_pedido,
 *                    repartidor_assigned_id
 *   pedido_items:    pedido_id, producto_id, cantidad, precio_unitario
 *   inventario_almacen: producto_id, cantidad
 *   inventario_campo: repartidor_id, producto_id, cantidad
 */

"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseService } from "@/lib/supabase/service";
import { getSesion } from "@/lib/auth";

/**
 * Cliente capturado con datos desglosados.
 */
export type ClienteInput = {
  nombre: string;
  telefono: string;
  email?: string;
  direccion: string;
  ciudad: string;
  referencias?: string;
  link_maps?: string;
};

/**
 * Producto en el pedido.
 */
export type ProductoInput = {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
};
/**
 * Input completo para crear un pedido.
 * repartidor_id ahora es obligatorio (no existe pedido sin destino).
 */
export type CrearPedidoInput = {
  cliente: ClienteInput;
  productos: ProductoInput[];
  repartidor_id: string;
  metodo_pago: "efectivo" | "transferencia" | "tarjeta_mercado_pago";
  notas_repartidor?: string;
};

export type CrearPedidoResult = {
  ok: true;
  pedido_id: string;
  folio: string;
} | {
  ok: false;
  error: string;
};

/**
 * Server Action: crear un pedido nuevo desde la captura del vendedor.
 *
 * Flujo:
 *   1. Valida rol Vendedor.
 *   2. Valida campos obligatorios (repartidor incluido).
 *   3. Valida stock en inventario_almacen.
 *   4. Inserta pedido en pedidos_central (con repartidor asignado, estatus en_ruta).
 *   5. Inserta items en pedido_items.
 *   6. Descuenta de inventario_almacen via RPC.
 *   7. Suma a inventario_campo del repartidor via RPC.
 *   8. Registra movimiento en movimientos_inventario_campo.
 *   9. Revalida /vendedor.
 */
export async function crearPedidoAction(
  input: CrearPedidoInput
): Promise<CrearPedidoResult> {
  // Validar sesion con getSesion (funciona correctamente)
  const sesion = await getSesion();
  if (sesion.rol !== "Vendedor") {
    return { ok: false, error: "No tienes permisos para crear pedidos." };
  }

  // ── Validar inputs ─────────────────
  const nombre = input.cliente.nombre.trim();
  const telefono = input.cliente.telefono.trim();
  const direccion = input.cliente.direccion.trim();
  const ciudad = input.cliente.ciudad.trim();

  if (!nombre || !telefono || !direccion || !ciudad) {
    return {
      ok: false,
      error: "Nombre, telefono, direccion y ciudad son obligatorios.",
    };
  }

  if (!input.repartidor_id) {
    return {
      ok: false,
      error: "Debe asignar un repartidor. No existe pedido sin destino.",
    };
  }

  if (!input.productos || input.productos.length === 0) {
    return { ok: false, error: "Debe incluir al menos un producto." };
  }

  for (const p of input.productos) {
    if (!p.producto_id || p.cantidad < 1 || p.precio_unitario <= 0) {
      return {
        ok: false,
        error: "Todos los productos deben tener producto_id, cantidad > 0 y precio > 0.",
      };
    }
  }

  const supabase = getSupabaseService();

  // ── Validar stock en almacen ──────
  for (const p of input.productos) {
    const { data: stock } = await supabase
      .from("inventario_almacen")
      .select("cantidad")
      .eq("producto_id", p.producto_id)
      .single();

    const disponible = (stock as any)?.cantidad ?? 0;
    if (disponible < p.cantidad) {
      return {
        ok: false,
        error: `Stock insuficiente para el producto ${p.producto_id}. Disponible: ${disponible}, requerido: ${p.cantidad}.`,
      };
    }
  }

  // ── Calcular total ─────────────────
  const total = input.productos.reduce(
    (sum, p) => sum + p.cantidad * p.precio_unitario,
    0
  );

  // ── Insertar pedido (con repartidor, en_ruta) ──
  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos_central")
    .insert({
      cliente_nombre: nombre,
      cliente_telefono: telefono,
      cliente_email: input.cliente.email?.trim() || null,
      direccion,
      ciudad,
      referencias: input.cliente.referencias?.trim() ?? null,
      link_maps: input.cliente.link_maps?.trim() ?? null,
      metodo_pago: input.metodo_pago,
      notas_repartidor: input.notas_repartidor?.trim() ?? null,
      estatus_pedido: "en_ruta",
      tipo_entrega: "reparto_local",
      repartidor_assigned_id: input.repartidor_id,
      monto_pagado: total,
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) {
    return {
      ok: false,
      error: `Error al crear pedido: ${pedidoError?.message ?? "desconocido"}`,
    };
  }

  const pedidoId = pedido.id;

  // ── Insertar items ─────────────────
  const itemsToInsert = input.productos.map((p) => ({
    pedido_id: pedidoId,
    producto_id: p.producto_id,
    cantidad: p.cantidad,
    precio_unitario: p.precio_unitario,
  }));

  const { error: itemsError } = await supabase
    .from("pedido_items")
    .insert(itemsToInsert);

  if (itemsError) {
    await supabase.from("pedidos_central").delete().eq("id", pedidoId);
    return {
      ok: false,
      error: `Error al agregar productos: ${itemsError.message}`,
    };
  }

  // ── Descontar de almacen y pasar a camioneta ──
  for (const p of input.productos) {
    // 1) Descontar de products.in_stock via RPC (dispara trigger para actualizar inventario_almacen)
    const { data: updatedRows, error: errAlmacen } = await supabase.rpc(
      "decrement_stock",
      {
        product_id: p.producto_id,
        qty: p.cantidad,
      }
    );

    if (errAlmacen || Number(updatedRows) !== 1) {
      // Rollback: borrar pedido e items
      await supabase.from("pedido_items").delete().eq("pedido_id", pedidoId);
      await supabase.from("pedidos_central").delete().eq("id", pedidoId);
      return {
        ok: false,
        error: `Error al descontar inventario: ${errAlmacen?.message ?? "Stock insuficiente o producto no encontrado"}`,
      };
    }

    // 2) Sumar a inventario_campo del repartidor
    const { error: errCampo } = await supabase.rpc(
      "incrementar_inventario_campo",
      {
        p_repartidor_id: input.repartidor_id,
        p_producto_id: p.producto_id,
        p_cantidad: p.cantidad,
      }
    );

    if (errCampo) {
      // Rollback parcial (el almacen ya se descontó, pero registramos)
      console.error("[ventas] Error al incrementar inventario_campo:", errCampo);
    }

    // 3) Registrar movimiento
    await supabase.from("movimientos_inventario_campo").insert({
      repartidor_id: input.repartidor_id,
      producto_id: p.producto_id,
      cantidad: p.cantidad,
      tipo_movimiento: "carga_dhl",
      motivo: `Pedido ${pedidoId}`,
    });
  }

  // ── Folio ─────────────────────────
  const folio = `LTC-${pedidoId.slice(0, 8).toUpperCase()}`;

  // ── Enviar correo de confirmación si el email está presente ──
  if (input.cliente.email?.trim()) {
    try {
      const emailItems = input.productos.map((p) => ({
        name: p.producto_id,
        cantidad: p.cantidad,
        precio: p.precio_unitario,
      }));

      const productIds = input.productos.map((p) => p.producto_id);
      
      supabase
        .from('products')
        .select('id, name')
        .in('id', productIds)
        .then(({ data: productsData }) => {
          const itemsWithNames = emailItems.map((item) => {
            const prod = productsData?.find((p) => p.id === item.name);
            return {
              ...item,
              name: prod?.name || item.name,
            };
          });

          import('../notifications/emailService').then(({ enviarConfirmacionPedidoEmail }) => {
            enviarConfirmacionPedidoEmail({
              id: pedidoId,
              cliente_nombre: nombre,
              cliente_email: input.cliente.email,
              direccion: direccion,
              ciudad: ciudad,
              metodo_pago: input.metodo_pago,
            } as any, itemsWithNames).catch((err) => {
              console.error('❌ Error enviando email de confirmación desde vendedor actions:', err);
            });
          });
        });
    } catch (e) {
      console.error('❌ Error enviando correo de confirmación de fondo:', e);
    }
  }

  revalidatePath("/vendedor");

  return { ok: true, pedido_id: pedidoId, folio };
}

/**
 * Server Action (obsoleta): ya no se usa porque el repartidor
 * se asigna al crear el pedido. Se mantiene por compatibilidad
 * pero ya no se llama desde el formulario nuevo.
 */
export type AsignarRepartidorResult = {
  ok: true;
} | {
  ok: false;
  error: string;
};

export async function asignarRepartidorVentaAction(
  pedidoId: string,
  repartidorId: string
): Promise<AsignarRepartidorResult> {
  const sesion = await getSesion();
  if (sesion.rol !== "Vendedor") {
    return { ok: false, error: "No tienes permisos para asignar repartidores." };
  }

  if (!pedidoId || !repartidorId) {
    return { ok: false, error: "pedidoId y repartidorId son obligatorios." };
  }

  const supabase = getSupabaseService();

  const { error } = await supabase
    .from("pedidos_central")
    .update({
      repartidor_assigned_id: repartidorId,
      estatus_pedido: "en_ruta",
    })
    .eq("id", pedidoId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/vendedor");
  return { ok: true };
}
