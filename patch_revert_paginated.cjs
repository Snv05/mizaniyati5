const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

const regex = /const rowsPerPage = [\s\S]*?  \}, \[rows, rowsPerPage\]\);/;

const newCode = `const paginatedPages = useMemo(() => {
    const pages: LogEntry[][] = [];
    for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
      pages.push(rows.slice(i, i + ROWS_PER_PAGE));
    }
    return pages;
  }, [rows]);`;

if (regex.test(code)) {
    code = code.replace(regex, newCode);
    fs.writeFileSync('src/components/DailyLogbook.tsx', code);
    console.log("Successfully replaced paginatedPages.");
} else {
    console.log("Could not find paginatedPages regex");
}
