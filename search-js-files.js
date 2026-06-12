const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(filepath, callback);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      callback(filepath);
    }
  });
}

console.log('Searching TS/TSX files for pedidos_central and orders references...');
walk('.', filepath => {
  const content = fs.readFileSync(filepath, 'utf8');
  if (content.includes('pedidos_central') || content.includes('from(\'orders\')')) {
    console.log(`Found in: ${filepath}`);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('pedidos_central') || line.includes('orders')) {
        console.log(`  L${idx + 1}: ${line.trim()}`);
      }
    });
  }
});
