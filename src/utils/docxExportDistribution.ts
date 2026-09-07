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
  PageOrientation
} from "docx";
import { MemoConfig } from "../types";
import { CurriculumSession } from "../data/officialCurriculum";

const createParagraph = (text: string, bold = false, color = "000000", size = 20, alignment: any = AlignmentType.CENTER) => {
  return new Paragraph({
    
    alignment: alignment,
    children: (text || "").split('\n').map((line, i, arr) => [
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

const createCell = (text: string, bold = false, bgColor?: string, columnSpan?: number, rowSpan?: number, size = 20, alignment: any = AlignmentType.CENTER) => {
  return new TableCell({
    columnSpan,
    rowSpan,
    shading: bgColor ? { fill: bgColor, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    children: [createParagraph(text, bold, "000000", size, alignment)]
  });
};

export const generateDistributionDocx = async (
  pages: CurriculumSession[][], 
  config: MemoConfig, 
  level: "1am" | "2am" | "3am" | "4am",
  orientation: 'portrait' | 'landscape'
): Promise<Blob> => {

  const levelLabel =
    level === '4am' ? 'السنة الرابعة متوسط'
      : level === '3am' ? 'السنة الثالثة متوسط'
      : level === '2am' ? 'السنة الثانية متوسط'
      : 'السنة الأولى متوسط';

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { rightToLeft: true, font: "Arial" },
          paragraph: {  alignment: AlignmentType.RIGHT }
        }
      }
    },
    sections: pages.map((page, index) => {
      let pageTitle = "";
      if (level === '4am') {
        pageTitle = index === 0 ? 'الإنســـــــان والصحــــــــــــــة' : index === 1 ? 'التنســـــــيق الوظيفـــي في العضويـــة' : 'انتقــــــال الصفــــــات الوراثيــــــة';
      } else if (level === '2am') {
        pageTitle = 'الإنســـــــان والمحيــــــــــــط';
      } else if (level === '1am') {
        pageTitle = 'الإنســـــــان والصحــــــــــــــة / الإنســـــــان والمحيــــــــــــط';
      }

      const rows: TableRow[] = [];

      // Header row for Midan (if applicable)
      if (level !== '3am' && pageTitle) {
        rows.push(new TableRow({
          children: [
            createCell(`الميــــــدان: ${pageTitle}`, true, "F0F0F0", 6, 1, 24)
          ]
        }));
      }

      // Column Headers
      rows.push(new TableRow({
        children: [
          new TableCell({ width: { size: 8, type: WidthType.PERCENTAGE }, shading: { fill: "F8F8F8", type: ShadingType.CLEAR, color: "auto" }, children: [createParagraph("الأشهر", true, "000000", 20)] }),
          new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, shading: { fill: "F8F8F8", type: ShadingType.CLEAR, color: "auto" }, children: [createParagraph("الأسابيع", true, "000000", 20)] }),
          new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "F8F8F8", type: ShadingType.CLEAR, color: "auto" }, children: [createParagraph("المقطع التعلمي", true, "000000", 20)] }),
          new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "F8F8F8", type: ShadingType.CLEAR, color: "auto" }, children: [createParagraph("المورد المعرفي", true, "000000", 20)] }),
          new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "F8F8F8", type: ShadingType.CLEAR, color: "auto" }, children: [createParagraph("الحصة الأولى", true, "000000", 20)] }),
          new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "F8F8F8", type: ShadingType.CLEAR, color: "auto" }, children: [createParagraph("الحصة الثانية", true, "000000", 20)] }),
        ]
      }));

      // Content Rows
      page.forEach((item) => {
        if (item.isHoliday) {
          rows.push(new TableRow({
            children: [
              createCell(item.month, true),
              createCell(item.dates, true),
              createCell(item.holidayLabel || 'عطلة', true, "E5E7EB", 4)
            ]
          }));
        } else if (item.isExam) {
          rows.push(new TableRow({
            children: [
              createCell(item.month, true),
              createCell(item.dates, true),
              createCell(item.session1 || 'اختبار / فرض', true, "FEF08A", 4)
            ]
          }));
        } else {
          rows.push(new TableRow({
            children: [
              createCell(item.month, false),
              createCell(item.dates, false),
              createCell(item.maqta || '', true),
              createCell(item.mawrid || '', true),
              createCell(item.session1 || '', false, undefined, 1, 1, 20, AlignmentType.RIGHT),
              createCell(item.session2 || '', false, undefined, 1, 1, 20, AlignmentType.RIGHT),
            ]
          }));
        }
      });

      return {
        properties: {
          page: {
            size: {
              orientation: orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
            },
            margin: { top: 720, bottom: 720, right: 720, left: 720 }
          }
        },
        children: [
          // Header info
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
                  createCell(`المستوى: ${levelLabel}`, true, undefined, 1, 1, 24, AlignmentType.RIGHT),
                  createCell(`التدرج السنوي لبناء التعلمات`, true, undefined, 1, 1, 28, AlignmentType.CENTER),
                  createCell(`الأستاذ: ${config.teacherName}`, true, undefined, 1, 1, 24, AlignmentType.LEFT),
                ]
              })
            ]
          }),
          new Paragraph({ text: "", spacing: { after: 200 } }),
          
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
          
          // Signatures table
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
                  createCell("السيد(ة) المدير(ة):", true, undefined, 1, 1, 22, AlignmentType.CENTER),
                  createCell("السيد(ة) المفتش(ة):", true, undefined, 1, 1, 22, AlignmentType.LEFT),
                ]
              })
            ]
          }),
          // Page break handled inherently by having multiple sections (one for each page)
        ]
      };
    })
  });

  return Packer.toBlob(doc);
};
