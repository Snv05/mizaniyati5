import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// نقطة نهاية لمعالجة طلبات المساعد البيداغوجي الذكي على جانب الخادم
app.post('/api/gemini/generate', async (req, res) => {
  try {
    // التحقق من وجود مفتاح واجهة برمجة التطبيقات بأمان في بيئة الخادم
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on server' });
    }
    const { prompt, question, lesson, curriculum } = req.body;
    const finalPrompt = prompt || question;
    if (!finalPrompt) {
      return res.status(400).json({ error: 'Missing prompt in request' });
    }

    // تهيئة عميل الذكاء الاصطناعي مع ترويسة الاستخدام
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    // استخدام النموذج المعتمد والمحدث gemini-3.6-flash
    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const response = await ai.models.generateContent({
      model,
      contents: finalPrompt,
    });
    return res.json({ text: response.text || '' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Gemini API Server Error]:', message);
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
