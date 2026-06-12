const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

try {
  const env = fs.readFileSync('.env.local', 'utf8');
  env.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
} catch (err) {
  console.warn('Could not read .env.local:', err.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is missing in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false
  }
});

(async () => {
  console.log('Setting up Almacen user...');
  
  // 1. Create the user in Supabase Auth
  let userId;
  try {
    const email = 'almacen@lunateia.com';
    const password = 'Almacen123';

    // Check if user already exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log('User already exists in Auth with ID:', existingUser.id);
      userId = existingUser.id;
    } else {
      console.log('Creating user in Auth...');
      const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Encargado Almacén' }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return;
      }
      console.log('User created successfully with ID:', user.id);
      userId = user.id;
    }

    // 2. Call the database procedure sp_crm_asignar_rol to assign the Almacen role
    // Since sp_crm_asignar_rol is a procedure, we can run it via rpc or a raw query if we had pg,
    // but in Supabase-js, if it's a procedure or function we call it via supabase.rpc()
    // Wait! sp_crm_asignar_rol is a PROCEDURE, not a FUNCTION.
    // In PostgreSQL, procedures must be called using CALL, and cannot be invoked using SELECT.
    // The supabase.rpc() client calls functions using SELECT.
    // If sp_crm_asignar_rol is a procedure, calling it via rpc might fail.
    // Let's try calling it via rpc. If it fails, we can tell the user to run it in SQL editor.
    // Alternatively, we can insert directly into crm_usuarios_roles table!
    // Yes! Inserting directly into crm_usuarios_roles table is fully supported by supabase-js!
    console.log('Assigning role Almacen to user...');
    const { error: insertError } = await supabase
      .from('crm_usuarios_roles')
      .upsert({
        user_auth_id: userId,
        rol: 'Almacen',
        repartidor_id: null,
        activo: true
      }, {
        onConflict: 'user_auth_id'
      });

    if (insertError) {
      console.error('Error upserting role in table crm_usuarios_roles:', insertError);
      console.log('NOTE: Make sure you have run the migration script 06_crm_almacen.sql first!');
    } else {
      console.log('Successfully assigned role Almacen in crm_usuarios_roles table!');
      
      // Let's propagate the claims using fn_crm_propagar_claims_a_usuario if possible
      console.log('Propagating JWT claims...');
      const { error: rpcError } = await supabase.rpc('fn_crm_propagar_claims_a_usuario', {
        p_user_auth_id: userId
      });

      if (rpcError) {
        console.error('Error running fn_crm_propagar_claims_a_usuario rpc:', rpcError);
      } else {
        console.log('Successfully propagated JWT claims! Almacen user is now fully configured!');
      }
    }

  } catch (e) {
    console.error('Exception:', e);
  }
})();
