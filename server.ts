import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, createPartFromUri } from '@google/genai';
import { Buffer } from 'node:buffer';
import { buildGeminiSystemPrompt } from './src/services/geminiPrompts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '40mb' }));

// نقطة نهاية لمعالجة طلبات المساعد البيداغوجي الذكي على جانب الخادم
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on server' });
    }
    const { prompt, question, attachments = [] } = req.body;
    const finalPrompt = prompt || question;
    if (!finalPrompt) {
      return res.status(400).json({ error: 'Missing prompt in request' });
    }

    const allowedAttachmentTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
    if (!Array.isArray(attachments) || attachments.length > 6) {
      return res.status(400).json({ error: 'Too many attachments' });
    }

    const attachmentInputs: Array<{ mimeType: string; base64: string; displayName: string }> = [];
    let attachmentSize = 0;
    for (const item of attachments) {
      if (!item || !allowedAttachmentTypes.has(item.mimeType)) {
        return res.status(400).json({ error: 'Unsupported attachment type' });
      }
      const dataUrl = String(item.dataUrl || '');
      const prefix = `data:${item.mimeType};base64,`;
      if (!dataUrl.startsWith(prefix)) {
        return res.status(400).json({ error: 'Invalid attachment data' });
      }
      attachmentSize += dataUrl.length;
      if (dataUrl.length > 20_000_000 || attachmentSize > 32_000_000) {
        return res.status(400).json({ error: 'Attachments are too large' });
      }
      attachmentInputs.push({
        mimeType: item.mimeType,
        base64: dataUrl.slice(prefix.length),
        displayName: String(item.name || `correction-source-${attachmentInputs.length + 1}`),
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    // ارفع المرفقات إلى Gemini Files API بدل إرسال Base64 في كل طلب.
    // هذا يقلل حجم طلبات التوليد ويجعل ملفات PDF الكبيرة أكثر استقراراً.
    const uploadedFiles: any[] = [];
    try {
      for (const item of attachmentInputs) {
        const file = await ai.files.upload({
          file: new Blob([Buffer.from(item.base64, 'base64')], { type: item.mimeType }),
          config: { mimeType: item.mimeType, displayName: item.displayName },
        });
        let info = file;
        for (let attempt = 0; attempt < 20 && info.state === 'PROCESSING'; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          info = await ai.files.get({ name: file.name });
        }
        if (info.state === 'FAILED') throw new Error(`فشل تجهيز المرفق: ${item.displayName}`);
        uploadedFiles.push(info);
      }

      const fileParts = uploadedFiles.map((file) => createPartFromUri(file.uri, file.mimeType));
      const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
      const response = await ai.models.generateContent({
        model,
        contents: fileParts.length
          ? [{ role: 'user', parts: [{ text: finalPrompt }, ...fileParts] }]
          : finalPrompt,
      });
      return res.json({ text: response.text || '' });
    } finally {
      await Promise.allSettled(uploadedFiles.map((file) => ai.files.delete({ name: file.name })));
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Gemini API Server Error]:', message);
    return res.status(500).json({ error: message });
  }
});

// تحليل ورقة الفرض/الاختبار قبل بناء مذكرة التصحيح
app.post('/api/gemini/analyze-correction-source', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on server' });

    const { examType, examText = '', attachments = [] } = req.body;
    if (!examType || (!String(examText).trim() && (!Array.isArray(attachments) || attachments.length === 0))) {
      return res.status(400).json({ error: 'مصدر التصحيح مطلوب' });
    }

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain']);
    if (!Array.isArray(attachments) || attachments.length > 6) {
      return res.status(400).json({ error: 'عدد المرفقات غير مسموح' });
    }

    let totalLength = 0;
    const parts: any[] = [];
    for (const item of attachments) {
      if (!item || !allowedTypes.has(item.mimeType)) return res.status(400).json({ error: 'نوع مرفق غير مسموح' });
      const dataUrl = String(item.dataUrl || '');
      const prefix = `data:${item.mimeType};base64,`;
      if (!dataUrl.startsWith(prefix) || dataUrl.length > 20_000_000) {
        return res.status(400).json({ error: 'مرفق غير صالح أو كبير جداً' });
      }
      totalLength += dataUrl.length;
      if (totalLength > 32_000_000) return res.status(400).json({ error: 'إجمالي المرفقات كبير جداً' });
      parts.push({ inlineData: { mimeType: item.mimeType, data: dataUrl.slice(prefix.length) } });
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [{
          text: [
            'حلل ورقة التقييم التالية كمصدر فقط ولا تحل الأسئلة.',
            'استخرج ما يمكن قراءته حرفياً من الورقة، مع الحفاظ على الترتيب.',
            'أعد JSON فقط بالشكل: {title, exercises:[{number, title, questions:[{number,text,points,documentRefs}]}], totalPoints, documents:[{id,description}], ambiguities:[]}.',
            'إذا لم تستطع قراءة عنصر اتركه فارغاً وأضفه إلى ambiguities. لا تخترع أي سؤال أو نقطة.',
            `نوع التقييم: ${examType}`,
            `النص المتاح: ${String(examText).slice(0, 30000)}`,
          ].join('\\n'),
        }, ...parts],
      }],
      config: { responseMimeType: 'application/json' },
    });
    return res.json({ json: response.text || '' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Correction source analysis error]:', message);
    return res.status(500).json({ error: message });
  }
});

// نقطة نهاية لتوليد المذكرة البيداغوجية الرسمية وفق منهاج الجيل الثاني (JSON منظم)
app.post('/api/gemini/generate-pedagogical-note', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'مفتاح واجهة برمجة تطبيقات Gemini غير متوفر في الخادم' });
    }
    const { gradeLevel, topic, attachments = [] } = req.body;
    if (!gradeLevel || !topic) {
      return res.status(400).json({ error: 'المستوى والموضوع مطلوبان لتوليد المذكرة' });
    }

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain']);
    if (!Array.isArray(attachments) || attachments.length > 6) {
      return res.status(400).json({ error: 'عدد المرفقات المسموح به هو 6 كحد أقصى.' });
    }

    let totalLength = 0;
    const attachmentParts: any[] = [];
    for (const item of attachments) {
      if (!item || !allowedTypes.has(item.mimeType)) {
        return res.status(400).json({ error: 'تم رفض مرفق بسبب نوع ملف غير مسموح.' });
      }
      const dataUrl = String(item.dataUrl || '');
      const prefix = `data:${item.mimeType};base64,`;
      if (!dataUrl.startsWith(prefix) || dataUrl.length > 8_500_000) {
        return res.status(400).json({ error: 'صيغة أو حجم أحد المرفقات غير صالح.' });
      }
      totalLength += dataUrl.length;
      if (totalLength > 10_000_000) {
        return res.status(400).json({ error: 'إجمالي المرفقات كبير جداً.' });
      }
      if (item.mimeType === 'text/plain') {
        return res.status(400).json({ error: 'الملفات النصية غير مدعومة بعد في التوليد المرفق.' });
      }
      attachmentParts.push({
        inlineData: {
          mimeType: item.mimeType,
          data: dataUrl.slice(prefix.length),
        },
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = buildGeminiSystemPrompt(gradeLevel, topic);
    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [
          { text: `قم بتوليد المذكرة البيداغوجية الرسمية التامة لمستوى [${gradeLevel}] في مادة علوم الطبيعة والحياة حول: "${topic}". التزم بإخراج كائن JSON فقط طبقاً للشروط والتعليمات. إذا وُجدت مصادر مرفقة، اعتبرها مصادر الأستاذ ولا تخترع بيانات مخالفة لها.` },
          ...attachmentParts,
        ],
      }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    return res.json({ json: response.text || '' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Gemini Pedagogical Note Server Error]:', message);
    return res.status(500).json({ error: message });
  }
});

// Serve static assets from dist
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
