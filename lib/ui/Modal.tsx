/**
 * lib/ui/Modal.tsx
 * ───────────────────────────────────────────────────────────
 * Modal accesible. Compatible con React 18 (sin Server
 * Components, debe ser 'use client' en quien lo use).
 *
 * Características:
 *   - Cierre con tecla ESC.
 *   - Cierre con click en el backdrop.
 *   - Bloquea el scroll del body mientras está abierto.
 *   - Atrapa el foco en el modal (loop con Tab).
 *   - Atributos ARIA correctos (role=dialog, aria-modal, labelledby).
 *
 * NOTA: este componente no usa 'use client' por sí mismo porque
 * Next 14+ ya lo trata como client si lo importas desde uno.
 * Si lo usas directo en un Server Component, márcalo 'use client'
 * en el archivo que lo importa, o envuélvelo en tu propio client
 * wrapper.
 * ───────────────────────────────────────────────────────────
 */

'use client';

import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export type ModalProps = {
  /** Si false, el modal no se renderiza. */
  open: boolean;
  /** Callback al cerrar (ESC, backdrop, botón X). */
  onClose: () => void;
  /** Título del modal. Se usa también como aria-label. */
  title: string;
  /** Contenido del modal. */
  children: ReactNode;
  /** Footer opcional (botones "Cancelar", "Guardar"). */
  footer?: ReactNode;
  /** Tamaño. Default: 'md'. */
  size?: ModalSize;
  /** Si false, no se cierra con click en el backdrop. Default: true. */
  closeOnBackdrop?: boolean;
  /** Si false, no se muestra el botón X. Default: true. */
  showCloseButton?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // ── ESC para cerrar ───────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // ── Bloquear scroll del body ──────────────────────────────
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ── Auto-focus en el primer elemento focuseable ───────────
  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    if (!root) return;
    const focusable = root.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }, [open]);

  if (!open) return null;

  function onBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={[styles.dialog, styles[`s_${size}`]].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {showCloseButton ? (
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          ) : null}
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>
  );
}
