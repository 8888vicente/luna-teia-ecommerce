/**
 * lib/ui/Money.tsx
 * ───────────────────────────────────────────────────────────
 * Formatear dinero en MXN de forma consistente en toda la app.
 *
 * Decisiones:
 *   - Locale fijo 'es-MX' (no dependes del navegador del cliente).
 *   - Currency 'MXN' con símbolo $.
 *   - Por defecto, 2 decimales (UX de tienda retail mexicana).
 *   - Para dashboards financieros podemos pedir 0 decimales.
 *
 * Uso:
 *   <Money value={1234.5} />                // $1,234.50
 *   <Money value={1234.5} decimals={0} />   // $1,234
 *   <Money value={-50} />                   // -$50.00 (color rojo)
 *   <Money value={1234.5} muted />          // color suave
 * ───────────────────────────────────────────────────────────
 */

import styles from './Money.module.css';

export type MoneyProps = {
  /** Cantidad. Acepta number, string numérico, o null/undefined (→ $0.00). */
  value: number | string | null | undefined;
  /** Cantidad de decimales. Default: 2. */
  decimals?: 0 | 2;
  /** Si true, no muestra el signo $ (útil en columnas muy estrechas). */
  hideSymbol?: boolean;
  /** Si true, valores negativos se pintan de rojo. Default: true. */
  colorizeNegatives?: boolean;
  /** Si true, color más suave (para subtotales, contexto). */
  muted?: boolean;
  /** Si true, tipografía más fuerte (totales, grandes cifras). */
  strong?: boolean;
  /** Tamaño tipográfico. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** className extra. */
  className?: string;
};

/**
 * Convierte un valor (number | string | null | undefined) a number.
 * Devuelve 0 si no es parseable. No lanza.
 */
function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(decimals: 0 | 2): Intl.NumberFormat {
  const key = `es-MX|MXN|${decimals}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;
  const f = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  formatterCache.set(key, f);
  return f;
}

export function Money({
  value,
  decimals = 2,
  hideSymbol = false,
  colorizeNegatives = true,
  muted = false,
  strong = false,
  size = 'md',
  className,
}: MoneyProps) {
  const n = toNumber(value);
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const formatted = getFormatter(decimals).format(abs);

  // hideSymbol elimina el $ del Intl para no repetirlo si queremos
  // el signo controlado por nosotros.
  const display = hideSymbol ? formatted.replace(/^\$\s*/, '') : formatted;

  const classes = [
    styles.money,
    styles[`s_${size}`],
    strong ? styles.strong : '',
    muted ? styles.muted : '',
    colorizeNegatives && n < 0 ? styles.negative : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {sign}
      {display}
    </span>
  );
}
