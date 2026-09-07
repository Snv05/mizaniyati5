const fs = require('fs');
let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

const getBaseSectionCode = `
  const getBaseSection = (sec: string) => {
    if (!sec) return 'قسم غير محدد';
    return sec.replace(/\\s*\\(?(?:فوج|ف|فـ|g|grp|group)\\s*\\d+\\)?\\s*/gi, '').trim();
  };
`;

const newFunction = `const handleGenerateSmartLogbook = () => {
    if (!startDate) return;

    if (assignedLevels.length === 0) {
      displayUserAlert('يرجى تعبئة حصة واحدة على الأقل في جدول استعمال الزمن لتحديد الأقسام المسندة');
      return;
    }

    const getBaseSection = (sec: string) => {
      if (!sec) return 'قسم غير محدد';
      return sec.replace(/\\s*\\(?(?:فوج|ف|فـ|g|grp|group)\\s*\\d+\\)?\\s*/gi, '').trim();
    };

    const sectionCounters: Record<string, number> = {};
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
        const res = bank[currentResIdx];
        sectionCounters[baseSection] += 1;

        const uniqueSections = Array.from(new Set(sessions.map((s) => s.section || 'قسم غير محدد')));
        const combinedSections = uniqueSections.join(' و ');

        const combinedTimes = sessions.map((s) => s.time).join(' / ');

        generated.push({
          id: \`\${dateStr}-\${baseSection}-\${generated.length}\`,
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
          activitiesList: res.activities,
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
    showToast(\`تم توليد \${generated.length} حصة للسنوات المسندة (\${assignedStr}) بنجاح\`);
    setTimeout(() => {
      document.getElementById('pages-start')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };`;

const startIdx = content.indexOf('const handleGenerateSmartLogbook = () => {');
const endIdx = content.indexOf('const handleExportWord = async () => {');

if (startIdx !== -1 && endIdx > startIdx) {
  content = content.substring(0, startIdx) + newFunction + '\n\n  // Paginate into 20 rows per page\n  ' + content.substring(endIdx);
  fs.writeFileSync('src/components/DailyLogbook.tsx', content);
  console.log('Successfully updated handleGenerateSmartLogbook logic for grouping classes');
} else {
  console.log('Could not find function bounds.');
}
