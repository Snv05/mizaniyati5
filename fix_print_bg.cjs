const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

// The class we added earlier is:
// className="min-h-screen bg-[#ffffff] grid-paper-bg text-zinc-900 ...
// but we want the background on the printed pages, not just the background of the app.

// Add grid-paper-bg to .print-page CSS
code = code.replace(
  `.print-page { direction: rtl; box-sizing: border-box; }`,
  `.print-page { direction: rtl; box-sizing: border-box; }\n        .print-page.bg-white { background-color: transparent !important; }`
);

// We need to add the grid-paper-bg to the print pages themselves, which have className="print-page bg-white ...
code = code.replace(/className="print-page bg-white/g, 'className="print-page grid-paper-bg');

// Ensure that @media print keeps the background graphics
code = code.replace(
  `@media print { @page { size: landscape; margin: 0; } }; }`,
  `@media print { @page { size: landscape; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`
);

fs.writeFileSync('src/components/DailyLogbook.tsx', code);
