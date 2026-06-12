const fs = require('fs');
const path = require('path');

const dir = 'supabase/migrations';
fs.readdirSync(dir).forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  if (content.includes('dhl_tracking_number') || content.includes('tracking')) {
    console.log(`Found in: ${file}`);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('dhl_tracking_number') || line.includes('tracking')) {
        console.log(`  L${idx + 1}: ${line.trim()}`);
      }
    });
  }
});
