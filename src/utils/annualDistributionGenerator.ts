import { LessonMemo, MemoConfig, Activity } from '../types';

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
}

export function generateAnnualDistribution(
  lessons: LessonMemo[],
  startDateStr: string,
  holidays: { startDate: string; endDate: string; label: string }[] = []
): GeneratedSession[] {
  // Flatten all activities
  const flatActivities: { midan: string; maqta: string; mawrid: string; title: string }[] = [];
  
  // Start with introduction
  flatActivities.push({
    midan: lessons[0]?.midan || '',
    maqta: lessons[0]?.maqta || '',
    mawrid: '',
    title: 'استقبال التلاميذ، تعارف / تقويم تشخيصي'
  });

  for (const lesson of lessons) {
    // Add Wوضعيات if needed, but let's just use activities
    for (const act of lesson.anshita) {
      flatActivities.push({
        midan: lesson.midan,
        maqta: lesson.maqta,
        mawrid: lesson.mawrid,
        title: act.title
      });
    }
    // Add Idmaj at the end of each sequence?
    flatActivities.push({
      midan: lesson.midan,
      maqta: lesson.maqta,
      mawrid: lesson.mawrid,
      title: 'إدماج وتقويم'
    });
  }

  const generated: GeneratedSession[] = [];
  let currentDate = new Date(startDateStr || '2023-09-17');
  
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

    // Check standard exams
    if (weekNum === 9 || weekNum === 21 || weekNum === 32) {
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
    if (weekNum === 13 || weekNum === 25 || weekNum === 35) {
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

    // Normal week
    const act1 = flatActivities[actIdx++];
    const act2 = actIdx < flatActivities.length ? flatActivities[actIdx++] : null;

    generated.push({
      midan: act1.midan,
      maqta: act1.maqta,
      mawrid: act1.mawrid,
      session1: act1.title,
      session2: act2 ? act2.title : '',
      month,
      dates
    });

    weekNum++;
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return generated;
}
