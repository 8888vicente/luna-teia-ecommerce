import { NextResponse } from 'next/server';
import { getProductById, decrementStock } from '../../../lib/productService';
import { supabase } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const shippingInfo = body?.shippingInfo || {};

    if (items.length === 0) {
      return NextResponse.json({ success: false, message: 'No se recibieron productos para la compra.' }, { status: 400 });
    }

    // Validar cada item
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
    }

    // Descontar stock
    for (const item of items) {
      const success = await decrementStock(item.id, item.quantity);
      if (!success) {
        // Revertir cambios anteriores si es posible
        return NextResponse.json({ success: false, message: 'Error actualizando el inventario. Intenta de nuevo.' }, { status: 500 });
      }
    }

    // Registrar la orden en Supabase (para llevar historial)
    const totalAmount = items.reduce((sum: number, item: { id: string; quantity: number; price?: number }) => {
      return sum + (item.price || 0) * item.quantity;
    }, 0);

    const { error: orderError } = await supabase.from('orders').insert({
      items: items.map((item: { id: string; quantity: number; price?: number }) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      total: totalAmount,
      shipping_info: shippingInfo,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (orderError) {
      console.error('Error registrando orden:', orderError.message);
      // La orden no se registró, pero el stock ya se descontó
    }

    // NOTA: Aquí se integrará Mercado Pago real en producción
    // Por ahora redirigimos a un mock
    const mockInitPoint = 'https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=mock-12345';

    return NextResponse.json({ success: true, init_point: mockInitPoint });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inicializando pago';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
