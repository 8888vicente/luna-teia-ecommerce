'use client';

/**
 * TablaComisiones — Client Component
 * Muestra las comisiones acumuladas por repartidor en
 * los últimos 7 días.
 *
 * La query va por pedidos_central -> pedido_items -> repartidores
 * para respetar el schema real de la BD.
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
      const hace7diasStr = hace7dias.toISOString();

      // 1) Traer pedidos_central con estatus=entregado, con su repartidor y items
      const { data: pedidos, error: e } = await supabase
        .from('pedidos_central')
        .select(
          `
          id,
          repartidor_assigned_id,
          updated_at,
          repartidor:repartidor_assigned_id!inner (
            id,
            nombre,
            ciudad
          ),
          pedido_items (
            comision_repartidor
          )
        `
        )
        .eq('estatus_pedido', 'entregado')
        .gte('updated_at', hace7diasStr);

      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }

      // 2) Agrupar por repartidor
      const mapa = new Map<string, FilaComision>();

      for (const p of pedidos ?? []) {
        const r: any = (p as any).repartidor;
        if (!r) continue;

        const repId = r.id;
        const existente = mapa.get(repId) ?? {
          repartidor_id: repId,
          repartidor_nombre: r.nombre,
          ciudad: r.ciudad,
          pedidos_entregados: 0,
          total_comision: 0,
        };

        existente.pedidos_entregados += 1;

        const items: any[] = (p as any).pedido_items ?? [];
        for (const item of items) {
          existente.total_comision += Number(item.comision_repartidor ?? 0);
        }

        mapa.set(repId, existente);
      }

      const agregadas = Array.from(mapa.values());
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
            <th>Comisi&oacute;n total</th>
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
