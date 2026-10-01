import defaultPortrait from '../assets/images/designer_portrait_1790463396414.jpg';

/**
 * الصورة الرسمية الثابتة لمصمم ومطور المنصة.
 * لا توجد آلية رفع أو تغيير أو حفظ بديلة لهذه الصورة داخل المنصة.
 */
export const FIXED_DESIGNER_PHOTO: string = defaultPortrait;
export const DESIGNER_PHOTO: string = defaultPortrait;
export const DESIGNER_NAME: string = 'الأستاذ بغداد الطيب';
export const DESIGNER_TITLE: string = 'تصميم وتطوير المنصة';

/** إرجاع الصورة الرسمية الثابتة فقط. */
export function getDesignerPhoto(): string {
  return FIXED_DESIGNER_PHOTO;
}
