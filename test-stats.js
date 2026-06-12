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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Fetching order stats...');
  try {
    const { data: orders, error } = await supabase
      .from('pedidos_central')
      .select('id, estatus_pedido, repartidor_assigned_id, created_at');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`Total orders in database: ${orders.length}`);
    const stats = {};
    orders.forEach(o => {
      const key = `${o.estatus_pedido} | Driver: ${o.repartidor_assigned_id ? 'Assigned' : 'Unassigned'}`;
      stats[key] = (stats[key] || 0) + 1;
    });

    console.log('Stats breakdown:', JSON.stringify(stats, null, 2));

    const { data: drivers, error: driversError } = await supabase
      .from('repartidores')
      .select('id, nombre, activo');

    if (driversError) {
      console.error('Drivers Error:', driversError);
    } else {
      console.log(`Total drivers in database: ${drivers.length}`);
      console.log('Drivers:', JSON.stringify(drivers, null, 2));
    }

  } catch (e) {
    console.error('Exception:', e);
  }
})();
