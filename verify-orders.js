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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('Fetching all pedidos in pedidos_central with tipo_entrega paqueteria_nacional...');
  const { data, error } = await supabase
    .from('pedidos_central')
    .select('id, cliente_nombre, ciudad, metodo_pago, estatus_empaque, estatus_pedido, monto_pagado, created_at')
    .eq('tipo_entrega', 'paqueteria_nacional')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Found ${data.length} paqueteria_nacional orders:`);
    data.forEach(p => {
      console.log(`- [${p.id}] ${p.cliente_nombre} | ${p.ciudad} | ${p.metodo_pago} | Empaque: ${p.estatus_empaque} | Pedido: ${p.estatus_pedido} | $${p.monto_pagado}`);
    });
  }

  console.log('\nAll orders status in orders table:');
  const { data: orders, error: oError } = await supabase
    .from('orders')
    .select('id, customer_name, status, total, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (oError) {
    console.error('Error orders:', oError);
  } else {
    orders.forEach(o => {
      console.log(`- [${o.id}] ${o.customer_name} | Status: ${o.status} | $${o.total}`);
    });
  }
})();
