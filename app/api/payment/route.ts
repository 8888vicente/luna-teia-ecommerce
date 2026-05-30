import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';
import { getProductById, decrementStock } from '../../../lib/productService';
import { supabase } from '../../../lib/supabase';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

/** Costo de envío fijo para compras reales */
const SHIPPING_COST = 150;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawItems: { id: string; name: string; price: number; quantity: number }[] = Array.isArray(body?.items) ? body.items : [];
    const shippingInfo = body?.shipping_info || {};

    if (rawItems.length === 0) {
      return NextResponse.json({ success: false, message: 'No se recibieron productos para la compra.' }, { status: 400 });
    }

    // Calcular subtotal
    const subtotal = rawItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // ── REGLA DE ENVÍO ──────────────────────────────────────
    // Subtotal < $15 → envío gratis
    // Subtotal ≥ $15 → se cobra envío de $150
    const shippingCost = subtotal < 15 ? 0 : SHIPPING_COST;
    const total = subtotal + shippingCost;

    // Validar datos de envío
    const requiredShipping = ['name', 'phone', 'email', 'street', 'suburb', 'city', 'state', 'zip'];
    for (const field of requiredShipping) {
      if (!shippingInfo[field]?.trim()) {
        return NextResponse.json({ success: false, message: `Falta el campo de envío: ${field}` }, { status: 400 });
      }
    }

    // Validar stock
    for (const item of rawItems) {
      if (!item?.id || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ success: false, message: 'Los datos de la orden no son válidos.' }, { status: 400 });
      }
      const product = await getProductById(item.id);
      if (!product) {
        return NextResponse.json({ success: false, message: `Producto no encontrado: ${item.id}` }, { status: 404 });
      }
      if ((product.stock ?? 0) < item.quantity) {
        return NextResponse.json({ success: false, message: `No hay suficiente stock para ${product.name}.` }, { status: 400 });
      }
    }

    // ── 1️⃣ GUARDAR ORDEN EN SUPABASE ──────────────────────
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        items: rawItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        customer_name:         shippingInfo.name,
        customer_phone:        shippingInfo.phone,
        customer_email:        shippingInfo.email,
        address_street_number: shippingInfo.street,
        address_neighborhood:  shippingInfo.suburb,
        address_city:          shippingInfo.city,
        address_state:         shippingInfo.state,
        address_postal_code:   shippingInfo.zip,
        address_references:    shippingInfo.references || '',
        total: total,
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError || !orderData?.id) {
      console.error('Error guardando orden en Supabase:', orderError?.message || 'No se obtuvo ID');
      return NextResponse.json({ success: false, message: 'Error al guardar la orden.' }, { status: 500 });
    }

    const orderId = orderData.id;
    console.log(`✅ Orden ${orderId} guardada — subtotal=$ ${subtotal} envío=$ ${shippingCost} total=$ ${total}`);

    // ── 2️⃣ CREAR PREFERENCIA EN MERCADO PAGO ──────────────
    // Items de productos
    const mpItems = rawItems.map(item => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'MXN',
    }));

    // Agregar el costo de envío como un ítem más (solo si aplica)
    if (shippingCost > 0) {
      mpItems.push({
        id: 'shipping',
        title: 'Costo de Envío (Paquetería Nacional)',
        quantity: 1,
        unit_price: shippingCost,
        currency_id: 'MXN',
      });
    }

    const preference = new Preference(client);
    const mpResponse = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: shippingInfo.name,
          email: shippingInfo.email,
          phone: { number: shippingInfo.phone },
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tudominio.com'}/api/webhooks/mercadopago`,
        external_reference: orderId,
      },
    });

    if (!mpResponse?.init_point) {
      console.error('❌ MP falló, orden', orderId, 'queda como pending (stock intacto)');
      return NextResponse.json({ success: false, message: 'Error al crear la preferencia de pago.' }, { status: 500 });
    }

    // ── 3️⃣ DESCONTAR STOCK (solo si MP respondió) ─────────
    for (const item of rawItems) {
      const success = await decrementStock(item.id, item.quantity);
      if (!success) {
        console.error(`⚠️ Error descontando stock de ${item.id} — orden ${orderId}`);
      }
    }

    console.log(`🎉 Orden ${orderId} → init_point OK, stock descontado`);
    return NextResponse.json({ success: true, init_point: mpResponse.init_point, order_id: orderId });
  } catch (error) {
    console.error('Error en payment:', error);
    return NextResponse.json({ success: false, message: 'Error inicializando pago' }, { status: 500 });
  }
}
