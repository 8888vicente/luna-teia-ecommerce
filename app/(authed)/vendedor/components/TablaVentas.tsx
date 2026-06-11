"use client";

/**
 * TablaVentas — Client Component
 *
 * Tabla de pedidos capturados con filtros por ciudad y repartidor.
 * Se actualiza via router.refresh() al crear un pedido.
 */

import { useState, useMemo } from "react";
import styles from "./TablaVentas.module.css";

type Pedido = {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  ciudad: string;
  monto_pagado: number;
  estatus_pedido: string;
  repartidor_nombre: string | null;
  created_at: string;
};

type Repartidor = {
  id: string;
  nombre: string;
  ciudad: string;
};

type Props = {
  pedidos: Pedido[];
  repartidores: Repartidor[];
  ciudades: string[];
};

type FiltroEstatus = "todos" | "pendiente" | "en_ruta" | "entregado" | "ausente" | "cancelado";

export function TablaVentas({ pedidos, repartidores, ciudades }: Props) {
  const [filtroCiudad, setFiltroCiudad] = useState("");
  const [filtroRepartidor, setFiltroRepartidor] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState<FiltroEstatus>("todos");

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (filtroCiudad && p.ciudad !== filtroCiudad) return false;
      if (filtroRepartidor) {
        const rep = repartidores.find((r) => r.id === filtroRepartidor);
        if (p.repartidor_nombre !== (rep?.nombre ?? null)) return false;
      }
      if (filtroEstatus !== "todos" && p.estatus_pedido !== filtroEstatus) return false;
      return true;
    });
  }, [pedidos, filtroCiudad, filtroRepartidor, filtroEstatus, repartidores]);

  const totalMonto = pedidosFiltrados.reduce(
    (sum, p) => sum + Number(p.monto_pagado ?? 0),
    0
  );

  return (
    <div>
      {/* ── Filtros ──────────────────────── */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="filtro_ciudad">Ciudad</label>
          <select
            id="filtro_ciudad"
            value={filtroCiudad}
            onChange={(e) => setFiltroCiudad(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todas</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filtro_repartidor">Repartidor</label>
          <select
            id="filtro_repartidor"
            value={filtroRepartidor}
            onChange={(e) => setFiltroRepartidor(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos</option>
            {repartidores.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filtro_estatus">Estatus</label>
          <select
            id="filtro_estatus"
            value={filtroEstatus}
            onChange={(e) => setFiltroEstatus(e.target.value as FiltroEstatus)}
            className={styles.filterSelect}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_ruta">En ruta</option>
            <option value="entregado">Entregado</option>
            <option value="ausente">Ausente</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className={styles.resultCount}>
          {pedidosFiltrados.length} pedidos &mdash; Total: ${totalMonto.toFixed(2)}
        </div>
      </div>

      {/* ── Tabla ────────────────────────── */}
      {pedidosFiltrados.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tel&eacute;fono</th>
                <th>Ciudad</th>
                <th>Total</th>
                <th>Estatus</th>
                <th>Repartidor</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.cliente_nombre}</strong>
                  </td>
                  <td>{p.cliente_telefono}</td>
                  <td>{p.ciudad}</td>
                  <td>${Number(p.monto_pagado ?? 0).toFixed(2)}</td>
                  <td>
                    <span
                      className={`${styles.tag} ${styles[p.estatus_pedido] ?? ""}`}
                    >
                      {p.estatus_pedido === "en_ruta"
                        ? "En ruta"
                        : p.estatus_pedido}
                    </span>
                  </td>
                  <td>{p.repartidor_nombre ?? "-"}</td>

                  <td>{p.created_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.empty}>
          <p>No hay pedidos que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
}
