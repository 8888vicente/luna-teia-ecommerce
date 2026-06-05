process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

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

if (!supabaseUrl || !supabaseKey) {
  console.error('Env vars missing. Url:', supabaseUrl, 'Key:', supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Testing connection to Supabase...');
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      console.log('Successfully fetched products!');
      console.log('Count:', data.length);
      if (data.length > 0) {
        const stores = [...new Set(data.map(p => p.store))];
        console.log('Unique stores in database:', stores);
        console.log('Stocks of products:');
        data.forEach(p => {
          console.log(`- ${p.name} (${p.store}): stock=${p.in_stock}`);
        });
      }
    }
  } catch (e) {
    console.error('Catch block error:', e);
  }
})();
