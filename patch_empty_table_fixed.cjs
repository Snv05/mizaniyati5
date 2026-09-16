const fs = require('fs');
let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

content = content.replace(
  '<table className="w-full border-collapse text-[11px] leading-5">',
  '<table className="w-full border-collapse text-[11px] leading-5 table-fixed">'
);

fs.writeFileSync('src/components/DailyLogbook.tsx', content, 'utf8');
console.log('Added table-fixed');
