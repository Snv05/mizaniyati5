import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export type LogbookOrientation = "portrait" | "landscape";

const waitForImages = async (root: HTMLElement): Promise<void> => {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(images.map(async (img) => {
    if (img.complete) return;
    await new Promise<void>((resolve) => {
      img.addEventListener("load", () => resolve(), { once: true });
      img.addEventListener("error", () => resolve(), { once: true });
    });
  }));
};


const preparePageForExport = (source: HTMLElement): { page: HTMLElement; cleanup: () => void } => {
  const page = source.cloneNode(true) as HTMLElement;
  page.classList.add("export-clean-page");
  page.style.boxShadow = "none";
  page.style.borderRadius = "0";
  page.style.margin = "0";
  page.style.transform = "none";
  page.style.backgroundColor = "#ffffff";
  // التصدير الرسمي أبيض وأسود؛ إزالة ألوان واجهة المعاينة من PDF.
  page.style.filter = "grayscale(1)";
  page.style.setProperty("-webkit-print-color-adjust", "exact");
  page.style.setProperty("print-color-adjust", "exact");

  page.querySelectorAll<HTMLElement>(".grid-paper-bg, .writing-grid-cell, .logbook-grid-cell").forEach((cell) => {
    cell.style.backgroundImage = "none";
    cell.style.backgroundColor = "#ffffff";
  });

  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-100000px";
  host.style.top = "0";
  host.style.width = source.getBoundingClientRect().width + "px";
  host.style.height = source.getBoundingClientRect().height + "px";
  host.style.overflow = "hidden";
  host.style.background = "#ffffff";
  host.style.zIndex = "-1";
  host.setAttribute("aria-hidden", "true");
  host.appendChild(page);
  document.body.appendChild(host);

  return {
    page,
    cleanup: () => host.remove(),
  };
};

export const generatePreviewMatchPdf = async (
  pageElements: HTMLElement[],
  orientation: LogbookOrientation = "portrait"
): Promise<void> => {
  if (!pageElements.length) throw new Error("لا توجد صفحات للمعاينة");
  if (document.fonts?.ready) await document.fonts.ready;

  const pdf = new jsPDF({
    orientation: orientation === "landscape" ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });

  const pageWidth = orientation === "landscape" ? 297 : 210;
  const pageHeight = orientation === "landscape" ? 210 : 297;

  for (let index = 0; index < pageElements.length; index += 1) {
    const element = pageElements[index];
    const prepared = preparePageForExport(element);
    try {
      await waitForImages(prepared.page);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );

      const canvas = await html2canvas(prepared.page, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        scrollX: 0,
        scrollY: 0,
        width: prepared.page.scrollWidth,
        height: prepared.page.scrollHeight,
        windowWidth: Math.max(document.documentElement.clientWidth, prepared.page.scrollWidth),
        windowHeight: Math.max(document.documentElement.clientHeight, prepared.page.scrollHeight),
      });

      if (index > 0) pdf.addPage();

    const imageData = canvas.toDataURL("image/png");

    // كل عنصر تصدير هو صفحة A4 فعلية؛ نملأ صفحة PDF كاملة حتى لا تظهر
    // هوامش إضافية أو يتم تصغير الصفحة بسبب فرق بسيط في أبعاد الـcanvas.
      pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST"
      );
    } finally {
      prepared.cleanup();
    }
  }

  pdf.save(`الدفتر-اليومي-${orientation === "landscape" ? "أفقي" : "عمودي"}.pdf`);
};
