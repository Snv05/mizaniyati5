import defaultPortrait from '../assets/images/designer_portrait_1790463396414.jpg';

const STORAGE_KEY = 'algeria_sciences_designer_photo_v1';

export function getDesignerPhoto(): string {
  try {
    const customPhoto = localStorage.getItem(STORAGE_KEY);
    if (customPhoto && customPhoto.startsWith('data:image/')) {
      return customPhoto;
    }
  } catch {
    // ignore
  }
  return defaultPortrait;
}

export function saveDesignerPhoto(dataUrl: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, dataUrl);
    window.dispatchEvent(new CustomEvent('designer-photo-updated', { detail: dataUrl }));
  } catch (err) {
    console.error('Failed to save designer photo:', err);
  }
}

export function resetDesignerPhoto(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('designer-photo-updated', { detail: defaultPortrait }));
  } catch {
    // ignore
  }
}
