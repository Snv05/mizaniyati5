import { PedagogicalNote, GradeLevel } from '../types/pedagogicalNote';
import { buildGeminiSystemPrompt } from './geminiPrompts';

/**
 * معالجة وتدقيق كود الـ JSON القادم من نموذج Gemini API مع المعالجة التلقائية للأخطاء (Error Handling & Validation)
 */
export function validateAndRepairPedagogicalNote(rawInput: string, fallbackLevel: GradeLevel = '4AM', fallbackTopic: string = ''): PedagogicalNote {
  let cleaned = String(rawInput || '').trim();

  // إزالة وسوم Markdown (```json ... ```) إن وُجدت
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // محاولة استخراج أول كائن JSON صالح داخل النص في حال وجود مقدمات أو مؤخرات نصية
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  let parsed: any = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    console.warn('[Validation Warning] فشل تحليل الـ JSON المباشر، جاري محاولة الترميم:', parseError);
    // محاولة تصحيح الفواصل الزائدة أو الأقواس غير المغلقة
    try {
      const sanitized = cleaned
        .replace(/,\s*([}\]])/g, '$1') // حذف الفاصلة الأخيرة قبل القوس
        .replace(/[\u0000-\u001F]+/g, ' '); // حذف محارف التحكم
      parsed = JSON.parse(sanitized);
    } catch {
      throw new Error('تعذر معالجة مخرجات الذكاء الاصطناعي كـ JSON صالح. يرجى إعادة المحاولة.');
    }
  }

  // التحقق والترميم الصارم (Schema Validation & Default Fallbacks)
  const meta = parsed.meta || {};
  const pedagogicalTriad = parsed.pedagogicalTriad || {};
  const requirements = parsed.requirements || {};
  const studentWorksheet = parsed.studentWorksheet || {};
  const bemEvaluationGrid = parsed.bemEvaluationGrid || {};

  const validatedNote: PedagogicalNote = {
    meta: {
      gradeLevel: (['1AM', '2AM', '3AM', '4AM'].includes(meta.gradeLevel) ? meta.gradeLevel : fallbackLevel) as GradeLevel,
      field: String(meta.field || 'الإنسان والصحة / الوسط الحي').trim(),
      learningUnit: String(meta.learningUnit || 'المقطع التعلمي المعتمد').trim(),
      learningResource: String(meta.learningResource || fallbackTopic || 'المورد المعرفي المستهدف').trim(),
      lessonTitle: String(meta.lessonTitle || fallbackTopic || 'عنوان الحصة التعليمية').trim(),
      durationHours: typeof meta.durationHours === 'number' ? meta.durationHours : 1,
      targetedCompetence: String(meta.targetedCompetence || 'تجنيد الموارد المعرفية والمنهجية لحل مشكلات دالة').trim(),
    },
    pedagogicalTriad: {
      knowledgeResource: String(pedagogicalTriad.knowledgeResource || 'بناء المعارف والمفاهيم العلمية المستهدفة').trim(),
      methodologicalResource: String(pedagogicalTriad.methodologicalResource || 'انتهاج مسعى علمي (تقصي، تجريب، تحليل وتفسير)').trim(),
      valuesResource: String(pedagogicalTriad.valuesResource || 'تبني سلوكيات إيجابية نحو الصحة والبيئة').trim(),
    },
    requirements: {
      prerequisites: Array.isArray(requirements.prerequisites) && requirements.prerequisites.length > 0
        ? requirements.prerequisites.map((p: any) => String(p).trim()).filter(Boolean)
        : ['المكتسبات القبلية المرتبطة بالمستوى السابق'],
      didacticMeans: Array.isArray(requirements.didacticMeans) && requirements.didacticMeans.length > 0
        ? requirements.didacticMeans.map((d: any) => String(d).trim()).filter(Boolean)
        : ['الكتاب المدرسي، وثائق وسندات بيولوجية، معدات مخبرية'],
      scientificTerms: Array.isArray(requirements.scientificTerms)
        ? requirements.scientificTerms.map((t: any) => ({
            arabic: String(t.arabic || '').trim(),
            french: String(t.french || '').trim(),
            english: String(t.english || '').trim(),
          })).filter((t: any) => t.arabic || t.french || t.english)
        : [],
    },
    experiments: Array.isArray(parsed.experiments)
      ? parsed.experiments.map((exp: any) => ({
          substanceTested: String(exp.substanceTested || '').trim(),
          reagentUsed: String(exp.reagentUsed || '').trim(),
          expectedObservation: String(exp.expectedObservation || '').trim(),
          scientificConclusion: String(exp.scientificConclusion || '').trim(),
        }))
      : [],
    sequence: Array.isArray(parsed.sequence) && parsed.sequence.length > 0
      ? parsed.sequence.map((stage: any, index: number) => ({
          stageName: String(stage.stageName || `المرحلة ${index + 1}`).trim(),
          timeMinutes: typeof stage.timeMinutes === 'number' ? stage.timeMinutes : 15,
          teacherInstructions: String(stage.teacherInstructions || '').trim(),
          studentActivities: String(stage.studentActivities || '').trim(),
          didacticSupports: Array.isArray(stage.didacticSupports) ? stage.didacticSupports.map(String) : [],
        }))
      : [
          {
            stageName: 'وضعية الانطلاق',
            timeMinutes: 10,
            teacherInstructions: 'إثارة الدافعية وطرح المشكل العلمي المرتبط بالمورد',
            studentActivities: 'استدعاء المكتسبات القبلية وصياغة الفرضيات الأولية',
            didacticSupports: ['سندات بيداغوجية، صور وأفلام قصيرة'],
          },
          {
            stageName: 'وضعية البحث والتقصي',
            timeMinutes: 35,
            teacherInstructions: 'تنظيم الأفواج وتوجيه مسعى التجريب والتحليل',
            studentActivities: 'معالجة الوثائق وإجراء التجارب واستنتاج النتائج',
            didacticSupports: ['بطاقة العمل الفوجي، تجهيزات مخبرية'],
          },
          {
            stageName: 'إرساء الموارد / التركيب',
            timeMinutes: 10,
            teacherInstructions: 'إدارة المناقشة الجماعية ومصادقة الحلول الصحيحة',
            studentActivities: 'صياغة خلاصة شاملة تدون في كراس المتعلم',
            didacticSupports: ['السبورة ومخططات الحوصلة'],
          },
          {
            stageName: 'تقويم الموارد',
            timeMinutes: 5,
            teacherInstructions: 'اقتراح نشاط تقويمي سريع للتأكد من التحكم في المورد',
            studentActivities: 'الإجابة الفردية عن الوضعية التقويمية المعيارية',
            didacticSupports: ['شبكة التقويم الذاتي'],
          },
        ],
    studentWorksheet: {
      instructions: Array.isArray(studentWorksheet.instructions) && studentWorksheet.instructions.length > 0
        ? studentWorksheet.instructions.map(String)
        : ['العمل في فوج تعاوني وفق المهام الموزعة'],
      questionsToAnswer: Array.isArray(studentWorksheet.questionsToAnswer) && studentWorksheet.questionsToAnswer.length > 0
        ? studentWorksheet.questionsToAnswer.map(String)
        : ['حلل السندات المقدمة واستخلص النتيجة العلمية المستهدفة'],
    },
    bemEvaluationGrid: {
      relevance: String(bemEvaluationGrid.relevance || 'مؤشر الوجاهة والتقيد بالمهمة المركبة المطلوبة').trim(),
      correctUseOfTools: String(bemEvaluationGrid.correctUseOfTools || 'الاستعمال السليم لمفاهيم علوم الطبيعة والحياة والمصطلحات العلمية').trim(),
      coherence: String(bemEvaluationGrid.coherence || 'تسلسل منطقي وتفسير علمي منسجم ومبرر').trim(),
    },
  };

  return validatedNote;
}

/**
 * استدعاء Gemini API لتوليد مذكرة بيداغوجية متكاملة وفق المنهاج الجزائري
 */
export async function generatePedagogicalNote(
  gradeLevel: GradeLevel,
  topic: string
): Promise<PedagogicalNote> {
  const cleanTopic = (topic || '').trim();
  if (!cleanTopic) {
    throw new Error('يرجى تحديد المورد أو موضوع الدرس المراد توليد المذكرات حوله');
  }

  try {
    const res = await fetch('/api/gemini/generate-pedagogical-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gradeLevel,
        topic: cleanTopic,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `فشل الاتصال بخدمة الذكاء الاصطناعي (${res.status})`);
    }

    const data = await res.json();
    const rawJson = data.json || data.text || '';
    if (!rawJson) {
      throw new Error('استجاب النموذج بدون محتوى صالح');
    }

    return validateAndRepairPedagogicalNote(rawJson, gradeLevel, cleanTopic);
  } catch (error) {
    console.error('[Generate Pedagogical Note Error]:', error);
    throw error;
  }
}
