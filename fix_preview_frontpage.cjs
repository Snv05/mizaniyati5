const fs = require('fs');
let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

// The line `<span>معاينة الطباعة الرسمية - {paginatedPages.length} صفحات</span>` needs to include +1 for front page
content = content.replace(
  '<span>معاينة الطباعة الرسمية - {paginatedPages.length} صفحات</span>', 
  '<span>معاينة الطباعة الرسمية - {paginatedPages.length + 1} صفحات</span>'
);

fs.writeFileSync('src/components/DailyLogbook.tsx', content, 'utf8');
