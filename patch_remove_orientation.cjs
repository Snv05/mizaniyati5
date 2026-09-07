const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

// Remove the toggle UI
const toggleRegex = /<div className="flex items-center bg-zinc-200 rounded-full p-0.5 ml-2">[\s\S]*?<\/div>/;
code = code.replace(toggleRegex, '');

// Remove the orientation state if needed, but since it's harmless I'll just leave it or remove it safely.
code = code.replace(/const \[orientation, setOrientation\] = useState<"portrait" | "landscape">\("portrait"\);\n/, '');

// Remove the CSS rules for @page that depended on orientation
// We can just rely on the default ones
code = code.replace(/@media print \{[\s\S]*?\@page \{[\s\S]*?\}[\s\S]*?\}/, '@media print { @page { size: landscape; margin: 0; } }');

fs.writeFileSync('src/components/DailyLogbook.tsx', code);
console.log('Orientation toggle removed.');
