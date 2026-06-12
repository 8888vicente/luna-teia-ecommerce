import { requireRepartidor } from '@/lib/auth';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getInventarioCamioneta } from '@/lib/crm/crm';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function RepartidorInventarioPage() {
  const sesion = await requireRepartidor();
  const supabase = await getSupabaseServer();

  const res = await getInventarioCamioneta(supabase, sesion.repartidorId);

  if (!res.ok) {
    return (
      <main className={styles.container}>
        <h1>Error al cargar inventario</h1>
        <p>{res.error}</p>
      </main>
    );
  }

  const inventario = res.data;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Mi Inventario (Camioneta)</h1>
        <p className={styles.subtitle}>
          Productos que llevas asignados actualmente en tu vehículo para entregar hoy.
        </p>
      </header>

      {inventario.length === 0 ? (
        <div className={styles.empty}>
          <p>No tienes productos asignados en tu camioneta actualmente.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Familia</th>
                <th className={styles.textRight}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.prodInfo}>
                      {item.products?.color_hex && (
                        <span
                          className={styles.colorDot}
                          style={{ backgroundColor: item.products.color_hex }}
                          aria-hidden="true"
                        />
                      )}
                      <strong className={styles.prodName}>
                        {item.products?.name ?? item.producto_id}
                      </strong>
                    </div>
                  </td>
                  <td className={styles.family}>{item.products?.family ?? 'Cosméticos'}</td>
                  <td className={[styles.textRight, styles.qty].join(' ')}>{item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
