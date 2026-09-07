const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

const regex = /export const DailyLogbook =/;
if (regex.test(code)) {
    console.log("Component found");
}

