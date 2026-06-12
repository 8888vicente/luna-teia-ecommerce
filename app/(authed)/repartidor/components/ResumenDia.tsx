'use client';

import type { ResumenRuta } from '@/lib/reparto/types';
import styles from './ResumenDia.module.css';

type Props = {
  resumen: ResumenRuta;
  duration: number | null;
  distance: number | null;
  isOptimized: boolean;
};

export function ResumenDia({ resumen, duration, distance, isOptimized }: Props) {
  const formatTime = (secs: number) => {
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  };

  const formatDistance = (meters: number) => {
    const kms = (meters / 1000).toFixed(1);
    return `${kms} km`;
  };

  const progressPercent = resumen.total_pedidos > 0 
    ? Math.round(((resumen.entregados + resumen.cancelados + resumen.ausentes) / resumen.total_pedidos) * 100)
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.emoji} aria-hidden="true">📦</span>
          <div className={styles.kpiInfo}>
            <span className={styles.value}>
              {resumen.entregados}/{resumen.total_pedidos}
            </span>
            <span className={styles.label}>Entregas</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.emoji} aria-hidden="true">💰</span>
          <div className={styles.kpiInfo}>
            <span className={styles.value}>${resumen.monto_cobrado.toLocaleString()}</span>
            <span className={styles.label}>Cobrado</span>
          </div>
        </div>

        {isOptimized && duration !== null && (
          <div className={styles.kpiCard}>
            <span className={styles.emoji} aria-hidden="true">⏱️</span>
            <div className={styles.kpiInfo}>
              <span className={styles.value}>{formatTime(duration)}</span>
              <span className={styles.label}>{formatDistance(distance ?? 0)} de ruta</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.progressBarBg} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
        <div 
          className={styles.progressBarFill} 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
