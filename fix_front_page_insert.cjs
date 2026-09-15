const fs = require('fs');
let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

const frontPageCode = `
  const renderFrontPage = (isPreview = false) => {
    return (
      <div
        key="front-page"
        className={
          isPreview 
            ? "print-page bg-white shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,0,0,0.1)] rounded-[2px] overflow-hidden shrink-0" 
            : "print-page bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[2px] border border-zinc-200 overflow-hidden mx-auto mb-8"
        }
        style={{
          width: \`\${PAGE_DIMENSIONS_MM.w}mm\`,
          minHeight: \`\${PAGE_DIMENSIONS_MM.h}mm\`,
          maxWidth: isPreview ? undefined : '100%',
        }}
      >
        <div style={{ padding: PAGE_INNER_PADDING }} className="h-full flex flex-col items-center">
          <div className="text-center w-full mt-4 mb-10">
             <div className="font-extrabold text-[22px] mb-1">الجمهورية الجزائرية الديمقراطية الشعبية</div>
             <div className="font-bold text-[20px]">وزارة التربية الوطنية</div>
          </div>
          
          <div className="text-[32px] font-black text-zinc-900 border-[3px] border-zinc-900 px-12 py-4 rounded-2xl mb-12 shadow-sm bg-zinc-50">
            الدفتر اليومي
          </div>

          <div className="w-full max-w-xl space-y-5 text-[18px] mb-12 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
             <div className="flex justify-between border-b border-dashed border-zinc-300 pb-3">
               <span className="font-bold text-zinc-500">الأستاذ(ة):</span>
               <span className="font-extrabold text-zinc-900">{teacher || '—'}</span>
             </div>
             <div className="flex justify-between border-b border-dashed border-zinc-300 pb-3">
               <span className="font-bold text-zinc-500">المادة:</span>
               <span className="font-extrabold text-zinc-900">{subject || '—'}</span>
             </div>
             <div className="flex justify-between border-b border-dashed border-zinc-300 pb-3">
               <span className="font-bold text-zinc-500">المتوسطة:</span>
               <span className="font-extrabold text-zinc-900">{school || '—'}</span>
             </div>
             <div className="flex justify-between border-b border-dashed border-zinc-300 pb-3">
               <span className="font-bold text-zinc-500">السنة الدراسية:</span>
               <span className="font-extrabold text-zinc-900">{config.schoolYear || '2025 - 2026'}</span>
             </div>
             <div className="flex justify-between pb-1">
               <span className="font-bold text-zinc-500">المستويات المسندة:</span>
               <span className="font-extrabold text-zinc-900" dir="ltr">{assignedLevels.join(' ، ')}</span>
             </div>
          </div>

          <div className="w-full mb-8 text-[12px]">
            <div className="font-bold text-[18px] mb-4 text-center bg-zinc-800 text-white py-2 rounded-t-lg mx-auto w-max px-8">جدول استعمال الزمن</div>
            <table className="w-full border-collapse border border-zinc-300 shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-zinc-100">
                  <th className="border border-zinc-300 p-2 text-center w-24 font-extrabold text-zinc-700">اليوم \\ التوقيت</th>
                  {gridRows.map(r => (
                    <th key={r.id} className="border border-zinc-300 p-2 text-center font-bold text-[11px] text-zinc-800 bg-zinc-50">{r.time}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEK_DAYS.map(day => (
                  <tr key={day}>
                    <td className="border border-zinc-300 p-2 text-center font-extrabold bg-zinc-100 text-zinc-800">{day}</td>
                    {gridRows.map(r => (
                      <td key={r.id} className="border border-zinc-300 p-1.5 text-center font-bold text-[11px] text-zinc-900 bg-white">
                        {r.cells[day] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {holidays.length > 0 && (
            <div className="w-full text-[12px] mt-6">
              <div className="font-bold text-[18px] mb-4 text-center bg-zinc-800 text-white py-2 rounded-t-lg mx-auto w-max px-8">جدول العطل</div>
              <table className="w-full max-w-xl mx-auto border-collapse border border-zinc-300 shadow-sm rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="border border-zinc-300 p-2 text-center font-extrabold text-zinc-700">العطلة</th>
                    <th className="border border-zinc-300 p-2 text-center font-extrabold text-zinc-700">من</th>
                    <th className="border border-zinc-300 p-2 text-center font-extrabold text-zinc-700">إلى</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map(h => (
                    <tr key={h.id}>
                      <td className="border border-zinc-300 p-2 text-center font-bold bg-white">{h.label}</td>
                      <td className="border border-zinc-300 p-2 text-center font-mono font-bold bg-zinc-50" dir="ltr">{h.start}</td>
                      <td className="border border-zinc-300 p-2 text-center font-mono font-bold bg-zinc-50" dir="ltr">{h.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };
`;

const TARGET = `  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f7f5ef] text-zinc-900 selection:bg-[#006233]/20"
      style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
    >`;

content = content.replace(TARGET, frontPageCode + '\n' + TARGET);

fs.writeFileSync('src/components/DailyLogbook.tsx', content, 'utf8');
