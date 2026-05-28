import { NextResponse } from 'next/server';
import { getProductById, decrementStock } from '../../../lib/productService';
import { supabase } from '../../../lib/supabase';

const MP_API = 'https://api.mercadopago.com/checkout/preferences';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const shippingInfo = body?.shippingInfo || {};

    if (items.length === 0) {
      return NextResponse.json({ success: false, message: 'No se recibieron productos para la compra.' }, { status: 400 });
    }

    // Validar y mapear items a formato de Mercado Pago
    const mpItems: Array<any> = [];
    for (const item of items) {
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

      mpItems.push({
        id: product.id,
        title: product.name,
        quantity: item.quantity,
        unit_price: Number(product.price),
        currency_id: 'MXN',
      });
    }

    // Descontar stock
    for (const item of items) {
      const success = await decrementStock(item.id, item.quantity);
      if (!success) {
        return NextResponse.json({ success: false, message: 'Error actualizando el inventario. Intenta de nuevo.' }, { status: 500 });
      }
    }

    // Registrar la orden en Supabase (para llevar historial)
    const totalAmount = mpItems.reduce((sum: number, it: any) => sum + it.unit_price * it.quantity, 0);

    const { error: orderError } = await supabase.from('orders').insert({
      items: mpItems.map((it: any) => ({ id: it.id, quantity: it.quantity, price: it.unit_price })),
      total: totalAmount,
      shipping_info: shippingInfo,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (orderError) {
      console.error('Error registrando orden:', orderError.message);
      // No impedimos el pago por un fallo al guardar el historial
    }

    // Crear preferencia en Mercado Pago
    const MP_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!MP_TOKEN) {
      return NextResponse.json({ success: false, message: 'MERCADO_PAGO_ACCESS_TOKEN no está configurada en el servidor.' }, { status: 500 });
    }

    const preferencePayload = {
      items: mpItems,
      back_urls: {
        success: '/',
        failure: '/',
        pending: '/',
      },
      auto_return: 'approved',
      payer: {},
    };

    const resp = await fetch(MP_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_TOKEN}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('MercadoPago create preference failed:', resp.status, text);
      return NextResponse.json({ success: false, message: 'Error creando preferencia de pago.' }, { status: 500 });
    }

    const pref = await resp.json();

    return NextResponse.json({
      success: true,
      preference_id: pref.id,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inicializando pago';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
