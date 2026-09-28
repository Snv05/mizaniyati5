/**
 * تطهير مستند الـ HTML المنسوخ لـ html2canvas لتفادي خطأ:
 * "Attempting to parse an unsupported color function 'oklch'"
 * الناتج عن دوال الألوان الحديثة في Tailwind CSS v4
 */
export const sanitizeOklchForHtml2Canvas = (clonedDoc: Document): void => {
  try {
    // 1. استبدال دوال oklch في كافة وسوم <style> داخل المستند المنسوخ
    const styleTags = clonedDoc.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
        // استبدال أي تعبير oklch(...) بلون سداسي عشري أو RGB آمن
        styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]+\)/gi, '#0f766e');
      }
    });

    // 2. فحص الأنماط المضمنة في عناصر الصفحة (inline styles)
    const elementsWithInlineStyles = clonedDoc.querySelectorAll<HTMLElement>('[style*="oklch"]');
    elementsWithInlineStyles.forEach((el) => {
      const styleAttr = el.getAttribute('style') || '';
      if (styleAttr.includes('oklch')) {
        el.setAttribute('style', styleAttr.replace(/oklch\([^)]+\)/gi, '#0f766e'));
      }
    });

    // 3. تأمين المتغيرات اللونية في :root و body إذا كانت موجودة
    const rootEl = clonedDoc.documentElement;
    if (rootEl) {
      rootEl.style.setProperty('--color-emerald-500', '#10b981');
      rootEl.style.setProperty('--color-emerald-600', '#059669');
      rootEl.style.setProperty('--color-emerald-700', '#047857');
    }
  } catch (err) {
    console.warn('html2canvas oklch sanitize warning:', err);
  }
};
