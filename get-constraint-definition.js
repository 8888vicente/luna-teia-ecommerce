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
  console.log('Querying constraint details via RPC or system tables...');
  // Since we cannot run raw SQL via Postgrest directly, let's see if we can query pg_constraint.
  // Wait! Is pg_constraint exposed in Postgrest? No, only tables in public.
  // But wait! Can we check if there's any RPC that allows executing queries?
  // Let's list the functions in the database!
  // How do we find out what tables/views are exposed? We can check the OpenAPI spec of Postgrest!
  // Postgrest exposes an OpenAPI spec at the root URL: http://.../rest/v1/
  // Let's see if we can fetch it. But wait, we can also check the migrations files.
  // Wait! In "01_crm_core.sql", there was no envios table or envio_id column.
  // Let's check where the envios table is created.
  // Wait, let's search for "CREATE TABLE envios" in the whole workspace!
  // Maybe it's in a file that does not have .sql extension?
  // Let's do a text search on all files in the workspace.
  // We can search for the word "envios" in all files.
  console.log('Searching all files for "CREATE TABLE envios" or "ALTER TABLE pedidos_central"...');
  
  function walk(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
          walk(filePath, callback);
        }
      } else {
        callback(filePath);
      }
    });
  }

  const path = require('path');
  walk('C:\\Users\\vicen\\.gemini\\antigravity\\scratch\\luna-teia-ecommerce', filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.toLowerCase().includes('create table envios') || content.toLowerCase().includes('table pedidos_central')) {
      console.log(`- Found in: ${filePath}`);
    }
  });

})();
