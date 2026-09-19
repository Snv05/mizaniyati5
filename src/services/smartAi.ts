import { GoogleGenAI } from '@google/genai';
import { LessonMemo } from '../types';

export interface SmartAiRequest {
  question: string;
  lesson?: LessonMemo | null;
  curriculum: LessonMemo[];
}

const buildContext = ({ lesson, curriculum }: SmartAiRequest) => {
  const level = lesson?.level;
  const sameLevel = level ? curriculum.filter(item => item.level === level) : curriculum;
  const sameMaqta = lesson?.maqta
    ? sameLevel.filter(item => item.maqta === lesson.maqta)
    : [];
  return JSON.stringify({
    currentLesson: lesson || null,
    levelCount: sameLevel.length,
    sameMaqtaCount: sameMaqta.length,
    instruction: 'اعتمد على بيانات قاعدة المنصة المرسلة في السياق. لا تخترع عنوانا أو نشاطا غير موجود عندما يكون السؤال عن المنهاج أو قاعدة البيانات.'
  }, null, 2);
};

export async function askSmartAi(request: SmartAiRequest): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = [
    'أنت المساعد البيداغوجي الذكي لمنصة تعليم علوم الطبيعة والحياة للتعليم المتوسط في الجزائر.',
    'أجب بالعربية وبشكل عملي ومنظم.',
    'فرّق بوضوح بين ما هو موجود في قاعدة المنصة وما هو اقتراح.',
    'إذا لم توجد المعلومة في السياق، قل إنها غير موجودة ولا تخترعها.',
    'عند طلب تعديل أو إنشاء بيانات، اقترح التعديل فقط ولا تدّعي أنك حفظته.',
    '',
    'سياق قاعدة البيانات:',
    buildContext(request),
    '',
    'سؤال الأستاذ:',
    request.question
  ].join('\n');

  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text?.trim() || null;
}
