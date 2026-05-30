import { NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY no está configurada en las variables de entorno');
  }
  return new Resend(key);
}

export async function POST(request: Request) {
  try {
    const resend = getResend();
    const payload = await request.json();
    const message = payload?.record?.message;

    if (!message) {
      return NextResponse.json({ success: false, message: 'No message found in payload' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Luna Teia <onboarding@resend.dev>',
      to: '8888vicente@gmail.com',
      subject: 'Luna Teia Cosméticos - ¡Nuevo Pedido Pagado!',
      text: message,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in notifications webhook:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
