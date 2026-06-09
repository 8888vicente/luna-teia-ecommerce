'use client';

/**
 * TablaComisiones — Client Component
 * Muestra las comisiones acumuladas por repartidor en
 * los últimos 7 días, calculadas a partir de los
 * pedido_items de pedidos ya entregados.
 *
 * Usa getSupabaseService() indirectamente vía una
 * server action (no en este archivo) para no exponer
 * la SERVICE KEY al bundle del cliente.
 */
import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import styles from './TablaComisiones.module.css';

type FilaComision = {
  repartidor_id: string;
  repartidor_nombre: string;
  ciudad: string;
  pedidos_entregados: number;
  total_comision: number;
};

export function TablaComisiones() {
  const [filas, setFilas] = useState<FilaComision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      const supabase = getSupabaseBrowser();

      const hace7dias = new Date();
      hace7dias.setDate(hace7dias.getDate() - 7);

      // Query agregada: trae repartidores con join a
      // pedido_items cuyo pedido esté 'entregado' en los
      // últimos 7 días. Como cliente autenticado con rol
      // Administrador, la RLS permite leer todo.
      const { data, error: e } = await supabase
        .from('repartidores')
        .select(
          `
          id,
          nombre,
          ciudad,
          pedido_items:pedido_items!inner (
            comision_repartidor,
            pedido:pedido_id!inner (
              estatus_pedido,
              updated_at
            )
          )
        `
        )
        .eq('estatus', 'activo');

      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }

      const agregadas: FilaComision[] = (data ?? []).map((r: any) => {
        const comFiltradas = (r.pedido_items ?? []).filter(
          (it: any) =>
            it.pedido?.estatus_pedido === 'entregado' &&
            new Date(it.pedido.updated_at) >= hace7dias &&
            it.comision_repartidor !== null
        );
        const total = comFiltradas.reduce(
          (acc: number, it: any) => acc + Number(it.comision_repartidor ?? 0),
          0
        );
        return {
          repartidor_id: r.id,
          repartidor_nombre: r.nombre,
          ciudad: r.ciudad,
          pedidos_entregados: new Set(
            comFiltradas.map((it: any) => it.pedido?.id)
          ).size,
          total_comision: total,
        };
      });

      agregadas.sort((a, b) => b.total_comision - a.total_comision);
      setFilas(agregadas);
      setLoading(false);
    }
    void cargar();
  }, []);

  if (loading) return <p>Cargando comisiones…</p>;
  if (error)
    return (
      <p className={styles.error} role="alert">
        Error: {error}
      </p>
    );

  if (filas.length === 0) {
    return <p className={styles.empty}>Sin comisiones registradas esta semana.</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Repartidor</th>
            <th>Ciudad</th>
            <th>Entregas (7d)</th>
            <th>Comisión total</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.repartidor_id}>
              <td>
                <strong>{f.repartidor_nombre}</strong>
              </td>
              <td>{f.ciudad}</td>
              <td>{f.pedidos_entregados}</td>
              <td className={styles.money}>
                ${f.total_comision.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: 'right' }}>
              <strong>Total a pagar:</strong>
            </td>
            <td className={styles.money}>
              <strong>
                $
                {filas
                  .reduce((acc, f) => acc + f.total_comision, 0)
                  .toFixed(2)}
              </strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
