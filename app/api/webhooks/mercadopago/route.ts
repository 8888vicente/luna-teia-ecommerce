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
      // Actualizar la orden a 'paid' en Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          mp_payment_id: paymentId,
          mp_status: status,
          paid_at: new Date().toISOString(),
        })
        .eq('id', externalReference);

      if (updateError) {
        console.error('❌ Error actualizando orden a paid:', updateError.message);
        return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
      }

      console.log(`✅ Orden ${externalReference} actualizada a 'paid' (pago MP: ${paymentId})`);
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
