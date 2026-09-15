const fs = require('fs');
let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

// 1. assignedLevels
content = content.replace(/const assignedLevels = useMemo<'1م' \| '2م' \| '3م' \| '4م'\[\]>\(\(\) => \{[\s\S]*?\}, \[gridRows\]\);/g, `const assignedLevels = useMemo<'1م' | '2م' | '3م' | '4م'[]>(() => {
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
  }, [gridRows, config.assignedClasses]);`);

// 2. assignedSectionsList
content = content.replace(/const assignedSectionsList = useMemo<string\[\]>\(\(\) => \{[\s\S]*?\}, \[gridRows\]\);/g, `const assignedSectionsList = useMemo<string[]>(() => {
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
  }, [gridRows, config.assignedClasses]);`);

// Verify replacements:
console.log(content.includes('if (config.assignedClasses && config.assignedClasses.length > 0) {') ? 'REPLACED_MEMOS' : 'FAILED_MEMOS');

fs.writeFileSync('src/components/DailyLogbook.tsx', content, 'utf8');
