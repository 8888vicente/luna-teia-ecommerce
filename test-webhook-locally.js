const { createClient } = require('@supabase/supabase-js');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const fs = require('fs');

// 1. Cargar variables de entorno
try {
  const env = fs.readFileSync('.env.local', 'utf8');
  env.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
} catch (err) {
  console.warn('Could not read .env.local:', err.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const resendKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !serviceKey || !mpAccessToken) {
  console.error('❌ Faltan variables de entorno necesarias en .env.local (Supabase URL, Service Key o Mercado Pago Token).');
  process.exit(1);
}

// Obtener ID de pago desde la línea de comandos
const paymentId = process.argv[2];
if (!paymentId) {
  console.error('❌ Por favor especifica el ID del pago. Uso: node test-webhook-locally.js <PAYMENT_ID>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken });

(async () => {
  console.log(`🔍 Iniciando recuperación de pago: ${paymentId}...`);
  try {
    // 2. Consultar el pago en Mercado Pago
    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: paymentId });
    
    const externalReference = paymentData?.external_reference;
    const status = paymentData?.status;
    
    console.log(`🔗 Datos MP - Status: ${status}, Orden ID (ref): ${externalReference}`);
    
    if (!externalReference) {
      console.error('❌ El pago no tiene un id de orden (external_reference) asociado.');
      return;
    }

    if (status !== 'approved') {
      console.warn(`⚠️ El pago no está aprobado en Mercado Pago (Status: ${status}).`);
      return;
    }

    const paidAtStr = new Date().toISOString();

    // 3. Actualizar la orden a 'paid' en la tabla orders
    console.log(`💾 Actualizando orden ${externalReference} a 'paid' en Supabase...`);
    const { data: updatedOrders, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        mp_payment_id: paymentId,
        mp_status: status,
        paid_at: paidAtStr,
      })
      .eq('id', externalReference)
      .select();

    if (updateError) {
      console.error('❌ Error al actualizar la orden en Supabase:', updateError.message);
      return;
    }
    
    console.log('✅ Orden actualizada exitosamente en tabla "orders"!');

    // 4. Sincronizar con crm (pedidos_central)
    console.log('🔄 Sincronizando con pedidos_central y pedido_items...');
    
    // Obtener datos completos de la orden
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', externalReference)
      .single();

    if (fetchError || !order) {
      console.error('❌ Error al obtener los detalles de la orden:', fetchError?.message);
      return;
    }

    // Verificar si ya existe en pedidos_central
    const { data: existing } = await supabase
      .from('pedidos_central')
      .select('id')
      .eq('envio_id', order.id)
      .maybeSingle();

    if (existing) {
      console.log(`ℹ️ El pedido ya estaba sincronizado en pedidos_central (ID: ${existing.id}).`);
      return;
    }

    const direccionCompleta = `${order.address_street_number}, Col. ${order.address_neighborhood}, Edo. ${order.address_state}, C.P. ${order.address_postal_code}`;
    
    const { data: crmPedido, error: insertError } = await supabase
      .from('pedidos_central')
      .insert({
        cliente_nombre: order.customer_name,
        cliente_telefono: order.customer_phone,
        cliente_email: order.customer_email,
        direccion: direccionCompleta,
        ciudad: order.address_city,
        referencias: order.address_references || null,
        link_maps: null,
        metodo_pago: 'tarjeta_mercado_pago',
        notas_repartidor: null,
        estatus_pedido: 'pendiente',
        tipo_entrega: 'paqueteria_nacional',
        estatus_reparto: 'pendiente',
        estatus_empaque: 'pendiente',
        monto_pagado: order.total,
        fecha_pago: paidAtStr,
        envio_id: order.id
      })
      .select('id')
      .single();

    if (insertError || !crmPedido) {
      console.error('❌ Error al insertar en pedidos_central:', insertError?.message);
      return;
    }

    const crmPedidoId = crmPedido.id;
    console.log(`✅ Sincronizado en pedidos_central (ID: ${crmPedidoId})`);

    // Mapear e insertar items
    const itemsArray = Array.isArray(order.items) ? order.items : [];
    const itemsToInsert = itemsArray.map(item => ({
      pedido_id: crmPedidoId,
      producto_id: item.id,
      cantidad: item.quantity,
      precio_unitario: item.price,
      comision_repartidor: 0
    }));

    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabase
        .from('pedido_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('❌ Error al insertar en pedido_items:', itemsError.message);
      } else {
        console.log(`✅ Sincronizados ${itemsToInsert.length} productos en pedido_items.`);
      }
    }

    // 5. Enviar correo electrónico de confirmación de Resend
    if (resendKey && order.customer_email) {
      console.log('✉️ Enviando correo de confirmación de Resend...');
      const { Resend } = require('resend');
      const resend = new Resend(resendKey);
      
      const emailItems = itemsArray.map(item => ({
        name: item.name,
        cantidad: item.quantity,
        precio: item.price
      }));

      // Intentar obtener nombres de productos
      const productIds = itemsArray.map(i => i.id);
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);

      const itemsWithNames = emailItems.map(item => {
        const prod = productsData?.find(p => p.id === item.name);
        return {
          ...item,
          name: prod?.name || item.name
        };
      });

      const { enviarConfirmacionPedidoEmail } = require('./lib/notifications/emailService');
      const emailSent = await enviarConfirmacionPedidoEmail({
        id: crmPedidoId,
        cliente_nombre: order.customer_name,
        cliente_email: order.customer_email,
        direccion: direccionCompleta,
        ciudad: order.address_city,
        metodo_pago: 'tarjeta_mercado_pago',
      }, itemsWithNames);

      if (emailSent) {
        console.log('✉️ Correo de confirmación enviado exitosamente.');
      } else {
        console.warn('⚠️ No se pudo enviar el correo de confirmación (revisa las credenciales de Resend o verificación de dominio).');
      }
    } else {
      console.log('ℹ️ Envío de correo omitido (falta RESEND_API_KEY o el cliente no especificó correo).');
    }

    console.log('🎉 ¡Recuperación y sincronización finalizada con éxito!');

  } catch (err) {
    console.error('❌ Excepción durante la ejecución:', err.message);
  }
})();
