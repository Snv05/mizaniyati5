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
  try {
    const prompt = [
      'أنت مساعد بيداغوجي خبير لأساتذة مادة علوم الطبيعة والحياة في مرحلة التعليم المتوسط بالجزائر.',
      'تعليمات الإجابة الصارمة:',
      '1. قدّم إجابات منظمة جداً ومركّزة ومفيدة، وتجنب الإطالة المفرطة أو الحشو.',
      '2. استخدم النقاط المرتبة (Bullet points) والفقرات القصيرة الواضحة.',
      '3. اعتمد على مصطلحات المنهاج الجزائري الرسمي (المركبة، المورد، الكفاءة الختامية، المشكل العلمي، مسعى التقصي، الفرضيات).',
      '4. عند اقتراح أنشطة أو تجارب مخبرية، اذكر الخطوات العملية المباشرة وبدائل الوسائل المتاحة في المخبر المدرسي.',
      '5. عند طلب وضعية انطلاق أو مشكل علمي، اعرض صياغة تربوية دقيقة وسليمة لغوياً وعلمياً قابلة للنسخ المباشر في المذكرة.',
      '',
      'سياق المنهاج الحالي:',
      buildContext(request),
      '',
      'طلب الأستاذ:',
      request.question
    ].join('\n');

    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      console.warn('[smart-ai] server returned status', res.status);
      return null;
    }

    const data = await res.json();
    return data.text?.trim() || null;
  } catch (error) {
    console.error('[smart-ai] generation failed', error);
    return null;
  }
}
