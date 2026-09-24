import { Document, Packer, Paragraph, TextRun, AlignmentType, PageOrientation } from 'docx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const safeFileName = (name: string) =>
  name.replace(/[\\/:*?"<>|]/g, '').trim() || 'فرض-اختبار';

export async function exportExamToDocx(title: string, text: string, orientation: 'portrait' | 'landscape' = 'portrait'): Promise<void> {
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title, bold: true, size: 32, font: 'Tajawal', rightToLeft: true })],
      spacing: { after: 260 },
    }),
    ...text.split(/\n+/).map(line => new Paragraph({
      alignment: AlignmentType.RIGHT,
      bidirectional: true,
      spacing: { after: 120 },
      children: [new TextRun({ text: line || ' ', size: 22, font: 'Tajawal', rightToLeft: true })],
    })),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Tajawal', rightToLeft: true },
          paragraph: { alignment: AlignmentType.RIGHT },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: orientation === 'landscape' ? 16838 : 11906,
            height: orientation === 'landscape' ? 11906 : 16838,
            orientation: orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
          },
          margin: { top: 720, bottom: 720, right: 720, left: 720 },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFileName(title) + '.docx';
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportExamElementToPdf(element: HTMLElement, title: string, orientation: 'portrait' | 'landscape' = 'portrait'): Promise<void> {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: Math.max(document.documentElement.clientWidth, element.scrollWidth),
    windowHeight: Math.max(document.documentElement.clientHeight, element.scrollHeight),
  });

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
  });
  const pageWidth = orientation === 'landscape' ? 297 : 210;
  const pageHeight = orientation === 'landscape' ? 210 : 297;
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const imageWidth = canvas.width * ratio;
  const imageHeight = canvas.height * ratio;

  // تقسيم المحتوى الطويل إلى صفحات A4 بدلاً من تصغير الفرض كله إلى صفحة واحدة.
  const pageCanvasHeight = Math.max(1, Math.floor(canvas.width * (pageHeight / pageWidth)));
  let offset = 0;
  let pageIndex = 0;
  while (offset < canvas.height) {
    const sliceHeight = Math.min(pageCanvasHeight, canvas.height - offset);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    const ctx = pageCanvas.getContext('2d');
    if (!ctx) break;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight * (sliceHeight / pageCanvasHeight));
    offset += sliceHeight;
    pageIndex += 1;
  }

  pdf.save(safeFileName(title) + '.pdf');
}


export function printExamElement(element: HTMLElement, title: string): void {
  const printWindow = window.open('', '_blank', 'width=900,height=1200');
  if (!printWindow) return;
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(node => node.outerHTML).join('\n');
  printWindow.document.write(`<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>${title}</title>${styles}<style>
    @page { size: A4 portrait; margin: 0; }
    body { margin: 0; background: white; }
    .exam-print { width: 210mm; min-height: 297mm; box-sizing: border-box; margin: 0 auto; padding: 16mm; background: white; }
    @media print { .exam-print { box-shadow: none !important; margin: 0; } }
  </style></head><body><div class="exam-print">${element.innerHTML}</div></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
}
