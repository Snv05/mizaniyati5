const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

// I need to add "attendance" and "wasail" columns to the logbook table in both the <thead> and <tbody>

const oldThead = `<table className="w-full border-collapse text-[11px] leading-5 table-fixed">
                          <thead>
                            <tr className="bg-[#064e3b] text-white">
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[62px]">اليوم</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[84px]">التاريخ</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[84px]">التوقيت</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[62px]">القسم</th>
                              <th className="border border-[#0a3d2e] px-3 py-2 font-bold text-right">محتوى الحصة</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[72px]">ملاحظة</th>
                            </tr>
                          </thead>`;

const newThead = `<table className="w-full border-collapse text-[11px] leading-5 table-fixed">
                          <thead>
                            <tr className="bg-[#064e3b] text-white">
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[62px]">اليوم</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[84px]">التاريخ</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[84px]">التوقيت</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[62px]">القسم</th>
                              <th className="border border-[#0a3d2e] px-3 py-2 font-bold text-right">محتوى الحصة</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[50px]">الحضور</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[50px]">الوسائل</th>
                              <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[72px]">ملاحظة</th>
                            </tr>
                          </thead>`;

code = code.replace(oldThead, newThead);

const oldRowPush = `tableBodyRows.push(
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
                );`;

const newRowPush = `tableBodyRows.push(
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
                    <td className="border border-zinc-200 px-2 py-2 text-zinc-600 text-[10px] w-[50px] text-center">
                      {r.attendance || '—'}
                    </td>
                    <td className="border border-zinc-200 px-2 py-2 text-zinc-600 text-[10px] w-[50px] text-center">
                      {r.wasail || '—'}
                    </td>
                    <td className="border border-zinc-200 px-2 py-2 text-zinc-600 text-[10px] w-[72px] text-center">
                      {r.note || '—'}
                    </td>
                  </tr>
                );`;

code = code.replace(oldRowPush, newRowPush);

const oldEmptyRowPush = `tableBodyRows.push(
                  <tr key={\`empty-p-\${emptyIdx}\`} className="bg-white">
                    <td className="border border-zinc-200 h-[36px]" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                  </tr>
                );`;

const newEmptyRowPush = `tableBodyRows.push(
                  <tr key={\`empty-p-\${emptyIdx}\`} className="bg-white">
                    <td className="border border-zinc-200 h-[36px]" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                    <td className="border border-zinc-200" />
                  </tr>
                );`;

code = code.replace(oldEmptyRowPush, newEmptyRowPush);


const oldDividerColSpan = `<td colSpan={6} className="border-t border-b border-[#bae6fd] h-1.5" />`;
const newDividerColSpan = `<td colSpan={8} className="border-t border-b border-[#bae6fd] h-1.5" />`;
code = code.replace(oldDividerColSpan, newDividerColSpan);

const oldDividerColSpan2 = `<td colSpan={6} className="border-t border-b border-[#fef08a] h-1" />`;
const newDividerColSpan2 = `<td colSpan={8} className="border-t border-b border-[#fef08a] h-1" />`;
code = code.replace(oldDividerColSpan2, newDividerColSpan2);

fs.writeFileSync('src/components/DailyLogbook.tsx', code);
console.log('Done replacing columns');
