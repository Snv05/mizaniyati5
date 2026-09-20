import React, { useState, useMemo, useEffect } from 'react';
import { generatePreviewMatchDocx } from "../utils/docxExportLogbook";
import { generatePreviewMatchPdf } from "../utils/pdfExportLogbook";
import {
  BookOpen,
  Calendar,
  AlertCircle,
  Clock,
  Eraser,
  Eye,
  FileStack,
  FileText,
  Grid3x3,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Table as TableIcon,
  X,
  ZoomIn,
  ZoomOut,
  Printer,
  CheckCircle2,
  Filter,
  GraduationCap,
  Layers,
  ListFilter,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';
import { LessonMemo, MemoConfig, Activity } from '../types';
import { TeacherOfficialStamp } from './TeacherOfficialStamp';
import { LESSONS_1AM } from '../data/lessons1am';
import { LESSONS_2AM } from '../data/lessons2am';
import { LESSONS_3AM } from '../data/lessons3am';
import { LESSONS_4AM } from '../data/lessons4am';
import { generateAnnualDistribution } from '../utils/annualDistributionGenerator';

interface DailyLogbookProps {
  selectedLevel?: '1am' | '2am' | '3am' | '4am';
  setSelectedLevel?: (lvl: '1am' | '2am' | '3am' | '4am') => void;
  config: MemoConfig;
  showToast: (msg: string) => void;
  curriculumLessons?: LessonMemo[];
}

export interface CurriculumResourceItem {
  level: '1م' | '2م' | '3م' | '4م';
  memoNumber: string;
  midan: string;
  maqta: string;
  mawrid: string;
  ta3alom?: string;
  formattedText: string;
  activities: string[];
  sourceSequenceId?: string;
  sourceResourceId?: string;
  sourceLearningUnitId?: string;
  sourceActivityIds?: string[];
  taqwim?: string;
  sourceSequenceId?: string;
  sourceResourceId?: string;
  sourceLearningUnitId?: string;
  sourceActivityId?: string;
  sourceActivityId2?: string;
}

const transformLessonMemoToLogbook = (lessons: LessonMemo[], levelLabel: '1م' | '2م' | '3م' | '4م'): CurriculumResourceItem[] => {
  return lessons.map(lesson => {
    let txt = `<u>الميدان:</u> ${lesson.midan || ''}`;
    if (lesson.maqta) txt += `\n<u>المقطع:</u> ${lesson.maqta}`;
    if (lesson.mawrid) txt += `\n<u>المورد:</u> ${lesson.mawrid}`;
    if (lesson.ta3alom) txt += `\n<u>تعلم المورد:</u> ${lesson.ta3alom}`;
    
    const actText = lesson.anshita.map(a => a.title).join(' / ');
    if (actText) {
       txt += `\n<u>الأنشطة:</u> ${actText}`;
    }
    
    return {
      level: levelLabel,
      memoNumber: lesson.memoNumber?.toString() || '',
      midan: lesson.midan || '',
      maqta: lesson.maqta || '',
      mawrid: lesson.mawrid || '',
      ta3alom: lesson.ta3alom || '',
      activities: lesson.anshita.map(a => a.title),
      formattedText: txt,
      sourceSequenceId: lesson.sourceSequenceId,
      sourceResourceId: lesson.sourceResourceId,
      sourceLearningUnitId: lesson.sourceLearningUnitId,
      sourceActivityIds: lesson.anshita.map(a => a.sourceActivityId).filter(Boolean) as string[],
      taqwim: lesson.taqwim || ''
    };
  });
};

// ربط مباشر مع قاعدة بيانات التدرج الرسمي (Master Curriculum DB)
const buildCurriculumDatabase = (lessons?: LessonMemo[]): Record<'1م' | '2م' | '3م' | '4م', CurriculumResourceItem[]> => ({
  '1م': transformLessonMemoToLogbook((lessons || LESSONS_1AM).filter(l => l.level === '1am'), '1م'),
  '2م': transformLessonMemoToLogbook((lessons || LESSONS_2AM).filter(l => l.level === '2am'), '2م'),
  '3م': transformLessonMemoToLogbook((lessons || LESSONS_3AM).filter(l => l.level === '3am'), '3م'),
  '4م': transformLessonMemoToLogbook((lessons || LESSONS_4AM).filter(l => l.level === '4am'), '4م'),
});

type AnnualStoredItem = { id?: string; level?: string; lessonType?: string; midan?: string; maqta?: string; mawrid?: string; session1?: string; session2?: string; sourceSequenceId?: string; sourceResourceId?: string; sourceLearningUnitId?: string; sourceActivityId?: string; sourceActivityId2?: string; isHoliday?: boolean; isExam?: boolean; month?: string; dates?: string; taqwim?: string };

const getStoredAnnualSchedule = (level: '1م' | '2م' | '3م' | '4م'): { startDate: string; items: AnnualStoredItem[] } | null => {
  try {
    const raw = JSON.parse(localStorage.getItem('algeria_sciences_annual_dist_v5') || '{}');
    const key = level.replace('م', 'am') as '1am' | '2am' | '3am' | '4am';
    const value = raw?.[key];
    if (!value?.startDate || !Array.isArray(value.items)) return null;
    const ARABIC_MONTHS = ['جانفي','فيفري','مارس','أفريل','ماي','جوان','جويلية','أوت','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const normalizedItems = value.items.map((item: AnnualStoredItem, index: number) => {
      if (item.month && item.dates) return item;
      const d = new Date(value.startDate);
      while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
      d.setDate(d.getDate() + index * 7);
      const thu = new Date(d); thu.setDate(thu.getDate() + 4);
      return { ...item, month: item.month || ARABIC_MONTHS[d.getMonth()], dates: item.dates || `${String(d.getDate()).padStart(2,'0')}-${String(thu.getDate()).padStart(2,'0')}` };
    });
    return { ...value, items: normalizedItems };
  } catch {
    return null;
  }
};

const findLessonForScheduledSource = (bank: CurriculumResourceItem[], item: AnnualStoredItem, sessionOrdinal: number): CurriculumResourceItem | null => {
  const activityId = sessionOrdinal === 0 ? item.sourceActivityId : item.sourceActivityId2;
  if (activityId) {
    const exact = bank.find(resource => resource.sourceActivityIds?.includes(activityId));
    if (exact) return exact;
  }
  if (!item.session1 && !item.session2) return null;
  const title = sessionOrdinal === 0 ? item.session1 : item.session2;
  if (!title) return null;
  const titleMatches = bank.filter(resource => resource.activities.includes(title));
  return titleMatches.length === 1 ? titleMatches[0] : null;
};

const LEVEL_NAMES_MAP: Record<string, string> = {
  '1م': 'السنة الأولى متوسط (1AM)',
  '2م': 'السنة الثانية متوسط (2AM)',
  '3م': 'السنة الثالثة متوسط (3AM)',
  '4م': 'السنة الرابعة متوسط (4AM - BEM)',
};

const WEEK_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

const JS_DAY_NAMES: Record<number, string> = {
  0: 'الأحد',
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

const MORNING_PERIODS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00'];
const AFTERNOON_PERIODS = ['13:30 - 14:30', '14:30 - 15:30', '15:30 - 16:30', '16:30 - 17:30'];
const ALL_PERIODS = [...MORNING_PERIODS, ...AFTERNOON_PERIODS];

const TIME_RANK: Record<string, number> = {};
ALL_PERIODS.forEach((t, i) => {
  TIME_RANK[t] = i;
});

function isMorningTime(timeStr: string): boolean {
  return MORNING_PERIODS.includes(timeStr);
}

function isAfternoonTime(timeStr: string): boolean {
  return AFTERNOON_PERIODS.includes(timeStr);
}

function isValidSchoolPeriod(timeStr: string): boolean {
  return ALL_PERIODS.includes(timeStr);
}

function getTimeRank(timeStr: string): number {
  return TIME_RANK[timeStr] ?? 999;
}

function createEmptyDayCells(): Record<string, string> {
  return {
    الأحد: '',
    الإثنين: '',
    الثلاثاء: '',
    الأربعاء: '',
    الخميس: '',
  };
}

export interface TimetableGridRow {
  id: string;
  time: string;
  cells: Record<string, string>;
}

export interface HolidayEntry {
  id?: string;
  startDate: string;
  endDate?: string;
  label: string;
}

export interface LogEntry {
  id: string;
  dayName: string;
  dateStr: string;
  time: string;
  section: string;
  level: string;
  content: string;
  midan?: string;
  maqta?: string;
  mawrid?: string;
  ta3alom?: string;
  activitiesList?: string[];
  note: string;
  resourceIndex?: number;
  attendance?: string;
  wasail?: string;
  lessonType?: 'curriculum' | 'introductory' | 'opening' | 'health' | 'remediation' | 'assessment' | 'holiday';
  taqwim?: string;
}

const EMPTY_TIMETABLE_ROWS: TimetableGridRow[] = Array.from({ length: 8 }, (_, i) => ({
  id: `r${i + 1}`,
  time: ALL_PERIODS[i],
  cells: createEmptyDayCells(),
}));

// Default rows used by the automatic timetable-fill action.
// Keep the grid structurally complete without inventing class assignments.
const AUTO_FILLED_TIMETABLE_ROWS: TimetableGridRow[] = EMPTY_TIMETABLE_ROWS.map((row) => ({
  ...row,
  cells: createEmptyDayCells(),
}));

const LOGBOOK_DATA_VERSION = '2026-09-20-v5';
const ROWS_PER_PAGE = 18;
const getPageDimensions = (orientation: 'portrait' | 'landscape') => orientation === 'landscape' ? { w: 297, h: 210 } : { w: 210, h: 297 };
const PRINT_MARGIN = '14mm';
const PAGE_INNER_PADDING = '14px';
const NOTEBOOK_CONTENT_MIN_HEIGHT = '72px';

function getSchoolWeekKey(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() - d.getDay());
  return formatDateToIsoString(d);
}

function getTotalLogbookPages(rowCount: number): number {
  return 1 + Math.max(1, Math.ceil(rowCount / ROWS_PER_PAGE));
}

export function detectLevelFromSection(sec: string): '1م' | '2م' | '3م' | '4م' | null {
  if (!sec) return null;
  const s = sec.trim();
  if (s.includes('4م') || s.includes('4 م') || s.startsWith('4')) return '4م';
  if (s.includes('3م') || s.includes('3 م') || s.startsWith('3')) return '3م';
  if (s.includes('2م') || s.includes('2 م') || s.startsWith('2')) return '2م';
  if (s.includes('1م') || s.includes('1 م') || s.startsWith('1')) return '1م';
  return null;
}

function formatDateToIsoString(d: Date): string {
  return d.toISOString().split('T')[0];
}

/**
 * عرض هرمي لمحتوى الدفتر:
 * نحتفظ بالبيانات كاملة في قاعدة البيانات، لكن لا نكرر
 * الميدان/المقطع/المورد/تعلم المورد في كل صف عندما لا تتغير.
 */
function buildHierarchicalContent(
  row: LogEntry,
  previous?: LogEntry
): string {
  if (row.lessonType && row.lessonType !== 'curriculum') {
    return row.content || '';
  }

  const parts: string[] = [];
  const sameLevel = !!previous && previous.level === row.level;
  const sameMidan = sameLevel && previous?.midan === row.midan;
  const sameMaqta = sameMidan && previous?.maqta === row.maqta;
  const sameMawrid = sameMaqta && previous?.mawrid === row.mawrid;
  const sameTa3alom = sameMawrid && previous?.ta3alom === row.ta3alom;

  if (!sameLevel && row.level) parts.push(`<u>المستوى:</u> ${row.level}`);
  if (!sameMidan && row.midan) parts.push(`<u>الميدان:</u> ${row.midan}`);
  if (!sameMaqta && row.maqta) parts.push(`<u>المقطع:</u> ${row.maqta}`);
  if (!sameMawrid && row.mawrid) parts.push(`<u>المورد:</u> ${row.mawrid}`);
  if (!sameTa3alom && row.ta3alom) parts.push(`<u>تعلم المورد:</u> ${row.ta3alom}`);

  const activities = (row.activitiesList || []).filter(Boolean).slice(0, 2);
  if (activities.length > 0) {
    parts.push(`<u>الأنشطة:</u> ${activities.join(' / ')}`);
  }

  return parts.join('\n') || row.content || '';
}



export const DailyLogbook: React.FC<DailyLogbookProps> = ({
  config,
  showToast,
  curriculumLessons,
}) => {
  // State for Header Info (synced with config initially)
  const CURRICULUM_DATABASE = useMemo(() => buildCurriculumDatabase(curriculumLessons), [curriculumLessons]);

  const [wilaya, setWilaya] = useState<string>(config.directorate || '');
  const [school, setSchool] = useState<string>(config.schoolName || '');
  const [teacher, setTeacher] = useState<string>(config.teacherName || '');
  const [subject, setSubject] = useState<string>('علوم الطبيعة والحياة');
    const [showSubjectInHeader, setShowSubjectInHeader] = useState<boolean>(true);
  const [showYearInHeader, setShowYearInHeader] = useState<boolean>(false); // احذف السنة الدراسية والمادة اتركها اختيارية

  // Timetable grid rows
  const [gridRows, setGridRows] = useState<TimetableGridRow[]>(EMPTY_TIMETABLE_ROWS);

  // Holidays with date ranges (من تاريخ إلى تاريخ)
  const [holidays, setHolidays] = useState<HolidayEntry[]>([]);
  const [newHolidayStartDate, setNewHolidayStartDate] = useState<string>('');
  const [newHolidayEndDate, setNewHolidayEndDate] = useState<string>('');
  const [newHolidayLabel, setNewHolidayLabel] = useState<string>('');

  // Generation controls
  const [period, setPeriod] = useState<string>('شهر');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const pageDimensions = getPageDimensions(orientation);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateToIsoString(d);
  });

  // Generated Daily Log Entries
  const [rows, setRows] = useState<LogEntry[]>([]);

  // Modals & UI States
  const [isElementsModalOpen, setIsElementsModalOpen] = useState<boolean>(false);
  const [modalFilterLevel, setModalFilterLevel] = useState<string>('assigned');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<"all" | "single">("all");
  const [previewZoom, setPreviewZoom] = useState<number>(85);
  const [showEmptyWarning, setShowEmptyWarning] = useState<boolean>(false);
  const [userAlert, setUserAlert] = useState<string | null>(null);

  // Quick Lesson Picker for individual rows
  const [activePickerRowId, setActivePickerRowId] = useState<string | null>(null);

  const displayUserAlert = (msg: string) => {
    setUserAlert(msg);
    setTimeout(() => setUserAlert(null), 3500);
  };

  // Load saved state from localStorage
  const loadFromStorage = () => {
    const keys = ['daftar_table_v2027'];
    for (const key of keys) {
      const item = localStorage.getItem(key);
      if (!item) continue;
      try {
        const parsed = JSON.parse(item);
        if (parsed.wilaya) setWilaya(parsed.wilaya);
        if (parsed.school) setSchool(parsed.school);
        if (parsed.teacher) setTeacher(parsed.teacher);
        if (parsed.subject !== undefined) setSubject(parsed.subject);
        if (parsed.showSubjectInHeader !== undefined) setShowSubjectInHeader(parsed.showSubjectInHeader);
        if (parsed.showYearInHeader !== undefined) setShowYearInHeader(parsed.showYearInHeader);
        if (parsed.holidays && Array.isArray(parsed.holidays)) {
          const normalized: HolidayEntry[] = parsed.holidays.map((h: any, idx: number) => ({
            id: h.id || `h-${idx}`,
            startDate: h.startDate || h.date || '',
            endDate: h.endDate || h.startDate || h.date || '',
            label: h.label || 'عطلة',
          })).filter((h: HolidayEntry) => !!h.startDate);
          if (normalized.length > 0) setHolidays(normalized);
        }
        if (parsed.logbookDataVersion === LOGBOOK_DATA_VERSION && parsed.rows && Array.isArray(parsed.rows)) setRows(parsed.rows);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.period) setPeriod(parsed.period);
        if (parsed.orientation === 'portrait' || parsed.orientation === 'landscape') setOrientation(parsed.orientation);
        if (parsed.gridRows && Array.isArray(parsed.gridRows)) {
          const valid: TimetableGridRow[] = [];
          const seen = new Set<string>();
          for (const row of parsed.gridRows) {
            if (!row.time || !isValidSchoolPeriod(row.time)) continue;
            if (seen.has(row.time)) continue;
            seen.add(row.time);
            const cleanCells = { ...row.cells };
            delete cleanCells['السبت'];
            valid.push({ ...row, cells: cleanCells });
          }
          if (valid.length > 0) {
            valid.sort((a, b) => getTimeRank(a.time) - getTimeRank(b.time));
            setGridRows(valid);
            break;
          }
        }
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    loadFromStorage();
    const handleSync = () => loadFromStorage();
    window.addEventListener('firebase-sync-complete', handleSync);
    return () => window.removeEventListener('firebase-sync-complete', handleSync);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    const dataToSave = {
      logbookDataVersion: LOGBOOK_DATA_VERSION,
      wilaya,
      school,
      teacher,
      subject,
      showSubjectInHeader,
      showYearInHeader,
      gridRows,
      holidays,
      rows,
      startDate,
      period,
      orientation,
    };
    localStorage.setItem(
      'daftar_table_v2027',
      JSON.stringify(dataToSave)
    );
    if ((window as any).syncToCloud) {
      (window as any).syncToCloud('logbook', dataToSave);
    }
  }, [wilaya, school, teacher, subject, config.schoolYear, showSubjectInHeader, showYearInHeader, gridRows, holidays, rows, startDate, period, orientation]);

  // Keyboard navigation for preview modal
  useEffect(() => {
    if (!isPreviewModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreviewModalOpen(false);
      if (e.key === '+' || e.key === '=') setPreviewZoom((z) => Math.min(150, z + 10));
      if (e.key === '-' || e.key === '_') setPreviewZoom((z) => Math.max(50, z - 10));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPreviewModalOpen]);

  // اكتشاف المستويات المسندة للأستاذ آلياً من جدول استعمال الزمن
  const assignedLevels = useMemo<'1م' | '2م' | '3م' | '4م'[]>(() => {
    const levelsSet = new Set<string>();
    if (config.assignedClasses && config.assignedClasses.length > 0) {
      config.assignedClasses.forEach(sec => {
        const lvl = detectLevelFromSection(sec);
        if (lvl) levelsSet.add(lvl);
      });
    } else {
      gridRows.forEach((row) => {
        WEEK_DAYS.forEach((day) => {
          const sec = row.cells[day]?.trim();
          if (sec) {
            const lvl = detectLevelFromSection(sec);
            if (lvl) levelsSet.add(lvl);
          }
        });
      });
    }
    return Array.from(levelsSet).sort() as any;
  }, [gridRows, config.assignedClasses]);

  // الأقسام الفرعية المسندة بالتفصيل
  const assignedSectionsList = useMemo<string[]>(() => {
    if (config.assignedClasses && config.assignedClasses.length > 0) {
      return [...config.assignedClasses].sort();
    }
    const secSet = new Set<string>();
    gridRows.forEach((row) => {
      WEEK_DAYS.forEach((day) => {
        const sec = row.cells[day]?.trim();
        if (sec) secSet.add(sec);
      });
    });
    return Array.from(secSet).sort();
  }, [gridRows, config.assignedClasses]);

  // Structured Timetable lookup
  const timetableSchedule = useMemo(() => {
    const sched: Record<string, { id: string; time: string; section: string; level: '1م' | '2م' | '3م' | '4م' | null }[]> = {
      الأحد: [],
      الإثنين: [],
      الثلاثاء: [],
      الأربعاء: [],
      الخميس: [],
    };

    [...gridRows]
      .sort((a, b) => getTimeRank(a.time) - getTimeRank(b.time))
      .forEach((row) => {
        WEEK_DAYS.forEach((day) => {
          const sec = row.cells[day]?.trim();
          if (sec) {
            sched[day].push({
              id: `${row.id}-${day}`,
              time: row.time,
              section: sec,
              level: detectLevelFromSection(sec),
            });
          }
        });
      });

    WEEK_DAYS.forEach((day) => {
      sched[day].sort((a, b) => getTimeRank(a.time) - getTimeRank(b.time));
    });

    return sched;
  }, [gridRows]);

  const targetDaysCount = useMemo(() => {
    switch (period) {
      case 'أسبوع':
        return 7;
      case 'أسبوعين':
        return 14;
      case 'شهر':
        return 30;
      case 'فصل':
        return 90;
      case 'سنة':
        return 180;
      default:
        return 30;
    }
  }, [period]);

  // دالة فحص العطل عبر التواريخ (تاريخ البداية والنهاية)
  const isDateInHoliday = (dateStr: string): boolean => {
    return holidays.some((h) => {
      const start = h.startDate;
      const end = h.endDate || h.startDate;
      return dateStr >= start && dateStr <= end;
    });
  };

  const formatPageNumberLabel = (pgIdx: number, total: number) =>
    `صفحة ${pgIdx + 1} من ${total} - 🇩🇿`;

  // توليد الدفتر اليومي الذكي مرتبطاً بقاعدة بيانات مذكرات المستويات المسندة حصراً
  const handleGenerateSmartLogbook = () => {
    if (!startDate) return;

    if (assignedLevels.length === 0 || gridRows.every(r => Object.values(r.cells).every((c: any) => !c || !c.trim()))) {
      displayUserAlert('يرجى تعبئة حصة واحدة على الأقل في جدول استعمال الزمن لتوليد الحصص');
      return;
    }

    const getBaseSection = (sec: string) => {
      if (!sec) return 'قسم غير محدد';
      return sec.replace(/\s*\(?(?:فوج|ف|فـ|g|grp|group)\s*\d+\)?\s*/gi, '').trim();
    };

    const sectionCounters: Record<string, number> = {};
    // عداد مستقل داخل كل أسبوع: الحصة الأولى ← session1، الثانية ← session2.
    // لا نستخدم ترتيب عناصر اليوم، لأن ذلك كان يجعل session2 لا تُختار فعلياً.
    const weeklySessionCounters: Record<string, number> = {};
    const generated: LogEntry[] = [];
    const baseDate = new Date(startDate);
    const currDate = new Date(baseDate);

    let schoolDaysCounted = 0;
    let iterationGuard = 0;
    const maxIterations = period === 'سنة' ? 400 : targetDaysCount * 2;

    const processDaySessions = (dayName: string, dateStr: string) => {
      const daySessions = timetableSchedule[dayName];
      if (!daySessions || daySessions.length === 0) return false;

      const groupedSessions: Record<string, typeof daySessions> = {};
      for (const sess of daySessions) {
        const base = getBaseSection(sess.section);
        if (!groupedSessions[base]) groupedSessions[base] = [];
        groupedSessions[base].push(sess);
      }

      for (const [baseSection, sessions] of Object.entries(groupedSessions)) {
        const firstSess = sessions[0];
        const lvl = firstSess.level || detectLevelFromSection(baseSection) || assignedLevels[0] || '1م';
        const bank = CURRICULUM_DATABASE[lvl] || CURRICULUM_DATABASE['1م'];

        if (sectionCounters[baseSection] === undefined) sectionCounters[baseSection] = 0;
        const currentResIdx = sectionCounters[baseSection] % bank.length;
        sectionCounters[baseSection] += 1;

        // Smart linkage: match the exact annual-distribution week, then consume
        // session1 and session2 in occurrence order for this section in that week.
        const storedAnnual = getStoredAnnualSchedule(lvl);
        const annual = storedAnnual || (() => {
          const sourceLessons =
            lvl === '1م' ? LESSONS_1AM :
            lvl === '2م' ? LESSONS_2AM :
            lvl === '3م' ? LESSONS_3AM :
            LESSONS_4AM;
          const generated = generateAnnualDistribution(sourceLessons, startDate, holidays);
          return generated.length > 0 ? { startDate, items: generated } : null;
        })();
        let res = bank[currentResIdx];
        let currentLessonType: LogEntry['lessonType'] = 'curriculum';
        let matchedAnnual = false;
        let linkedSourceSequenceId = res.sourceSequenceId;
        let linkedSourceResourceId = res.sourceResourceId;
        let linkedSourceLearningUnitId = res.sourceLearningUnitId;
        let linkedSourceActivityId = res.sourceActivityIds?.[0];
        let linkedSourceActivityId2 = res.sourceActivityIds?.[1];
        if (annual) {
          const start = new Date(annual.startDate);
          while (start.getDay() !== 0) start.setDate(start.getDate() + 1);
          const current = new Date(dateStr);
          const diffDays = Math.floor((current.getTime() - start.getTime()) / 86400000);
          const weekIndex = Math.floor(diffDays / 7);
          const annualItem = weekIndex >= 0 ? annual.items[weekIndex] : null;

          if (annualItem) {
            const weekKey = baseSection + "::" + weekIndex;
            const ordinal = weeklySessionCounters[weekKey] || 0;
            weeklySessionCounters[weekKey] = ordinal + 1;
            const scheduledTitle = ordinal === 0
              ? annualItem.session1
              : ordinal === 1
                ? annualItem.session2
                : annualItem.session2;

            const hasCurriculumSourceForSession =
              ordinal === 0 ? !!annualItem.sourceActivityId : !!annualItem.sourceActivityId2;

            const isAssessmentSession =
              ordinal === 1 &&
              !annualItem.sourceActivityId2 &&
              (!!annualItem.taqwim || String(scheduledTitle || '').trim().startsWith('تقويم'));

            if (isAssessmentSession || (annualItem.lessonType && annualItem.lessonType !== 'curriculum' && !hasCurriculumSourceForSession)) {
              currentLessonType = isAssessmentSession ? 'assessment' : annualItem.lessonType as LogEntry['lessonType'];
              matchedAnnual = true;
              const specialTitle = scheduledTitle || (annualItem.taqwim ? `تقويم: ${annualItem.taqwim}` : 'تقويم');
              res = {
                level: lvl,
                memoNumber: '',
                midan: '',
                maqta: '',
                mawrid: '',
                ta3alom: '',
                formattedText: specialTitle,
                activities: [],
                taqwim: annualItem.taqwim || ''
              };
            } else {
              const scheduled = findLessonForScheduledSource(bank, annualItem, ordinal);
              if (scheduled) {
                currentLessonType = 'curriculum';
                res = scheduled;
                linkedSourceSequenceId = annualItem.sourceSequenceId || scheduled.sourceSequenceId;
                linkedSourceResourceId = annualItem.sourceResourceId || scheduled.sourceResourceId;
                linkedSourceLearningUnitId = annualItem.sourceLearningUnitId || scheduled.sourceLearningUnitId;
                linkedSourceActivityId = annualItem.sourceActivityId || scheduled.sourceActivityIds?.[0];
                linkedSourceActivityId2 = annualItem.sourceActivityId2 || scheduled.sourceActivityIds?.[1];
                matchedAnnual = true;
              }
            }
          }
        }

        // If the annual distribution does not contain an exact curriculum title,
        // keep the master-bank fallback instead of inventing or silently altering content.
        if (!matchedAnnual && annual) {
          // Intentionally preserve the master curriculum fallback.
        }

        const uniqueSections = Array.from(new Set(sessions.map((s) => s.section || 'قسم غير محدد')));
        const combinedSections = uniqueSections.join(' و ');

        const combinedTimes = sessions.map((s) => s.time).join(' / ');

        generated.push({
          id: `${dateStr}-${baseSection}-${generated.length}`,
          dayName,
          dateStr,
          time: combinedTimes,
          section: combinedSections,
          level: lvl,
          content: res.formattedText,
          midan: res.midan,
          maqta: res.maqta,
          mawrid: res.mawrid,
          ta3alom: res.ta3alom,
          activitiesList: res.activities.slice(0, 2),
          taqwim: res.taqwim || '',
          sourceSequenceId: linkedSourceSequenceId,
          sourceResourceId: linkedSourceResourceId,
          sourceLearningUnitId: linkedSourceLearningUnitId,
          sourceActivityId: linkedSourceActivityId,
          sourceActivityId2: linkedSourceActivityId2,
          lessonType: currentLessonType,
          note: '',
          resourceIndex: currentResIdx,
        });
      }
      return true;
    };

    if (period === 'سنة') {
      while (schoolDaysCounted < 180 && iterationGuard < maxIterations) {
        const dayName = JS_DAY_NAMES[currDate.getDay()];
        const dateStr = formatDateToIsoString(currDate);
        const isWeekend = dayName === 'الجمعة' || dayName === 'السبت';
        const isHoliday = isDateInHoliday(dateStr);

        if (!isWeekend && !isHoliday) {
           const hasSessions = processDaySessions(dayName, dateStr);
           if (hasSessions) schoolDaysCounted++;
        }
        currDate.setDate(currDate.getDate() + 1);
        iterationGuard++;
      }
    } else {
      for (let i = 0; i < targetDaysCount; i++) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i);
        const dayName = JS_DAY_NAMES[d.getDay()];
        const dateStr = formatDateToIsoString(d);

        if (dayName === 'الجمعة' || dayName === 'السبت') continue;
        if (isDateInHoliday(dateStr)) continue;

        processDaySessions(dayName, dateStr);
      }
    }

    setRows(generated);
    const assignedStr = assignedLevels.join(' و ');
    showToast(`تم توليد ${generated.length} حصة للسنوات المسندة (${assignedStr}) بنجاح`);
    setTimeout(() => {
      document.getElementById('pages-start')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Paginate into 20 rows per page
  const handleExportWord = async () => {
    try {
      if (rows.length === 0) {
        showToast('ولّد الدفتر أولاً قبل تصدير Word');
        return;
      }
      if (!isPreviewModalOpen) {
        setPreviewMode('all');
        setIsPreviewModalOpen(true);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const pages = Array.from(
        document.querySelectorAll<HTMLElement>('[data-preview-export-page="true"]')
      );
      if (!pages.length) throw new Error('تعذر العثور على صفحات المعاينة للتصدير');

      const blob = await generatePreviewMatchDocx(pages, orientation);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `الدفتر-اليومي-مطابق-للمعاينة-${orientation === 'landscape' ? 'أفقي' : 'عمودي'}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      showToast('تم تصدير Word مطابقاً لصفحات المعاينة');
    } catch (error) {
      console.error(error);
      showToast('تعذر تصدير Word المطابق للمعاينة');
    }
  };

  const handleExportPdf = async () => {
    try {
      if (rows.length === 0) {
        showToast('ولّد الدفتر أولاً قبل تصدير PDF');
        return;
      }
      if (!isPreviewModalOpen) {
        setPreviewMode('all');
        setIsPreviewModalOpen(true);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const pages = Array.from(
        document.querySelectorAll<HTMLElement>('[data-preview-export-page="true"]')
      );
      if (!pages.length) throw new Error('تعذر العثور على صفحات المعاينة للتصدير');

      await generatePreviewMatchPdf(pages, orientation);
      showToast('تم تصدير PDF مطابقاً لصفحات المعاينة');
    } catch (error) {
      console.error(error);
      showToast('تعذر تصدير PDF المطابق للمعاينة');
    }
  };

  const paginatedPages = useMemo(() => {
    const pages: LogEntry[][] = [];
    for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
      pages.push(rows.slice(i, i + ROWS_PER_PAGE));
    }
    return pages;
  }, [rows]);

  const levelDistributionSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach((r) => {
      counts[r.level] = (counts[r.level] || 0) + 1;
    });
    // نعرض فقط المستويات المسندة التي توجد في الحصص
    return (
      assignedLevels
        .map((lvl) => `${lvl} (${counts[lvl] || 0} حصة)`)
        .join(' • ') || '—'
    );
  }, [rows, assignedLevels]);

  const totalFilledTimetableSlots = useMemo(() => {
    let count = 0;
    gridRows.forEach((row) =>
      WEEK_DAYS.forEach((day) => {
        if (row.cells[day]?.trim()) count++;
      })
    );
    return count;
  }, [gridRows]);

  // Timetable row modifications
  const handleCellChange = (rowId: string, day: string, value: string) => {
    setGridRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, cells: { ...r.cells, [day]: value } } : r))
    );
  };

  const handleTimeChange = (rowId: string, newTime: string, shiftType: 'morning' | 'afternoon') => {
    if (!isValidSchoolPeriod(newTime)) {
      displayUserAlert('الفترة محجوزة للراحة - الصباح 08-12 والمساء 13:30-17:30');
      return;
    }
    if (shiftType === 'morning' && !isMorningTime(newTime)) {
      displayUserAlert('الفترة محجوزة للراحة - الصباح 08-12 والمساء 13:30-17:30');
      return;
    }
    if (shiftType === 'afternoon' && !isAfternoonTime(newTime)) {
      displayUserAlert('الفترة محجوزة للراحة - الصباح 08-12 والمساء 13:30-17:30');
      return;
    }
    if (gridRows.some((r) => r.time === newTime && r.id !== rowId)) {
      displayUserAlert(`التوقيت ${newTime} موجود مسبقاً`);
      return;
    }
    setGridRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, time: newTime } : r)));
  };

  const handleAddMorningRow = () => {
    const existing = new Set(gridRows.map((r) => r.time));
    const available = MORNING_PERIODS.find((t) => !existing.has(t));
    if (!available) {
      displayUserAlert('جميع فترات الصباح (08:00-12:00) ممتلئة');
      return;
    }
    const newRow: TimetableGridRow = {
      id: Math.random().toString(36).slice(2, 7),
      time: available,
      cells: createEmptyDayCells(),
    };
    setGridRows((prev) => [...prev, newRow].sort((a, b) => getTimeRank(a.time) - getTimeRank(b.time)));
    showToast('تمت إضافة فترة صباحية');
  };

  const handleAddAfternoonRow = () => {
    const existing = new Set(gridRows.map((r) => r.time));
    const available = AFTERNOON_PERIODS.find((t) => !existing.has(t));
    if (!available) {
      displayUserAlert('جميع فترات المساء (13:30-17:30) ممتلئة');
      return;
    }
    const newRow: TimetableGridRow = {
      id: Math.random().toString(36).slice(2, 7),
      time: available,
      cells: createEmptyDayCells(),
    };
    setGridRows((prev) => [...prev, newRow].sort((a, b) => getTimeRank(a.time) - getTimeRank(b.time)));
    showToast('تمت إضافة فترة مسائية');
  };

  const handleDeleteGridRow = (rowId: string) => {
    setGridRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleClearGrid = () => {
    setGridRows((prev) => prev.map((r) => ({ ...r, cells: createEmptyDayCells() })));
    showToast('تم مسح الجدول');
  };

  const handleAutoFillGrid = () => {
    setGridRows(
      AUTO_FILLED_TIMETABLE_ROWS.map((r) => ({
        ...r,
        id: Math.random().toString(36).slice(2, 6) + r.id,
      })).sort((a, b) => getTimeRank(a.time) - getTimeRank(b.time))
    );
    showToast('تمت التعبئة التلقائية للجدول بجميع المستويات');
  };

  // إسناد سريع لمستوى محدد (مثلاً أستاذ يدرس 1م و 4م فقط)
  const handleQuickAssignPreset = (presetLevels: ('1م' | '2م' | '3م' | '4م')[]) => {
    const updated = gridRows.map((row) => {
      const newCells = { ...row.cells };
      WEEK_DAYS.forEach((day) => {
        const curSec = newCells[day]?.trim();
        if (curSec) {
          const lvl = detectLevelFromSection(curSec);
          if (lvl && !presetLevels.includes(lvl)) {
            newCells[day] = ''; // مسح الأقسام غير المسندة
          }
        }
      });
      return { ...row, cells: newCells };
    });
    setGridRows(updated);
    showToast(`تم ضبط الأقسام المسندة: ${presetLevels.join(' و ')}`);
  };

  const handleResetDefaultGrid = () => {
    setGridRows(
      EMPTY_TIMETABLE_ROWS.map((r) => ({
        ...r,
        id: Math.random().toString(36).slice(2, 6) + r.id,
      })).sort((a, b) => getTimeRank(a.time) - getTimeRank(b.time))
    );
    showToast('تمت استعادة الجدول الافتراضي');
  };

  const handleAddHoliday = () => {
    if (!newHolidayStartDate) {
      displayUserAlert('يرجى تحديد تاريخ بداية العطلة');
      return;
    }
    const end = newHolidayEndDate || newHolidayStartDate;
    if (end < newHolidayStartDate) {
      displayUserAlert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }
    setHolidays((prev) =>
      [...prev, {
        id: Math.random().toString(36).slice(2, 7),
        startDate: newHolidayStartDate,
        endDate: end,
        label: newHolidayLabel || 'عطلة رسمية'
      }].sort((a, b) => a.startDate.localeCompare(b.startDate))
    );
    setNewHolidayStartDate('');
    setNewHolidayEndDate('');
    setNewHolidayLabel('');
    showToast('تمت إضافة فترة العطلة بنجاح');
  };

  const handleOpenPreview = (mode: 'all' | 'single') => {
    setPreviewMode(mode);
    setPreviewZoom(85);
    setIsPreviewModalOpen(true);
    setShowEmptyWarning(false);
  };

  const previewPagesToDisplay = useMemo(() => {
    if (previewMode === 'single') return paginatedPages.slice(0, 1);
    return paginatedPages;
  }, [paginatedPages, previewMode]);

  const morningRows = useMemo(
    () => gridRows.filter((r) => isMorningTime(r.time)).sort((a, b) => getTimeRank(a.time) - getTimeRank(b.time)),
    [gridRows]
  );
  const afternoonRows = useMemo(
    () => gridRows.filter((r) => isAfternoonTime(r.time)).sort((a, b) => getTimeRank(a.time) - getTimeRank(b.time)),
    [gridRows]
  );

  const renderLunchBreakRow = (key: string) => (
    <tr key={key} className="bg-[#fffbeb]">
      <td
        colSpan={6}
        className="border border-amber-200 text-center py-1 text-[10px] font-extrabold text-amber-800 tracking-wide"
      >
        <span className="inline-flex items-center gap-1.5">
          <span>🍽️</span> استراحة الغداء 12:00 - 13:30 - فترة راحة
        </span>
      </td>
    </tr>
  );

  // مكون بطاقة/صفحة الغلاف واستعمال الزمن (الصفحة الأولى عند الطباعة)
  const renderCoverFirstPage = () => (
    <div
      className="print-page cover-page shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[2px] border border-zinc-200 overflow-hidden mx-auto mb-8"
      style={{
        width: `${pageDimensions.w}mm`,
        minHeight: `${pageDimensions.h}mm`,
        maxWidth: '100%',
      }}
    >
      <div style={{ padding: '16px' }} className="h-full flex flex-col justify-between">
        <div>
          {/* Header Flag */}
          <div className="h-1 flex -mx-[1px] mb-3">
            <div className="flex-1 bg-[#006233]" />
            <div className="flex-1 bg-[#D21034]" />
          </div>

          {/* Official Republic Header */}
          <div className="text-center pb-4 border-b border-zinc-300">
            <div className="text-[13px] font-extrabold flex items-center justify-center gap-2 text-zinc-900">
              <span className="text-[18px]">🇩🇿</span> الجمهورية الجزائرية الديمقراطية الشعبية
            </div>
            <div className="text-[12px] font-bold text-zinc-700 mt-0.5">وزارة التربية الوطنية</div>
            <div className="text-[12px] font-semibold text-zinc-600">مديرية التربية لولاية {wilaya}</div>
            <div className="text-[13px] font-extrabold text-zinc-800 mt-1">متوسطة: {school}</div>
          </div>

          {/* Cover Title */}
          <div className="my-5 text-center bg-gradient-to-b from-[#064e3b] to-[#042f24] text-white py-4 rounded-xl shadow-xs">
            <div className="text-[10px] tracking-widest uppercase opacity-80 mb-0.5">وثيقة بيداغوجية رسمية</div>
            <h1 className="text-[24px] font-[800] tracking-tight">الدفتر اليومي للأستاذ</h1>
            <div className="text-[13px] font-medium opacity-95 mt-1">
              مرحلة التعليم المتوسط {showSubjectInHeader && subject ? `• مادة ${subject}` : ''}
            </div>
            {showYearInHeader && config.schoolYear && (
              <div className="inline-block mt-2 bg-white/20 px-3 py-0.5 rounded-full text-[11px] font-bold">
                السنة الدراسية: {config.schoolYear}
              </div>
            )}
          </div>

          {/* Teacher & Assignment Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5 text-[11px]">
            <div className="bg-[#fcfcf9] border border-zinc-200 rounded-xl p-3.5 space-y-2">
              <div className="text-[12px] font-extrabold text-[#064e3b] border-b border-zinc-200 pb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>معلومات الأستاذ(ة) والإسناد التربوي:</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-1.5 text-zinc-800">
                <span className="text-zinc-500 font-medium">الأستاذ(ة):</span>
                <span className="font-bold">{teacher}</span>

                {showSubjectInHeader && subject && (
                  <>
                    <span className="text-zinc-500 font-medium">المادة:</span>
                    <span className="font-bold">{subject}</span>
                  </>
                )}

                {showYearInHeader && config.schoolYear && (
                  <>
                    <span className="text-zinc-500 font-medium">السنة الدراسية:</span>
                    <span className="font-bold">{config.schoolYear}</span>
                  </>
                )}

                <span className="text-zinc-500 font-medium">المستويات:</span>
                <span className="font-extrabold text-[#064e3b]">
                  {assignedLevels.length > 0 ? assignedLevels.join(' ، ') : '—'}
                </span>

                <span className="text-zinc-500 font-medium">الأقسام المسندة:</span>
                <span className="font-bold">
                  {assignedSectionsList.length > 0 ? assignedSectionsList.join(' • ') : '—'}
                </span>
              </div>
            </div>

            <div className="bg-[#f0fdf4] border border-emerald-200 rounded-xl p-3.5 space-y-2">
              <div className="text-[12px] font-extrabold text-[#064e3b] border-b border-emerald-200 pb-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#16a34a]" />
                <span>ملخص الحجم الساعي والسنوات المسندة:</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-zinc-800">
                <div className="flex justify-between items-center bg-white px-2 py-1 rounded border border-emerald-100">
                  <span>إجمالي الحصص الأسبوعية:</span>
                  <b className="text-[#064e3b] font-mono text-[12px]">{totalFilledTimetableSlots} حصة/أسبوع</b>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {assignedLevels.map((lvl) => (
                    <span
                      key={lvl}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        lvl === '4م'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : lvl === '3م'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : lvl === '2م'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {lvl} ({CURRICULUM_DATABASE[lvl]?.length || 0} مورد بالمنهاج)
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-zinc-500 leading-tight pt-1">
                  • يتم تدوين حصص المستويات المسندة حصراً وفق التدرج السنوي المعتمد.
                </div>
              </div>
            </div>
          </div>

          {/* Official Weekly Timetable (استعمال الزمن الأسبوعي الرسمي) */}
          <div className="rounded-xl border border-zinc-300 overflow-hidden mb-4">
            <div className="bg-[#064e3b] text-white px-3 py-2 flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <TableIcon className="w-3.5 h-3.5" />
                جدول استعمال الزمن الأسبوعي للأستاذ (من الأحد إلى الخميس)
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                نظام الدوام بفترتين: صباحية ومسائية
              </span>
            </div>

            <table className="w-full border-collapse text-[10px] leading-4 text-center">
              <thead>
                <tr className="bg-zinc-100 text-zinc-800 font-bold border-b border-zinc-300">
                  <th className="border border-zinc-200 px-2 py-1.5 w-[90px]">التوقيت</th>
                  {WEEK_DAYS.map((day) => (
                    <th key={day} className="border border-zinc-200 px-2 py-1.5 font-bold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Morning Shift */}
                {morningRows.map((row) => (
                  <tr key={row.id} className="hover:bg-amber-50/30">
                    <td className="border border-zinc-200 px-1.5 py-1 font-mono font-bold bg-zinc-50 text-zinc-700">
                      {row.time}
                    </td>
                    {WEEK_DAYS.map((day) => {
                      const cellVal = row.cells[day] || '';
                      const lvl = detectLevelFromSection(cellVal);
                      return (
                        <td key={day} className="border border-zinc-200 px-1 py-1 font-bold">
                          {cellVal ? (
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${
                                lvl === '4م'
                                  ? 'bg-red-50 text-red-800 border-red-200'
                                  : lvl === '3م'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : lvl === '2م'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {cellVal}
                            </span>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Lunch break */}
                <tr className="bg-[#fffbeb] text-amber-900 font-bold text-[9px]">
                  <td colSpan={6} className="border border-amber-200 py-1 text-center">
                    استراحة الغداء 12:00 - 13:30
                  </td>
                </tr>

                {/* Afternoon Shift */}
                {afternoonRows.map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-50/30">
                    <td className="border border-zinc-200 px-1.5 py-1 font-mono font-bold bg-zinc-50 text-zinc-700">
                      {row.time}
                    </td>
                    {WEEK_DAYS.map((day) => {
                      const cellVal = row.cells[day] || '';
                      const lvl = detectLevelFromSection(cellVal);
                      return (
                        <td key={day} className="border border-zinc-200 px-1 py-1 font-bold">
                          {cellVal ? (
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${
                                lvl === '4م'
                                  ? 'bg-red-50 text-red-800 border-red-200'
                                  : lvl === '3م'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : lvl === '2م'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {cellVal}
                            </span>
                          ) : (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cover Page Footer with Stamps */}
        <div className="mt-auto pt-3 border-t border-zinc-200 relative pb-2">
          <div className="grid grid-cols-4 gap-3 text-[10px] text-center mb-3">
            <div>
              <div className="font-bold text-zinc-800">توقيع الأستاذ(ة)</div>
              <div className="mt-5 border-t border-dashed border-zinc-400 h-8" />
            </div>
            <div>
              <div className="font-bold text-zinc-800">ختم الأستاذ(ة)</div>
              <div className="absolute left-3 bottom-2 flex justify-start">
                <TeacherOfficialStamp config={config} size="md" />
              </div>
            </div>
            <div>
              <div className="font-bold text-zinc-800">تأشيرة مدير المؤسسة</div>
              <div className="mt-5 border-t border-dashed border-zinc-400 h-8" />
            </div>
            <div>
              <div className="font-bold text-zinc-800">تأشيرة مفتش المادة</div>
              <div className="mt-5 border-t border-dashed border-zinc-400 h-8" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-2 border-t border-zinc-100">
            <span>الصفحة الأولى (الغلاف واستعمال الزمن الرسمي)</span>
            <span className="font-bold text-zinc-700">صفحة 1 من {getTotalLogbookPages(rows.length)}</span>
            <span>الجمهورية الجزائرية الديمقراطية الشعبية 🇩🇿</span>
          </div>

          <div className="h-1 flex -mx-[1px] mt-2">
            <div className="flex-1 bg-[#006233]" />
            <div className="flex-1 bg-[#D21034]" />
          </div>
        </div>
      </div>
    </div>
  );


  const renderFrontPage = (isPreview = false) => {
    return (
      <div
        key="front-page"
        className={
          isPreview 
            ? "print-page bg-white shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,0,0,0.1)] rounded-[2px] overflow-hidden shrink-0 flex flex-col" 
            : "print-page bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[2px] border border-zinc-200 overflow-hidden mx-auto mb-8 flex flex-col"
        }
        style={{
          width: `${pageDimensions.w}mm`,
          minHeight: `${pageDimensions.h}mm`,
          maxWidth: isPreview ? undefined : '100%',
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(rgba(148,163,184,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.22) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      >
        <div style={{ padding: PAGE_INNER_PADDING }} className="h-full flex flex-col">
          <div className="w-full border-b border-zinc-200 mb-8">
            <div className="h-1 flex">
              <div className="flex-1 bg-[#006233]" />
              <div className="flex-1 bg-[#D21034]" />
            </div>
            <div className="px-5 py-4 text-center space-y-1">
              <div className="font-bold text-[12px] flex items-center justify-center gap-1 text-zinc-900">
                <span>🇩🇿</span> الجمهورية الجزائرية الديمقراطية الشعبية
              </div>
              <div className="text-zinc-700 font-medium text-[12px]">وزارة التربية الوطنية</div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center">
            <div className="text-[26px] font-extrabold text-zinc-900 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#006233] text-white grid place-items-center"><BookOpen className="w-4 h-4" /></div>
              الدفتر اليومي
              <div className="w-8 h-8 rounded-full bg-[#D21034] text-white grid place-items-center"><Calendar className="w-4 h-4" /></div>
            </div>

            <div className="w-full max-w-3xl text-[12px] mb-10 flex flex-wrap justify-center gap-x-6 gap-y-3 bg-[#f9faf6] p-4 border border-zinc-200 rounded-[2px]">
              <span className="flex items-center gap-1.5"><span className="text-zinc-500 font-medium">الأستاذ(ة):</span> <span className="font-bold text-zinc-900">{teacher || '—'}</span></span>
              <span className="flex items-center gap-1.5"><span className="text-zinc-500 font-medium">المادة:</span> <span className="font-bold text-zinc-900">{subject || '—'}</span></span>
              <span className="flex items-center gap-1.5"><span className="text-zinc-500 font-medium">المتوسطة:</span> <span className="font-bold text-zinc-900">{school || '—'}</span></span>
              <span className="flex items-center gap-1.5"><span className="text-zinc-500 font-medium">السنة الدراسية:</span> <span className="font-bold text-zinc-900">{config.schoolYear || ''}</span></span>
              <span className="flex items-center gap-1.5"><span className="text-zinc-500 font-medium">المستويات المسندة:</span> <span className="font-bold text-zinc-900" dir="ltr">{assignedLevels.join(' ، ')}</span></span>
            </div>

            <div className="w-full mb-8">
              <div className="text-[13px] font-bold text-[#064e3b] mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#006233] rounded-full" />
                جدول استعمال الزمن
              </div>
              <table className="w-full border-collapse border border-zinc-200">
                <thead>
                  <tr>
                    <th className="border border-zinc-200 px-2 py-2 text-center w-[80px] bg-[#f0fdf4] font-bold text-[#064e3b] text-[11px]">اليوم \ التوقيت</th>
                    {gridRows.map(r => (
                      <th key={r.id} className="border border-zinc-200 px-2 py-2 text-center font-bold text-[10px] text-zinc-700 bg-[#f9faf6] font-mono">{r.time}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WEEK_DAYS.map((day, idx) => (
                    <tr key={day} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f9faf6]'}>
                      <td className="border border-zinc-200 px-2 py-2 text-center font-bold text-[11px] text-zinc-900 w-[80px]">{day}</td>
                      {gridRows.map(r => {
                        const cellVal = r.cells[day] || '';
                        const lvl = detectLevelFromSection(cellVal);
                        return (
                          <td key={r.id} className="border border-zinc-200 px-1 py-1 text-center font-bold">
                            {cellVal ? (
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${
                                  lvl === '4م'
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : lvl === '3م'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : lvl === '2م'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                {cellVal}
                              </span>
                            ) : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {holidays.length > 0 && (
              <div className="w-full max-w-3xl mx-auto">
                <div className="text-[13px] font-bold text-[#991b1b] mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#D21034] rounded-full" />
                  جدول العطل
                </div>
                <table className="w-full border-collapse border border-zinc-200">
                  <thead>
                    <tr>
                      <th className="border border-zinc-200 px-2 py-2 text-center bg-[#fef2f2] font-bold text-[#991b1b] text-[11px] w-[50%]">العطلة</th>
                      <th className="border border-zinc-200 px-2 py-2 text-center bg-[#f9faf6] font-bold text-zinc-700 text-[11px] w-[25%]">من</th>
                      <th className="border border-zinc-200 px-2 py-2 text-center bg-[#f9faf6] font-bold text-zinc-700 text-[11px] w-[25%]">إلى</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.map((h, idx) => (
                      <tr key={h.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f9faf6]'}>
                        <td className="border border-zinc-200 px-2 py-1.5 text-center font-bold text-[11px] text-zinc-900">{h.label}</td>
                        <td className="border border-zinc-200 px-2 py-1.5 text-center font-mono font-medium text-[10px] text-zinc-700" dir="ltr">{h.start}</td>
                        <td className="border border-zinc-200 px-2 py-1.5 text-center font-mono font-medium text-[10px] text-zinc-700" dir="ltr">{h.end}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ختم الأستاذ + توقيع في الصفحة الأولى — لضمان أن كل صفحة تحتوي الختم */}
          <div className="mt-auto pt-3 border-t border-zinc-200 flex items-end justify-between gap-6 text-[10px]">
            <div className="text-center min-w-[140px]">
              <div className="font-bold text-zinc-800">توقيع الأستاذ(ة)</div>
              <div className="mt-5 border-t border-dashed border-zinc-400 h-7" />
            </div>
            <div className="text-center">
              <div className="font-bold text-zinc-800 mb-1">ختم الأستاذ(ة)</div>
              <div className="flex justify-center">
                <TeacherOfficialStamp config={config} size="sm" />
              </div>
            </div>
            <div className="text-center min-w-[140px]">
              <div className="font-bold text-zinc-800">تأشيرة المؤسسة</div>
              <div className="mt-5 border-t border-dashed border-zinc-400 h-7" />
            </div>
            <div className="font-bold text-zinc-700 whitespace-nowrap">
              صفحة 1 من {getTotalLogbookPages(rows.length)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#ffffff] grid-paper-bg text-zinc-900 selection:bg-[#006233]/20"
      style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        @media print {
          @page { size: A4 ${orientation}; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .grid-paper-bg {
            background-color: #ffffff !important;
            background-image: linear-gradient(rgba(148,163,184,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.22) 1px, transparent 1px) !important;
            background-size: 10px 10px !important;
          }
          .print-page { break-inside: avoid; page-break-inside: avoid; }
        }
        .print-page { direction: rtl; box-sizing: border-box; }
        .writing-grid-cell { background-color: rgba(255,255,255,.90); background-image: linear-gradient(rgba(100,116,139,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.18) 1px, transparent 1px); background-size: 8px 8px; }
        .logbook-grid-cell { background-color: rgba(255,255,255,.90); background-image: linear-gradient(rgba(100,116,139,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.16) 1px, transparent 1px); background-size: 8px 8px; }
        @media print {
  @page { size: A4 portrait; margin: 0 !important; }
  body { margin: 0 !important; padding: 0 !important; background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body > * { visibility: hidden !important; }
  .print-preview-root, .print-preview-root * { visibility: visible !important; }
  .print-preview-root { position: static !important; inset: auto !important; width: 100% !important; height: auto !important; background: #fff !important; overflow: visible !important; display: block !important; }
  .print-preview-root .preview-controls { display: none !important; }
  .print-preview-root .preview-scroll { overflow: visible !important; padding: 0 !important; background: #fff !important; display: block !important; }
  .print-preview-root .preview-scroll > div { transform: none !important; width: auto !important; gap: 0 !important; }
  .print-preview-root .print-page { box-shadow:none !important; margin:0 !important; border:0 !important; width: 210mm !important; height: 297mm !important; min-height: 297mm !important; max-width:none !important; page-break-after: always !important; break-after: page !important; overflow:hidden !important; }
  .print-preview-root .print-page:last-child { page-break-after: auto !important; break-after: auto !important; }
  .print-preview-root.print-orientation-landscape .print-page { width: 297mm !important; height: 210mm !important; min-height: 210mm !important; }
  .no-print { display:none !important; }
  .logbook-table { border-collapse: collapse !important; }
  .writing-grid-cell, .logbook-grid-cell { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
        .cover-page { background-color: #fffdf7; background-image: radial-gradient(circle at 15% 10%, rgba(6,78,59,.08), transparent 28%), radial-gradient(circle at 85% 20%, rgba(210,16,52,.06), transparent 25%), linear-gradient(rgba(120,113,108,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(120,113,108,.035) 1px, transparent 1px); background-size: auto, auto, 18px 18px, 18px 18px; }
        .logbook-table { border-collapse: collapse !important; }
        .logbook-table th, .logbook-table td { border: 1.5px solid #64748b !important; }
        .preview-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .preview-scroll::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        .preview-scroll::-webkit-scrollbar-track { background: #111827; }
        .grid-paper-bg {
          background-color: #ffffff;
          background-image: linear-gradient(rgba(148,163,184,.22) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(148,163,184,.22) 1px, transparent 1px);
          background-size: 10px 10px;
        }
      `}</style>

      {/* Algerian Flag Ribbon at Top */}
      <div className="w-full h-1 flex no-print">
        <div className="flex-1 bg-[#006233]" />
        <div className="flex-1 bg-[#D21034]" />
      </div>

      {/* Header Banner */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[13px] md:text-[15px] font-bold text-zinc-700">
                <span className="text-[18px]">🇩🇿</span> الجمهورية الجزائرية الديمقراطية الشعبية
              </div>
              <div className="text-[13px] font-medium text-zinc-600 pr-7">وزارة التربية الوطنية</div>
              <div className="flex flex-wrap gap-2 mt-3 text-[12px] md:text-[13px] leading-6">
                <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded">
                  مديرية التربية لولاية:{' '}
                  <input
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="bg-transparent border-b border-dashed border-zinc-400 outline-none min-w-[90px] font-bold text-zinc-800"
                    placeholder="الولاية"
                  />
                </span>
                <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded">
                  المتوسطة:{' '}
                  <input
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="bg-transparent border-b border-dashed border-zinc-400 outline-none min-w-[120px] font-bold text-zinc-800"
                    placeholder="المتوسطة"
                  />
                </span>
                <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 px-2 py-1 rounded">
                  الأستاذ(ة):{' '}
                  <input
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    className="bg-transparent border-b border-dashed border-zinc-400 outline-none min-w-[110px] font-bold text-zinc-800"
                    placeholder="الاسم"
                  />
                </span>
                <span className="inline-flex items-center gap-1 bg-[#064e3b] text-white px-2 py-1 rounded font-bold">
                  المادة: العلوم الطبيعية
                </span>
                <span className="inline-flex items-center gap-1 bg-zinc-900 text-white px-2 py-1 rounded font-bold">
                  السنة: {config.schoolYear || ''}
                </span>
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-[22px] md:text-[28px] font-[800] tracking-tight leading-none text-zinc-900">
                الدفتر اليومي - استعمال زمن جدولي
              </h1>
              <p className="text-[13px] font-bold text-[#006233] mt-1">
                ربط تلقائي بالمنهاج وقاعدة بيانات المستويات المسندة للأستاذ
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                A4 • 20 سطر • فلترة ذكية للسنوات المسندة • تسلسل بيداغوجي للموارد
              </p>
            </div>
          </div>
        </div>
        <div className="w-full h-1 flex">
          <div className="flex-1 bg-[#006233]" />
          <div className="flex-1 bg-[#D21034]" />
        </div>
      </header>

      {/* Main Grid: Sidebar + Printable Pages */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-0">
        {/* Sidebar Controls */}
        <aside className="no-print bg-white lg:border-l border-zinc-200 lg:min-h-[calc(100vh-120px)]">
          <div className="p-4 md:p-5 space-y-6">
            
            {/* Dynamic Assigned Levels Detection Banner */}
            <div className="rounded-xl border-2 border-[#064e3b]/20 bg-gradient-to-br from-[#f0fdf4] to-[#e8f5e9] p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#064e3b]">
                  <GraduationCap className="w-4 h-4 text-[#16a34a]" />
                  <span>المستويات المسندة للأستاذ (مكتشفة تلقائياً):</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {assignedLevels.length} مستويات
                </span>
              </div>

              {assignedLevels.length === 0 ? (
                <div className="text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 leading-relaxed font-medium">
                  ⚠️ لم يتم إسناد أي قسم بعد في استعمال الزمن أدناه. أدخل قسماً (مثل 1م1 أو 4م2) لتفعيله آلياً في الدفتر.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {assignedLevels.map((lvl) => (
                      <span
                        key={lvl}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-extrabold border shadow-2xs ${
                          lvl === '4م'
                            ? 'bg-red-50 border-red-300 text-red-800'
                            : lvl === '3م'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : lvl === '2م'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{LEVEL_NAMES_MAP[lvl]}</span>
                        <span className="text-[10px] font-normal opacity-80">
                          ({CURRICULUM_DATABASE[lvl].length} مورد في القاعدة)
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Hidden / Unassigned Levels Notice */}
                  {(['1م', '2م', '3م', '4م'] as const).some((lvl) => !assignedLevels.includes(lvl)) && (
                    <div className="text-[11px] text-zinc-600 bg-white/70 rounded-lg p-2 border border-emerald-200 flex items-center justify-between">
                      <span>
                        المستويات غير المسندة (محجوبة تلقائياً من الدفتر):{' '}
                        <b>
                          {(['1م', '2م', '3م', '4م'] as const)
                            .filter((lvl) => !assignedLevels.includes(lvl))
                            .join('، ')}
                        </b>
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                <span className="text-zinc-600 font-medium">الأقسام الفعلية:</span>
                <span className="font-bold text-zinc-800 font-mono">
                  {assignedSectionsList.length > 0 ? assignedSectionsList.join(' • ') : '—'}
                </span>
              </div>
            </div>

            {/* Timetable Grid Card with Real-time Binding */}
            <div className="rounded-xl border-2 border-[#064e3b]/15 overflow-hidden shadow-sm">
              <div className="bg-[#064e3b] text-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-extrabold">
                  <TableIcon className="w-4 h-4" />
                  <span>استعمال الزمن - فترتين ثابتتين</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-bold">
                    {totalFilledTimetableSlots} حصة أسبوعياً
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsElementsModalOpen(true)}
                    className="text-[10px] bg-white text-[#064e3b] border px-2.5 py-1 rounded-full font-bold hover:bg-zinc-50 cursor-pointer"
                  >
                    قاعدة المناهج ({assignedLevels.length} مسندة)
                  </button>
                </div>
              </div>

              <div className="p-0 bg-[#fcfcf9]">


                {userAlert && (
                  <div className="m-2 bg-red-50 border border-red-200 text-red-800 text-[11px] font-bold rounded-lg px-3 py-2 flex items-center gap-2 animate-pulse">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{userAlert}</span>
                  </div>
                )}

                {/* Morning Shift */}
                <div className="border-b-2 border-amber-200">
                  <div className="bg-gradient-to-l from-amber-50 to-orange-50 border-b border-amber-200 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-extrabold text-[12px] text-amber-900">
                      <Sun className="w-4 h-4 text-amber-600" />
                      <span>☀️ الفترة الصباحية (08:00-12:00)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMorningRow}
                      className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة صباح</span>
                    </button>
                  </div>

                  <div className="overflow-auto">
                    <table className="w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#92400e] text-white">
                          <th className="border border-[#78350f] px-2 py-1.5 font-bold w-[115px] sticky right-0 bg-[#92400e] z-10">
                            <Clock className="w-3 h-3 inline ml-1" /> التوقيت
                          </th>
                          {WEEK_DAYS.map((day) => (
                            <th
                              key={day}
                              className="border border-[#78350f] px-1 py-1.5 font-bold min-w-[68px] text-center text-[10px]"
                            >
                              {day}
                            </th>
                          ))}
                          <th className="border border-[#78350f] w-[28px]" />
                        </tr>
                      </thead>
                      <tbody>
                        {morningRows.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-3 text-[11px] text-zinc-400">
                              لا توجد حصص صباحية - اضغط إضافة صباح
                            </td>
                          </tr>
                        )}
                        {morningRows.map((row) => (
                          <tr key={row.id} className="bg-white hover:bg-amber-50/60 transition-colors">
                            <td className="border border-zinc-200 p-0.5 sticky right-0 bg-inherit z-10">
                              <select
                                value={row.time}
                                onChange={(e) => handleTimeChange(row.id, e.target.value, 'morning')}
                                className="w-full bg-white border border-amber-200 rounded-md px-1 py-1.5 text-[11px] font-mono font-bold text-center outline-none focus:ring-2 focus:ring-amber-400"
                              >
                                {MORNING_PERIODS.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </td>
                            {WEEK_DAYS.map((day) => {
                              const cellVal = row.cells[day] || '';
                              const lvl = detectLevelFromSection(cellVal);
                              let colorCls = 'bg-white border-zinc-200 text-zinc-700 placeholder:text-zinc-300';
                              if (cellVal) {
                                if (lvl === '4م') colorCls = 'bg-red-50 border-red-200 text-red-800';
                                else if (lvl === '3م') colorCls = 'bg-amber-50 border-amber-200 text-amber-800';
                                else if (lvl === '2م') colorCls = 'bg-blue-50 border-blue-200 text-blue-800';
                                else colorCls = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                              }
                              return (
                                <td key={day} className="border border-zinc-200 p-0.5">
                                  <input
                                    list="sections-list"
                                    value={cellVal}
                                    onChange={(e) => handleCellChange(row.id, day, e.target.value)}
                                    placeholder="—"
                                    className={`w-full rounded-md px-1 py-1.5 text-[11px] font-bold text-center outline-none border focus:ring-2 focus:ring-amber-200 transition ${colorCls}`}
                                  />
                                </td>
                              );
                            })}
                            <td className="border border-zinc-200 p-0.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteGridRow(row.id)}
                                className="w-6 h-6 grid place-items-center rounded hover:bg-white text-zinc-400 hover:text-red-600 transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Lunch Break Banner */}
                <div className="bg-[#fffbeb] border-y-2 border-amber-300 border-dashed py-1.5 px-3 flex items-center justify-center gap-2 text-[11px] font-extrabold text-amber-800">
                  <span>🍽️</span>
                  <span>استراحة الغداء 12:00 - 13:30 - الفترة محجوزة للراحة</span>
                  <span className="text-[9px] bg-white border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                    لا يمكن إضافة 12:30 أو 13:00
                  </span>
                </div>

                {/* Afternoon Shift */}
                <div>
                  <div className="bg-gradient-to-l from-indigo-50 to-violet-50 border-b border-indigo-200 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-extrabold text-[12px] text-indigo-900">
                      <Moon className="w-4 h-4 text-indigo-600" />
                      <span>🌙 الفترة المسائية (13:30-17:30)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAfternoonRow}
                      className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة مساء</span>
                    </button>
                  </div>

                  <div className="overflow-auto">
                    <table className="w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#312e81] text-white">
                          <th className="border border-[#1e1b4b] px-2 py-1.5 font-bold w-[115px] sticky right-0 bg-[#312e81] z-10">
                            <Clock className="w-3 h-3 inline ml-1" /> التوقيت
                          </th>
                          {WEEK_DAYS.map((day) => (
                            <th
                              key={day}
                              className="border border-[#1e1b4b] px-1 py-1.5 font-bold min-w-[68px] text-center text-[10px]"
                            >
                              {day}
                            </th>
                          ))}
                          <th className="border border-[#1e1b4b] w-[28px]" />
                        </tr>
                      </thead>
                      <tbody>
                        {afternoonRows.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-3 text-[11px] text-zinc-400">
                              لا توجد حصص مسائية - اضغط إضافة مساء
                            </td>
                          </tr>
                        )}
                        {afternoonRows.map((row) => (
                          <tr key={row.id} className="bg-white hover:bg-indigo-50/60 transition-colors">
                            <td className="border border-zinc-200 p-0.5 sticky right-0 bg-inherit z-10">
                              <select
                                value={row.time}
                                onChange={(e) => handleTimeChange(row.id, e.target.value, 'afternoon')}
                                className="w-full bg-white border border-indigo-200 rounded-md px-1 py-1.5 text-[11px] font-mono font-bold text-center outline-none focus:ring-2 focus:ring-indigo-300"
                              >
                                {AFTERNOON_PERIODS.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </td>
                            {WEEK_DAYS.map((day) => {
                              const cellVal = row.cells[day] || '';
                              const lvl = detectLevelFromSection(cellVal);
                              let colorCls = 'bg-white border-zinc-200 text-zinc-700 placeholder:text-zinc-300';
                              if (cellVal) {
                                if (lvl === '4م') colorCls = 'bg-red-50 border-red-200 text-red-800';
                                else if (lvl === '3م') colorCls = 'bg-amber-50 border-amber-200 text-amber-800';
                                else if (lvl === '2م') colorCls = 'bg-blue-50 border-blue-200 text-blue-800';
                                else colorCls = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                              }
                              return (
                                <td key={day} className="border border-zinc-200 p-0.5">
                                  <input
                                    list="sections-list"
                                    value={cellVal}
                                    onChange={(e) => handleCellChange(row.id, day, e.target.value)}
                                    placeholder="—"
                                    className={`w-full rounded-md px-1 py-1.5 text-[11px] font-bold text-center outline-none border focus:ring-2 focus:ring-indigo-200 transition ${colorCls}`}
                                  />
                                </td>
                              );
                            })}
                            <td className="border border-zinc-200 p-0.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteGridRow(row.id)}
                                className="w-6 h-6 grid place-items-center rounded hover:bg-white text-zinc-400 hover:text-red-600 transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Level Preset Buttons */}
                <div className="p-2 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <ListFilter className="w-3.5 h-3.5" />
                    نماذج إسناد سريعة:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickAssignPreset(['1م', '4م'])}
                    className="bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px] transition cursor-pointer"
                  >
                    1م + 4م فقط
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAssignPreset(['2م', '3م'])}
                    className="bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px] transition cursor-pointer"
                  >
                    2م + 3م فقط
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAssignPreset(['4م'])}
                    className="bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px] transition cursor-pointer"
                  >
                    4م (BEM) فقط
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAssignPreset(['1م', '2م', '3م', '4م'])}
                    className="bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px] transition cursor-pointer"
                  >
                    الكل (1م-4م)
                  </button>
                </div>

                {/* Timetable Buttons */}
                <div className="p-2.5 bg-zinc-50 border-t border-zinc-200 flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={handleAutoFillGrid}
                    className="inline-flex items-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm transition cursor-pointer"
                  >
                    <Grid3x3 className="w-3.5 h-3.5" />
                    <span>تعبئة شاملة</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearGrid}
                    className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>مسح الجدول</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDefaultGrid}
                    className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>افتراضي</span>
                  </button>
                  <div className="ml-auto text-[10px] text-zinc-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                    <span>الجمعة مستثناة • الفترتين فقط</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Holidays Card */}
            <div className="rounded-xl border border-zinc-200 overflow-hidden">
              <div className="bg-zinc-50 px-4 py-2.5 flex items-center gap-2 text-[13px] font-bold border-b border-zinc-200">
                <Calendar className="w-4 h-4 text-zinc-700" />
                <span>العطل الرسمية + الجمعة</span>
              </div>
              <div className="p-3 space-y-2 max-h-[190px] overflow-auto">
                <div className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-2.5 py-1.5">
                  الجمعة عطلة تلقائية + العطل أدناه محجوبة من التوليد
                </div>
                {holidays.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[11px] border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white"
                  >
                    <span className="font-mono text-[11px] bg-zinc-900 text-white px-1.5 py-0.5 rounded">
                      {h.startDate} {h.endDate && h.endDate !== h.startDate ? ' - ' + h.endDate : ''}
                    </span>
                    <span className="flex-1 font-medium text-zinc-800">{h.label}</span>
                    <button
                      type="button"
                      onClick={() => setHolidays((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-zinc-400 hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-zinc-200 bg-zinc-50 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newHolidayStartDate}
                    onChange={(e) => setNewHolidayStartDate(e.target.value)}
                    className="border border-zinc-200 rounded-lg px-2 py-1.5 text-[12px] bg-white outline-none"
                    title="تاريخ البداية"
                  />
                  <input
                    type="date"
                    value={newHolidayEndDate}
                    onChange={(e) => setNewHolidayEndDate(e.target.value)}
                    className="border border-zinc-200 rounded-lg px-2 py-1.5 text-[12px] bg-white outline-none"
                    title="تاريخ النهاية (اختياري)"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    value={newHolidayLabel}
                    onChange={(e) => setNewHolidayLabel(e.target.value)}
                    placeholder="المناسبة"
                    className="flex-1 border border-zinc-200 rounded-lg px-2 py-1.5 text-[12px] bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddHoliday}
                    className="bg-white border border-zinc-300 rounded-lg px-3 text-[11px] font-bold hover:bg-zinc-50 cursor-pointer"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Generator Card */}
            <div className="rounded-xl border-2 border-[#064e3b]/20 bg-[#f0fdf4] overflow-hidden">
              <div className="px-4 py-2.5 flex items-center gap-2 text-[13px] font-extrabold border-b border-emerald-100 text-[#064e3b]">
                <Sparkles className="w-4 h-4" />
                <span>المولد الذكي وفق المنهاج الوزاري</span>
              </div>
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 mb-1">المدة المطلوبة</label>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full border border-zinc-200 rounded-lg px-2 py-2 text-[12px] font-bold bg-white outline-none"
                    >
                      <option>أسبوع</option>
                      <option>أسبوعين</option>
                      <option>شهر</option>
                      <option>فصل</option>
                      <option>سنة</option>
                    </select>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {period === 'سنة' ? '180 يوم تدريس كامل' : `${targetDaysCount} يوم تقويمي`}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 mb-1">تاريخ بداية الدفتر</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-zinc-200 rounded-lg px-2 py-2 text-[12px] bg-white outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 mb-1">وضعية الصفحة</label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                      className="w-full border border-zinc-200 rounded-lg px-2 py-2 text-[12px] bg-white outline-none font-bold"
                    >
                      <option value="portrait">عمودي</option>
                      <option value="landscape">أفقي</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateSmartLogbook}
                      className="bg-[#064e3b] hover:bg-[#042f24] text-white rounded-xl py-2.5 text-[13px] font-extrabold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>توليد الدفتر الذكي</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenPreview('all')}
                      className="bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl py-2.5 text-[13px] font-extrabold flex items-center justify-center gap-2 shadow-md ring-1 ring-emerald-300/50 transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>👁️ معاينة الطباعة</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview('single')}
                      className="bg-white hover:bg-zinc-50 border-2 border-zinc-900/10 rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>📄 صفحة واحدة (عينة)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRows([]);
                        showToast('تم مسح سجلات الدفتر اليومي');
                      }}
                      className="bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Eraser className="w-4 h-4 text-zinc-600" />
                      <span>مسح الدفتر</span>
                    </button>
                  </div>
                </div>

                {showEmptyWarning && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[12px] font-bold rounded-xl px-3 py-2 text-center animate-pulse">
                    ⚠️ يجب توليد الدفتر أولاً قبل فتح المعاينة
                  </div>
                )}

                {rows.length > 0 && (
                  <div className="text-[11px] text-center bg-white border border-emerald-200 rounded-lg py-2 font-bold text-[#064e3b] space-y-1">
                    <div>
                      {rows.length} حصة • {paginatedPages.length} صفحة • A4 / 18 صفاً • {orientation === 'landscape' ? 'أفقي' : 'عمودي'}
                    </div>
                    <div className="text-[10px] text-zinc-600 font-medium">
                      المستويات المسندة في الدفتر: {levelDistributionSummary}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </aside>

        {/* Main Printable Area */}
        <main className="bg-[#efebe0] p-2 md:p-6 lg:p-8">
          <div id="pages-start" className="no-print mb-4 flex items-center justify-between gap-2 text-[12px] text-zinc-600">
            <div className="flex items-center gap-2">
              <FileStack className="w-4 h-4 text-[#064e3b]" />
              <span>
                معاينة الدفتر اليومي ({paginatedPages.length} صفحة) — A4 • 18 صفاً • {orientation === 'landscape' ? 'أفقي' : 'عمودي'} •{' '}
                {paginatedPages.length > 0 ? formatPageNumberLabel(0, paginatedPages.length) : 'جاهز للتوليد'}
              </span>
            </div>
            {assignedLevels.length > 0 && (
              <span className="bg-white border border-zinc-300 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#064e3b]">
                الأقسام المسندة: {assignedLevels.join('، ')}
              </span>
            )}
          </div>

          {/* Empty State Card */}
          {paginatedPages.length === 0 && (
            <div
              className="bg-white rounded-[20px] border-2 border-dashed border-zinc-300 p-10 text-center shadow-sm mx-auto"
              style={{ width: `${pageDimensions.w}mm`, maxWidth: '100%', minHeight: '340px' }}
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#064e3b] text-white grid place-items-center mb-4 text-[20px]">
                🇩🇿
              </div>
              <h3 className="font-extrabold text-[16px] text-zinc-900">
                الدفتر فارغ حالياً - بانتظار التوليد الذكي
              </h3>
              <p className="text-[12px] text-zinc-600 mt-2 leading-6 max-w-[480px] mx-auto font-medium">
                اضبط جدول الحصص في الشريط الجانبي (المستويات المسندة:{' '}
                <b>{assignedLevels.length > 0 ? assignedLevels.join('، ') : 'أدخل قسماً'}</b>)، ثم اختر المدة واضغط{' '}
                <b className="text-[#064e3b]">«توليد الدفتر الذكي»</b>. لن تظهر في الدفتر إلا السنوات المسندة لك فقط!
              </p>

              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <span className="bg-zinc-900 text-white px-3 py-1 rounded-full text-[11px] font-bold">
                  A4 • 18 صفاً لكل صفحة
                </span>
                <span className="bg-white border border-zinc-300 px-3 py-1 rounded-full text-[11px] font-bold text-zinc-700">
                  ربط بقاعدة بيانات المناهج الوزارية
                </span>
                <span className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-full text-[11px] font-bold">
                  صباح 08-12 | مساء 13:30-17:30
                </span>
              </div>

              <div className="mt-4 inline-flex flex-wrap gap-2 text-[11px]">
                {(['1م', '2م', '3م', '4م'] as const).map((lvl) => {
                  const isAssigned = assignedLevels.includes(lvl);
                  return (
                    <span
                      key={lvl}
                      className={`px-3 py-1 rounded-full border font-bold transition ${
                        isAssigned
                          ? lvl === '4م'
                            ? 'bg-red-50 border-red-300 text-red-800 ring-2 ring-red-200'
                            : lvl === '3م'
                            ? 'bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-200'
                            : lvl === '2م'
                            ? 'bg-blue-50 border-blue-300 text-blue-800 ring-2 ring-blue-200'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-200'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-400 opacity-60'
                      }`}
                    >
                      {lvl}: {CURRICULUM_DATABASE[lvl].length} مورد{' '}
                      {isAssigned ? '(مسندة للأستاذ ✅)' : '(غير مسندة ⛔)'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Render Pages */}
          <div className="space-y-8">
            {renderFrontPage(false)}
            {paginatedPages.map((pageRows, pageIdx) => {
              const tableBodyRows: React.ReactNode[] = [];
              let prevDateStr = '';
              let prevWasMorning = false;
              let prevWeekKey = '';

              pageRows.forEach((r, rowIdx) => {
                const isNewDate = r.dateStr !== prevDateStr;
                const weekKey = getSchoolWeekKey(r.dateStr);
                const isNewWeek = !!prevWeekKey && weekKey !== prevWeekKey;
                const previousRow = rowIdx > 0 ? pageRows[rowIdx - 1] : undefined;
                const displayContent = buildHierarchicalContent(r, previousRow);
                const isMorning = isMorningTime(r.time);
                const isAfternoon = isAfternoonTime(r.time);
                const morningToAfternoonBreak =
                  !isNewDate && prevWasMorning && isAfternoon;
                
                if (isNewWeek) {
                  for (let weekSpaceIdx = 0; weekSpaceIdx < 2; weekSpaceIdx++) {
                    tableBodyRows.push(
                      <tr key={`week-space-${r.id}-${weekSpaceIdx}`} className="bg-white">
                        {Array.from({ length: 8 }).map((_, cellIdx) => (
                          <td
                            key={cellIdx}
                            contentEditable
                            suppressContentEditableWarning
                            className="writing-grid-cell border border-slate-400 h-[34px] outline-none"
                            title="خانة كتابة إضافية بين الأسابيع"
                          />
                        ))}
                      </tr>
                    );
                  }
                } else if (isNewDate && rowIdx > 0) {
                  tableBodyRows.push(
                    <tr key={`divider-${r.id}-day`} className="bg-[#f0f9ff]">
                      <td colSpan={8} className="border-t border-b border-[#bae6fd] h-1.5" />
                    </tr>
                  );
                } else if (morningToAfternoonBreak) {
                  tableBodyRows.push(
                    <tr key={`divider-${r.id}-time`} className="bg-[#fefce8]">
                      <td colSpan={8} className="border-t border-b border-[#fef08a] h-1" />
                    </tr>
                  );
                }

                prevDateStr = r.dateStr;
                prevWeekKey = weekKey;
                if (isMorning) prevWasMorning = true;
                if (isAfternoon) prevWasMorning = false;

                tableBodyRows.push(
                  <tr key={r.id} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#f9faf6]'}>
                    <td className="border border-zinc-200 px-2 py-2 font-bold text-center whitespace-nowrap text-zinc-900 w-[62px]">
                      {r.dayName}
                    </td>
                    <td className="border border-zinc-200 px-1 py-2 text-center font-mono text-[10px] text-zinc-700 w-[84px]">
                      {r.dateStr}
                    </td>
                    <td className="border border-zinc-200 px-2 py-2 text-center font-mono text-[10px] w-[84px]">
                      {r.time}
                    </td>
                    <td className="border border-zinc-200 px-2 py-2 text-center font-bold w-[62px]">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${
                          r.level === '4م'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : r.level === '3م'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : r.level === '2م'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {r.section}
                      </span>
                    </td>
                    <td
                      className="border border-zinc-200 px-3 py-2 text-zinc-900 leading-relaxed text-right whitespace-pre-line align-top"
                      style={{ minHeight: NOTEBOOK_CONTENT_MIN_HEIGHT, height: NOTEBOOK_CONTENT_MIN_HEIGHT }}
                      dangerouslySetInnerHTML={{ __html: displayContent }}
                    />
                    <td className="border border-zinc-200 px-2 py-2 text-zinc-600 text-[10px] w-[50px] text-center">
                      {r.attendance || '—'}
                    </td>
                    <td className="border border-zinc-200 px-2 py-2 text-zinc-600 text-[10px] w-[50px] text-center">
                      {r.wasail || '—'}
                    </td>
                    <td className="border border-zinc-200 px-2 py-2 text-zinc-600 text-[10px] w-[72px] text-center">
                      {r.note || '—'}
                    </td>
                  </tr>
                );
              });

              const emptyRowsCount = Math.max(0, ROWS_PER_PAGE - pageRows.length);
              for (let emptyIdx = 0; emptyIdx < emptyRowsCount; emptyIdx++) {
                tableBodyRows.push(
                  <tr key={`empty-p-${emptyIdx}`} className="bg-white">
                    <td className="border border-zinc-200 h-[36px]" />
                    <td className="logbook-grid-cell border border-zinc-200" />
                    <td className="logbook-grid-cell border border-zinc-200" />
                    <td className="logbook-grid-cell border border-zinc-200" />
                    <td className="logbook-grid-cell border border-zinc-200" />
                    <td className="logbook-grid-cell border border-zinc-200" />
                    <td className="logbook-grid-cell border border-zinc-200" />
                    <td className="logbook-grid-cell border border-zinc-200" />
                  </tr>
                );
              }

              return (
                <div
                  key={pageIdx}
                  className="print-page grid-paper-bg shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[2px] border border-zinc-200 overflow-hidden mx-auto mb-8"
                  style={{
                    width: `${pageDimensions.w}mm`,
                    minHeight: `${pageDimensions.h}mm`,
                    maxWidth: '100%',
                  }}
                >
                  <div style={{ padding: PAGE_INNER_PADDING }} className="h-full flex flex-col justify-between">
                    <div>
                      <div className="border-b border-zinc-200">
                        <div className="h-1 flex">
                          <div className="flex-1 bg-[#006233]" />
                          <div className="flex-1 bg-[#D21034]" />
                        </div>
                        <div className="px-5 py-3 flex justify-between items-start gap-4">
                          <div className="text-[11px] leading-5">
                            <div className="font-bold flex items-center gap-1 text-zinc-900">
                              <span className="text-[#006233]">الجمهورية الجزائرية الديمقراطية الشعبية</span>
                            </div>
                            <div className="text-zinc-700">وزارة التربية الوطنية</div>
                            <div className="text-zinc-600">{config.directorate}</div>
                            <div className="text-zinc-600">المؤسسة: {config.schoolName}</div>
                          </div>
                          <div className="text-center text-[10px] space-y-1 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-lg">
                            <div className="flex flex-col items-center gap-1">
                              <span>
                                الأستاذ: <b>{config.teacherName}</b>
                              </span>
                              <span>
                                المادة: <b>العلوم الطبيعية</b>
                              </span>
                              <span>
                                السنة: <b>{config.schoolYear || ''}</b>
                              </span>
                            </div>
                            <div className="mt-1 text-[10px] text-zinc-500 font-medium">
                              المستويات المسندة: <b>{assignedLevels.join('، ')}</b>
                            </div>
                          </div>
                          <div className="text-left shrink-0 space-y-1">
                            <div className="text-[15px] font-extrabold text-zinc-900">الدفتر اليومي</div>
                            <div className="text-[11px] font-bold text-[#064e3b]">التعليم المتوسط</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-0 flex-1 mt-1">
                        <table className="logbook-table w-full border-collapse text-[11px] leading-5 table-fixed">
                          <thead>
                            <tr className="bg-[#064e3b] text-white">
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[62px]">اليوم</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[84px]">التاريخ</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[84px]">التوقيت</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[62px]">القسم</th>
                              <th className="border border-[#0a3d2e] px-3 py-2 font-bold text-right">محتوى الحصة</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[50px]">الحضور</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[50px]">الوسائل</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[72px]">ملاحظة</th>
                            </tr>
                          </thead>
                          <tbody>{tableBodyRows}</tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="px-4 py-3 border-t border-zinc-200 grid grid-cols-4 gap-4 text-[11px] bg-white">
                        <div className="text-center">
                          <div className="font-bold text-zinc-900">توقيع الأستاذ(ة)</div>
                          <div className="mt-6 border-t border-dashed border-zinc-400 h-10" />
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-zinc-900">ختم الأستاذ(ة)</div>
                          <div className="mt-2 flex justify-center">
                            <TeacherOfficialStamp config={config} size="sm" />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-zinc-900">توقيع المدير</div>
                          <div className="mt-6 border-t border-dashed border-zinc-400 h-10" />
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-zinc-900">توقيع المفتش</div>
                          <div className="mt-6 border-t border-dashed border-zinc-400 h-10" />
                        </div>
                      </div>
                      <div className="px-4 pb-2 flex justify-center items-center border-t border-zinc-100 pt-2">
                        <span className="bg-zinc-900 text-white px-4 py-1 rounded-full font-bold text-[11px]">
                           صفحة {pageIdx + 2} من {getTotalLogbookPages(rows.length)}
                        </span>
                      </div>
                      <div className="h-1 flex -mx-[1px]">
                        <div className="flex-1 bg-[#006233]" />
                        <div className="flex-1 bg-[#D21034]" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Curriculum Database Elements Modal */}
      {isElementsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setIsElementsModalOpen(false)} />
          <div className="relative bg-white rounded-[18px] shadow-2xl w-full max-w-[760px] max-h-[85vh] overflow-hidden border border-zinc-200">
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#064e3b]" />
                <h3 className="font-extrabold text-[15px] text-zinc-900">
                  قاعدة بيانات المناهج والموارد التعليمية
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsElementsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-200/70 hover:bg-zinc-300 grid place-items-center text-zinc-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs inside Modal */}
            <div className="p-4 bg-[#f0fdf4] border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setModalFilterLevel('assigned')}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                    modalFilterLevel === 'assigned'
                      ? 'bg-[#064e3b] text-white shadow-xs'
                      : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  المستويات المسندة فقط ({assignedLevels.length})
                </button>
                <button
                  type="button"
                  onClick={() => setModalFilterLevel('all')}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                    modalFilterLevel === 'all'
                      ? 'bg-[#064e3b] text-white shadow-xs'
                      : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  عرض كافة السنوات (1م، 2م، 3م، 4م)
                </button>
              </div>

              <div className="text-[11px] text-zinc-600 font-medium">
                إجمالي موارد المناهج: <b>87 مورد رسمي</b>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-auto max-h-[60vh] space-y-5">
              {(['1م', '2م', '3م', '4م'] as const)
                .filter((lvl) => (modalFilterLevel === 'assigned' ? assignedLevels.includes(lvl) : true))
                .map((lvl) => {
                  const isAssigned = assignedLevels.includes(lvl);
                  return (
                    <div key={lvl} className="rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
                      <div
                        className={`px-4 py-2.5 font-extrabold text-[13px] flex items-center justify-between ${
                          lvl === '4م'
                            ? 'bg-red-50 text-red-900 border-b border-red-200'
                            : lvl === '3م'
                            ? 'bg-amber-50 text-amber-900 border-b border-amber-200'
                            : lvl === '2م'
                            ? 'bg-blue-50 text-blue-900 border-b border-blue-200'
                            : 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{LEVEL_NAMES_MAP[lvl]}</span>
                          {isAssigned ? (
                            <span className="text-[10px] bg-white text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                              مسند للأستاذ ✅
                            </span>
                          ) : (
                            <span className="text-[10px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full font-medium">
                              غير مسند ⛔
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] bg-white border px-2.5 py-0.5 rounded-full font-bold">
                          {CURRICULUM_DATABASE[lvl].length} مورد تعليمي
                        </span>
                      </div>

                      <div className="divide-y divide-zinc-100 max-h-[220px] overflow-auto">
                        {CURRICULUM_DATABASE[lvl].map((res, resIdx) => (
                          <div key={resIdx} className="px-4 py-2.5 text-[11px] leading-relaxed flex items-start gap-3 hover:bg-zinc-50 transition">
                            <span className="font-mono text-[10px] bg-zinc-900 text-white w-5 h-5 grid place-items-center rounded-full shrink-0 mt-0.5">
                              {resIdx + 1}
                            </span>
                            <div className="flex-1 space-y-0.5">
                              <div className="font-bold text-zinc-900">{res.mawrid}</div>
                              <div className="text-[10px] text-zinc-500">
                                {res.midan} • {res.maqta}
                              </div>
                              {res.activities.length > 0 && (
                                <div className="text-[10px] text-[#064e3b] font-medium">
                                  النشاطات: {res.activities.join(' + ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-[11px] leading-relaxed text-zinc-600">
                <b>آلية الربط البيداغوجي الذكي:</b> عند إدراج قسم في جدول التوقيت (مثل 1م1 أو 4م2)، يستخرج النظام المستوى التعليمي، ويسحب المورد التالي بالترتيب الرسمي من قاعدة بيانات مذكرات علوم الطبيعة والحياة.
                <b> السنوات التي لا تدرسها لن تظهر في دفترك اليومي إطلاقاً</b>، مما يحقق الدقة والتنظيم التام.
              </div>
            </div>

            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsElementsModalOpen(false)}
                className="bg-zinc-900 text-white rounded-xl px-5 py-2 text-[12px] font-bold hover:bg-zinc-800 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Print & Preview Modal */}
      {isPreviewModalOpen && (
        <div className={`fixed inset-0 z-[100] flex flex-col bg-[#1f2937] print-preview-root print-orientation-${orientation}`} dir="rtl">
          {/* Preview Modal Header */}
          <div className="preview-controls h-[56px] bg-[#111827] border-b border-zinc-700 flex items-center justify-between px-3 md:px-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-[#111827] grid place-items-center font-extrabold text-[14px]">
                👁️
              </div>
              <div>
                <div className="text-white font-extrabold text-[13px] md:text-[14px] leading-none flex items-center gap-2">
                  <span>معاينة الطباعة الرسمية - {paginatedPages.length + 1} صفحات</span>
                  {previewMode === 'single' && (
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      صفحة واحدة (عينة)
                    </span>
                  )}
                </div>
                <div className="text-zinc-400 text-[10px] mt-1 hidden md:block">
                  A4 • 20 سطر • المستويات المسندة: {assignedLevels.join('، ') || '—'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              

              <button
                type="button"
                onClick={handleExportWord}
                className="inline-flex items-center gap-1.5 bg-[#0369a1] hover:bg-[#0284c7] text-white px-3 py-1.5 rounded-full text-[11px] font-bold transition shadow-sm cursor-pointer ml-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>تصدير Word</span>
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 bg-[#006233] hover:bg-[#004d28] text-white px-3 py-1.5 rounded-full text-[11px] font-bold transition shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>تصدير PDF</span>
              </button>

              <div className="flex items-center bg-[#1f2937] border border-zinc-600 rounded-full p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((v) => Math.max(50, v - 10))}
                  className="w-7 h-7 grid place-items-center rounded-full hover:bg-zinc-700 text-white transition cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-white min-w-[42px] text-center font-mono">
                  {previewZoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((v) => Math.min(150, v + 10))}
                  className="w-7 h-7 grid place-items-center rounded-full hover:bg-zinc-700 text-white transition cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-8 h-8 grid place-items-center bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Scrollable Stage */}
          <div className="flex-1 overflow-auto preview-scroll p-4 md:p-8 bg-[#1f2937]">
            {paginatedPages.length === 0 ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#111827] border border-zinc-700 grid place-items-center text-[32px] mb-4">
                  📄
                </div>
                <h3 className="text-white font-extrabold text-[18px]">لا يوجد دفتر للمعاينة</h3>
                <p className="text-zinc-400 text-[13px] mt-2 max-w-[320px] leading-6">
                  يجب توليد الدفتر أولاً من لوحة التحكم. اضبط استعمال الزمن والمدة ثم اضغط توليد الدفتر الذكي.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="mt-6 bg-white text-zinc-900 px-6 py-2 rounded-full text-[13px] font-bold cursor-pointer hover:bg-zinc-100"
                >
                  العودة وضبط الجدول
                </button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center gap-8 md:gap-10 w-full"
                style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
              >
                {React.cloneElement(renderCoverFirstPage(), { 'data-preview-export-page': 'true' })}
                {previewPagesToDisplay.map((pageRows, pageIdx) => (
                  <div
                    key={pageIdx}
                    data-preview-export-page="true" className="print-page grid-paper-bg shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,0,0,0.1)] rounded-[2px] overflow-hidden shrink-0"
                    style={{ width: `${pageDimensions.w}mm`, minHeight: `${pageDimensions.h}mm` }}
                  >
                    <div style={{ padding: PAGE_INNER_PADDING }} className="h-full flex flex-col justify-between">
                      {/* Header */}
                      <div>
                        <div className="border-b border-zinc-200">
                          <div className="h-1 flex">
                            <div className="flex-1 bg-[#006233]" />
                            <div className="flex-1 bg-[#D21034]" />
                          </div>
                          <div className="px-5 py-3 flex justify-between items-start gap-4">
                            <div className="text-[11px] leading-5">
                              <div className="font-bold flex items-center gap-1 text-zinc-900">
                                <span>🇩🇿</span> الجمهورية الجزائرية الديمقراطية الشعبية
                              </div>
                              <div className="text-zinc-700 font-medium">وزارة التربية الوطنية</div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-zinc-800">
                                <span>
                                  مديرية: <b>{wilaya}</b>
                                </span>
                                <span>
                                  متوسطة: <b>{school}</b>
                                </span>
                                <span>
                                  الأستاذ: <b>{teacher}</b>
                                </span>
                                <span>
                                  المادة: <b>العلوم الطبيعية</b>
                                </span>
                                <span>
                                  السنة: <b>{config.schoolYear || ''}</b>
                                </span>
                              </div>
                              <div className="mt-1 text-[10px] text-zinc-500 font-medium">
                                المستويات المسندة: <b>{assignedLevels.join('، ')}</b> • المدة: {period} • البداية:{' '}
                                {startDate}
                              </div>
                            </div>

                            <div className="text-left shrink-0 space-y-1">
                              <div className="text-[15px] font-extrabold text-zinc-900">الدفتر اليومي</div>
                              <div className="text-[11px] font-bold text-[#064e3b]">التعليم المتوسط</div>
                            </div>
                          </div>
                        </div>

                        {/* Table */}
                        <div className="p-0 flex-1 mt-1">
                          <table className="w-full border-collapse text-[11px] leading-5 table-fixed">
                            <thead>
                              <tr className="bg-[#064e3b] text-white">
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[62px]">اليوم</th>
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[84px]">التاريخ</th>
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[84px]">التوقيت</th>
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[62px]">القسم/الفوج</th>
                                <th className="border border-[#0a3d2e] px-3 py-2 font-bold text-right">محتوى الحصة</th>
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[50px]">الحضور</th>
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[50px]">الوسائل</th>
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[72px]">ملاحظة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pageRows.map((r, rowIdx) => {
                                const previousRow = rowIdx > 0 ? pageRows[rowIdx - 1] : undefined;
                                const isNewWeek = rowIdx > 0 && getSchoolWeekKey(r.dateStr) !== getSchoolWeekKey(pageRows[rowIdx - 1].dateStr);
                                const previewContent = buildHierarchicalContent(r, previousRow);
                                return (
                                  <React.Fragment key={r.id}>
                                    {isNewWeek && (
                                      <>
                                        {[0, 1].map((weekSpaceIdx) => (
                                          <tr key={`preview-week-space-${r.id}-${weekSpaceIdx}`} className="bg-white">
                                            {Array.from({ length: 8 }).map((_, cellIdx) => (
                                              <td
                                                key={cellIdx}
                                                contentEditable
                                                suppressContentEditableWarning
                                                className="logbook-grid-cell border border-slate-400 h-[34px] outline-none"
                                                title="خانة كتابة إضافية بين الأسابيع"
                                              />
                                            ))}
                                          </tr>
                                        ))}
                                      </>
                                    )}
                                    <tr key={r.id} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#f9faf6]'}>
                                  <td className="logbook-grid-cell border border-zinc-200 px-2 py-2 font-bold text-center whitespace-nowrap text-zinc-900">
                                    {r.dayName}
                                  </td>
                                  <td className="writing-grid-cell border border-zinc-200 px-1 py-2 text-center font-mono text-[10px] text-zinc-700">
                                    {r.dateStr}
                                  </td>
                                  <td className="logbook-grid-cell border border-zinc-200 px-2 py-2 text-center font-mono text-[10px]">
                                    {r.time}
                                  </td>
                                  <td className="logbook-grid-cell border border-zinc-200 px-2 py-2 text-center font-bold">
                                    <span
                                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${
                                        r.level === '4م'
                                          ? 'bg-red-50 text-red-800 border-red-200'
                                          : r.level === '3م'
                                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                                          : r.level === '2م'
                                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      }`}
                                    >
                                      {r.section}
                                    </span>
                                  </td>
                                  <td
                                    className="writing-grid-cell border border-zinc-200 px-3 py-2 text-zinc-900 leading-relaxed whitespace-pre-line text-right align-top"
                                    style={{ minHeight: NOTEBOOK_CONTENT_MIN_HEIGHT, height: NOTEBOOK_CONTENT_MIN_HEIGHT }}
                                    dangerouslySetInnerHTML={{ __html: previewContent }}
                                  />
                                  <td className="logbook-grid-cell border border-zinc-200" />
                                  <td className="logbook-grid-cell border border-zinc-200" />
                                  <td className="writing-grid-cell border border-zinc-200 px-2 py-2 text-zinc-600 min-h-[72px]">{r.note}</td>
                                </tr>
                                  </React.Fragment>
                                );
                              })}
                              {Array.from({ length: Math.max(0, ROWS_PER_PAGE - pageRows.length) }).map((_, emptyIdx) => (
                                <tr key={`empty-p-${emptyIdx}`} className="bg-white">
                                  <td className="logbook-grid-cell border border-zinc-200 h-[32px]" />
                                  <td className="logbook-grid-cell border border-zinc-200" />
                                  <td className="logbook-grid-cell border border-zinc-200" />
                                  <td className="logbook-grid-cell border border-zinc-200" />
                                  <td className="logbook-grid-cell border border-zinc-200" />
                                  <td className="logbook-grid-cell border border-zinc-200" />
                                  <td className="logbook-grid-cell border border-zinc-200" />
                                  <td className="logbook-grid-cell border border-zinc-200" />
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Official Footer */}
                      <div className="mt-auto relative pb-12">
                        <div className="px-4 py-3 border-t border-zinc-200 grid grid-cols-4 gap-4 text-[11px] bg-white">
                          <div className="text-center">
                            <div className="font-bold text-zinc-900">توقيع الأستاذ(ة)</div>
                            <div className="mt-6 border-t border-dashed border-zinc-400 h-10" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-zinc-900">ختم الأستاذ(ة)</div>
                            <div className="absolute left-3 bottom-3 flex justify-start">
                              <TeacherOfficialStamp config={config} size="md" />
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-zinc-900">توقيع المدير</div>
                            <div className="mt-6 border-t border-dashed border-zinc-400 h-10" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-zinc-900">توقيع المفتش</div>
                            <div className="mt-6 border-t border-dashed border-zinc-400 h-10" />
                          </div>
                        </div>

                        <div className="px-4 pb-2 flex justify-center items-center border-t border-zinc-100 pt-2">
                          <span className="bg-zinc-900 text-white px-4 py-1 rounded-full font-bold text-[11px]">
                            {formatPageNumberLabel(previewMode === 'single' ? 1 : pageIdx + 1, getTotalLogbookPages(rows.length))}
                          </span>
                        </div>

                        <div className="h-1 flex -mx-[1px]">
                          <div className="flex-1 bg-[#006233]" />
                          <div className="flex-1 bg-[#D21034]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Footer */}
      <footer className="no-print text-center text-[10px] text-zinc-500 py-6 border-t border-zinc-200 bg-white">
        الدفتر اليومي - استعمال زمن جدولي • A4 • 20 سطر • علوم الطبيعة والحياة للطور المتوسط • 🇩🇿 •{' '}
        {totalFilledTimetableSlots} حصة أسبوعياً • {assignedLevels.length} مستويات مسندة
      </footer>
    </div>
  );
};
