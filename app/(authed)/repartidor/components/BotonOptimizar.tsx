'use client';

import styles from './BotonOptimizar.module.css';

type Props = {
  onOptimize: () => Promise<void>;
  isOptimizing: boolean;
  isOptimized: boolean;
  disabled?: boolean;
};

export function BotonOptimizar({
  onOptimize,
  isOptimizing,
  isOptimized,
  disabled,
}: Props) {
  return (
    <div className={styles.container}>
      <button
        type="button"
        className={[
          styles.btn,
          isOptimized ? styles.optimized : '',
          isOptimizing ? styles.optimizing : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={onOptimize}
        disabled={disabled || isOptimizing}
      >
        {isOptimizing ? (
          <>
            <span className={styles.spinner} />
            <span>Optimizando ruta...</span>
          </>
        ) : isOptimized ? (
          '⚡ Ruta Optimizada (Re-optimizar)'
        ) : (
          '🗺️ Optimizar Ruta con OSRM'
        )}
      </button>
    </div>
  );
}
