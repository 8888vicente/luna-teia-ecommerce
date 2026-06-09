/**
 * lib/ui/index.ts
 * ───────────────────────────────────────────────────────────
 * PUERTA ÚNICA de los componentes UI reusables.
 *
 * Regla: importar siempre desde aquí:
 *   import { Tabla, Tag, Money, Modal, Spinner } from '@/lib/ui';
 *
 * NUNCA desde archivos internos como './Tabla'.
 * Esto permite reorganizar la carpeta sin romper imports.
 * ───────────────────────────────────────────────────────────
 */

export { Tabla } from './Tabla';
export type {
  TablaProps,
  TablaColumn,
  TablaFooterCell,
  ColumnAlign,
} from './Tabla';

export { Tag } from './Tag';
export type { TagProps, TagVariant, TagTone, TagSize } from './Tag';

export { Money } from './Money';
export type { MoneyProps } from './Money';

export { Modal } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

export { Spinner } from './Spinner';
export type { SpinnerProps, SpinnerSize } from './Spinner';

export { ToastProvider, useToast } from './Toast';
export type { ToastTone, ToastInput } from './Toast';
