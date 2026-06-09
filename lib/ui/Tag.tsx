/**
 * lib/ui/Tag.tsx
 * ───────────────────────────────────────────────────────────
 * Etiqueta colorida reutilizable. Las `variant` están
 * conectadas a los enums de `lib/crm/types.ts` para que el
 * color sea siempre consistente en toda la app:
 *
 *   - 'entregado'        → verde
 *   - 'pendiente'        → ámbar
 *   - 'en_ruta'          → azul
 *   - 'ausente'          → gris
 *   - 'cancelado'        → rojo
 *   - 'facebook'         → azul Facebook
 *   - 'ecommerce'        → morado
 *   - 'kiosk'            → naranja
 *   - 'reparto_local'    → verde-azulado
 *   - 'paqueteria_nacional' → rojo suave
 *
 * También se puede usar `tone` genérico para tags personalizados:
 *   - 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 *
 * Uso:
 *   <Tag variant="entregado">Entregado</Tag>
 *   <Tag tone="success">Listo</Tag>
 * ───────────────────────────────────────────────────────────
 */

import type { ReactNode } from 'react';
import styles from './Tag.module.css';

export type TagVariant =
  | 'entregado'
  | 'pendiente'
  | 'en_ruta'
  | 'ausente'
  | 'cancelado'
  | 'facebook'
  | 'ecommerce'
  | 'kiosk'
  | 'reparto_local'
  | 'paqueteria_nacional';

export type TagTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type TagSize = 'sm' | 'md';

export type TagProps = {
  /** Variante semántica mapeada a un color predefinido. */
  variant?: TagVariant;
  /** Tono genérico cuando no hay variant semántica. */
  tone?: TagTone;
  /** Tamaño: 'sm' (chips pequeños) | 'md' (default). */
  size?: TagSize;
  /** Contenido del tag. */
  children: ReactNode;
  /** Icono opcional a la izquierda. */
  icon?: ReactNode;
  /** Clases extra. */
  className?: string;
};

export function Tag({
  variant,
  tone,
  size = 'md',
  children,
  icon,
  className,
}: TagProps) {
  // variant tiene prioridad sobre tone.
  const visualKey = variant ?? tone ?? 'neutral';

  return (
    <span
      className={[
        styles.tag,
        styles[`v_${visualKey}`],
        styles[`s_${size}`],
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
}
