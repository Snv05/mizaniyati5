const fs = require('fs');
let code = fs.readFileSync('src/utils/docxExportLogbook.ts', 'utf8');

// I will just revert docxExportLogbook.ts entirely to what it was before today's modifications.
// Actually, earlier in this session I saved its initial state exactly as it was printed to me:

const oldContent = `import { 
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
  Header
} from "docx";
import { MemoConfig } from "../types";
import { LogEntry } from "../components/DailyLogbook";

const createParagraph = (text: string, bold = false, color = "000000", size = 20, alignment: any = AlignmentType.CENTER) => {
  return new Paragraph({
    alignment: alignment,
    children: (text || "").split('\\n').map((line, i, arr) => [
      new TextRun({
        text: line,
        bold: bold,
        color: color,
        rightToLeft: true,
        size: size,
        font: "Arial"
      }),
      ...(i < arr.length - 1 ? [new TextRun({ break: 1 })] : [])
    ]).flat()
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
    children: [createParagraph(text, bold, bgColor === "064E3B" ? "FFFFFF" : "000000", size, alignment)]
  });
};

export const generateLogbookDocx = async (
  logs: LogEntry[], 
  config: MemoConfig
): Promise<Blob> => {
  const rows: TableRow[] = [];

  // Header Row (will repeat across pages)
  rows.push(new TableRow({
    tableHeader: true, // Word repeats this on new pages
    children: [
      createCell("اليوم", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 10),
      createCell("التاريخ", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 15),
      createCell("التوقيت", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 15),
      createCell("القسم/الفوج", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 15),
      createCell("محتوى الحصة وفق المنهاج", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 35),
      createCell("ملاحظة", true, "064E3B", 1, 1, 22, AlignmentType.CENTER, 10),
    ]
  }));

  // Log Entries
  logs.forEach((log, index) => {
    const bgColor = index % 2 === 0 ? "FFFFFF" : "F9FAF6";
    rows.push(new TableRow({
      children: [
        createCell(log.dayName, true, bgColor, 1, 1, 20),
        createCell(log.dateStr, false, bgColor, 1, 1, 18),
        createCell(log.time, false, bgColor, 1, 1, 18),
        createCell(log.section, true, bgColor, 1, 1, 20),
        createCell(log.content, false, bgColor, 1, 1, 20, AlignmentType.RIGHT),
        createCell(log.note || '', false, bgColor, 1, 1, 18),
      ]
    }));
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { rightToLeft: true, font: "Arial" },
          paragraph: {  alignment: AlignmentType.RIGHT }
        }
      }
    },
    sections: [{
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
                    createCell(\`الجمهورية الجزائرية الديمقراطية الشعبية\\nوزارة التربية الوطنية\`, true, undefined, 1, 1, 18, AlignmentType.RIGHT),
                    createCell(\`الدفتر اليومي - الأستاذ(ة): \${config.teacherName}\`, true, undefined, 1, 1, 28, AlignmentType.CENTER),
                    createCell(\`الموسم: \${config.schoolYear}\\nالمتوسطة: \${config.schoolName}\`, true, undefined, 1, 1, 18, AlignmentType.LEFT),
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
    }]
  });

  return Packer.toBlob(doc);
};
`
fs.writeFileSync('src/utils/docxExportLogbook.ts', oldContent);
console.log('docxExportLogbook.ts reverted.');
