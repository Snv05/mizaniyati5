const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

if (code.includes('export default function DailyLogbook')) {
    console.log("export default function DailyLogbook");
} else if (code.includes('const DailyLogbook =')) {
    console.log("const DailyLogbook =");
} else {
    console.log("Not found");
}

