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
    await waitForImages(element);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: 0,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: Math.max(document.documentElement.clientWidth, element.scrollWidth),
      windowHeight: Math.max(document.documentElement.clientHeight, element.scrollHeight),
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
  }

  pdf.save(`الدفتر-اليومي-مطابق-للمعاينة-${orientation === "landscape" ? "أفقي" : "عمودي"}.pdf`);
};
