const fs = require('fs');

let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

// Replace imports
content = content.replace(
  /import \{ LESSONS_1AM \} from '\.\.\/data\/lessons1am';\nimport \{ LESSONS_2AM \} from '\.\.\/data\/lessons2am';\nimport \{ LESSONS_3AM \} from '\.\.\/data\/lessons3am';\nimport \{ LESSONS_4AM \} from '\.\.\/data\/lessons4am';/,
  `import { CURRICULUM_1AM, CURRICULUM_2AM, CURRICULUM_3AM, CURRICULUM_4AM, CurriculumSession } from '../data/officialCurriculum';`
);

// We need to rewrite `generateFormattedText` and `CURRICULUM_DATABASE`.
const databaseStartStr = `const generateFormattedText = (l: any) => {`;
const databaseEndStr = `};\n\nconst LEVEL_NAMES_MAP: Record<string, string> = {`;

const startIdx = content.indexOf(databaseStartStr);
const endIdx = content.indexOf(databaseEndStr) + `};\n`.length;

const replacement = `const transformCurriculumToLogbook = (curriculum: CurriculumSession[], levelLabel: '1م' | '2م' | '3م' | '4م'): CurriculumResourceItem[] => {
  const flat: CurriculumResourceItem[] = [];
  curriculum.forEach((item) => {
    if (item.isHoliday) return;
    
    // Helper to build formatted text
    const buildText = (content: string) => {
      let txt = \`<u>الميدان:</u> \${item.midan || ''}\`;
      if (item.maqta) txt += \`\\n<u>المقطع:</u> \${item.maqta}\`;
      if (item.mawrid) txt += \`\\n<u>المورد:</u> \${item.mawrid}\`;
      txt += \`\\n<u>المحتوى:</u> \${content}\`;
      return txt;
    };

    if (item.isExam) {
       if (item.session1) flat.push({ level: levelLabel, memoNumber: '', midan: item.midan || '', maqta: item.maqta || '', mawrid: item.mawrid || '', ta3alom: item.session1, activities: [], formattedText: buildText(item.session1) });
       if (item.session2) flat.push({ level: levelLabel, memoNumber: '', midan: item.midan || '', maqta: item.maqta || '', mawrid: item.mawrid || '', ta3alom: item.session2, activities: [], formattedText: buildText(item.session2) });
       return;
    }

    if (item.session1) {
      flat.push({
        level: levelLabel,
        memoNumber: '',
        midan: item.midan || '',
        maqta: item.maqta || '',
        mawrid: item.mawrid || '',
        ta3alom: item.session1,
        activities: [],
        formattedText: buildText(item.session1)
      });
    }
    if (item.session2) {
      flat.push({
        level: levelLabel,
        memoNumber: '',
        midan: item.midan || '',
        maqta: item.maqta || '',
        mawrid: item.mawrid || '',
        ta3alom: item.session2,
        activities: [],
        formattedText: buildText(item.session2)
      });
    }
  });
  return flat;
};

// ربط مباشر مع قاعدة بيانات التدرج الرسمي
const CURRICULUM_DATABASE: Record<'1م' | '2م' | '3م' | '4م', CurriculumResourceItem[]> = {
  '1م': transformCurriculumToLogbook(CURRICULUM_1AM, '1م'),
  '2م': transformCurriculumToLogbook(CURRICULUM_2AM, '2م'),
  '3م': transformCurriculumToLogbook(CURRICULUM_3AM, '3م'),
  '4م': transformCurriculumToLogbook(CURRICULUM_4AM, '4م'),
};
`;

if (startIdx !== -1 && endIdx > startIdx) {
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/components/DailyLogbook.tsx', content);
  console.log('Successfully patched DailyLogbook.tsx');
} else {
  console.log('Could not find boundaries to replace.');
}

