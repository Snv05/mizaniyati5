import { LessonMemo } from '../types';

export interface SmartAiAttachment {
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface SmartAiSource {
  title: string;
  uri: string;
}

export interface SmartAiRequest {
  question: string;
  lesson?: LessonMemo | null;
  curriculum: LessonMemo[];
  attachments?: SmartAiAttachment[];
  useWeb?: boolean;
  level?: string;
}

export interface SmartAiResponse {
  text: string;
  sources: SmartAiSource[];
  webSearchQueries: string[];
  usedWeb: boolean;
  usedAttachments: string[];
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
    .slice(0, 80)
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
        asila: compact(a.asila, 700),
        ajwiba: compact(a.ajwiba, 700),
      })),
    }));

  return JSON.stringify({
    currentLesson: lesson || null,
    levelCount: sameLevel.length,
    sameMaqtaCount: sameMaqta.length,
    relevantLessons,
    sourcePolicy: [
      'بيانات المنصة والمنهاج الحالي هي المصدر الأول.',
      'المذكرات والوثائق المرفقة مصادر مباشرة عند إرفاقها.',
      'الاقتراحات الجديدة يجب وسمها بوضوح على أنها اقتراحات.',
      'لا تخترع أسماء موارد أو أنشطة غير موجودة في المصدر.',
    ],
  }, null, 2);
};

export async function askSmartAi(request: SmartAiRequest): Promise<SmartAiResponse | null> {
  try {
    const prompt = [
      'أنت المساعد البيداغوجي الذكي المتخصص في علوم الطبيعة والحياة للتعليم المتوسط في الجزائر.',
      'اجعل الإجابة عملية وقابلة للاستعمال من طرف الأستاذ.',
      'اعتمد أولاً على قاعدة بيانات المنصة للميدان والمقطع والمورد وتعلم المورد والتدرج والمذكرات.',
      'إذا أرفق الأستاذ وثيقة مرافقة أو مذكرة أو PDF/Word/صورة، اقرأها واستخرج منها ما يلزم قبل الإجابة.',
      'إذا كان السؤال يحتاج معلومة حديثة أو بحثاً خارجياً، استخدم البحث على الويب واذكر المصادر.',
      'لا تقدم معلومة على أنها رسمية إذا لم يثبتها المصدر. عند الغموض اكتب: يحتاج مراجعة الأستاذ.',
      'عند إنشاء نشاط أو تجربة أو تقويم جديد، وسمه: اقتراح تربوي.',
      'يمكنك مساعدة الأستاذ في: تحضير الحصة، وضعيات الانطلاق، مسعى التقصي، التجارب، التقويم، الفروض، مذكرة التصحيح، التدرج، الدفتر اليومي، وتكييف الأنشطة.',
      '',
      'سياق المنهاج والمذكرات:',
      buildContext(request),
      '',
      'طلب الأستاذ:',
      request.question,
    ].join('\n');

    const res = await fetch('/api/gemini/smart-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: request.question,
        prompt,
        level: request.level || request.lesson?.level || '',
        currentLesson: request.lesson || null,
        curriculum: request.curriculum,
        attachments: request.attachments || [],
        useWeb: request.useWeb !== false,
      }),
    });

    if (!res.ok) {
      let message = '';
      try {
        const body = await res.json();
        message = body.error || '';
      } catch { /* ignore */ }
      throw new Error(message || `Smart Assistant HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      text: String(data.text || '').trim(),
      sources: Array.isArray(data.sources) ? data.sources : [],
      webSearchQueries: Array.isArray(data.webSearchQueries) ? data.webSearchQueries : [],
      usedWeb: Boolean(data.usedWeb),
      usedAttachments: Array.isArray(data.usedAttachments) ? data.usedAttachments : [],
    };
  } catch (error) {
    console.error('[smart-ai] generation failed', error);
    throw error;
  }
}
