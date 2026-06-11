"use client";

/**
 * CapturarPedido — Client Component
 *


 * Formulario completo para capturar un pedido desde Facebook Messenger
 * y asignarlo a un repartidor en un solo paso.
 *
 * ESQUEMA REAL DE LA BD:
 *   pedidos_central: cliente_nombre, cliente_telefono, direccion,

 *                    ciudad, referencias, link_maps, metodo_pago,
 *                    notas_repartidor, repartidor_assigned_id
 */

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  crearPedidoAction,
  type ProductoInput,
} from "@/lib/ventas/actions";
import styles from "./CapturarPedido.module.css";

type RepartidorItem = {
  id: string;
  nombre: string;
  ciudad: string;
};

type Props = {
  catalogo: Array<{
    id: string;
    name: string;
    price: number;
    color_hex: string;
    family: string;
  }>;
  repartidores: RepartidorItem[];
};

type EstadoForm = "idle" | "saving" | "success" | "error";




type FilaProducto = { key: string } & ProductoInput;

let nextKey = 0;
function freshKey(): string {
  return `prod_${++nextKey}_${Date.now()}`;
}

type MetodoPago = "efectivo" | "transferencia" | "tarjeta_mercado_pago";


export function CapturarPedido({ catalogo, repartidores }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [estado, setEstado] = useState<EstadoForm>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [folio, setFolio] = useState<string | null>(null);

  const [productos, setProductos] = useState<FilaProducto[]>([
    { key: freshKey(), producto_id: "", cantidad: 1, precio_unitario: 0 },
  ]);

  const [cliente, setCliente] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    referencias: "",
    link_maps: "",
  });

  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo");
  const [notasRepartidor, setNotasRepartidor] = useState("");
  const [repartidorId, setRepartidorId] = useState("");

  // ── Helpers ──────────────────────────

  const total = productos.reduce(
    (sum, p) => sum + p.cantidad * p.precio_unitario,
    0
  );

  function agregarProducto() {
    setProductos((prev) => [
      ...prev,
      { key: freshKey(), producto_id: "", cantidad: 1, precio_unitario: 0 },
    ]);
  }

  function quitarProducto(key: string) {
    setProductos((prev) => prev.filter((p) => p.key !== key));
  }

  function actualizarProducto(
    key: string,
    campo: keyof ProductoInput,
    valor: string | number
  ) {
    setProductos((prev) =>
      prev.map((p) => (p.key === key ? { ...p, [campo]: valor } : p))
    );
  }

  function handleProductoSelect(key: string, productoId: string) {
    const prod = catalogo.find((c) => c.id === productoId);
    setProductos((prev) =>
      prev.map((p) =>
        p.key === key
          ? {
              ...p,
              producto_id: productoId,
              precio_unitario: prod?.price ?? 0,
            }
          : p
      )
    );
  }

  // ── Submit ───────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (estado === "saving") return;

    setEstado("saving");
    setErrorMsg(null);
    setFolio(null);

    // Crear el pedido (todo en un solo paso: captura + repartidor + inventario)
    const res = await crearPedidoAction({
      cliente: {
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        ciudad: cliente.ciudad,
        referencias: cliente.referencias || undefined,
        link_maps: cliente.link_maps || undefined,
      },
      productos: productos.map(({ key, ...rest }) => rest),
      repartidor_id: repartidorId,
      metodo_pago: metodoPago,
      notas_repartidor: notasRepartidor || undefined,
    });

    if (!res.ok) {
      setEstado("error");
      setErrorMsg(res.error);
      return;
    }

    setEstado("success");
    setFolio(res.folio);

    setTimeout(() => {
      setProductos([
        { key: freshKey(), producto_id: "", cantidad: 1, precio_unitario: 0 },
      ]);
      setCliente({
        nombre: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        referencias: "",
        link_maps: "",
      });
      setMetodoPago("efectivo");
      setNotasRepartidor("");
      setRepartidorId("");
      setEstado("idle");
      setFolio(null);
      router.refresh();
    }, 3000);
  }

  // ── Render ───────────────────────────

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
      {/* ── Modal de exito ──────────── */}
      {estado === "success" && folio && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <span className={styles.modalIcon}>&#x2705;</span>
            <h3>&iexcl;Pedido creado!</h3>
            <p className={styles.folio}>{folio}</p>
            {repartidorId && (
              <p className={styles.modalHint}>
                Asignado a repartidor exitosamente.
              </p>
            )}
            <p className={styles.modalHint}>
              Copi&aacute; el folio para enviarlo por Messenger.
            </p>
          </div>
        </div>
      )}

      {/* ── Cliente ──────────────────── */}
      <fieldset className={styles.fieldset}>
        <legend>Datos de la clienta</legend>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="cliente_nombre">Nombre *</label>



            <input id="cliente_nombre" required
              value={cliente.nombre}





              onChange={(e) => setCliente((c) => ({ ...c, nombre: e.target.value }))}
              placeholder="Nombre completo" />
          </div>
          <div className={styles.field}>
            <label htmlFor="cliente_telefono">Tel&eacute;fono *</label>




            <input id="cliente_telefono" required type="tel"
              value={cliente.telefono}





              onChange={(e) => setCliente((c) => ({ ...c, telefono: e.target.value }))}
              placeholder="+52 662 123 4567" />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="cliente_direccion">Direcci&oacute;n *</label>



            <input id="cliente_direccion" required
              value={cliente.direccion}





              onChange={(e) => setCliente((c) => ({ ...c, direccion: e.target.value }))}
              placeholder="Calle y n&uacute;mero" />
          </div>
          <div className={styles.field}>
            <label htmlFor="cliente_ciudad">Ciudad *</label>



            <input id="cliente_ciudad" required
              value={cliente.ciudad}





              onChange={(e) => setCliente((c) => ({ ...c, ciudad: e.target.value }))}
              placeholder="Hermosillo, Nogales, Obreg&oacute;n..." />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="cliente_referencias">Referencias</label>


            <input id="cliente_referencias"
              value={cliente.referencias}





              onChange={(e) => setCliente((c) => ({ ...c, referencias: e.target.value }))}
              placeholder="Cerca del Oxxo, casa blanca..." />
          </div>
          <div className={styles.field}>
            <label htmlFor="cliente_link_maps">Link Maps</label>


            <input id="cliente_link_maps"
              value={cliente.link_maps}





              onChange={(e) => setCliente((c) => ({ ...c, link_maps: e.target.value }))}
              placeholder="https://maps.app.goo.gl/..." />
          </div>
        </div>
      </fieldset>

      {/* ── Productos ────────────────── */}
      <fieldset className={styles.fieldset}>
        <legend>Productos</legend>

        {productos.map((p, idx) => (
          <div key={p.key} className={styles.productRow}>
            <span className={styles.productIndex}>{idx + 1}.</span>



            <select value={p.producto_id}
              onChange={(e) => handleProductoSelect(p.key, e.target.value)}






              className={styles.productSelect} required>
              <option value="" disabled>Seleccionar producto...</option>
              {catalogo.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} &mdash; ${prod.price.toFixed(2)}
                </option>
              ))}
            </select>




























            <input type="number" min={1} value={p.cantidad}
              onChange={(e) => actualizarProducto(p.key, "cantidad", Number(e.target.value))}
              className={styles.qtyInput} aria-label="Cantidad" />
            <input type="number" min={0} step={0.01} value={p.precio_unitario}
              onChange={(e) => actualizarProducto(p.key, "precio_unitario", Number(e.target.value))}
              className={styles.priceInput} aria-label="Precio unitario" />
            <span className={styles.subtotal}>${(p.cantidad * p.precio_unitario).toFixed(2)}</span>
            {productos.length > 1 && (








              <button type="button" onClick={() => quitarProducto(p.key)}
                className={styles.removeBtn} aria-label="Quitar producto">&times;</button>
            )}
          </div>
        ))}

        <button type="button" onClick={agregarProducto} className={styles.addBtn}>
          + Agregar producto
        </button>
      </fieldset>

      {/* ── Asignar repartidor ────────── */}
      <fieldset className={styles.fieldset}>
        <legend>Asignar a repartidor</legend>
        <div className={styles.field}>
          <label htmlFor="repartidor_asignado">Repartidor</label>
          <select id="repartidor_asignado"
            value={repartidorId}
            onChange={(e) => setRepartidorId(e.target.value)}
            className={styles.select}
            required>
            <option value="">Seleccionar repartidor...</option>
            {repartidores.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre} &mdash; {r.ciudad}
              </option>
            ))}
          </select>
          <small className={styles.help}>
            El inventario se descuenta del almac&eacute;n y pasa a la camioneta del repartidor autom&aacute;ticamente.
          </small>
        </div>
      </fieldset>

      {/* ── Metodo de pago y notas ──── */}
      <fieldset className={styles.fieldset}>
        <legend>Pago y notas</legend>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="metodo_pago">M&eacute;todo de pago *</label>



            <select id="metodo_pago" value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}


              className={styles.select}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta_mercado_pago">Tarjeta (Mercado Pago)</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="notas_repartidor">Notas para el repartidor</label>


            <input id="notas_repartidor"
              value={notasRepartidor}
              onChange={(e) => setNotasRepartidor(e.target.value)}


              placeholder="Llamar antes de llegar, port&oacute;n rojo..." />
          </div>
        </div>
      </fieldset>

      {/* ── Total y submit ───────────── */}
      <div className={styles.footer}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total:</span>
          <span className={styles.totalAmount}>${total.toFixed(2)}</span>
        </div>

        {estado === "error" && errorMsg && (



          <p className={styles.errorMsg} role="alert">{errorMsg}</p>
        )}






        <button type="submit" disabled={estado === "saving"} className={styles.submitBtn}>
          {estado === "saving" ? "Guardando..." : "Guardar pedido"}
        </button>
      </div>
    </form>
  );
}
