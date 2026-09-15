const fs = require('fs');
let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

// 1. Fix the assignedLevels useMemo
content = content.replace(/const assignedLevels = useMemo<'1م' \| '2م' \| '3م' \| '4م'\[\]>\(\(\) => \{[\s\S]*?\}, \[gridRows\]\);/m, `const assignedLevels = useMemo<'1م' | '2م' | '3م' | '4م'[]>(() => {
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

// 2. Fix the assignedSectionsList useMemo
content = content.replace(/const assignedSectionsList = useMemo<string\[\]>\(\(\) => \{[\s\S]*?\}, \[gridRows\]\);/m, `const assignedSectionsList = useMemo<string[]>(() => {
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

// 3. Remove local state schoolYear
content = content.replace(/const \[schoolYear, setSchoolYear\] = useState<string>\(config.schoolYear \|\| '2025 - 2026'\);/, '');
content = content.replace(/if \(parsed.schoolYear !== undefined\) setSchoolYear\(parsed.schoolYear\);/, '');

// Replace all local variables schoolYear with config.schoolYear
content = content.replace(/\{schoolYear\}/g, '{config.schoolYear || \'2025 - 2026\'}');
content = content.replace(/schoolYear \&\& \(/g, 'config.schoolYear && (');

// Wait, the previous sed might have messed it up, let me checkout from the file backup if possible? 
// No backup. Let's fix the sed replacements if they were applied.
