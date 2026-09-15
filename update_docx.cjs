const fs = require('fs');
let content = fs.readFileSync('src/utils/docxExportLogbook.ts', 'utf8');

// I need to import TimetableGridRow and HolidayEntry.
// Let's see what types are available in DailyLogbook.tsx.
