const fs = require('fs');
let content = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

const targetHeader = `<th className="border border-[#0a3d2e] px-3 py-2 font-bold">محتوى الحصة</th>
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[72px]">ملاحظة</th>`;
const replacementHeader = `<th className="border border-[#0a3d2e] px-3 py-2 font-bold text-right">محتوى الحصة</th>
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[50px]">الحضور</th>
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[50px]">الوسائل</th>
                                <th className="border border-[#0a3d2e] px-2 py-2 font-bold w-[72px]">ملاحظة</th>`;

content = content.replace(targetHeader, replacementHeader);

const targetRow = `<td className="border border-zinc-200 px-3 py-2 text-zinc-900 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: r.content }} />
                                  <td className="border border-zinc-200 px-2 py-2 text-zinc-600">{r.note}</td>`;
const replacementRow = `<td className="border border-zinc-200 px-3 py-2 text-zinc-900 leading-relaxed whitespace-pre-line text-right" dangerouslySetInnerHTML={{ __html: r.content }} />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200 px-2 py-2 text-zinc-600">{r.note}</td>`;

content = content.replace(targetRow, replacementRow);

const targetEmptyRow = `<td className="border border-zinc-200 h-[32px]" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />`;
const replacementEmptyRow = `<td className="border border-zinc-200 h-[32px]" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />
                                  <td className="border border-zinc-200" />`;

content = content.replace(targetEmptyRow, replacementEmptyRow);

fs.writeFileSync('src/components/DailyLogbook.tsx', content, 'utf8');
console.log('Patched empty table view to match filled table view');
