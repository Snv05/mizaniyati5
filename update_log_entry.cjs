const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

code = code.replace(
  "  resourceIndex?: number;\n}",
  "  resourceIndex?: number;\n  attendance?: string;\n  wasail?: string;\n}"
);

fs.writeFileSync('src/components/DailyLogbook.tsx', code);
