import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { sanitizeOklchForHtml2Canvas } from "./html2canvasSanitizer";

export type DistributionOrientation = "portrait" | "landscape";

const waitForImages = async (root: HTMLElement) => {
  await Promise.all(Array.from(root.querySelectorAll("img")).map(async (img) => {
    if (img.complete) return;
    await new Promise<void>(resolve => {
      img.addEventListener("load", () => resolve(), { once: true });
      img.addEventListener("error", () => resolve(), { once: true });
    });
  }));
};

export const generateDistributionPdf = async (
  pageElements: HTMLElement[],
  orientation: DistributionOrientation = "portrait"
): Promise<void> => {
  if (!pageElements.length) throw new Error("لا توجد صفحات للتصدير");
  if (document.fonts?.ready) await document.fonts.ready;

  const landscape = orientation === "landscape";
  const pdf = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });

  const pageWidth = landscape ? 297 : 210;
  const pageHeight = landscape ? 210 : 297;

  for (let i = 0; i < pageElements.length; i++) {
    const source = pageElements[i];
    const page = source.cloneNode(true) as HTMLElement;

    page.style.width = landscape ? "297mm" : "210mm";
    page.style.height = landscape ? "210mm" : "297mm";
    page.style.minHeight = page.style.height;
    page.style.boxSizing = "border-box";
    page.style.margin = "0";
    page.style.padding = "10mm";
    page.style.boxShadow = "none";
    page.style.borderRadius = "0";
    page.style.background = "#fffdf8";
    page.style.backdropFilter = "none";
    page.style.setProperty("-webkit-backdrop-filter", "none");
    page.style.setProperty("font-family", "Cairo, Tajawal, 'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif");
    page.style.setProperty("-webkit-print-color-adjust", "exact");
    page.style.setProperty("print-color-adjust", "exact");
    page.style.setProperty("direction", "rtl");
    page.style.setProperty("unicode-bidi", "plaintext");

    page.querySelectorAll<HTMLElement>("[class*='print:hidden']").forEach(el => {
      el.style.display = "none";
    });

    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "0";
    host.style.top = "0";
    host.style.width = page.style.width;
    host.style.height = page.style.height;
    host.style.overflow = "hidden";
    host.style.background = "#ffffff";
    host.style.zIndex = "-9999";
    host.style.pointerEvents = "none";
    host.style.opacity = "1";
    host.appendChild(page);
    document.body.appendChild(host);

    try {
      await waitForImages(page);
      // html2canvas لا يرسم الكتابة العمودية العربية المدمجة reliably؛
      // في PDF نحافظ على الدمج والألوان لكن نجعل النص أفقيًا واضحًا بدل تشويه الحروف.
      page.querySelectorAll<HTMLElement>(".distribution-merged-vertical").forEach((el) => {
        el.style.setProperty("writing-mode", "horizontal-tb", "important");
        el.style.setProperty("text-orientation", "mixed", "important");
        el.style.setProperty("transform", "none", "important");
        el.style.setProperty("min-width", "0", "important");
        el.style.setProperty("white-space", "normal", "important");
        el.style.setProperty("direction", "rtl", "important");
        el.style.setProperty("unicode-bidi", "plaintext", "important");
        el.style.setProperty("text-align", "center", "important");
        el.style.setProperty("vertical-align", "middle", "important");
      });
      page.querySelectorAll<HTMLElement>("table").forEach((table) => {
        table.style.setProperty("direction", "rtl", "important");
        table.style.setProperty("box-sizing", "border-box", "important");
        table.style.setProperty("width", "100%", "important");
        table.style.setProperty("table-layout", "fixed", "important");
      });

      await new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );

      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          sanitizeOklchForHtml2Canvas(clonedDoc);
        },
      });

      if (i > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
    } finally {
      host.remove();
    }
  }

  pdf.save("التدرج_السنوي.pdf");
};
