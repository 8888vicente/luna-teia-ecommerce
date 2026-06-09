/**
 * lib/ui/Toast.tsx
 * ───────────────────────────────────────────────────────────
 * Sistema de notificaciones toast. Provider + hook.
 *
 *   - useToast() devuelve { show(message, tone) }.
 *   - Hasta 4 toasts simultáneos, los más recientes arriba.
 *   - Auto-dismiss configurable (default 4s).
 *   - Cierre manual con X.
 *   - Sin dependencias externas (no sonner, no react-hot-toast).
 *
 * Uso:
 *   'use client';
 *   import { useToast } from '@/lib/ui';
 *
 *   const toast = useToast();
 *   toast.show('Pedido asignado', 'success');
 * ───────────────────────────────────────────────────────────
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styles from './Toast.module.css';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export type ToastInput = {
  message: string;
  tone?: ToastTone;
  /** Milisegundos hasta auto-cerrar. 0 = no auto-cerrar. */
  duration?: number;
};

type ToastInternal = Required<Omit<ToastInput, 'duration'>> & {
  id: number;
  duration: number;
};

type ToastContextValue = {
  show: (input: string | ToastInput, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastContextValue['show']>((input, tone) => {
    idRef.current += 1;
    const id = idRef.current;
    const normalized: ToastInput =
      typeof input === 'string' ? { message: input, tone } : input;

    const t: ToastInternal = {
      id,
      message: normalized.message,
      tone: normalized.tone ?? 'info',
      duration: normalized.duration ?? 4000,
    };

    setToasts((prev) => [...prev, t].slice(-4)); // máximo 4

    if (t.duration > 0) {
      window.setTimeout(() => dismiss(id), t.duration);
    }
  }, [dismiss]);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[styles.toast, styles[`t_${t.tone}`]].join(' ')}
            role="status"
          >
            <span className={styles.msg}>{t.message}</span>
            <button
              type="button"
              className={styles.close}
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast() debe usarse dentro de un <ToastProvider>.');
  }
  return ctx;
}
