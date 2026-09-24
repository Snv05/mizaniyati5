import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// إضافة وسيط (Middleware) لمعالجة طلبات الذكاء الاصطناعي على مستوى الخادم لحماية المفتاح السري
function serverSideGeminiPlugin(): Plugin {
  return {
    name: 'server-side-gemini',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // اعتراض طلبات توليد الإجابات عبر واجهة برمجة التطبيقات
        if (req.url === '/api/gemini/generate' && req.method === 'POST') {
          let body = '';
          // تجميع حزم البيانات القادمة من العميل
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              // جلب مفتاح واجهة برمجة التطبيقات من متغيرات البيئة في الخادم حصراً
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server' }));
                return;
              }
              const data = JSON.parse(body || '{}');
              const prompt = data.prompt || data.question;
              if (!prompt) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing prompt' }));
                return;
              }
              // تهيئة عميل GoogleGenAI مع ترويسة القياس الموصى بها
              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });
              // اعتماد أحدث نموذج مدعوم ومستقر (gemini-3.6-flash)
              const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
              const response = await ai.models.generateContent({
                model,
                contents: prompt,
              });
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: response.text || '' }));
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Generation failed';
              console.error('[Gemini Vite Middleware Error]:', message);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: message }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverSideGeminiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
