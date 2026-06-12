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
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

(async () => {
  console.log('Logging in as admin@lunateia.com...');
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@lunateia.com',
      password: 'Admin123'
    });

    if (authError) {
      console.error('Login error:', authError);
      return;
    }

    console.log('Login successful! JWT app_metadata:', authData.user.app_metadata);

    // Query pedidos_central using the authenticated session
    const { data: pedidos, error: queryError } = await supabase
      .from('pedidos_central')
      .select('id, cliente_nombre, estatus_pedido');

    if (queryError) {
      console.error('Query error:', queryError);
    } else {
      console.log(`Successfully fetched pedidos with RLS. Count: ${pedidos.length}`);
    }

    // Query repartidores using the authenticated session
    const { data: drivers, error: driversError } = await supabase
      .from('repartidores')
      .select('id, nombre');

    if (driversError) {
      console.error('Drivers query error:', driversError);
    } else {
      console.log(`Successfully fetched drivers with RLS. Count: ${drivers.length}`);
    }

  } catch (e) {
    console.error('Exception:', e);
  }
})();
