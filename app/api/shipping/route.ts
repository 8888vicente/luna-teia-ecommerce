import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Aquí es donde conectaremos con la API real de SkydropX en la Fase 2
    // Ejemplo de payload esperado: { zipCode: '83000', weight: 1.5 }
    
    // Simulación:
    const mockRate = 150; // Tarifa plana simulada

    return NextResponse.json({ success: true, rate: mockRate, message: 'Tarifa calculada exitosamente' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error calculando envío' }, { status: 500 });
  }
}
