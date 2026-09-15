import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  WidthType, 
  BorderStyle, 
  VerticalAlign,
  ShadingType,
  PageOrientation,
  Header,
  PageBreak
} from "docx";
import { MemoConfig } from "../types";
import { LogEntry } from "../components/DailyLogbook";

const createParagraph = (text: string, bold = false, color = "000000", size = 20, alignment: any = AlignmentType.CENTER) => {
  return new Paragraph({
    alignment: alignment,
    children: (text || "").split('\n').map((line, i, arr) => {
      const parts = line.split(/(<u>.*?<\/u>)/g);
      const runs = parts.map(part => {
        if (part.startsWith('<u>') && part.endsWith('</u>')) {
          return new TextRun({
            text: part.slice(3, -4),
            bold: bold,
            underline: { type: "single", color: color },
            color: color,
            rightToLeft: true,
            size: size,
            font: "Arial"
          });
        }
        return new TextRun({
          text: part,
          bold: bold,
          color: color,
          rightToLeft: true,
          size: size,
          font: "Arial"
        });
      });
      return [ ...runs, ...(i < arr.length - 1 ? [new TextRun({ break: 1 })] : []) ];
    }).flat()
  });
};

const createCell = (text: string, bold = false, bgColor?: string, columnSpan?: number, rowSpan?: number, size = 20, alignment: any = AlignmentType.CENTER, widthPercent?: number) => {
  return new TableCell({
    columnSpan,
    rowSpan,
    shading: bgColor ? { fill: bgColor, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    children: [createParagraph(text, bold, bgColor === "064E3B" || bgColor === "333333" ? "FFFFFF" : "000000", size, alignment)]
  });
};

const WEEK_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', ' الخميس'];

export const generateLogbookDocx = async (
  logs: LogEntry[], 
  config: MemoConfig,
  gridRows: any[] = [],
  holidays: any[] = [],
  assignedLevels: string[] = []
): Promise<Blob> => {

  const rows: TableRow[] = [];
  rows.push(new TableRow({
    tableHeader: true,
    children: [
      createCell("اليوم", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 10),
      createCell("التاريخ", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 15),
      createCell("التوقيت", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 15),
      createCell("القسم/الفوج", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 15),
      createCell("محتوى الحصة وفق المنهاج", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 25),
      createCell("الحضور", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 5),
      createCell("الوسائل", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 5),
      createCell("ملاحظة", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 10),
    ]
  }));

  logs.forEach((log, index) => {
    const bgColor = index % 2 === 0 ? "FFFFFF" : "F9FAF6";
    rows.push(new TableRow({
      children: [
        createCell(log.dayName, true, bgColor, 1, 1, 20),
        createCell(log.dateStr, false, bgColor, 1, 1, 18),
        createCell(log.time, false, bgColor, 1, 1, 18),
        createCell(log.section, true, bgColor, 1, 1, 20),
        createCell(log.content, false, bgColor, 1, 1, 20, AlignmentType.RIGHT),
        createCell(log.attendance || '', false, bgColor, 1, 1, 18),
        createCell(log.wasail || '', false, bgColor, 1, 1, 18),
        createCell(log.note || '', false, bgColor, 1, 1, 18),
      ]
    }));
  });

  
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
            createCell(`الجمهورية الجزائرية الديمقراطية الشعبية\nوزارة التربية الوطنية`, true, undefined, 1, 1, 18, AlignmentType.RIGHT),
            createCell(`الدفتر اليومي - الأستاذ(ة): ${config.teacherName}`, true, undefined, 1, 1, 28, AlignmentType.CENTER),
            createCell(`الموسم: ${config.schoolYear}\nالمتوسطة: ${config.schoolName}`, true, undefined, 1, 1, 18, AlignmentType.LEFT),
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
        createCell("اليوم \ التوقيت", true, "F0FDF4", 1, 1, 16),
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



  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { rightToLeft: true, font: "Arial" },
          paragraph: {  alignment: AlignmentType.RIGHT }
        }
      }
    },
    sections: [
      {
        // First Section: Front Page (Portrait or Landscape, let's keep Landscape to be consistent)
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, bottom: 720, right: 720, left: 720 }
          }
        },
        children: [
          ...frontPageChildren,
          new Paragraph({
            children: [new PageBreak()]
          }),
        ]
      },
      {
        // Second Section: Main Logbook Entries
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, bottom: 720, right: 720, left: 720 }
          }
        },
        headers: {
          default: new Header({
            children: [
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
                      createCell(`الجمهورية الجزائرية الديمقراطية الشعبية\nوزارة التربية الوطنية`, true, undefined, 1, 1, 18, AlignmentType.RIGHT),
                      createCell(`الدفتر اليومي - الأستاذ(ة): ${config.teacherName}`, true, undefined, 1, 1, 28, AlignmentType.CENTER),
                      createCell(`الموسم: ${config.schoolYear}\nالمتوسطة: ${config.schoolName}`, true, undefined, 1, 1, 18, AlignmentType.LEFT),
                    ]
                  })
                ]
              }),
              new Paragraph({ text: "", spacing: { after: 200 } }),
            ]
          })
        },
        children: [
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
            },
            rows: rows
          }),
          new Paragraph({ text: "", spacing: { after: 400 } }),
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
                  createCell("إمضاء الأستاذ(ة):", true, undefined, 1, 1, 22, AlignmentType.RIGHT),
                  createCell("إمضاء المدير(ة):", true, undefined, 1, 1, 22, AlignmentType.CENTER),
                  createCell("إمضاء المفتش(ة):", true, undefined, 1, 1, 22, AlignmentType.LEFT),
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  return Packer.toBlob(doc);
};
