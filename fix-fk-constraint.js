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
  console.log('Step 1: Drop the bad foreign key constraint...');
  const { error: e1 } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE public.pedidos_central DROP CONSTRAINT IF EXISTS pedidos_central_envio_id_fkey'
  });
  if (e1) console.log('Note:', e1.message);

  console.log('Step 2: Add the correct FK to orders...');
  const { error: e2 } = await supabase.rpc('exec_sql', {
    query: `ALTER TABLE public.pedidos_central ADD CONSTRAINT pedidos_central_envio_id_fkey FOREIGN KEY (envio_id) REFERENCES public.orders(id) ON DELETE SET NULL`
  });
  if (e2) console.log('Note:', e2.message);
})();
