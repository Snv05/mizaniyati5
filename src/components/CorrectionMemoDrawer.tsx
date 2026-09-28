import React, { useMemo, useRef, useState } from 'react';
import { ClipboardCheck, FileDown, Printer, Sparkles, X } from 'lucide-react';
import { LessonMemo, MemoConfig } from '../types';
import { generateCorrectionMemo } from '../services/correctionMemoAi';
import { exportCorrectionMemoToDocx, exportCorrectionMemoToPdf, printCorrectionMemo } from '../utils/correctionMemoExport';

export const CorrectionMemoDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentLesson?: LessonMemo | null;
  curriculumLessons?: LessonMemo[];
  config?: MemoConfig;
}> = ({ isOpen, onClose, currentLesson, curriculumLessons = [], config }) => {
  const [examType, setExamType] = useState<'فرض' | 'اختبار'>('فرض');
  const [title, setTitle] = useState('مذكرة تصحيح الفرض');
  const [examText, setExamText] = useState('');
  const [correction, setCorrection] = useState('');
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const context = useMemo(() => currentLesson
    ? [
        `المستوى: ${currentLesson.level}`,
        `الميدان: ${currentLesson.midan}`,
        `المقطع: ${currentLesson.maqta}`,
        `المورد التعلمي: ${currentLesson.mawrid}`,
        `تعلم المورد: ${currentLesson.ta3alom}`,
        `الأنشطة: ${currentLesson.anshita.map(activity => activity.title).join(' | ')}`,
      ].join('\n')
    : 'لا يوجد مورد محدد.', [currentLesson]);

  if (!isOpen) return null;

  const generate = async () => {
    if (!examText.trim()) {
      setCorrection('ألصق ورقة الفرض أو الاختبار أولاً.');
      return;
    }

    setBusy(true);
    setCorrection('');
    try {
      const result = await generateCorrectionMemo({
        examType,
        examText: examText.trim(),
        lesson: currentLesson,
        curriculum: curriculumLessons,
      });
      setCorrection(result || 'تعذر إنشاء مذكرة التصحيح. تحقق من خدمة التوليد ثم أعد المحاولة.');
    } catch {
      setCorrection('تعذر إنشاء مذكرة التصحيح. أعد المحاولة.');
    } finally {
      setBusy(false);
    }
  };

  const clearForm = () => {
    setExamText('');
    setCorrection('');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/45 flex justify-end" onClick={onClose}>
      <aside className="w-full max-w-5xl h-full bg-[#edf9f6] shadow-2xl overflow-y-auto" dir="rtl" onClick={e => e.stopPropagation()}>
        <header className="sticky top-0 z-10 px-5 py-4 bg-gradient-to-l from-teal-900 to-emerald-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center"><ClipboardCheck /></div>
            <div>
              <h2 className="font-black text-lg">مذكرة تصحيح الفرض والاختبار</h2>
              <p className="text-xs text-white/80">أداة مستقلة للتصحيح — منفصلة عن المساعد الذكي العام</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="إغلاق"><X /></button>
        </header>

        <main className="p-4 md:p-6 space-y-5">
          <section className="bg-[#fffdf8] rounded-2xl border border-teal-100 p-4 md:p-5 shadow-sm space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-black text-slate-600">نوع التقييم</span>
                <select value={examType} onChange={e => {
                  const value = e.target.value as 'فرض' | 'اختبار';
                  setExamType(value);
                  setTitle('مذكرة تصحيح ' + value);
                  setCorrection('');
                }} className="w-full border border-teal-100 rounded-xl p-3 bg-white">
                  <option value="فرض">فرض</option>
                  <option value="اختبار">اختبار</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black text-slate-600">عنوان المذكرة</span>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-teal-100 rounded-xl p-3 bg-white" placeholder="عنوان المذكرة" />
              </label>
            </div>

            <div className="rounded-xl bg-teal-50/70 border border-teal-100 p-3 text-sm leading-7">
              <div className="font-black text-teal-900 mb-1">المصدر المرتبط بالتصحيح</div>
              <div>{context}</div>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-black text-slate-600">ورقة الفرض أو الاختبار</span>
              <textarea
                value={examText}
                onChange={e => setExamText(e.target.value)}
                rows={11}
                className="w-full border border-teal-100 rounded-xl p-3 bg-white leading-8"
                placeholder="ألصق هنا نص ورقة الفرض أو الاختبار كاملاً، مع النقاط والوثائق والأسئلة..."
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button onClick={generate} disabled={busy || !examText.trim()} className="flex-1 min-w-[220px] py-3 rounded-xl bg-teal-700 text-white font-black disabled:opacity-40">
                <Sparkles className="inline w-4 h-4 ml-1" />{busy ? 'جاري إعداد مذكرة التصحيح...' : 'إعداد مذكرة التصحيح'}
              </button>
              <button onClick={clearForm} disabled={busy} className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold disabled:opacity-40">
                مسح
              </button>
            </div>
          </section>

          {correction && (
            <section className="bg-[#fffdf8] rounded-2xl border border-teal-100 p-3 shadow-sm">
              <div ref={previewRef} className="bg-white p-6 md:p-8 min-h-[1120px] text-slate-900" dir="rtl">
                <div className="text-center border-b-2 border-teal-700 pb-4 mb-5">
                  <div className="font-black">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                  <div className="font-bold">وزارة التربية الوطنية</div>
                  <h1 className="text-2xl font-black text-teal-800 mt-3">{title}</h1>
                  <div className="text-sm mt-2">{currentLesson?.level?.toUpperCase() || '—'} • علوم الطبيعة والحياة</div>
                </div>

                <div className="grid md:grid-cols-2 gap-2 text-sm border border-teal-100 rounded-xl p-3 mb-5 bg-teal-50/30">
                  <div>المؤسسة: {config?.schoolName || '................'}</div>
                  <div>الأستاذ(ة): {config?.teacherName || '................'}</div>
                  <div>الميدان: {currentLesson?.midan || '................'}</div>
                  <div>المقطع: {currentLesson?.maqta || '................'}</div>
                  <div>المورد التعلمي: {currentLesson?.mawrid || '................'}</div>
                  <div>تعلم المورد: {currentLesson?.ta3alom || '................'}</div>
                </div>

                <div className="whitespace-pre-wrap leading-8 text-[14px]">{correction}</div>

                <div className="mt-8 pt-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between gap-3">
                  <span>مذكرة تصحيح</span>
                  <span>مراجعة الأستاذ قبل الاعتماد</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 p-2.5 no-print rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[11px] font-extrabold text-slate-600 px-1.5">إخراج المذكرة</span>
                <button onClick={() => previewRef.current && printCorrectionMemo(previewRef.current, title)} className="px-3.5 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800">
                  <Printer className="inline w-4 h-4 ml-1" />طباعة
                </button>
                <button onClick={() => previewRef.current && exportCorrectionMemoToPdf(previewRef.current, title)} className="px-3.5 py-2 rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800">
                  <FileDown className="inline w-4 h-4 ml-1" />PDF
                </button>
                <button onClick={() => exportCorrectionMemoToDocx({ title, text: correction, config, level: currentLesson?.level })} className="px-3.5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700">
                  <FileDown className="inline w-4 h-4 ml-1" />Word قابل للتعديل
                </button>
              </div>
            </section>
          )}
        </main>
      </aside>
    </div>
  );
};
