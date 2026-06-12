import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Mercado Pago envía el webhook con { type, data: { id } }
    // type puede ser 'payment', 'plan', 'subscription', etc.
    const paymentId = body?.data?.id;
    const type = body?.type;

    if (!paymentId || type !== 'payment') {
      // Ignorar webhooks que no sean de pagos
      return NextResponse.json({ success: true, message: 'Ignored' });
    }

    console.log(`📬 Webhook MP recibido — payment_id: ${paymentId}`);

    // Consultar el estado real del pago en Mercado Pago
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    const externalReference = paymentData?.external_reference;
    const status = paymentData?.status; // 'approved', 'pending', 'rejected', etc.

    if (!externalReference) {
      console.warn('⚠️ Webhook MP sin external_reference — no se puede asociar a orden');
      return NextResponse.json({ success: false, message: 'No external_reference' });
    }

    console.log(`🔗 Pago ${paymentId} → orden ${externalReference}, status MP: ${status}`);

    if (status === 'approved') {
      const paidAtStr = new Date().toISOString();
      // 1) Actualizar la orden a 'paid' en Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          mp_payment_id: paymentId,
          mp_status: status,
          paid_at: paidAtStr,
        })
        .eq('id', externalReference);

      if (updateError) {
        console.error('❌ Error actualizando orden a paid:', updateError.message);
        return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
      }

      console.log(`✅ Orden ${externalReference} actualizada a 'paid' (pago MP: ${paymentId})`);

      // 2) Sincronizar a pedidos_central y pedido_items para Almacén/CRM
      try {
        // Consultar la orden de e-commerce completa
        const { data: order, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', externalReference)
          .single();

        if (fetchError || !order) {
          console.error(`❌ Error al obtener la orden ${externalReference} para sincronizar:`, fetchError?.message);
        } else {
          // Verificar si ya existe en pedidos_central
          const { data: existing } = await supabase
            .from('pedidos_central')
            .select('id')
            .eq('envio_id', order.id)
            .maybeSingle();

          if (existing) {
            console.log(`ℹ️ La orden ${order.id} ya estaba sincronizada en pedidos_central (ID: ${existing.id}).`);
          } else {
            // Formatear dirección completa
            const direccionCompleta = `${order.address_street_number}, Col. ${order.address_neighborhood}, Edo. ${order.address_state}, C.P. ${order.address_postal_code}`;
            
            // Insertar en pedidos_central
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
              console.error(`❌ Error al insertar en pedidos_central:`, insertError?.message);
            } else {
              const crmPedidoId = crmPedido.id;
              console.log(`✅ Sincronizado en pedidos_central con ID: ${crmPedidoId}`);

              // Mapear items de la orden de e-commerce
              const itemsArray = Array.isArray(order.items) ? order.items : [];
              const itemsToInsert = itemsArray.map((item: any) => ({
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
                  console.error(`❌ Error al insertar pedido_items en la sincronización:`, itemsError.message);
                } else {
                  console.log(`✅ Sincronizados ${itemsToInsert.length} productos en pedido_items.`);
                }
              }

              // 3) Enviar correo electrónico de confirmación usando Resend
              const emailItems = itemsArray.map((item: any) => ({
                name: item.name,
                cantidad: item.quantity,
                precio: item.price
              }));

              // Llamada no bloqueante para no retrasar la respuesta a Mercado Pago
              import('../../../../lib/notifications/emailService').then(({ enviarConfirmacionPedidoEmail }) => {
                enviarConfirmacionPedidoEmail({
                  id: crmPedidoId,
                  cliente_nombre: order.customer_name,
                  cliente_email: order.customer_email,
                  direccion: direccionCompleta,
                  ciudad: order.address_city,
                  metodo_pago: 'tarjeta_mercado_pago',
                } as any, emailItems).catch(err => {
                  console.error('❌ Error en el envío de correo de confirmación de fondo:', err);
                });
              });
            }
          }
        }
      } catch (syncErr) {
        console.error('❌ Excepción durante la sincronización del webhook:', syncErr);
      }

    } else if (status === 'rejected' || status === 'cancelled' || status === 'refunded') {
      // Si el pago fue rechazado, cancelado o reembolsado, marcar la orden
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: status, // 'rejected', 'cancelled' o 'refunded'
          mp_payment_id: paymentId,
          mp_status: status,
        })
        .eq('id', externalReference);

      if (updateError) {
        console.error('❌ Error actualizando orden:', updateError.message);
      } else {
        console.log(`ℹ️ Orden ${externalReference} → ${status}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en webhook MP:', error);
    return NextResponse.json({ success: false, message: 'Error processing webhook' }, { status: 500 });
  }
}
