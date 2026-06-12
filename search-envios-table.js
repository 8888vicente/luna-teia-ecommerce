const fs = require('fs');
const path = require('path');

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

console.log('Searching for table name "envios" in codebase...');
walk('C:\\Users\\vicen\\.gemini\\antigravity\\scratch\\luna-teia-ecommerce', filePath => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    // We search for from('envios') or select from envios
    if (content.includes("from('envios')") || content.includes('from("envios")') || content.includes('.from(\'envios\')')) {
      console.log(`- Found in: ${filePath}`);
    }
  }
});
