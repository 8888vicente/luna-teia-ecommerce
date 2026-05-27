'use client';

import React from 'react';
import Link from 'next/link';

export default function PoliticasPage() {
  // Definimos los estilos usando el estándar oficial de React para asegurar compatibilidad total
  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      color: '#37474F',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '4rem',
    },
    header: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #ECEFF1',
      padding: '3rem 1.5rem',
      textAlign: 'center',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '300',
      color: '#212121',
      letterSpacing: '0.05em',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
    },
    subtitle: {
      fontSize: '0.85rem',
      color: '#90A4AE',
      fontWeight: '600',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
    },
    contentWrapper: {
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '0 1.5rem',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      border: '1px solid #ECEFF1',
      padding: '2.5rem 2rem',
    },
    introText: {
      fontSize: '1.05rem',
      lineHeight: '1.7',
      color: '#455A64',
      borderBottom: '1px solid #ECEFF1',
      paddingBottom: '1.5rem',
      marginBottom: '2rem',
    },
    section: {
      marginBottom: '2.5rem',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: '#FCE4EC',
      color: '#C2185B',
      fontWeight: '600',
      fontSize: '0.85rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#212121',
      margin: 0,
    },
    paragraph: {
      fontSize: '0.95rem',
      lineHeight: '1.6',
      color: '#455A64',
      marginLeft: '2.25rem',
      marginBottom: '0.75rem',
    },
    bulletList: {
      marginLeft: '3.5rem',
      marginBottom: '1rem',
      color: '#455A64',
      fontSize: '0.95rem',
      lineHeight: '1.6',
    },
    alertBox: {
      backgroundColor: '#FFF8E1',
      borderLeft: '4px solid #FFB300',
      padding: '1rem',
      borderRadius: '0 8px 8px 0',
      marginLeft: '2.25rem',
      marginBottom: '1rem',
      fontSize: '0.9rem',
      color: '#5D4037',
      lineHeight: '1.5',
    },
    highlightBox: {
      backgroundColor: '#FAFAFA',
      borderLeft: '4px solid #F48FB1',
      padding: '1.2rem',
      borderRadius: '0 8px 8px 0',
      marginLeft: '2.25rem',
      marginBottom: '1rem',
    },
    highlightTitle: {
      fontSize: '0.95rem',
      fontWeight: '700',
      color: '#212121',
      marginBottom: '0.5rem',
    },
    highlightText: {
      fontSize: '0.85rem',
      color: '#546E7A',
      lineHeight: '1.5',
      margin: 0,
    },
    footerLink: {
      display: 'block',
      textAlign: 'center',
      marginTop: '3rem',
      color: '#78909C',
      textDecoration: 'underline',
      fontSize: '0.9rem',
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Luna Teia</h1>
        <p style={styles.subtitle}>Políticas de Envío y Devoluciones</p>
      </header>

      <main style={styles.contentWrapper}>
        <div style={styles.card}>
          <p style={styles.introText}>
            Luna Teia Cosméticos realiza envíos exclusivamente dentro de la República Mexicana. A continuación, detallamos las condiciones de compra, envío y las políticas aplicables para devoluciones o aclaraciones.
          </p>

          {/* 1. Procesamiento */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.badge}>1</span>
              <h2 style={styles.sectionTitle}>Procesamiento de pedidos</h2>
            </div>
            <p style={styles.paragraph}>
              Todos los pedidos son procesados en un periodo de <strong>1 a 3 días hábiles</strong> posteriores a la confirmación del pago. Los días hábiles son de lunes a viernes, excluyendo días festivos oficiales.
            </p>
            <p style={styles.paragraph}>
              Los pedidos confirmados después de las <strong>2:00 p.m.</strong> se procesan al día hábil siguiente.
            </p>
            <p style={{ ...styles.paragraph, fontStyle: 'italic', color: '#78909C', fontSize: '0.85rem' }}>
              * Durante temporadas altas, promociones, rebajas o lanzamientos, el tiempo de procesamiento puede extenderse ligeramente.
            </p>
          </section>

          {/* 2. Métodos y Tiempos */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.badge}>2</span>
              <h2 style={styles.sectionTitle}>Métodos y tiempos de envío</h2>
            </div>
            <p style={styles.paragraph}>
              Los envíos son gestionados mediante <strong>Skydrop</strong> y diversas paqueterías nacionales, seleccionadas según la cobertura y disponibilidad del destino.
            </p>
            <p style={styles.paragraph}>
              El tiempo estimado de entrega para el envío económico terrestre es de <strong>2 a 5 días hábiles</strong> una vez despachado el pedido. Los tiempos pueden variar dependiendo de la zona geográfica.
            </p>
          </section>

          {/* 3. Costos de envío */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.badge}>3</span>
              <h2 style={styles.sectionTitle}>Costos de envío</h2>
            </div>
            <p style={styles.paragraph}>
              El costo de envío se calcula automáticamente en el carrito de compras bajo los siguientes criterios:
            </p>
            <ul style={styles.bulletList}>
              <li>Compras de <strong>$0.00 a $200.00 MXN</strong>: Envío base de <strong>$150.00 MXN</strong>.</li>
              <li>Compras de <strong>$200.01 a $499.99 MXN</strong>: Envío preferencial de <strong>$100.00 MXN</strong> (Luna Teia subsidia parte del costo).</li>
              <li>Compras de <strong>$500.00 MXN o más</strong>: <strong>Envío sin costo (¡GRATIS!)</strong>.</li>
            </ul>
          </section>

          {/* 4. Dirección incorrecta */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.badge}>4</span>
              <h2 style={styles.sectionTitle}>Dirección incorrecta o paquetes devueltos</h2>
            </div>
            <p style={styles.paragraph}>
              Es responsabilidad exclusiva del cliente verificar que la dirección de envío proporcionada sea correcta, completa y actual. En caso de que la paquetería devuelva el paquete por:
            </p>
            <ul style={styles.bulletList}>
              <li>Dirección incorrecta o datos incompletos.</li>
              <li>Ausencia del destinatario tras los intentos de entrega.</li>
              <li>Rechazo del paquete.</li>
            </ul>
            <div style={styles.alertBox}>
              <strong>⚠️ Importante:</strong> El cliente deberá cubrir el costo total del reenvío. Luna Teia Cosméticos no se hace responsable por pérdidas, retrasos o robos derivados de información errónea proporcionada por el cliente.
            </div>
            <p style={{ ...styles.paragraph, fontSize: '0.85rem', color: '#78909C' }}>
              En caso de extravío atribuible a la paquetería, gestionaremos la reclamación correspondiente con el proveedor logístico e informaremos al cliente sobre el resultado.
            </p>
          </section>

          {/* 5. Cambios y devoluciones */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.badge}>5</span>
              <h2 style={styles.sectionTitle}>Cambios y devoluciones</h2>
            </div>
            <p style={styles.paragraph}>
              Debido a la naturaleza de los productos cosméticos y de higiene personal, las devoluciones son limitadas por razones de salud y protección de la higiene. <strong>No se aceptan cambios ni devoluciones por:</strong>
            </p>
            <ul style={styles.bulletList}>
              <li>Diferencias de percepción en tonos, colores, texturas o acabados.</li>
              <li>Variaciones visuales derivadas de la iluminación, la pantalla o la fotografía.</li>
              <li>Expectativas personales sobre la duración del producto o arrepentimiento si ya fue abierto o utilizado.</li>
            </ul>
            <div style={styles.highlightBox}>
              <p style={styles.highlightTitle}>Cancelación por arrepentimiento:</p>
              <p style={styles.highlightText}>
                Solo será válido dentro de los primeros <strong>5 días hábiles</strong> tras recibirlo, de conformidad con el artículo 93 de la Ley Federal de Protección al Consumidor, siempre y cuando el producto permanezca cerrado, con sus sellos intactos y en su empaque original. El cliente cubre los costos de retorno y un cargo operativo de $50.00 MXN.
              </p>
            </div>
          </section>

          {/* 6. Productos dañados */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.badge}>6</span>
              <h2 style={styles.sectionTitle}>Productos dañados o defectuosos</h2>
            </div>
            <p style={styles.paragraph}>
              Si tu producto llega dañado o presenta un defecto de fabricación, deberás reportarlo dentro de las primeras <strong>48 horas posteriores a la entrega</strong>. Para proceder, es obligatorio enviar:
            </p>
            <ul style={styles.bulletList}>
              <li>Fotografías claras y detalladas del daño.</li>
              <li>Video del desempaque (unboxing) del producto y su empaque de envío.</li>
            </ul>
            <p style={{ ...styles.paragraph, fontSize: '0.85rem', color: '#78909C' }}>
              Sin la evidencia suficiente dentro del plazo estipulado, no será posible proceder con la aclaración. La resolución consistirá en la reposición o reembolso del producto, tras evaluar la evidencia.
            </p>
          </section>

          {/* 7. Alergias */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.badge}>7</span>
              <h2 style={styles.sectionTitle}>Alergias e ingredientes</h2>
            </div>
            <p style={styles.paragraph}>
              Los productos cosméticos pueden contener ingredientes que generen reacciones o sensibilidad. Recomendamos revisar cuidadosamente la lista de ingredientes de cada producto antes de su aplicación. Luna Teia Cosméticos no se hace responsable por sensibilidades individuales.
            </p>
            <p style={{ ...styles.paragraph, fontWeight: '600' }}>
              Ante cualquier molestia o reacción adversa, suspenda inmediatamente su uso y consulte a su médico.
            </p>
          </section>
        </div>

        <Link href="/" style={styles.footerLink}>
          ← Volver a la Tienda Principal
        </Link>
      </main>
    </div>
  );
}
