import { NextResponse } from 'next/server';
import { getProductById, decrementStock } from '../../../lib/productService';

import { supabase } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawItems: { id: string; name: string; price: number; quantity: number }[] = Array.isArray(body?.items) ? body.items : [];
    const shippingInfo = body?.shipping_info || {};
    const total = Number(body?.total) || 0;

    if (rawItems.length === 0) {
      return NextResponse.json({ success: false, message: 'No se recibieron productos para la compra.' }, { status: 400 });
    }

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

    // Guardar la orden en Supabase ANTES de descontar stock
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        items: rawItems.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
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
      });

    if (orderError) {
      console.error('Error guardando orden:', orderError.message);
      return NextResponse.json({ success: false, message: 'Error al guardar la orden. Intenta de nuevo.' }, { status: 500 });
    }

    // Descontar stock
    for (const item of rawItems) {
      const success = await decrementStock(item.id, item.quantity);
      if (!success) {
        console.error(`Error descontando stock de ${item.id}`);
      }
    }

    const mockInitPoint = 'https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=mock-12345';

    return NextResponse.json({ success: true, init_point: mockInitPoint });
  } catch (error) {
    console.error('Error en payment:', error);
    return NextResponse.json({ success: false, message: 'Error inicializando pago' }, { status: 500 });
  }
}

