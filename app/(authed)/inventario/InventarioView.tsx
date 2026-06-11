"use client";

/**
 * InventarioView - Client Component
 *
 * Muestra dos paneles: Inventario en Almacen e Inventario en Campo.
 * Cada panel tiene filtro por nombre de producto, y el panel de
 * camioneta tiene filtro por repartidor.
 */

import { useState, useMemo } from "react";
import styles from "./InventarioView.module.css";

type ItemAlmacen = {
  producto_id: string;
  producto_nombre: string;
  producto_familia: string;
  cantidad: number;
};

type ItemCampo = {
  id: string;
  repartidor_id: string;
  repartidor_nombre: string;
  repartidor_ciudad: string;
  producto_id: string;
  producto_nombre: string;
  producto_familia: string;
  cantidad: number;
};

type Props = {
  almacen: ItemAlmacen[];
  campo: ItemCampo[];
};

export function InventarioView({ almacen, campo }: Props) {
  const [busquedaAlmacen, setBusquedaAlmacen] = useState("");
  const [filtroRepartidor, setFiltroRepartidor] = useState("");

  // Repartidores unicos para el select de filtro
  const repartidoresUnicos = useMemo(() => {
    const mapa = new Map<
      string,
      { id: string; nombre: string; ciudad: string }
    >();
    campo.forEach((c) => {
      if (!mapa.has(c.repartidor_id)) {
        mapa.set(c.repartidor_id, {
          id: c.repartidor_id,
          nombre: c.repartidor_nombre,
          ciudad: c.repartidor_ciudad,
        });
      }
    });
    return Array.from(mapa.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [campo]);

  const almacenFiltrado = useMemo(() => {
    if (!busquedaAlmacen) return almacen;
    const q = busquedaAlmacen.toLowerCase();
    return almacen.filter(
      (a) =>
        a.producto_nombre.toLowerCase().includes(q) ||
        a.producto_familia.toLowerCase().includes(q)
    );
  }, [almacen, busquedaAlmacen]);

  const campoFiltrado = useMemo(() => {
    let resultado = campo;
    if (filtroRepartidor) {
      resultado = resultado.filter(
        (c) => c.repartidor_id === filtroRepartidor
      );
    }
    if (busquedaAlmacen) {
      const q = busquedaAlmacen.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.producto_nombre.toLowerCase().includes(q) ||
          c.producto_familia.toLowerCase().includes(q)
      );
    }
    return resultado;
  }, [campo, filtroRepartidor, busquedaAlmacen]);

  return (
    <div className={styles.grid}>
      {/* Panel: Almacen */}
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>
          Almacen{" "}
          <span className={styles.panelCount}>
            {almacen.length} productos
          </span>
        </h2>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar producto o familia..."
            value={busquedaAlmacen}
            onChange={(e) => setBusquedaAlmacen(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Familia</th>
                <th className={styles.colRight}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {almacenFiltrado.map((a) => (
                <tr key={a.producto_id}>
                  <td>{a.producto_nombre}</td>
                  <td className={styles.family}>{a.producto_familia}</td>
                  <td className={styles.colRight}>
                    <span
                      className={`${styles.stockBadge} ${
                        a.cantidad < 10 ? styles.stockLow : ""
                      }`}
                    >
                      {a.cantidad}
                    </span>
                  </td>
                </tr>
              ))}
              {almacenFiltrado.length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.emptyRow}>
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Panel: Campo */}
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>
          En camioneta{" "}
          <span className={styles.panelCount}>
            {campo.length} registros
          </span>
        </h2>

        {/* Filtro por repartidor */}
        <div className={styles.filtroRepartidor}>
          <label htmlFor="filtro_rep_campo">Repartidor:</label>
          <select
            id="filtro_rep_campo"
            value={filtroRepartidor}
            onChange={(e) => setFiltroRepartidor(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos los repartidores</option>
            {repartidoresUnicos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre} - {r.ciudad}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Repartidor</th>
                <th>Producto</th>
                <th className={styles.colRight}>Cant.</th>
              </tr>
            </thead>
            <tbody>
              {campoFiltrado.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.repartidor_nombre}</strong>
                    <br />
                    <span className={styles.familyHint}>
                      {c.repartidor_ciudad}
                    </span>
                  </td>
                  <td>
                    {c.producto_nombre}
                    <span className={styles.familyHint}>
                      {" "}
                      ({c.producto_familia})
                    </span>
                  </td>
                  <td className={styles.colRight}>{c.cantidad}</td>
                </tr>
              ))}
              {campoFiltrado.length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.emptyRow}>
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
