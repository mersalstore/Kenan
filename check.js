const fs = require('fs');
const buf = fs.readFileSync('src/InternalApp.tsx');
console.log('Length:', buf.length);
console.log('First 50 bytes (hex):', buf.slice(0, 50).toString('hex'));
