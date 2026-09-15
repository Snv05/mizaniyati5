const fs = require('fs');
let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

content = content.replace(/const \[schoolYear, setSchoolYear\] = useState<string>\(config\.schoolYear \|\| '2025 - 2026'\);\n/, '');
content = content.replace(/if \(parsed\.schoolYear !== undefined\) setSchoolYear\(parsed\.schoolYear\);\n/, '');
content = content.replace(/schoolYear,\n/g, ''); // in useEffect dep array
content = content.replace(/schoolYear, showSubjectInHeader/g, 'config.schoolYear, showSubjectInHeader');

fs.writeFileSync('src/components/DailyLogbook.tsx', content, 'utf8');
console.log('Done cleaning schoolYear');
