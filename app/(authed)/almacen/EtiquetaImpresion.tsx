'use client';

import type { PedidoCentralRow, PedidoItemRow } from '@/lib/crm/types';
import styles from './EtiquetaImpresion.module.css';

type PedidoItemConProducto = PedidoItemRow & {
  products: {
    name: string;
    color_hex: string;
    image_url: string;
    family: string;
  } | null;
};

type PedidoCompuesto = PedidoCentralRow & {
  pedido_items: PedidoItemConProducto[];
};

type Props = {
  pedido: PedidoCompuesto;
};

export function EtiquetaImpresion({ pedido }: Props) {
  const isNational = pedido.tipo_entrega === 'paqueteria_nacional';
  const trackingNumber = pedido.dhl_tracking_number || '';

  // API de código de barras de tec-it (gratuita, de alto contraste para lectores ópticos)
  const barcodeUrl = trackingNumber 
    ? `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(trackingNumber)}&code=Code128&translate-esc=true`
    : `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(pedido.id.slice(0, 8))}&code=Code128&translate-esc=true`;

  return (
    <article className={styles.ticketContainer} id="etiqueta-impresion-ticket">
      {/* Cabecera del ticket */}
      <header className={styles.header}>
        <h1 className={styles.brandName}>Luna Teia</h1>
        <p className={styles.brandSubtitle}>CRM Logístico - Bodega</p>
        <div className={styles.divider}></div>
      </header>

      {/* Tipo de entrega e ID */}
      <section className={styles.deliverySection}>
        <div className={styles.deliveryType}>
          {isNational ? '📦 ENVIÓ NACIONAL' : '📍 REPARTO LOCAL'}
        </div>
        <p className={styles.orderId}>
          Pedido: <strong>#{pedido.id.slice(0, 8)}</strong>
        </p>
        <span className={styles.date}>
          {new Date(pedido.created_at).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </section>

      <div className={styles.divider}></div>

      {/* Datos del Cliente */}
      <section className={styles.clientSection}>
        <h3>DESTINATARIO:</h3>
        <p className={styles.clientName}>{pedido.cliente_nombre}</p>
        <p>📞 Whatsapp: {pedido.cliente_telefono}</p>
        <p className={styles.address}>
          <strong>Dirección:</strong> {pedido.direccion} ({pedido.ciudad})
        </p>
        {pedido.referencias && (
          <p className={styles.references}>
            <strong>Ref:</strong> {pedido.referencias}
          </p>
        )}
      </section>

      <div className={styles.divider}></div>

      {/* Contenido / Packing List */}
      <section className={styles.itemsSection}>
        <h3>ARTÍCULOS A EMPACAR:</h3>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th className={styles.textLeft}>Cant</th>
              <th className={styles.textLeft}>Producto</th>
            </tr>
          </thead>
          <tbody>
            {pedido.pedido_items.map((item) => (
              <tr key={item.id} className={styles.itemRow}>
                <td className={styles.itemQty}>{item.cantidad} x</td>
                <td className={styles.itemName}>
                  {item.products?.name || `Producto: ${item.producto_id}`}
                  <span className={styles.itemFamily}>
                    ({item.products?.family || 'General'})
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className={styles.divider}></div>

      {/* Guía o Tracking - Barcode */}
      <section className={styles.barcodeSection}>
        {isNational ? (
          <>
            <p className={styles.guideTitle}>GUÍA DE RASTREO:</p>
            {trackingNumber ? (
              <>
                {/* Renderizar imagen de código de barras */}
                <img 
                  src={barcodeUrl} 
                  alt={`Código de barras ${trackingNumber}`} 
                  className={styles.barcodeImage}
                />
                <strong className={styles.trackingCode}>{trackingNumber}</strong>
              </>
            ) : (
              <span className={styles.noGuide}>⚠️ Falta asignar número de guía</span>
            )}
          </>
        ) : (
          <>
            <p className={styles.guideTitle}>CÓDIGO DE CONTROL LOCAL:</p>
            <img 
              src={barcodeUrl} 
              alt={`Código local ${pedido.id.slice(0, 8)}`} 
              className={styles.barcodeImage}
            />
            <strong className={styles.trackingCode}>{pedido.id.slice(0, 8).toUpperCase()}</strong>
          </>
        )}
      </section>

      <footer className={styles.footer}>
        <div className={styles.divider}></div>
        <p>Luna Teia Cosméticos</p>
        <p className={styles.footerMsg}>Empacado con amor 💖</p>
      </footer>
    </article>
  );
}
