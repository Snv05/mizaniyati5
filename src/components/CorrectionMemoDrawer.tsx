import React, { useMemo, useRef, useState } from 'react';
import { ClipboardCheck, FileDown, Printer, Sparkles, X } from 'lucide-react';
import { LessonMemo, MemoConfig } from '../types';
import { askSmartAi } from '../services/smartAi';
import { exportCorrectionMemoToDocx, exportCorrectionMemoToPdf, printCorrectionMemo } from '../utils/correctionMemoExport';

export const CorrectionMemoDrawer: React.FC<{
  isOpen: boolean; onClose: () => void; currentLesson?: LessonMemo | null;
  curriculumLessons?: LessonMemo[]; config?: MemoConfig;
}> = ({ isOpen, onClose, currentLesson, curriculumLessons = [], config }) => {
  const [examType, setExamType] = useState<'فرض'|'اختبار'>('فرض');
  const [title, setTitle] = useState('مذكرة تصحيح الفرض');
  const [examText, setExamText] = useState('');
  const [correction, setCorrection] = useState('');
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const context = useMemo(() => currentLesson ? `المستوى: ${currentLesson.level}\nالميدان: ${currentLesson.midan}\nالمقطع: ${currentLesson.maqta}\nالمورد: ${currentLesson.mawrid}\nتعلم المورد: ${currentLesson.ta3alom}\nالأنشطة: ${currentLesson.anshita.map(a => a.title).join(' | ')}` : 'لا يوجد مورد محدد.', [currentLesson]);

  if (!isOpen) return null;
  const generate = async () => {
    if (!examText.trim()) { setCorrection('ألصق ورقة الفرض أو الاختبار أولاً.'); return; }
    setBusy(true);
    try {
      const r = await askSmartAi({ question: `أنشئ مذكرة تصحيح مستقلة لـ${examType} علوم الطبيعة والحياة.\nالسياق الرسمي:\n${context}\n\nنص ${examType}:\n${examText}\n\nصحح كل تمرين وسؤال بنفس الترتيب. اكتب الإجابة النموذجية، عناصر الإجابة المنتظرة، سلم التنقيط لكل سؤال، والمجموع النهائي. احترم النقاط الموجودة في الورقة. أضف الأخطاء الشائعة وملاحظات التصحيح ومؤشرات الكفاءة عند توفرها. لا تخترع مرجعاً رسمياً؛ عند غموض سؤال اكتب «يحتاج مراجعة الأستاذ». هذه مذكرة تصحيح فقط وليست ورقة تلميذ، وبدون Markdown معقد.`, lesson: currentLesson, curriculum: curriculumLessons });
      setCorrection(r || 'تعذر إنشاء مذكرة التصحيح.')
    } catch { setCorrection('تعذر إنشاء مذكرة التصحيح. تحقق من إعداد الذكاء الاصطناعي.'); }
    finally { setBusy(false); }
  };
  const sheet = previewRef.current;
  return <div className="fixed inset-0 z-[60] bg-black/45 flex justify-end" onClick={onClose}>
    <aside className="w-full max-w-4xl h-full bg-slate-100 shadow-2xl overflow-y-auto" dir="rtl" onClick={e=>e.stopPropagation()}>
      <header className="sticky top-0 z-10 px-5 py-4 bg-gradient-to-l from-teal-900 to-emerald-700 text-white flex justify-between items-center">
        <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center"><ClipboardCheck/></div><div><h2 className="font-black text-lg">مذكرة تصحيح الفرض والاختبار</h2><p className="text-xs text-white/80">وثيقة مستقلة عن المساعد الذكي</p></div></div>
        <button onClick={onClose}><X/></button>
      </header>
      <main className="p-5 space-y-5">
        <section className="bg-white rounded-2xl border p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <select value={examType} onChange={e=>{const v=e.target.value as 'فرض'|'اختبار';setExamType(v);setTitle('مذكرة تصحيح '+v)}} className="border rounded-xl p-3"><option>فرض</option><option>اختبار</option></select>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="border rounded-xl p-3" placeholder="عنوان المذكرة"/>
          </div>
          <textarea value={examText} onChange={e=>setExamText(e.target.value)} rows={9} className="w-full border rounded-xl p-3 leading-7" placeholder="ألصق هنا ورقة الفرض أو الاختبار..."/>
          <button onClick={generate} disabled={busy || !examText.trim()} className="w-full py-3 rounded-xl bg-teal-700 text-white font-black disabled:opacity-40"><Sparkles className="inline w-4 h-4 ml-1"/>{busy?'جاري إنشاء مذكرة التصحيح...':'إنشاء مذكرة التصحيح'}</button>
        </section>
        {correction && <section className="bg-white rounded-2xl border p-3">
          <div ref={previewRef} className="bg-white p-8 min-h-[1120px] text-slate-900" dir="rtl">
            <div className="text-center border-b-2 border-teal-700 pb-4 mb-5"><div className="font-black">الجمهورية الجزائرية الديمقراطية الشعبية</div><div className="font-bold">وزارة التربية الوطنية</div><h1 className="text-2xl font-black text-teal-800 mt-3">{title}</h1><div className="text-sm mt-2">{currentLesson?.level?.toUpperCase()||'—'} • علوم الطبيعة والحياة</div></div>
            <div className="grid grid-cols-2 gap-2 text-sm border rounded-xl p-3 mb-5"><div>المؤسسة: {config?.schoolName||'................'}</div><div>الأستاذ(ة): {config?.teacherName||'................'}</div><div>المورد: {currentLesson?.mawrid||'................'}</div><div>تعلم المورد: {currentLesson?.ta3alom||'................'}</div></div>
            <div className="whitespace-pre-wrap leading-8 text-[14px]">{correction}</div>
            <div className="mt-8 pt-3 border-t text-xs text-slate-500 flex justify-between"><span>مذكرة تصحيح</span><span>مراجعة الأستاذ قبل الاعتماد</span></div>
          </div>
          <div className="flex flex-wrap gap-2 p-3">
            <button onClick={()=>previewRef.current&&printCorrectionMemo(previewRef.current,title)} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"><Printer className="inline w-4 h-4 ml-1"/>طباعة</button>
            <button onClick={()=>previewRef.current&&exportCorrectionMemoToDocx({title,text:correction,config,level:currentLesson?.level})} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"><FileDown className="inline w-4 h-4 ml-1"/>Word قابل للتعديل</button>
            <button onClick={()=>previewRef.current&&exportCorrectionMemoToPdf(previewRef.current,title)} className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold"><FileDown className="inline w-4 h-4 ml-1"/>PDF</button>
          </div>
        </section>}
      </main>
    </aside>
  </div>;
};
