import { GoogleGenAI } from '@google/genai';
import { LessonMemo } from '../types';

export interface SmartAiRequest {
  question: string;
  lesson?: LessonMemo | null;
  curriculum: LessonMemo[];
}

const compact = (value: unknown, max = 1800): string => {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return text.length > max ? text.slice(0, max) + '…' : text;
};

const buildContext = ({ lesson, curriculum }: SmartAiRequest) => {
  const level = lesson?.level;
  const sameLevel = level ? curriculum.filter(item => item.level === level) : curriculum;
  const sameMaqta = lesson?.maqta
    ? sameLevel.filter(item => item.maqta === lesson.maqta)
    : [];

  const relevantLessons = (lesson ? [lesson, ...sameMaqta.filter(x => x !== lesson)] : sameLevel)
    .slice(0, 12)
    .map(item => ({
      level: item.level,
      midan: item.midan,
      maqta: item.maqta,
      mawrid: item.mawrid,
      ta3alom: item.ta3alom,
      markaba: item.markaba,
      marifa: item.marifa,
      manhaji: item.manhaji,
      wadiya: item.wadiya,
      moshkila: item.moshkila,
      faradiyat: item.faradiyat,
      irsae: item.irsae,
      taqwim: item.taqwim,
      activities: item.anshita.map(a => ({
        sourceActivityId: a.sourceActivityId,
        title: a.title,
        asila: compact(a.asila, 900),
        ajwiba: compact(a.ajwiba, 900),
      })),
    }));

  return JSON.stringify({
    currentLesson: lesson || null,
    levelCount: sameLevel.length,
    sameMaqtaCount: sameMaqta.length,
    relevantLessons,
    instruction: 'قاعدة المنصة هي المصدر الأول. لا تغيّر أو تخترع أسماء موارد أو أنشطة عندما يطلب الأستاذ معلومة عن المنهاج. إذا كانت المعلومة غير موجودة في السياق، صرّح بذلك. الاقتراحات الجديدة يجب وسمها بوضوح على أنها اقتراحات.',
  }, null, 2);
};

export async function askSmartAi(request: SmartAiRequest): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
    const prompt = [
      'أنت مساعد اصطناعي عملي للأستاذ في منصة علوم الطبيعة والحياة للتعليم المتوسط في الجزائر.',
      'مهمتك مساعدة الأستاذ في: فهم المورد الحالي، بناء مذكرة، اقتراح وضعية ومشكل وفرضيات، إعداد نشاط أو تقويم، تنظيم الحصة، ربط الحصة بالتدرج، وتجهيز نص قابل للتصدير.',
      'اعتمد على سياق قاعدة المنصة أولاً، واذكر بوضوح ما هو من القاعدة وما هو اقتراح جديد.',
      'لا تدّع تنفيذ حفظ أو تعديل أو تصدير لم يحدث فعلياً.',
      'إذا كان السؤال عن نشاط/مورد محدد، أعط اسم السجل كما ورد في السياق ولا تستبدله باسم من عندك.',
      'أجب بالعربية وبشكل منظم وقابل للنسخ إلى المذكرة.',
      '',
      'سياق المنصة:',
      buildContext(request),
      '',
      'طلب الأستاذ:',
      request.question
    ].join('\n');

    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text?.trim() || null;
  } catch (error) {
    console.error('[smart-ai] generation failed', error);
    return null;
  }
}
