import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { buildGeminiSystemPrompt } from './src/services/geminiPrompts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// نقطة نهاية لمعالجة طلبات المساعد البيداغوجي الذكي على جانب الخادم
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on server' });
    }
    const { prompt, question } = req.body;
    const finalPrompt = prompt || question;
    if (!finalPrompt) {
      return res.status(400).json({ error: 'Missing prompt in request' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    // استخدام النموذج المعتمد gemini-3.8-flash
    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
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

// نقطة نهاية لتوليد المذكرة البيداغوجية الرسمية وفق منهاج الجيل الثاني (JSON منظم)
app.post('/api/gemini/generate-pedagogical-note', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'مفتاح واجهة برمجة تطبيقات Gemini غير متوفر في الخادم' });
    }
    const { gradeLevel, topic } = req.body;
    if (!gradeLevel || !topic) {
      return res.status(400).json({ error: 'المستوى والموضوع مطلوبان لتوليد المذكرة' });
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
      contents: `قم بتوليد المذكرة البيداغوجية الرسمية التامة لمستوى [${gradeLevel}] في مادة علوم الطبيعة والحياة حول: "${topic}". التزم بإخراج كائن JSON فقط طبقاً للشروط والتعليمات.`,
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
