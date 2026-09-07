const fs = require('fs');

let fileContent = fs.readFileSync('src/data/annualDistributionData.ts', 'utf8');

// Replace all occurrences of "الحصة 2" that are not preceded by a newline
fileContent = fileContent.replace(/(.)(الحصة 2:)/g, (match, p1, p2) => {
    if (p1 === '\n' || p1 === '\r') return match;
    return p1 + '\n' + p2;
});

fs.writeFileSync('src/data/annualDistributionData.ts', fileContent);
console.log('Fixed newlines using generic regex.');
