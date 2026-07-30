const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const m = h.match(/<meta\s+name="viewport"\s+content="width=device-width, initial-scale=1\.0, maximum-scale=1\.0, user-scalable=no"\s*>/);
if(!m){ console.error('FAIL: viewport meta missing'); process.exit(1); }
const i = h.indexOf(m[0]);
const title = h.indexOf('<title>', i);
const viewportFirst = i < title;
if(!viewportFirst){ console.error('FAIL: viewport must be before <title>'); process.exit(1); }
console.log('PASS: viewport meta tag present, positioned before <title> at byte offset', i);