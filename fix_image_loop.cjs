const fs = require('fs');
let content = fs.readFileSync('src/components/LevelsHomePage.tsx', 'utf8');

const oldCode = `onError={(e) => {
                  e.currentTarget.src = "https://ui-avatars.com/api/?name=بغداد+الطيب&background=047857&color=fff&size=128&bold=true";
                }}`;

const newCode = `onError={(e) => {
                  e.currentTarget.onerror = null; // Prevent infinite loop
                  e.currentTarget.src = "https://ui-avatars.com/api/?name=بغداد+الطيب&background=047857&color=fff&size=128&bold=true";
                }}`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/components/LevelsHomePage.tsx', content, 'utf8');
console.log('Fixed potential infinite loop');
