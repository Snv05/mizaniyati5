const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

const regex = /\{paginatedPages\.map\(\(page, pageIdx\) => \{[\s\S]*?\}\)\}/;

const oldRender = `{paginatedPages.map((pageRows, pageIdx) => {
              const tableBodyRows: React.ReactNode[] = [];
              let prevDateStr = '';
              let prevWasMorning = false;

              pageRows.forEach((r, rowIdx) => {
                const isNewDate = r.dateStr !== prevDateStr;
                const isMorning = isMorningTime(r.time);
                const isAfternoon = isAfternoonTime(r.time);
                const morningToAfternoonBreak =
                  !isNewDate && prevWasMorning && isAfternoon;
                
                if (isNewDate && rowIdx > 0) {
                  tableBodyRows.push(
                    <tr key={\`divider-\${r.id}-day\`} className="bg-[#f0f9ff]">
                      <td colSpan={6} className="border-t border-b border-[#bae6fd] h-1.5" />
                    </tr>
                  );
                } else if (morningToAfternoonBreak) {
                  tableBodyRows.push(
                    <tr key={\`divider-\${r.id}-time\`} className="bg-[#fefce8]">
                      <td colSpan={6} className="border-t border-b border-[#fef08a] h-1" />
                    </tr>
                  );
                }

                prevDateStr = r.dateStr;
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
                        className={\`inline-block px-1.5 py-0.5 rounded text-[10px] border \${
                          r.level === '4م'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : r.level === '3م'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : r.level === '2م'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }\`}
                      >
                        {r.section}
                      </span>
                    </td>
                    <td className="border border-zinc-200 px-3 py-2 text-zinc-900 leading-relaxed text-right">
                      {r.content}
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
                  <tr key={\`empty-p-\${emptyIdx}\`} className="bg-white">
                    <td className="border border-zinc-200 h-[36px]" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                  </tr>
                );
              }

              return (
                <div
                  key={pageIdx}
                  className="print-page bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[2px] border border-zinc-200 overflow-hidden mx-auto mb-8"
                  style={{
                    width: \`\${PAGE_DIMENSIONS_MM.w}mm\`,
                    minHeight: \`\${PAGE_DIMENSIONS_MM.h}mm\`,
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
                                السنة: <b>{config.schoolYear || '2025 - 2026'}</b>
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
                        <table className="w-full border-collapse text-[11px] leading-5 table-fixed">
                          <thead>
                            <tr className="bg-[#064e3b] text-white">
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[62px]">اليوم</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[84px]">التاريخ</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[84px]">التوقيت</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[62px]">القسم</th>
                              <th className="border border-[#0a3d2e] px-3 py-2 font-bold text-right">محتوى الحصة</th>
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
                           {pageIdx + 1}
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
            })}`;

if (regex.test(code)) {
    code = code.replace(regex, oldRender);
    fs.writeFileSync('src/components/DailyLogbook.tsx', code);
    console.log("Successfully reverted render block.");
} else {
    console.log("Regex not found.");
}
