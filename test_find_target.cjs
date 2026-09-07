const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

const regex = /<div className="absolute inset-\[8mm\] double-border-green pointer-events-none" \/>\s*<div className="relative h-full p-\[11mm\] flex flex-col">/;

if (regex.test(code)) {
    console.log("Found");
} else {
    console.log("Not Found");
}

