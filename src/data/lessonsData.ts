import { LessonMemo } from '../types';
import { LESSONS_1AM } from './lessons1am';
import { LESSONS_2AM } from './lessons2am';
import { LESSONS_3AM } from './lessons3am';
import { LESSONS_4AM } from './lessons4am';

export const LEVELS = [
  { id: '1am', label: 'السنة الأولى متوسط (1 م)' },
  { id: '2am', label: 'السنة الثانية متوسط (2 م)' },
  { id: '3am', label: 'السنة الثالثة متوسط (3 م)' },
  { id: '4am', label: 'السنة الرابعة متوسط (4 م)' },
] as const;

export const MIDAN_BY_LEVEL: Record<'1am' | '2am' | '3am' | '4am', { id: string; label: string }[]> = {
  '1am': [
    { id: 'الإنسان والصحة', label: 'ميدان الإنسان والصحة' },
    { id: 'الإنسان والمحيط', label: 'ميدان الإنسان والمحيط' },
  ],
  '2am': [
    { id: 'الإنسان والمحيط', label: 'ميدان الإنسان والمحيط' },
  ],
  '3am': [
    { id: 'الإنسان والمحيط', label: 'ميدان الإنسان والمحيط' },
  ],
  '4am': [
    { id: 'الإنسان والصحة', label: 'ميدان الإنسان والصحة' },
  ],
};

const getUniqueMaqati = (lessons: LessonMemo[]): string[] => {
  const unique: string[] = [];
  for (const lesson of lessons) {
    if (!unique.includes(lesson.maqta)) {
      unique.push(lesson.maqta);
    }
  }
  return unique;
};

export const MAQATI_BY_LEVEL: Record<'1am' | '2am' | '3am' | '4am', string[]> = {
  '1am': getUniqueMaqati(LESSONS_1AM),
  '2am': getUniqueMaqati(LESSONS_2AM),
  '3am': getUniqueMaqati(LESSONS_3AM),
  '4am': [
    'المقطع الأول: التغذية عند الإنسان',
    'المقطع الثاني: التنسيق الوظيفي في العضوية',
    'المقطع الثالث: انتقال الصفات الوراثية',
  ],
};

export const LESSONS_DATA: LessonMemo[] = [
  // 1AM (السنة الأولى متوسط)
  ...LESSONS_1AM,

  // 2AM (السنة الثانية متوسط)
  ...LESSONS_2AM,

  // 3AM (السنة الثالثة متوسط)
  ...LESSONS_3AM,

  // 4AM (السنة الرابعة متوسط)
  ...LESSONS_4AM,
];
