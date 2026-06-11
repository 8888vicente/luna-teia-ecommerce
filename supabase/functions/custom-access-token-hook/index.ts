// supabase/functions/custom-access-token-hook/index.ts
//
// Custom Access Token Hook para Luna Teia.
// Se ejecuta automaticamente cada vez que Supabase genera un JWT
// (login, signup, refresh). Lee el rol activo de crm_usuarios_roles
// y lo inyecta en app_metadata del JWT.
//
// Estructura del input (ver docs Supabase):
//   { user_id, claims }
//
// Estructura del output esperado:
//   { claims: { ...claims_originales, app_metadata: { role, repartidor_id } } }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface HookInput {
  user_id: string;
  claims: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  try {
    // 1) Parsear el input que manda Supabase
    const payload: HookInput = await req.json();
    const userId = payload.user_id;
    const claims = payload.claims ?? {};

    // 2) Crear cliente con SERVICE ROLE (la Edge Function es server-side,
    //    asi que puede leer de crm_usuarios_roles sin problema de RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 3) Leer el rol activo del usuario
    const { data: rolRow, error: rolError } = await supabaseAdmin
      .from("crm_usuarios_roles")
      .select("rol, repartidor_id")
      .eq("user_auth_id", userId)
      .eq("activo", true)
      .maybeSingle();

    if (rolError) {
      console.error("Error leyendo rol:", rolError);
      // Si falla, devolvemos los claims sin modificar (no rompe el login)
      return new Response(
        JSON.stringify({ claims }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // 4) Armar app_metadata segun el rol
    let appMetadata: { role: string | null; repartidor_id: string | null };
    if (!rolRow) {
      appMetadata = { role: null, repartidor_id: null };
    } else if (rolRow.rol === "Repartidor") {
      appMetadata = { role: "Repartidor", repartidor_id: rolRow.repartidor_id };
    } else {
      // Administrador o Vendedor: sin repartidor_id
      appMetadata = { role: rolRow.rol, repartidor_id: null };
    }

    // 5) Devolver los claims con app_metadata actualizado
    const updatedClaims = {
      ...claims,
      app_metadata: {
        ...(claims.app_metadata ?? {}),
        ...appMetadata,
      },
    };

    return new Response(
      JSON.stringify({ claims: updatedClaims }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Hook error:", err);
    // En caso de error, devolvemos los claims originales (no rompe el login)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});