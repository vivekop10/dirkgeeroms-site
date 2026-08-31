const fs = require('fs');
const path = require('path');

function walk(d) {
  let res = [];
  try {
    for (const f of fs.readdirSync(d)) {
      if (['.git', 'node_modules', 'raw_cache', 'old web', 'wp-content'].includes(f)) continue;
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) res.push(...walk(p));
      else if (f.endsWith('.html')) res.push(p);
    }
  } catch (e) {}
  return res;
}

let count = 0;
for (const f of walk('.')) {
  let c = fs.readFileSync(f, 'utf8');
  const orig = c;
  c = c.replace(/type="[a-zA-Z0-9]+-text\/javascript"/g, 'type="text/javascript"');
  if (c !== orig) {
    fs.writeFileSync(f, c, 'utf8');
    count++;
  }
}
console.log('Fixed Cloudflare dummy script types in', count, 'files');
