/**
 * lib/notifications/emailService.ts
 * ───────────────────────────────────────────────────────────
 * Servicio de notificaciones por correo electrónico utilizando Resend.
 * ───────────────────────────────────────────────────────────
 */

import { Resend } from 'resend';
import type { PedidoCentralRow, PedidoItemRow } from '../crm/types';

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('⚠️ RESEND_API_KEY no está configurada en las variables de entorno.');
    return null;
  }
  return new Resend(key);
}

const BRAND_COLOR = '#b45309'; // Luna Teia Elegant Amber/Brown Accent
const TEXT_COLOR = '#1e293b';
const BG_COLOR = '#fdfbf7'; // Cream background

type PedidoConDetalles = PedidoCentralRow & {
  pedido_items?: Array<PedidoItemRow & {
    products?: { name: string; family: string } | null;
  }>;
};

/**
 * Envía un correo electrónico de confirmación al cliente tras crearse su pedido.
 */
export async function enviarConfirmacionPedidoEmail(
  pedido: PedidoConDetalles,
  items: Array<{ name: string; cantidad: number; precio: number }>
): Promise<boolean> {
  const emailDestino = pedido.cliente_email;
  if (!emailDestino) {
    return false;
  }

  const resend = getResendClient();
  if (!resend) return false;

  const folio = `LTC-${pedido.id.slice(0, 8).toUpperCase()}`;
  const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 0; color: ${TEXT_COLOR}; font-size: 14px;">${item.name}</td>
        <td style="padding: 10px 0; text-align: center; color: ${TEXT_COLOR}; font-size: 14px;">${item.cantidad}</td>
        <td style="padding: 10px 0; text-align: right; color: ${TEXT_COLOR}; font-size: 14px;">$${item.precio.toFixed(2)}</td>
        <td style="padding: 10px 0; text-align: right; color: ${TEXT_COLOR}; font-weight: bold; font-size: 14px;">$${(item.cantidad * item.precio).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Tu pedido en Luna Teia</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: sans-serif; background-color: #f1f5f9; color: ${TEXT_COLOR};">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: ${BG_COLOR}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
          <td style="padding: 30px; text-align: center; background-color: #212121; color: white;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 0.05em; text-transform: uppercase;">Luna Teia</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8; letter-spacing: 0.1em;">COSMÉTICOS & BELLEZA</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding: 30px;">
            <h2 style="margin-top: 0; color: ${BRAND_COLOR}; font-size: 20px;">¡Gracias por tu compra, ${pedido.cliente_nombre}!</h2>
            <p style="font-size: 15px; line-height: 1.6;">Hemos recibido tu pedido y nuestro equipo en almacén ya está trabajando para prepararlo lo antes posible.</p>
            
            <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <h3 style="margin-top: 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; font-size: 16px; color: #0f172a;">Detalles del Pedido</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.5;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Folio:</strong></td>
                  <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #0f172a;">${folio}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Fecha:</strong></td>
                  <td style="padding: 4px 0; text-align: right;">${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Método de Pago:</strong></td>
                  <td style="padding: 4px 0; text-align: right; text-transform: capitalize;">${pedido.metodo_pago.replace(/_/g, ' ')}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;"><strong>Dirección de Envío:</strong></td>
                  <td style="padding: 4px 0; text-align: right; color: #475569;">${pedido.direccion} (${pedido.ciudad})</td>
                </tr>
              </table>
            </div>

            <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 10px;">Artículos</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #cbd5e1;">
                  <th align="left" style="padding-bottom: 8px; font-size: 13px; color: #64748b;">Producto</th>
                  <th align="center" style="padding-bottom: 8px; font-size: 13px; color: #64748b; width: 60px;">Cant</th>
                  <th align="right" style="padding-bottom: 8px; font-size: 13px; color: #64748b; width: 80px;">Precio</th>
                  <th align="right" style="padding-bottom: 8px; font-size: 13px; color: #64748b; width: 90px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2"></td>
                  <td style="padding: 15px 0 5px 0; text-align: right; font-weight: bold; color: #64748b;">Subtotal:</td>
                  <td style="padding: 15px 0 5px 0; text-align: right; font-weight: bold; color: #0f172a;">$${subtotalFormateado(total)}</td>
                </tr>
                <tr>
                  <td colspan="2"></td>
                  <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #64748b;">Envío:</td>
                  <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #16a34a;">Gratis</td>
                </tr>
                <tr style="border-top: 1px solid #cbd5e1;">
                  <td colspan="2"></td>
                  <td style="padding: 15px 0; text-align: right; font-size: 16px; font-weight: bold; color: #0f172a;">Total:</td>
                  <td style="padding: 15px 0; text-align: right; font-size: 18px; font-weight: bold; color: ${BRAND_COLOR};">$${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding: 20px 30px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 5px 0;">Luna Teia Cosméticos</p>
            <p style="margin: 0;">Este es un correo automático, por favor no respondas directamente.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Luna Teia <ventas@lunateia.com>',
      to: emailDestino,
      subject: `Luna Teia — Confirmación de Pedido ${folio}`,
      html: html,
    });

    if (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      return false;
    }
    console.log(`✉️ Correo de confirmación enviado exitosamente a ${emailDestino} para pedido ${pedido.id}`);
    return true;
  } catch (err) {
    console.error('❌ Excepción enviando email de confirmación:', err);
    return false;
  }
}

/**
 * Envía un correo electrónico de confirmación con la guía de rastreo cuando el almacén completa el empaque.
 */
export async function enviarPedidoEmpacadoEmail(
  pedido: PedidoCentralRow
): Promise<boolean> {
  const emailDestino = pedido.cliente_email;
  if (!emailDestino) {
    return false;
  }

  const resend = getResendClient();
  if (!resend) return false;

  const tracking = pedido.dhl_tracking_number || 'No especificado';
  const folio = `LTC-${pedido.id.slice(0, 8).toUpperCase()}`;

  // Intenta deducir la paquetería
  let paqueteria = 'paquetería';
  let trackingUrl = '#';

  const trackLower = tracking.toLowerCase().trim();
  if (trackLower.startsWith('dhl')) {
    paqueteria = 'DHL';
    trackingUrl = `https://www.dhl.com/mx-es/home/tracking/tracking-express.html?submit=1&tracking-id=${tracking}`;
  } else if (trackLower.startsWith('fedex')) {
    paqueteria = 'FedEx';
    trackingUrl = `https://www.fedex.com/apps/fedextrack/?tracknumbers=${tracking}`;
  } else if (trackLower.startsWith('estafeta')) {
    paqueteria = 'Estafeta';
    trackingUrl = `https://www.estafeta.com/Herramientas/Rastreo`;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Tu pedido ha sido enviado</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: sans-serif; background-color: #f1f5f9; color: ${TEXT_COLOR};">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: ${BG_COLOR}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
          <td style="padding: 30px; text-align: center; background-color: #212121; color: white;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 0.05em; text-transform: uppercase;">Luna Teia</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8; letter-spacing: 0.1em;">COSMÉTICOS & BELLEZA</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding: 30px;">
            <h2 style="margin-top: 0; color: #16a34a; font-size: 20px;">¡Tu pedido ha sido enviado! 📦✈️</h2>
            <p style="font-size: 15px; line-height: 1.6;">Hola <strong>${pedido.cliente_nombre}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">Nos alegra informarte que tu pedido <strong>${folio}</strong> ya ha sido empacado por nuestro equipo de bodega y entregado a la paquetería.</p>
            
            <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Número de Guía de Rastreo</p>
              <h3 style="margin: 0 0 15px 0; font-size: 26px; color: ${BRAND_COLOR}; letter-spacing: 0.05em; font-family: monospace;">${tracking}</h3>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">Paquetería: <strong>${paqueteria}</strong></p>
              
              ${trackingUrl !== '#' ? `
                <a href="${trackingUrl}" target="_blank" style="background-color: ${BRAND_COLOR}; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 14px; transition: background-color 0.2s ease;">
                  Rastrear mi paquete
                </a>
              ` : `
                <p style="font-size: 13px; color: #94a3b8; font-style: italic;">Puedes consultar el estado de tu envío en la página web oficial de la paquetería con tu número de guía.</p>
              `}
            </div>

            <p style="font-size: 15px; line-height: 1.6;">Si tienes alguna pregunta o necesitas ayuda con tu entrega, no dudes en ponerte en contacto con nosotros.</p>
            <p style="font-size: 15px; line-height: 1.6; margin-bottom: 0;">¡Que disfrutes tus productos! ✨</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding: 20px 30px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 5px 0;">Luna Teia Cosméticos</p>
            <p style="margin: 0;">Este es un correo automático, por favor no respondas directamente.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Luna Teia <ventas@lunateia.com>',
      to: emailDestino,
      subject: `Luna Teia — Pedido Enviado ${folio} (Guía: ${tracking})`,
      html: html,
    });

    if (error) {
      console.error('❌ Error enviando email de envío/guía:', error);
      return false;
    }
    console.log(`✉️ Correo de envío/guía enviado exitosamente a ${emailDestino} para pedido ${pedido.id}`);
    return true;
  } catch (err) {
    console.error('❌ Excepción enviando email de envío/guía:', err);
    return false;
  }
}

function subtotalFormateado(total: number): string {
  return (total).toFixed(2);
}
