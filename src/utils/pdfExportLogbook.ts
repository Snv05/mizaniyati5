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


const preparePageForExport = (source: HTMLElement, orientation: LogbookOrientation): { page: HTMLElement; cleanup: () => void } => {
  const page = source.cloneNode(true) as HTMLElement;
  page.classList.add("export-clean-page");
  page.style.boxShadow = "none";
  page.style.borderRadius = "0";
  page.style.margin = "0";
  page.style.transform = "none";
  page.style.backgroundColor = "#ffffff";
  page.style.width = orientation === "landscape" ? "297mm" : "210mm";
  page.style.height = orientation === "landscape" ? "210mm" : "297mm";
  page.style.minHeight = page.style.height;
  page.style.maxWidth = "none";
  // يحافظ PDF على ألوان الدفتر والمربعات الصغيرة كما تظهر في المعاينة.
  page.style.setProperty("-webkit-print-color-adjust", "exact");
  page.style.setProperty("print-color-adjust", "exact");

  page.querySelectorAll<HTMLElement>(".grid-paper-bg").forEach((cell) => {
    cell.style.backgroundColor = "#ffffff";
  });
  // لا نحذف شبكة المربعات الصغيرة من خلايا الدفتر أثناء التصدير.
  page.querySelectorAll<HTMLElement>(".writing-grid-cell, .logbook-grid-cell").forEach((cell) => {
    cell.style.backgroundColor = "#ffffff";
    cell.style.backgroundImage =
      "linear-gradient(to right, rgba(6, 78, 59, 0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 78, 59, 0.10) 1px, transparent 1px)";
    cell.style.backgroundSize = "8px 8px";
  });

  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-100000px";
  host.style.top = "0";
  host.style.width = page.getBoundingClientRect().width + "px";
  host.style.height = page.getBoundingClientRect().height + "px";
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
  await waitForImages(pageElements[0]);

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
    const prepared = preparePageForExport(element, orientation);
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const canvas = await html2canvas(prepared.page, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 10000,
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
