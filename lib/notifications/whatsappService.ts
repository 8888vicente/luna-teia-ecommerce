/**
 * lib/notifications/whatsappService.ts
 * ───────────────────────────────────────────────────────────
 * Generador de enlaces rápidos para WhatsApp (wa.me) con plantillas.
 * ───────────────────────────────────────────────────────────
 */

/**
 * Limpia y formatea el número de teléfono para wa.me.
 * Quita espacios, guiones, paréntesis y añade el código de país de México (52) si tiene 10 dígitos.
 */
export function formatearTelefonoWhatsApp(telefono: string): string {
  const limpio = telefono.replace(/\D/g, ''); // Deja solo dígitos
  
  if (limpio.length === 10) {
    return `52${limpio}`;
  }
  return limpio;
}

type DatosConfirmacion = {
  cliente_nombre: string;
  folio: string;
  total: number;
};

type DatosGuia = {
  cliente_nombre: string;
  folio: string;
  tracking_number: string;
};

type DatosReparto = {
  cliente_nombre: string;
  direccion: string;
};

/**
 * Genera un enlace a wa.me codificado con la plantilla de texto correspondiente.
 */
export function obtenerEnlaceWhatsApp(
  telefono: string,
  tipo: 'confirmacion' | 'guia' | 'reparto',
  datos: Record<string, any>
): string {
  const telFormateado = formatearTelefonoWhatsApp(telefono);
  let mensaje = '';

  if (tipo === 'confirmacion') {
    const d = datos as DatosConfirmacion;
    mensaje = `Hola *${d.cliente_nombre}*, te confirmamos que tu pedido de *Luna Teia* con folio *${d.folio}* por un total de *$${d.total.toFixed(2)}* ha sido registrado con éxito. ¡Muchas gracias por tu confianza! ✨`;
  } 
  
  else if (tipo === 'guia') {
    const d = datos as DatosGuia;
    const tracking = d.tracking_number.trim();
    let paqueteria = 'paquetería';
    const trackLower = tracking.toLowerCase();
    
    if (trackLower.startsWith('dhl')) paqueteria = 'DHL';
    else if (trackLower.startsWith('fedex')) paqueteria = 'FedEx';
    else if (trackLower.startsWith('estafeta')) paqueteria = 'Estafeta';

    mensaje = `¡Hola *${d.cliente_nombre}*! Tu pedido *${d.folio}* de *Luna Teia* ya fue empacado y entregado a paquetería. Tu número de guía de rastreo es: *${tracking}* (${paqueteria}). Puedes consultarlo en su sitio web oficial. 📦✈️`;
  } 
  
  else if (tipo === 'reparto') {
    const d = datos as DatosReparto;
    mensaje = `Hola *${d.cliente_nombre}*, soy tu repartidor de *Luna Teia*. Voy en camino a tu domicilio en *${d.direccion}* para realizar tu entrega el día de hoy. ¡Nos vemos en unos momentos! 🛵🌸`;
  }

  return `https://wa.me/${telFormateado}?text=${encodeURIComponent(mensaje)}`;
}
