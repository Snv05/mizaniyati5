const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

code = code.replace(/background-image: linear-gradient\([^;]+;/, `background-image: linear-gradient(#cce0ff 1px, transparent 1px),
                            linear-gradient(90deg, #cce0ff 1px, transparent 1px);`);
code = code.replace(/background-size: 24px 24px;/, `background-size: 24px 24px;`);

fs.writeFileSync('src/components/DailyLogbook.tsx', code);
