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
  console.error('Env vars missing. Url:', supabaseUrl, 'Key:', serviceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

(async () => {
  console.log('Testing direct UPDATE on products table...');
  try {
    // 1) Get current stock of a test product (e.g. 'r1')
    const { data: selectData, error: selectError } = await supabase
      .from('products')
      .select('id, name, in_stock')
      .eq('id', 'r1')
      .single();

    if (selectError) {
      console.error('Error selecting product:', selectError);
      process.exit(1);
    }

    console.log('Current product state:', selectData);

    // 2) Try to update the stock
    const testStock = selectData.in_stock;
    console.log(`Attempting to set in_stock of ${selectData.name} to ${testStock}`);

    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({ in_stock: testStock })
      .eq('id', 'r1')
      .select();

    if (updateError) {
      console.error('Error during UPDATE:', updateError);
    } else {
      console.log('UPDATE successful! Return data:', updateData);
    }

  } catch (e) {
    console.error('Catch block error:', e);
  }
})();
