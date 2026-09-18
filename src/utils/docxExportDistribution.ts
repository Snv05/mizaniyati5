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
  Footer,
  PageNumber,
  ImageRun
} from "docx";
import { MemoConfig } from "../types";
import { GeneratedSession as CurriculumSession } from "./annualDistributionGenerator";

const base64ToUint8Array = (base64: string) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

const imageDataUrlToPng = async (dataUrl: string): Promise<Uint8Array> => {
  if (!dataUrl.startsWith("data:image/")) throw new Error("Unsupported image data");
  const image = new Image();
  image.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("تعذر تحميل صورة الختم"));
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || 512;
  canvas.height = image.naturalHeight || 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas غير متاح");
  ctx.drawImage(image, 0, 0);
  return base64ToUint8Array(canvas.toDataURL("image/png").split(",")[1]);
};

const svgToPngData = async (svg: string, width = 420, height = 420): Promise<Uint8Array> => {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("تعذر تحويل الختم إلى صورة"));
    });
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas غير متاح");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    return base64ToUint8Array(canvas.toDataURL("image/png").split(",")[1]);
  } finally { URL.revokeObjectURL(url); }
};

const buildTeacherStampSvg = (config: MemoConfig, size = 420) => {
  const esc = (v: string) => v.replace(/[<>&"]/g, "");
  const name = esc(config.teacherName || "");
  const school = esc((config.schoolName || "").slice(0, 30));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="100%" height="100%" fill="white"/>
    <circle cx="210" cy="210" r="170" fill="#eff6ff" fill-opacity=".55" stroke="#1d4ed8" stroke-width="7" stroke-dasharray="12 6"/>
    <circle cx="210" cy="210" r="132" fill="none" stroke="#1d4ed8" stroke-width="3"/>
    <text x="210" y="105" text-anchor="middle" font-family="Arial" font-size="25" font-weight="bold" fill="#1e40af">الجمهورية الجزائرية الديمقراطية الشعبية</text>
    <text x="210" y="150" text-anchor="middle" font-family="Arial" font-size="23" font-weight="bold" fill="#1e40af">وزارة التربية الوطنية</text>
    <text x="210" y="205" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold" fill="#1e40af">علوم الطبيعة والحياة</text>
    <text x="210" y="250" text-anchor="middle" font-family="Arial" font-size="30" font-weight="900" fill="#1e40af">${name}</text>
    <text x="210" y="292" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#1e40af">${school}</text>
  </svg>`;
};


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

  const teacherStampData = config.teacherStamp?.startsWith("data:image/")
    ? await imageDataUrlToPng(config.teacherStamp)
    : await svgToPngData(buildTeacherStampSvg(config));

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
      const pageItems = page;
      const uniqueFields = [...new Set(pageItems.map((item) => item.midan).filter(Boolean))];
      const uniqueSequences = [...new Set(pageItems.map((item) => item.maqta).filter(Boolean))];
      const pageTitle = uniqueFields.length === 1
        ? uniqueFields[0]
        : uniqueSequences.length === 1
          ? uniqueSequences[0]
          : '';

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
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'الصفحة ', font: 'Arial', rightToLeft: true }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Arial' })
              ]
            })]
          })
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
                  new TableCell({ children: [
                    createParagraph("إمضاء الأستاذ(ة):", true, "000000", 22, AlignmentType.RIGHT),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: "png", data: teacherStampData, transformation: { width: 90, height: 90 } })] })
                  ] }),
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
