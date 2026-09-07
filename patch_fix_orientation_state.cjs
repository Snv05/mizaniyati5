const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

code = code.replace(/  \| "landscape">\("portrait"\);\n/, '');

fs.writeFileSync('src/components/DailyLogbook.tsx', code);
