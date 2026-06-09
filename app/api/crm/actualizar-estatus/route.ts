/**
 * POST /api/crm/actualizar-estatus
 * ───────────────────────────────────────────────────────────
 * Endpoint REST para que un Repartidor (o un webhook
 * externo de confianza) cambie el estatus de un pedido.
 *
 * Headers esperados:
 *   Authorization: Bearer <access_token del JWT de Supabase>
 *
 * Body JSON:
 *   {
 *     "pedido_id":  "uuid",
 *     "estatus":    "entregado" | "cancelado" | "ausente" | "en_ruta"
 *   }
 *
 * Respuestas:
 *   200 { ok: true, data: null }
 *   400 { ok: false, error: "..." }                     // input inválido
 *   401 { ok: false, error: "UNAUTHORIZED" }            // sin token
 *   403 { ok: false, error: "FORBIDDEN: rol requerido" } // rol incorrecto
 *   500 { ok: false, error: "..." }                     // error inesperado
 *
 * Importante: la RLS del script 01 sigue aplicando.
 * Si el JWT no es de un Repartidor con ese pedido
 * asignado, Supabase rechazará el UPDATE.
 * ───────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { actualizarEstatusPedido } from '@/lib/crm/crm';
import type { PedidoEstatus } from '@/lib/crm/types';

const ESTATUS_VALIDOS: PedidoEstatus[] = [
  'en_ruta',
  'entregado',
  'ausente',
  'cancelado',
];

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  // 1) Validar sesión
  const supabase = await getSupabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonResponse({ ok: false, error: 'UNAUTHORIZED' }, 401);
  }

  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const role = (appMeta.role as string | null) ?? null;

  if (role !== 'Repartidor' && role !== 'Administrador') {
    return jsonResponse(
      { ok: false, error: 'FORBIDDEN: se requiere rol Repartidor o Administrador' },
      403
    );
  }

  // 2) Parsear y validar body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Body JSON inválido.' }, 400);
  }

  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as Record<string, unknown>).pedido_id !== 'string' ||
    typeof (body as Record<string, unknown>).estatus !== 'string'
  ) {
    return jsonResponse(
      { ok: false, error: 'Campos requeridos: pedido_id (string), estatus (string).' },
      400
    );
  }

  const { pedido_id, estatus } = body as { pedido_id: string; estatus: string };

  if (!ESTATUS_VALIDOS.includes(estatus as PedidoEstatus)) {
    return jsonResponse(
      {
        ok: false,
        error: `estatus inválido. Permitidos: ${ESTATUS_VALIDOS.join(', ')}`,
      },
      400
    );
  }

  // 3) Ejecutar (la RLS filtra si el pedido no le corresponde)
  const res = await actualizarEstatusPedido(
    supabase,
    pedido_id,
    estatus as PedidoEstatus
  );

  if (!res.ok) {
    // Mapeamos códigos comunes de Supabase a HTTP status
    const code = res.code;
    let httpStatus = 400;
    if (code === 'PGRST116' || code === '42501') httpStatus = 403; // RLS denied
    if (code === '23514') httpStatus = 409; // check_violation (stock insuficiente)
    return jsonResponse({ ok: false, error: res.error, code }, httpStatus);
  }

  return jsonResponse({ ok: true, data: null }, 200);
}
