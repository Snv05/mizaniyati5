const fs = require('fs');

let fileContent = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

fileContent = fileContent.replace(
  /<td className="border border-zinc-200 px-3 py-2 text-zinc-900 leading-relaxed text-right">\s*\{r\.content\}\s*<\/td>/g,
  '<td className="border border-zinc-200 px-3 py-2 text-zinc-900 leading-relaxed text-right whitespace-pre-line" dangerouslySetInnerHTML={{ __html: r.content }} />'
);

fileContent = fileContent.replace(
  /<td className="border border-zinc-200 px-3 py-2 text-zinc-900 leading-relaxed">\s*\{r\.content\}\s*<\/td>/g,
  '<td className="border border-zinc-200 px-3 py-2 text-zinc-900 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: r.content }} />'
);

fs.writeFileSync('src/components/DailyLogbook.tsx', fileContent);
console.log('Patched HTML rendering in DailyLogbook.tsx');
