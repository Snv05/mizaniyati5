const fs = require('fs');

let fileContent = fs.readFileSync('src/components/AnnualDistribution.tsx', 'utf8');

// Replace localStorage initialization and all usages
fileContent = fileContent.replace(/algeria_sciences_annual_dist_v2/g, 'algeria_sciences_annual_dist_v3');

fs.writeFileSync('src/components/AnnualDistribution.tsx', fileContent);
console.log('Successfully updated localStorage key to v3');
