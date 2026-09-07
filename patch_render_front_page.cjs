const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

// Also update the word export to support these columns:
const oldWord = `      createCell("محتوى الحصة وفق المنهاج", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 35),
      createCell("ملاحظة", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 10),`;

const newWord = `      createCell("محتوى الحصة وفق المنهاج", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 25),
      createCell("الحضور", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 5),
      createCell("الوسائل", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 5),
      createCell("ملاحظة", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 10),`;

let docCode = fs.readFileSync('src/utils/docxExportLogbook.ts', 'utf8');
docCode = docCode.replace(oldWord, newWord);

const oldWordRow = `        createCell(log.section, true, bgColor, 1, 1, 20),
        createCell(log.content, false, bgColor, 1, 1, 20, AlignmentType.RIGHT),
        createCell(log.note || '', false, bgColor, 1, 1, 18),`;

const newWordRow = `        createCell(log.section, true, bgColor, 1, 1, 20),
        createCell(log.content, false, bgColor, 1, 1, 20, AlignmentType.RIGHT),
        createCell(log.attendance || '', false, bgColor, 1, 1, 18),
        createCell(log.wasail || '', false, bgColor, 1, 1, 18),
        createCell(log.note || '', false, bgColor, 1, 1, 18),`;

docCode = docCode.replace(oldWordRow, newWordRow);
fs.writeFileSync('src/utils/docxExportLogbook.ts', docCode);

// I need to add page 4 to DailyLogbook.tsx.
// We can use the existing paginatedPages logic to inject an extra page at the front, or we can just render it before the logbook pages map.
// The user asks to "move page 4 literally as it is to DailyLogbook.tsx, inside the cover/reception page section".
// Looking at the provided HTML for page 4:
// It contains "الجمهورية الجزائرية الديمقراطية الشعبية", the info block, "التوقيت الأسبوعي" table, "توزيع الأفواج" table, "العطل المدرسية 2026/2027", and stamps.

console.log("Done word update");
