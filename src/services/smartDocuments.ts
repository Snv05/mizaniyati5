import mammoth from 'mammoth';

export interface SmartDocumentSource {
  id: string;
  name: string;
  type: 'curriculum' | 'companion' | 'memo' | 'uploaded';
  mimeType: string;
  text: string;
  addedAt: string;
}

const STORAGE_KEY = 'mizaniyati_ai_documents_v1';

export const loadSmartDocuments = (): SmartDocumentSource[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveSmartDocuments = (docs: SmartDocumentSource[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
    const page = await pdf.getPage(pageNo);
    const textContent = await page.getTextContent();
    pages.push(
      (textContent.items as Array<{ str?: string }>)
        .map(item => item.str || '')
        .join(' ')
    );
  }
  return pages.join('\n\n');
}

async function extractDocxText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

export async function extractSmartDocumentText(file: File): Promise<string> {
  const lower = file.name.toLowerCase();
  if (file.type === 'application/pdf' || lower.endsWith('.pdf')) {
    return extractPdfText(file);
  }
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lower.endsWith('.docx')
  ) {
    return extractDocxText(file);
  }
  return file.text();
}

export async function addSmartDocument(
  file: File,
  type: SmartDocumentSource['type'] = 'uploaded'
): Promise<SmartDocumentSource> {
  const text = (await extractSmartDocumentText(file)).trim();
  if (!text) throw new Error('لم يتم العثور على نص قابل للقراءة داخل الملف.');

  const source: SmartDocumentSource = {
    id: crypto.randomUUID(),
    name: file.name,
    type,
    mimeType: file.type || 'application/octet-stream',
    text: text.slice(0, 120000),
    addedAt: new Date().toISOString(),
  };

  const docs = loadSmartDocuments().filter(doc => doc.name !== source.name);
  docs.push(source);
  saveSmartDocuments(docs);
  return source;
}

export function removeSmartDocument(id: string) {
  saveSmartDocuments(loadSmartDocuments().filter(doc => doc.id !== id));
}

export function clearSmartDocuments() {
  localStorage.removeItem(STORAGE_KEY);
}

export function buildDocumentContext(docs: SmartDocumentSource[], maxChars = 30000): string {
  let used = 0;
  return docs
    .map(doc => {
      if (used >= maxChars) return '';
      const remaining = maxChars - used;
      const text = doc.text.slice(0, remaining);
      used += text.length;
      return `[مصدر محلي: ${doc.name}]\n${text}`;
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}
