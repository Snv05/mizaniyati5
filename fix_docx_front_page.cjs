const fs = require('fs');
let content = fs.readFileSync('src/utils/docxExportLogbook.ts', 'utf8');

// We will recreate the frontPageChildren in docxExportLogbook.ts
// to match the exact same minimalist tables with NO thick black borders on the front page.

const newDocxPart = `
  // Front Page Content
  const frontPageChildren: any[] = [
    // Same red/green small header
    new Table({
      visuallyRightToLeft: true,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      rows: [
        new TableRow({
          children: [
            createCell(\`الجمهورية الجزائرية الديمقراطية الشعبية\\nوزارة التربية الوطنية\`, true, undefined, 1, 1, 18, AlignmentType.RIGHT),
            createCell(\`الدفتر اليومي - الأستاذ(ة): \${config.teacherName}\`, true, undefined, 1, 1, 28, AlignmentType.CENTER),
            createCell(\`الموسم: \${config.schoolYear}\\nالمتوسطة: \${config.schoolName}\`, true, undefined, 1, 1, 18, AlignmentType.LEFT),
          ]
        })
      ]
    }),
    new Paragraph({ text: "", spacing: { after: 600 } }),
    createParagraph("الدفتر اليومي", true, "006233", 40),
    new Paragraph({ text: "", spacing: { after: 400 } }),
    
    // Info Block (Simple border)
    new Table({
      visuallyRightToLeft: true,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
        left: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
        right: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "EEEEEE" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      rows: [
        new TableRow({ children: [ createCell("الأستاذ(ة):", true, undefined, 1, 1, 20, AlignmentType.RIGHT), createCell(config.teacherName || '—', true, undefined, 1, 1, 20, AlignmentType.RIGHT) ] }),
        new TableRow({ children: [ createCell("المادة:", true, undefined, 1, 1, 20, AlignmentType.RIGHT), createCell("علوم الطبيعة والحياة", true, undefined, 1, 1, 20, AlignmentType.RIGHT) ] }),
        new TableRow({ children: [ createCell("المتوسطة:", true, undefined, 1, 1, 20, AlignmentType.RIGHT), createCell(config.schoolName || '—', true, undefined, 1, 1, 20, AlignmentType.RIGHT) ] }),
        new TableRow({ children: [ createCell("السنة الدراسية:", true, undefined, 1, 1, 20, AlignmentType.RIGHT), createCell(config.schoolYear || '2025 - 2026', true, undefined, 1, 1, 20, AlignmentType.RIGHT) ] }),
        new TableRow({ children: [ createCell("المستويات المسندة:", true, undefined, 1, 1, 20, AlignmentType.RIGHT), createCell(assignedLevels.join(' ، '), true, undefined, 1, 1, 20, AlignmentType.RIGHT) ] }),
      ]
    }),
    
    new Paragraph({ text: "", spacing: { after: 600 } }),
    createParagraph("جدول استعمال الزمن", true, "006233", 24, AlignmentType.RIGHT),
    new Paragraph({ text: "", spacing: { after: 100 } }),
  ];

  // Timetable
  if (gridRows.length > 0) {
    const timetableRows: TableRow[] = [];
    timetableRows.push(new TableRow({
      children: [
        createCell("اليوم \\ التوقيت", true, "F0FDF4", 1, 1, 16),
        ...gridRows.map((r: any) => createCell(r.time, true, "F9FAF6", 1, 1, 14))
      ]
    }));
    
    WEEK_DAYS.forEach((day, index) => {
      const bgColor = index % 2 === 0 ? "FFFFFF" : "F9FAF6";
      timetableRows.push(new TableRow({
        children: [
          createCell(day, true, bgColor, 1, 1, 16),
          ...gridRows.map((r: any) => createCell(r.cells[day] || '', true, bgColor, 1, 1, 14))
        ]
      }));
    });

    frontPageChildren.push(
      new Table({
        visuallyRightToLeft: true,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
          left: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
          right: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
          insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
        },
        rows: timetableRows
      })
    );
  }

  // Holidays
  if (holidays.length > 0) {
    frontPageChildren.push(new Paragraph({ text: "", spacing: { after: 600 } }));
    frontPageChildren.push(createParagraph("جدول العطل", true, "991B1B", 24, AlignmentType.RIGHT));
    frontPageChildren.push(new Paragraph({ text: "", spacing: { after: 100 } }));
    
    const holidayRows: TableRow[] = [];
    holidayRows.push(new TableRow({
      children: [
        createCell("العطلة", true, "FEF2F2", 1, 1, 18),
        createCell("من", true, "F9FAF6", 1, 1, 18),
        createCell("إلى", true, "F9FAF6", 1, 1, 18),
      ]
    }));
    holidays.forEach((h: any, index) => {
      const bgColor = index % 2 === 0 ? "FFFFFF" : "F9FAF6";
      holidayRows.push(new TableRow({
        children: [
          createCell(h.label, true, bgColor, 1, 1, 16),
          createCell(h.startDate || h.start || '', false, bgColor, 1, 1, 16),
          createCell(h.endDate || h.end || '', false, bgColor, 1, 1, 16),
        ]
      }));
    });
    
    frontPageChildren.push(
      new Table({
        visuallyRightToLeft: true,
        width: { size: 80, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.RIGHT,
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
          left: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
          right: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
          insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
        },
        rows: holidayRows
      })
    );
  }
`;

const replaceRegex = /\/\/ Front Page Content[\s\S]*?\/\/ Holidays[\s\S]*?holidayRows\n      \}\)\n    \);\n  \}/;

content = content.replace(replaceRegex, newDocxPart);
fs.writeFileSync('src/utils/docxExportLogbook.ts', content, 'utf8');
console.log('Fixed Docx FrontPage');
