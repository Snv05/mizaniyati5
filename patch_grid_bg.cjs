const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

const classToAdd = `        .grid-paper-bg {
          background-color: #ffffff;
          background-image: linear-gradient(#e0e7ff 1px, transparent 1px),
                            linear-gradient(90deg, #e0e7ff 1px, transparent 1px);
          background-size: 24px 24px;
        }`;

code = code.replace(
  `.preview-scroll::-webkit-scrollbar-track { background: #111827; }`,
  `.preview-scroll::-webkit-scrollbar-track { background: #111827; }\n${classToAdd}`
);

code = code.replace(
  `className="min-h-screen bg-[#f7f5ef] text-zinc-900 selection:bg-[#006233]/20"`,
  `className="min-h-screen bg-[#ffffff] grid-paper-bg text-zinc-900 selection:bg-[#006233]/20"`
);

fs.writeFileSync('src/components/DailyLogbook.tsx', code);
