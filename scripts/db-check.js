const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Error: Missing Supabase env variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function checkSchema() {
  console.log('--- Inspecting tables ---');
  
  // Query crm_usuarios_roles
  const { data: roles, error: rolesError } = await supabase
    .from('crm_usuarios_roles')
    .select('*')
    .limit(5);

  if (rolesError) {
    console.error('Error querying crm_usuarios_roles:', rolesError.message);
  } else {
    console.log('crm_usuarios_roles sample:', roles);
  }

  // Query repartidores
  const { data: repartidores, error: repError } = await supabase
    .from('repartidores')
    .select('*')
    .limit(1);

  if (repError) {
    console.error('Error querying repartidores:', repError.message);
  } else {
    console.log('repartidores sample:', repartidores);
  }
}

checkSchema();
