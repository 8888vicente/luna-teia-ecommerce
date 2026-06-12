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

if (!supabaseUrl || !supabaseKey) {
  console.error('Env vars missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Testing query...');
  try {
    const { data, error } = await supabase
      .from('pedidos_central')
      .select('*, pedido_items(*, products:producto_id(name, color_hex, image_url, family))')
      .order('created_at', { ascending: false })
      .limit(150);

    if (error) {
      console.error('Error on query:', error);
    } else {
      console.log('Query successful! Count:', data.length);
      if (data.length > 0) {
        console.log('First order item:', JSON.stringify(data[0].pedido_items[0], null, 2));
      }
    }
  } catch (e) {
    console.error('Exception:', e);
  }
})();
