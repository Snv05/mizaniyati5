import type { MemoConfig } from '../types';

type PdfLibraries = {
  html2canvas: (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
  jsPDF: new (options?: Record<string, unknown>) => {
    internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
    addImage: (imageData: string, format: string, x: number, y: number, width: number, height: number, alias?: string, compression?: string) => void;
    addPage: () => void;
    save: (filename: string) => void;
  };
};

declare global {
  interface Window {
    html2canvas?: PdfLibraries['html2canvas'];
    jspdf?: { jsPDF: PdfLibraries['jsPDF'] };
  }
}

const loadScript = (src: string, id: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('تعذر تحميل مكتبة PDF')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('تعذر تحميل مكتبة PDF'));
    document.head.appendChild(script);
  });

const ensurePdfLibraries = async (): Promise<PdfLibraries> => {
  if (!window.html2canvas) {
    await loadScript(
      'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
      'edu-maker-html2canvas'
    );
  }

  if (!window.jspdf?.jsPDF) {
    await loadScript(
      'https://cdn.jsdelivr.net/npm/jspdf@3.0.3/dist/jspdf.umd.min.js',
      'edu-maker-jspdf'
    );
  }

  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error('مكتبات PDF غير متاحة');
  }

  return { html2canvas: window.html2canvas, jsPDF: window.jspdf.jsPDF };
};

const waitForImages = async (root: HTMLElement): Promise<void> => {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete) return;
      await new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      });
    })
  );
};

const buildSafeFilename = (config: MemoConfig, title: string): string => {
  const raw = `مذكرة_${config.level || 'niveau'}_${config.teacherName || ''}_${title || 'بيداغوجية'}`;
  return raw.replace(/[^a-zA-Z0-9\\u0600-\\u06FF_-]/g, '_').replace(/_+/g, '_').slice(0, 100) + '.pdf';
};

export const generateMemoPdf = async (
  config: MemoConfig,
  title = 'مذكرة بيداغوجية'
): Promise<void> => {
  const paper = document.getElementById('memo-paper');
  if (!paper) {
    throw new Error('لم يتم العثور على المذكرة للتصدير');
  }

  const { html2canvas, jsPDF } = await ensurePdfLibraries();

  const hiddenForPdf = Array.from(
    paper.querySelectorAll<HTMLElement>('.print\\:hidden, [data-pdf-hidden="true"]')
  );
  const previousVisibility = hiddenForPdf.map((el) => el.style.visibility);
  hiddenForPdf.forEach((el) => {
    el.style.visibility = 'hidden';
  });

  const previousShadow = paper.style.boxShadow;
  const previousBorderRadius = paper.style.borderRadius;
  paper.style.boxShadow = 'none';
  paper.style.borderRadius = '0';

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await waitForImages(paper);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const canvas = await html2canvas(paper, {
      scale: Math.min(2, window.devicePixelRatio || 1.5),
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: paper.scrollWidth,
    });

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 0;
    const imageWidth = pageWidth - margin * 2;
    const pagePixelHeight = Math.floor((canvas.width * pageHeight) / imageWidth);

    let sourceY = 0;
    let pageIndex = 0;

    while (sourceY < canvas.height) {
      const sliceHeight = Math.min(pagePixelHeight, canvas.height - sourceY);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;

      const ctx = slice.getContext('2d');
      if (!ctx) throw new Error('تعذر إنشاء صفحة PDF');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        slice.width,
        slice.height
      );

      const renderedHeight = (sliceHeight * imageWidth) / canvas.width;
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, imageWidth, renderedHeight, undefined, 'FAST');

      sourceY += sliceHeight;
      pageIndex += 1;
    }

    pdf.save(buildSafeFilename(config, title));
  } finally {
    hiddenForPdf.forEach((el, i) => {
      el.style.visibility = previousVisibility[i];
    });
    paper.style.boxShadow = previousShadow;
    paper.style.borderRadius = previousBorderRadius;
  }
};
