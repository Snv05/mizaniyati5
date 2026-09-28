import { LessonMemo } from '../types';
import { PedagogicalAttachmentInput } from './geminiPedagogicalService';

export interface CorrectionMemoRequest {
  examType: 'فرض' | 'اختبار';
  examText: string;
  lesson?: LessonMemo | null;
  curriculum: LessonMemo[];
  attachments?: PedagogicalAttachmentInput[];
}

const compact = (value: unknown, max = 1200): string => {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return text.length > max ? text.slice(0, max) + '…' : text;
};

const buildCurriculumContext = ({ lesson, curriculum }: CorrectionMemoRequest) => {
  const sameLevel = lesson ? curriculum.filter(item => item.level === lesson.level) : curriculum;
  const sameMaqta = lesson?.maqta
    ? sameLevel.filter(item => item.maqta === lesson.maqta)
    : [];

  const relevant = (lesson ? [lesson, ...sameMaqta.filter(x => x !== lesson)] : sameLevel)
    .slice(0, 16)
    .map(item => ({
      level: item.level,
      midan: item.midan,
      maqta: item.maqta,
      mawrid: item.mawrid,
      ta3alom: item.ta3alom,
      markaba: item.markaba,
      kafaaKhitamiya: item.kafaaKhitamiya,
      ma3ayirTaqwim: item.ma3ayirTaqwim,
      activities: item.anshita.map(activity => ({
        sourceActivityId: activity.sourceActivityId,
        title: activity.title,
        asila: compact(activity.asila, 700),
        ajwiba: compact(activity.ajwiba, 700),
      })),
    }));

  return JSON.stringify(relevant, null, 2);
};

export async function generateCorrectionMemo(request: CorrectionMemoRequest): Promise<string | null> {
  const prompt = [
    'أنت أداة مستقلة متخصصة فقط في إعداد مذكرة تصحيح لأساتذة علوم الطبيعة والحياة في التعليم المتوسط بالجزائر.',
    'هذه الأداة ليست المساعد الذكي العام ولا تستعمل طلباته أو واجهته.',
    'المصدر الأول هو نص الفرض/الاختبار الذي يقدمه الأستاذ، ثم بيانات المنصة الرسمية للسياق العلمي.',
    '',
    'قواعد صارمة:',
    '1. حافظ على ترتيب التمارين والأسئلة كما وردت في الورقة.',
    '2. لا تخترع سؤالاً أو نقطة أو مرجعاً غير موجود في الورقة.',
    '3. احترم سلم التنقيط الموجود في الورقة، وإن لم يوجد فاقترح توزيعاً واضحاً وموسوماً بأنه «اقتراح للمراجعة».',
    '4. لكل سؤال: اكتب الإجابة النموذجية، عناصر الإجابة المنتظرة، وسلّم النقاط.',
    '5. في أسئلة الوثائق أو الرسوم: اذكر ما يجب ملاحظته ثم الاستنتاج العلمي المنتظر.',
    '6. في السؤال غير الواضح أو الذي لا تكفي معطياته: اكتب «يحتاج مراجعة الأستاذ» ولا تخمّن.',
    '7. في النهاية: مجموع النقاط، الأخطاء الشائعة، ملاحظات التصحيح، ومؤشرات الكفاءة عند توفرها في سياق المنصة.',
    '8. اكتب نصاً عربياً منظماً قابلاً للطباعة والتحرير في Word، بدون جداول Markdown أو رموز معقدة.',
    '',
    'السياق الرسمي من قاعدة المنصة:',
    buildCurriculumContext(request),
    '',
    'نوع التقييم: ' + request.examType,
    'نص ورقة التقييم:',
    request.examText,
  ].join('\n');

  try {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        attachments: (request.attachments || []).map(({ name, mimeType, size, dataUrl }) => ({
          name, mimeType, size, dataUrl,
        })),
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data.text === 'string' && data.text.trim() ? data.text.trim() : null;
  } catch (error) {
    console.error('[correction-memo] generation failed', error);
    return null;
  }
}
