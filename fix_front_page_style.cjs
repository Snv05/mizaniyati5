const fs = require('fs');
let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

const oldFuncRegex = /const renderFrontPage = \(isPreview = false\) => \{[\s\S]*?\n  \};\n/;

const newFunc = `const renderFrontPage = (isPreview = false) => {
    return (
      <div
        key="front-page"
        className={
          isPreview 
            ? "print-page bg-white shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,0,0,0.1)] rounded-[2px] overflow-hidden shrink-0 flex flex-col" 
            : "print-page bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[2px] border border-zinc-200 overflow-hidden mx-auto mb-8 flex flex-col"
        }
        style={{
          width: \`\${PAGE_DIMENSIONS_MM.w}mm\`,
          minHeight: \`\${PAGE_DIMENSIONS_MM.h}mm\`,
          maxWidth: isPreview ? undefined : '100%',
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
              <span className="flex items-center gap-1.5"><span className="text-zinc-500 font-medium">السنة الدراسية:</span> <span className="font-bold text-zinc-900">{config.schoolYear || '2025 - 2026'}</span></span>
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
                    <th className="border border-zinc-200 px-2 py-2 text-center w-[80px] bg-[#f0fdf4] font-bold text-[#064e3b] text-[11px]">اليوم \\ التوقيت</th>
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
                                className={\`inline-block px-1.5 py-0.5 rounded text-[10px] border \${
                                  lvl === '4م'
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : lvl === '3م'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : lvl === '2م'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }\`}
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
        </div>
      </div>
    );
  };
`;

content = content.replace(oldFuncRegex, newFunc);
fs.writeFileSync('src/components/DailyLogbook.tsx', content, 'utf8');
console.log('Fixed FrontPage in React');
