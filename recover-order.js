const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const fs = require('fs');

// Load env
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
const resendApiKey = process.env.RESEND_API_KEY;

const supabase = createClient(supabaseUrl, serviceKey);
const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken });

(async () => {
  const paymentId = process.argv[2];
  if (!paymentId) {
    console.error('Usage: node recover-order.js <PAYMENT_ID>');
    process.exit(1);
  }

  console.log(`\n🔍 Fetching payment ${paymentId} from Mercado Pago...`);
  const payment = new Payment(mpClient);
  const paymentData = await payment.get({ id: paymentId });

  const externalReference = paymentData?.external_reference;
  const status = paymentData?.status;

  console.log(`→ Status: ${status}, Order ID: ${externalReference}`);

  if (!externalReference || status !== 'approved') {
    console.error('Payment not approved or no external_reference. Aborting.');
    return;
  }

  // 1. Update orders table
  console.log(`\n💾 Updating orders table to 'paid'...`);
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      mp_payment_id: String(paymentId),
      mp_status: status,
      paid_at: new Date().toISOString(),
    })
    .eq('id', externalReference);

  if (updateError) {
    console.error('❌ Error updating orders:', updateError.message);
    return;
  }
  console.log('✅ Orders table updated!');

  // 2. Fetch complete order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', externalReference)
    .single();

  if (fetchError || !order) {
    console.error('❌ Error fetching order:', fetchError?.message);
    return;
  }

  // 3. Check if already in pedidos_central
  const { data: existingByName } = await supabase
    .from('pedidos_central')
    .select('id')
    .eq('cliente_nombre', order.customer_name)
    .eq('metodo_pago', 'tarjeta_mercado_pago')
    .maybeSingle();

  if (existingByName) {
    console.log(`ℹ️ Ya existe en pedidos_central (ID: ${existingByName.id}). Verificando items...`);
    // Still try to send the email
  } else {
    // 4. Insert into pedidos_central WITHOUT envio_id
    const direccionCompleta = `${order.address_street_number || ''}, Col. ${order.address_neighborhood || ''}, Edo. ${order.address_state || ''}, C.P. ${order.address_postal_code || ''}`;
    const paidAtStr = new Date().toISOString();

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
        notas_repartidor: `Pedido e-commerce - MP Payment: ${paymentId}`,
        estatus_pedido: 'pendiente',
        tipo_entrega: 'paqueteria_nacional',
        estatus_reparto: 'pendiente',
        estatus_empaque: 'pendiente',
        monto_pagado: order.total,
        fecha_pago: paidAtStr,
      })
      .select('id')
      .single();

    if (insertError || !crmPedido) {
      console.error('❌ Error inserting into pedidos_central:', insertError?.message);
      return;
    }

    const crmPedidoId = crmPedido.id;
    console.log(`✅ Synced to pedidos_central (ID: ${crmPedidoId})`);

    // 5. Insert items
    const itemsArray = Array.isArray(order.items) ? order.items : [];
    if (itemsArray.length > 0) {
      const itemsToInsert = itemsArray.map(item => ({
        pedido_id: crmPedidoId,
        producto_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.price,
        comision_repartidor: 0
      }));

      const { error: itemsError } = await supabase.from('pedido_items').insert(itemsToInsert);
      if (itemsError) {
        console.error('❌ Error inserting pedido_items:', itemsError.message);
      } else {
        console.log(`✅ ${itemsToInsert.length} items synced to pedido_items.`);
      }
    }

    // 6. Send email
    if (resendApiKey && order.customer_email) {
      console.log('\n✉️  Sending confirmation email via Resend...');
      try {
        const resend = new Resend(resendApiKey);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        
        const itemsHtml = (itemsArray.map(item => 
          `<tr><td>${item.name}</td><td>${item.quantity}</td><td>$${item.price}</td></tr>`
        )).join('');

        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: fromEmail,
          to: order.customer_email,
          subject: `¡Tu pedido Luna Teia ha sido confirmado! 💄`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #e91e8c;">¡Tu pedido está confirmado, ${order.customer_name}!</h1>
              <p>Gracias por tu compra en Luna Teia. Tu pedido ha sido recibido y está siendo procesado.</p>
              <h2>Resumen del pedido</h2>
              <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                <thead>
                  <tr style="background: #f48fb1;"><th>Producto</th><th>Cantidad</th><th>Precio</th></tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <p><strong>Total pagado: $${order.total} MXN</strong></p>
              <h2>Dirección de envío</h2>
              <p>${order.address_street_number}, Col. ${order.address_neighborhood}<br>
                 ${order.address_city}, ${order.address_state}<br>
                 C.P. ${order.address_postal_code}</p>
              <p style="color: #666;">Te enviaremos un número de guía cuando tu pedido sea despachado.</p>
              <p>¿Tienes alguna pregunta? Escríbenos por WhatsApp.</p>
              <br>
              <p><strong>Luna Teia Cosméticos</strong></p>
            </div>
          `,
        });
        
        if (emailError) {
          console.error('❌ Resend error:', emailError);
        } else {
          console.log(`✅ Email sent! ID: ${emailResult?.id}`);
        }
      } catch (err) {
        console.error('❌ Email exception:', err.message);
      }
    } else {
      console.log('ℹ️ Skipping email (no RESEND_API_KEY or no customer email).');
    }
  }

  console.log('\n🎉 Recovery complete!');
})();
