import { LessonMemo } from '../types';

export interface GeneratedSession {
  midan: string;
  maqta: string;
  mawrid: string;
  session1: string;
  session2: string;
  isExam?: boolean;
  isHoliday?: boolean;
  holidayLabel?: string;
  month: string;
  dates: string;
  sourceLearningUnitId?: string;
  learningUnit?: string;
}

export function generateAnnualDistribution(
  lessons: LessonMemo[],
  startDateStr: string,
  holidays: { startDate: string; endDate: string; label: string }[] = []
): GeneratedSession[] {
  // For 1AM, keep every learning unit intact: activities from one learning unit
  // must never be paired with activities from another resource.
  const flatActivities: { midan: string; maqta: string; mawrid: string; title: string; sourceLearningUnitId?: string; learningUnit?: string }[] = [];
  
  // Build sessions only from curriculum activities; never invent curriculum content.
  for (const lesson of lessons) {
    for (const act of lesson.anshita) {
      flatActivities.push({
        midan: lesson.midan,
        maqta: lesson.maqta,
        mawrid: lesson.mawrid,
        title: act.title,
        sourceLearningUnitId: lesson.sourceLearningUnitId,
        learningUnit: lesson.ta3alom
      });
    }
  }

  const generated: GeneratedSession[] = [];
  if (!startDateStr) return [];
  const currentDate = new Date(startDateStr);
  if (Number.isNaN(currentDate.getTime())) return [];
  
  // Align to Sunday
  while (currentDate.getDay() !== 0) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const ARABIC_MONTHS = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  const getFormattedDateRange = (date: Date) => {
    const thu = new Date(date);
    thu.setDate(thu.getDate() + 4);
    const d1 = date.getDate().toString().padStart(2, '0');
    const d2 = thu.getDate().toString().padStart(2, '0');
    return `${d1}-${d2}`;
  };

  const isDateInHolidays = (d: Date) => {
    for (const h of holidays) {
      if (!h.startDate || !h.endDate) continue;
      const start = new Date(h.startDate);
      const end = new Date(h.endDate);
      if (d >= start && d <= end) return h.label;
    }
    return null;
  };

  let actIdx = 0;
  let weekNum = 1;
  let lastMidan = '';
  let lastMaqta = '';
  let lastMawrid = '';
  const is1AM = lessons.some(lesson => lesson.level === '1am');

  while (actIdx < flatActivities.length) {
    const month = ARABIC_MONTHS[currentDate.getMonth()];
    const dates = getFormattedDateRange(currentDate);

    // Keep track of current location in curriculum
    if (flatActivities[actIdx]) {
      lastMidan = flatActivities[actIdx].midan || lastMidan;
      lastMaqta = flatActivities[actIdx].maqta || lastMaqta;
      lastMawrid = flatActivities[actIdx].mawrid || lastMawrid;
    }

    // Check holiday
    const hol = isDateInHolidays(currentDate);
    if (hol) {
      generated.push({
        midan: lastMidan,
        maqta: lastMaqta,
        mawrid: lastMawrid,
        session1: '',
        session2: '',
        isHoliday: true,
        holidayLabel: hol,
        month,
        dates
      });
      currentDate.setDate(currentDate.getDate() + 7);
      continue;
    }

    // Standard exam placeholders are kept for the generic 2AM/3AM/4AM model.
    // 1AM must remain source-driven and must not receive invented exam rows.
    if (!is1AM && (weekNum === 9 || weekNum === 21 || weekNum === 32)) {
      generated.push({
        midan: lastMidan,
        maqta: lastMaqta,
        mawrid: lastMawrid,
        session1: `فرض الثلاثي ${weekNum === 9 ? 'الأول' : weekNum === 21 ? 'الثاني' : 'الثالث'}`,
        session2: 'تصحيح الفرض',
        isExam: true,
        month,
        dates
      });
      weekNum++;
      currentDate.setDate(currentDate.getDate() + 7);
      continue;
    }
    if (!is1AM && (weekNum === 13 || weekNum === 25 || weekNum === 35)) {
      generated.push({
        midan: lastMidan,
        maqta: lastMaqta,
        mawrid: lastMawrid,
        session1: `اختبار الثلاثي ${weekNum === 13 ? 'الأول' : weekNum === 25 ? 'الثاني' : 'الثالث'}`,
        session2: 'تصحيح الاختبار',
        isExam: true,
        month,
        dates
      });
      weekNum++;
      currentDate.setDate(currentDate.getDate() + 7);
      continue;
    }

    // Normal week. For 1AM, consume at most two activities from the same learning unit.
    const act1 = flatActivities[actIdx++];
    let act2 = flatActivities[actIdx] || null;
    if (is1AM && act2 && act2.sourceLearningUnitId !== act1.sourceLearningUnitId) {
      act2 = null;
    } else if (act2) {
      actIdx++;
    }

    generated.push({
      midan: act1.midan,
      maqta: act1.maqta,
      mawrid: act1.mawrid,
      session1: act1.title,
      session2: act2 ? act2.title : '',
      month,
      dates,
      sourceLearningUnitId: act1.sourceLearningUnitId,
      learningUnit: act1.learningUnit
    });
    weekNum++;
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return generated;
}
