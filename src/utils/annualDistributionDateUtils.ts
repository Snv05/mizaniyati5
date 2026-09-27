import { OfficialAnnualDistributionRow } from '../data/officialAnnualDistributionData';

export const ARABIC_MONTH_NAMES = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export interface SchoolCalendarSettings {
  startDate: string; // YYYY-MM-DD
  schoolYear: string;
  dateFormat: 'short' | 'spaced' | 'withMonth' | 'isoShort';
  holidays: {
    autumnWeek: number;
    autumnLabel: string;
    winterWeeks: [number, number];
    winterLabel: string;
    springWeeks: [number, number];
    springLabel: string;
  };
  exams: {
    exam1Week: number;
    exam1Label: string;
    exam2Week: number;
    exam2Label: string;
    exam3Week: number;
    exam3Label: string;
  };
}

/**
 * اشتقاق تاريخ الدخول المدرسي الافتراضي حسب السنة الدراسية في الجزائر (الأحد المناسب في سبتمبر)
 */
export function deriveDefaultSchoolEntryDate(schoolYear: string): string {
  const match = String(schoolYear || '').match(/(20\d{2})/);
  const year = match ? Number(match[1]) : 2024;
  
  if (year === 2024) return '2024-09-22';
  if (year === 2025) return '2025-09-21';
  if (year === 2026) return '2026-09-20';
  
  // البحث عن الأحد الثالث أو الرابع من سبتمبر
  const sepDate = new Date(year, 8, 20); // 20 سبتمبر
  while (sepDate.getDay() !== 0) { // الأحد = 0
    sepDate.setDate(sepDate.getDate() + 1);
  }
  const m = String(sepDate.getMonth() + 1).padStart(2, '0');
  const d = String(sepDate.getDate()).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * اشتقاق تسمية السنة الدراسية (مثال: 2025-2026) من تاريخ البداية
 */
export function deriveSchoolYearFromDate(dateStr: string): string {
  if (!dateStr) return '2024-2025';
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '2024-2025';
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 is Jan, 8 is Sep
  if (month >= 7) { // من شهر أوت فما فوق، بداية موسم دراسي جديد
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

/**
 * الحصول على الإعدادات الافتراضية للرزنامة الوزارية
 */
export function getDefaultCalendarSettings(schoolYear: string, customStartDate?: string): SchoolCalendarSettings {
  const startDate = customStartDate || deriveDefaultSchoolEntryDate(schoolYear);
  return {
    startDate,
    schoolYear: schoolYear || '2024-2025',
    dateFormat: 'short',
    holidays: {
      autumnWeek: 6,
      autumnLabel: 'عطلة الخريف',
      winterWeeks: [14, 15],
      winterLabel: 'عطلة الشتاء',
      springWeeks: [27, 28],
      springLabel: 'عطلة الربيع',
    },
    exams: {
      exam1Week: 11,
      exam1Label: 'إختبارات الفصل الأول',
      exam2Week: 24,
      exam2Label: 'إختبارات الفصل الثاني',
      exam3Week: 35,
      exam3Label: 'إختبارات الفصل الثالث',
    },
  };
}

/**
 * محاذاة أي تاريخ إلى يوم الأحد المقابل في الأسبوع الدراسي الجزائري
 */
export function alignToSunday(dateStr: string): Date {
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return new Date();
  const day = d.getDay(); // 0 is Sunday
  if (day !== 0) {
    d.setDate(d.getDate() - day);
  }
  return d;
}

/**
 * حساب تفاصيل الأسبوع (الأحد والخميس والشهر والصيغة النصية)
 */
export function computeWeekRange(
  startSunday: Date,
  weekIndex: number,
  dateFormat: SchoolCalendarSettings['dateFormat'] = 'short'
) {
  const sunday = new Date(startSunday.getTime() + weekIndex * 7 * 24 * 3600 * 1000);
  const thursday = new Date(sunday.getTime() + 4 * 24 * 3600 * 1000);

  const sunDayStr = String(sunday.getDate()).padStart(2, '0');
  const thuDayStr = String(thursday.getDate()).padStart(2, '0');
  const sunMonth = sunday.getMonth();
  const thuMonth = thursday.getMonth();

  // تحديد الشهر المعتمد في الوثائق الوزارية
  let monthName = ARABIC_MONTH_NAMES[sunMonth];
  if (sunMonth !== thuMonth) {
    // حساب عدد أيام الدراسة الواقعة في كل شهر
    const daysInSunMonth = (new Date(sunday.getFullYear(), sunMonth + 1, 0).getDate()) - sunday.getDate() + 1;
    const daysInThuMonth = thursday.getDate();
    monthName = daysInThuMonth >= daysInSunMonth ? ARABIC_MONTH_NAMES[thuMonth] : ARABIC_MONTH_NAMES[sunMonth];
  }

  let datesStr = `${sunDayStr}-${thuDayStr}`;
  if (dateFormat === 'spaced') {
    datesStr = `${sunDayStr} − ${thuDayStr}`;
  } else if (dateFormat === 'withMonth') {
    if (sunMonth === thuMonth) {
      datesStr = `${sunDayStr} إلى ${thuDayStr} ${ARABIC_MONTH_NAMES[sunMonth]}`;
    } else {
      datesStr = `${sunDayStr} ${ARABIC_MONTH_NAMES[sunMonth]} إلى ${thuDayStr} ${ARABIC_MONTH_NAMES[thuMonth]}`;
    }
  } else if (dateFormat === 'isoShort') {
    const sMonth = String(sunMonth + 1).padStart(2, '0');
    const tMonth = String(thuMonth + 1).padStart(2, '0');
    datesStr = `${sunDayStr}/${sMonth} - ${thuDayStr}/${tMonth}`;
  }

  return {
    sunday,
    thursday,
    sunDayStr,
    thuDayStr,
    monthName,
    datesStr,
    isoStart: sunday.toISOString().split('T')[0],
    isoEnd: thursday.toISOString().split('T')[0],
  };
}

/**
 * إعادة حساب كافة تواريخ وأشهر التدرج السنوي بناءً على تاريخ الدخول المدرسي والعطل والاختبارات
 */
export function recalculateDistributionRows(
  baseRows: OfficialAnnualDistributionRow[],
  settings: SchoolCalendarSettings
): OfficialAnnualDistributionRow[] {
  if (!baseRows || baseRows.length === 0) return [];
  const startSunday = alignToSunday(settings.startDate);

  return baseRows.map((row, index) => {
    // رقم الأسبوع يبدأ من 1
    const weekNum = typeof row.week === 'number' ? row.week : (index + 1);
    const weekIndex = weekNum - 1;

    const range = computeWeekRange(startSunday, weekIndex, settings.dateFormat);

    // التحقق من فترات العطل الرسمية
    const isAutumn = weekNum === settings.holidays.autumnWeek;
    const isWinter = settings.holidays.winterWeeks.includes(weekNum as any);
    const isSpring = settings.holidays.springWeeks.includes(weekNum as any);
    const isHoliday = isAutumn || isWinter || isSpring || row.isHoliday;

    // التحقق من فترات الاختبارات الرسمية
    const isExam1 = weekNum === settings.exams.exam1Week;
    const isExam2 = weekNum === settings.exams.exam2Week;
    const isExam3 = weekNum === settings.exams.exam3Week;
    const isExam = isExam1 || isExam2 || isExam3 || row.isExam;

    let updatedSession1 = row.session1;
    let updatedSession2 = row.session2;
    let updatedHolidayLabel = row.holidayLabel;
    let updatedMawrid = row.mawrid;

    // تحديث مسميات العطل والاختبارات بناءً على الرزنامة الرسمية
    if (isAutumn) {
      updatedHolidayLabel = `${settings.holidays.autumnLabel} (${range.datesStr})`;
      if (row.session2 && /عطلة الخريف/.test(row.session2)) {
        updatedSession2 = `${settings.holidays.autumnLabel} (${range.datesStr})`;
      }
    } else if (isWinter) {
      updatedHolidayLabel = settings.holidays.winterLabel;
      if (row.session1 && (/عطلة الشتاء/.test(row.session1) || !row.session2)) {
        updatedSession1 = settings.holidays.winterLabel;
        updatedSession2 = settings.holidays.winterLabel;
        updatedMawrid = settings.holidays.winterLabel;
      }
    } else if (isSpring) {
      updatedHolidayLabel = settings.holidays.springLabel;
      if (row.session1 && (/عطلة الربيع/.test(row.session1) || !row.session2)) {
        updatedSession1 = settings.holidays.springLabel;
        updatedSession2 = settings.holidays.springLabel;
        updatedMawrid = settings.holidays.springLabel;
      }
    }

    if (isExam1) {
      if (/اختبارات|إختبار/.test(row.mawrid || '') || /اختبارات|إختبار/.test(row.session1 || '')) {
        updatedMawrid = settings.exams.exam1Label;
        updatedSession1 = settings.exams.exam1Label;
      }
    } else if (isExam2) {
      if (/اختبارات|إختبار/.test(row.mawrid || '') || /اختبارات|إختبار/.test(row.session1 || '')) {
        updatedMawrid = settings.exams.exam2Label;
        updatedSession1 = settings.exams.exam2Label;
      }
    } else if (isExam3) {
      if (/اختبارات|إختبار/.test(row.mawrid || '') || /اختبارات|إختبار/.test(row.session1 || '')) {
        updatedMawrid = settings.exams.exam3Label;
        updatedSession1 = settings.exams.exam3Label;
      }
    }

    return {
      ...row,
      week: weekNum,
      month: range.monthName,
      dates: range.datesStr,
      isHoliday,
      isExam,
      holidayLabel: updatedHolidayLabel,
      session1: updatedSession1,
      session2: updatedSession2,
      mawrid: updatedMawrid,
    };
  });
}

/**
 * مزامنة تاريخ الدخول والعطل مع دفتر النصوص في التخزين المحلي
 */
export function syncCalendarToDailyLogbook(startDate: string, settings: SchoolCalendarSettings): boolean {
  try {
    const raw = localStorage.getItem('daftar_table_v2027');
    const logbook = raw ? JSON.parse(raw) : {};
    
    logbook.startDate = startDate;
    
    // حساب تواريخ العطل لإدراجها في قائمة عطل الدفتر
    const startSunday = alignToSunday(startDate);
    const autumnRange = computeWeekRange(startSunday, settings.holidays.autumnWeek - 1);
    const winter1Range = computeWeekRange(startSunday, settings.holidays.winterWeeks[0] - 1);
    const winter2Range = computeWeekRange(startSunday, settings.holidays.winterWeeks[1] - 1);
    const spring1Range = computeWeekRange(startSunday, settings.holidays.springWeeks[0] - 1);
    const spring2Range = computeWeekRange(startSunday, settings.holidays.springWeeks[1] - 1);

    const generatedHolidays = [
      {
        id: 'holiday-autumn',
        startDate: autumnRange.isoStart,
        endDate: autumnRange.isoEnd,
        label: settings.holidays.autumnLabel,
      },
      {
        id: 'holiday-winter',
        startDate: winter1Range.isoStart,
        endDate: winter2Range.isoEnd,
        label: settings.holidays.winterLabel,
      },
      {
        id: 'holiday-spring',
        startDate: spring1Range.isoStart,
        endDate: spring2Range.isoEnd,
        label: settings.holidays.springLabel,
      },
    ];

    // دمج العطل دون تكرار
    const existingHolidays = Array.isArray(logbook.holidays) ? logbook.holidays : [];
    const nonOfficialHolidays = existingHolidays.filter(
      (h: any) => !/عطلة الخريف|عطلة الشتاء|عطلة الربيع/.test(h.label || '')
    );

    logbook.holidays = [...generatedHolidays, ...nonOfficialHolidays];
    localStorage.setItem('daftar_table_v2027', JSON.stringify(logbook));
    return true;
  } catch (err) {
    console.error('فشل مزامنة الرزنامة مع دفتر النصوص:', err);
    return false;
  }
}
