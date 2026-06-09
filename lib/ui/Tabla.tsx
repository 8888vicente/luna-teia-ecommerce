/**
 * lib/ui/Tabla.tsx
 * ───────────────────────────────────────────────────────────
 * Wrapper tipado sobre <table>. Un solo lugar para mantener
 * el estilo de todas las tablas de la app.
 *
 * Características:
 *   - Genéricos: defines el tipo de fila y la firma de columnas
 *     se vuelve type-safe (no más `any` en tablas).
 *   - Estados integrados: loading, empty, error, datos.
 *   - Footer opcional (útil para totales en tablas financieras).
 *   - Sticky header, scroll horizontal en móvil, filas zebra.
 *
 * Uso:
 *   type Fila = { id: string; nombre: string; total: number };
 *
 *   <Tabla<Fila>
 *     data={filas}
 *     keyOf={(f) => f.id}
 *     columns={[
 *       { key: 'nombre', header: 'Cliente', render: (f) => f.nombre },
 *       { key: 'total',  header: 'Total',   render: (f) => <Money value={f.total} />, align: 'right' },
 *     ]}
 *     footer={[
 *       { colSpan: 1, content: <strong>Total</strong>, align: 'right' },
 *       { colSpan: 1, content: <Money value={1250} />, align: 'right' },
 *     ]}
 *     loading={false}
 *     emptyMessage="Sin pedidos aún."
 *   />
 * ───────────────────────────────────────────────────────────
 */

import type { ReactNode } from 'react';
import styles from './Tabla.module.css';

export type ColumnAlign = 'left' | 'center' | 'right';

export type TablaColumn<T> = {
  /** Identificador único de la columna. */
  key: string;
  /** Texto del <th>. Puede ser string o nodo (ej. icono). */
  header: ReactNode;
  /** Cómo extraer el contenido de la celda para una fila. */
  render: (fila: T) => ReactNode;
  /** Alineación horizontal. Default: 'left'. */
  align?: ColumnAlign;
  /** Ancho preferido. Default: auto. */
  width?: string;
  /** Clases extra para <td> (ej. para formato numérico). */
  cellClassName?: string;
};

export type TablaFooterCell = {
  colSpan?: number;
  content: ReactNode;
  align?: ColumnAlign;
};

export type TablaProps<T> = {
  data: readonly T[];
  /** Función para extraer la key única de cada fila. */
  keyOf: (fila: T) => string;
  /** Definición de columnas en orden. */
  columns: readonly TablaColumn<T>[];
  /** Fila(s) del footer. Vacío = sin footer. */
  footer?: readonly TablaFooterCell[];
  /** Estado de carga: muestra mensaje + deshabilita interacciones. */
  loading?: boolean;
  /** Mensaje cuando data está vacía. Default: "Sin resultados.". */
  emptyMessage?: string;
  /** Mensaje de error opcional. */
  error?: string | null;
  /** Variante visual: 'default' | 'compact' (más densa para dashboards). */
  density?: 'default' | 'compact';
  /** Clases extra en el wrapper externo. */
  className?: string;
};

export function Tabla<T>({
  data,
  keyOf,
  columns,
  footer,
  loading = false,
  emptyMessage = 'Sin resultados.',
  error = null,
  density = 'default',
  className,
}: TablaProps<T>) {
  // ── Estado: error ──────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.tableWrapper}>
        <p className={styles.error} role="alert">
          ⚠️ {error}
        </p>
      </div>
    );
  }

  // ── Estado: loading ────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.tableWrapper}>
        <p className={styles.loading}>Cargando…</p>
      </div>
    );
  }

  // ── Estado: vacío ──────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <p className={styles.empty}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={[
        styles.tableWrapper,
        density === 'compact' ? styles.compact : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: col.align ?? 'left',
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((fila) => (
            <tr key={keyOf(fila)}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={col.cellClassName}
                  style={{ textAlign: col.align ?? 'left' }}
                >
                  {col.render(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && footer.length > 0 ? (
          <tfoot>
            <tr>
              {footer.map((cell, idx) => (
                <td
                  key={idx}
                  colSpan={cell.colSpan ?? 1}
                  style={{ textAlign: cell.align ?? 'left' }}
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
