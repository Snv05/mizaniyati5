const fs = require('fs');
let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

content = content.replace(/if \(assignedLevels.length === 0\) \{/, `if (assignedLevels.length === 0 || gridRows.every(r => Object.values(r.cells).every(c => !c.trim()))) {`);

fs.writeFileSync('src/components/DailyLogbook.tsx', content, 'utf8');
console.log('Fixed generation check');
