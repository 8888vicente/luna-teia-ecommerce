/**
 * lib/ui/Spinner.tsx
 * Indicador de carga. Tres tamaños + opción de "pantalla completa".
 *
 * Uso:
 *   <Spinner />
 *   <Spinner size="sm" />
 *   <Spinner fullScreen label="Cargando pedidos…" />
 */

import styles from './Spinner.module.css';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

export type SpinnerProps = {
  size?: SpinnerSize;
  /** Si true, ocupa toda la pantalla con un mensaje. */
  fullScreen?: boolean;
  /** Texto accesible (aria-label) y visible si fullScreen. */
  label?: string;
  className?: string;
};

export function Spinner({
  size = 'md',
  fullScreen = false,
  label = 'Cargando…',
  className,
}: SpinnerProps) {
  if (fullScreen) {
    return (
      <div className={styles.fullScreen} role="status" aria-live="polite">
        <span className={[styles.spinner, styles[`s_${size}`]].join(' ')} />
        <span className={styles.label}>{label}</span>
      </div>
    );
  }

  return (
    <span
      className={[
        styles.spinner,
        styles[`s_${size}`],
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-label={label}
    />
  );
}
