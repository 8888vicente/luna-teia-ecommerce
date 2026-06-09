'use client';

/**
 * BotonEstatus — Tres botones para cambiar el estatus
 * del pedido: Entregado (verde), Cancelado (rojo),
 * Ausente (gris). Maneja estado local de loading y
 * propaga el resultado al padre.
 */
import { useState } from 'react';
import type { PedidoEstatus } from '@/lib/crm/types';
import styles from './BotonEstatus.module.css';

type Props = {
  pedidoId: string;
  disabled?: boolean;
  onConfirm: (
    pedidoId: string,
    nuevoEstatus: PedidoEstatus
  ) => Promise<{ ok: boolean; error?: string }>;
};

type EstatusKey = 'entregado' | 'cancelado' | 'ausente';

const BOTONES: { key: EstatusKey; label: string; estatus: PedidoEstatus }[] = [
  { key: 'entregado', label: '✓ Entregado', estatus: 'entregado' },
  { key: 'ausente', label: '👤 Ausente', estatus: 'ausente' },
  { key: 'cancelado', label: '✕ Cancelado', estatus: 'cancelado' },
];

export function BotonEstatus({ pedidoId, disabled, onConfirm }: Props) {
  const [loadingKey, setLoadingKey] = useState<EstatusKey | null>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  async function handleClick(b: (typeof BOTONES)[number]) {
    setErrorLocal(null);
    setLoadingKey(b.key);
    const res = await onConfirm(pedidoId, b.estatus);
    setLoadingKey(null);
    if (!res.ok && res.error) {
      setErrorLocal(res.error);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        {BOTONES.map((b) => {
          const isLoading = loadingKey === b.key;
          return (
            <button
              key={b.key}
              type="button"
              className={`${styles.btn} ${styles[b.key]}`}
              disabled={disabled || loadingKey !== null}
              onClick={() => handleClick(b)}
            >
              {isLoading ? '...' : b.label}
            </button>
          );
        })}
      </div>
      {errorLocal && (
        <p className={styles.errorLocal} role="alert">
          {errorLocal}
        </p>
      )}
    </div>
  );
}
