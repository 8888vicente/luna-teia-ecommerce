/**
 * app/api/auth/signout/route.ts
 *
 * POST /api/auth/signout
 *
 * Cierra la sesion del usuario actual y lo redirige a /login.
 * Usado por el boton de logout del sidebar en (authed)/layout.tsx.
 *
 * Es un route handler (no server action) porque lo invocamos
 * desde un <form action> del header (que es server component)
 * con method=POST.
 */

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}