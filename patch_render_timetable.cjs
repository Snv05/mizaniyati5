const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLogbook.tsx', 'utf8');

// I also need to add inputs for attendance and wasail in the activePickerRowId UI block

const oldInputs = `<div className="col-span-12 md:col-span-4 lg:col-span-5">
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                              محتوى الحصة (يدوي)
                            </label>
                            <input
                              type="text"
                              value={r.content}
                              onChange={(e) => updateRow(r.id, 'content', e.target.value)}
                              className="w-full text-[12px] p-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#006233]"
                              placeholder="محتوى الحصة المنجز..."
                            />
                          </div>

                          <div className="col-span-12 md:col-span-4 lg:col-span-3">
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                              ملاحظة (اختياري)
                            </label>
                            <input
                              type="text"
                              value={r.note || ''}
                              onChange={(e) => updateRow(r.id, 'note', e.target.value)}
                              className="w-full text-[12px] p-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400"
                              placeholder="ملاحظات حول سير الحصة..."
                            />
                          </div>`;

const newInputs = `<div className="col-span-12 md:col-span-4 lg:col-span-5">
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                              محتوى الحصة (يدوي)
                            </label>
                            <input
                              type="text"
                              value={r.content}
                              onChange={(e) => updateRow(r.id, 'content', e.target.value)}
                              className="w-full text-[12px] p-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#006233]"
                              placeholder="محتوى الحصة المنجز..."
                            />
                          </div>

                          <div className="col-span-6 md:col-span-2 lg:col-span-2">
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                              الحضور
                            </label>
                            <input
                              type="text"
                              value={r.attendance || ''}
                              onChange={(e) => updateRow(r.id, 'attendance', e.target.value)}
                              className="w-full text-[12px] p-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#006233]"
                              placeholder="الغيابات..."
                            />
                          </div>

                          <div className="col-span-6 md:col-span-2 lg:col-span-2">
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                              الوسائل
                            </label>
                            <input
                              type="text"
                              value={r.wasail || ''}
                              onChange={(e) => updateRow(r.id, 'wasail', e.target.value)}
                              className="w-full text-[12px] p-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#006233]"
                              placeholder="الوسائل المستعملة..."
                            />
                          </div>

                          <div className="col-span-12 md:col-span-4 lg:col-span-3">
                            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                              ملاحظة (اختياري)
                            </label>
                            <input
                              type="text"
                              value={r.note || ''}
                              onChange={(e) => updateRow(r.id, 'note', e.target.value)}
                              className="w-full text-[12px] p-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-400"
                              placeholder="ملاحظات حول سير الحصة..."
                            />
                          </div>`;

code = code.replace(oldInputs, newInputs);
fs.writeFileSync('src/components/DailyLogbook.tsx', code);
console.log('Done inputs replace');
