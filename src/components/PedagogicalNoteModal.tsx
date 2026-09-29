import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  FlaskConical, 
  Languages, 
  Award, 
  Users, 
  BookOpen,
  Loader2,
  RefreshCw,
  Clock,
  Layers,
  FileCheck2,
  Paperclip,
  Image as ImageIcon,
  FileUp,
  Trash2,
  RotateCcw,
  XCircle
} from 'lucide-react';
import { PedagogicalNote, GradeLevel } from '../types/pedagogicalNote';
import { generatePedagogicalNote } from '../services/geminiPedagogicalService';
import { MemoConfig } from '../types';
import { TeacherOfficialStamp } from './TeacherOfficialStamp';
import {
  MemoAttachment,
  fileToMemoAttachment,
  listMemoAttachments,
  saveMemoAttachment,
  deleteMemoAttachment,
  MAX_ATTACHMENT_BYTES,
  MAX_TOTAL_ATTACHMENT_BYTES,
} from '../services/memoAttachmentStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultLevel?: '1am' | '2am' | '3am' | '4am';
  defaultTopic?: string;
  config: MemoConfig;
  showToast: (msg: string) => void;
}

export const PedagogicalNoteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultLevel = '4am',
  defaultTopic = '',
  config,
  showToast,
}) => {
  const mapLevelToGrade = (lvl: string): GradeLevel => {
    if (lvl === '1am') return '1AM';
    if (lvl === '2am') return '2AM';
    if (lvl === '3am') return '3AM';
    return '4AM';
  };

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(() => mapLevelToGrade(defaultLevel));
  const [topic, setTopic] = useState<string>(defaultTopic || 'الهضم في الأنبوب الهضمي ومسارات الامتصاص');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [note, setNote] = useState<PedagogicalNote | null>(null);
  const [activeTab, setActiveTab] = useState<'note' | 'worksheet' | 'json'>('note');
  const [copied, setCopied] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<MemoAttachment[]>([]);
  const [savedAttachments, setSavedAttachments] = useState<MemoAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [useWebResearch, setUseWebResearch] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    listMemoAttachments()
      .then(setSavedAttachments)
      .catch((error) => console.error('[memo-attachments]', error));
  }, [isOpen]);

  const addFiles = async (files: FileList | File[]) => {
    const incoming = Array.from(files);
    for (const file of incoming) {
      try {
        const attachment = await fileToMemoAttachment(file);
        setAttachments((prev) => {
          const nextTotal = prev.reduce((sum, item) => sum + item.size, 0) + attachment.size;
          if (nextTotal > MAX_TOTAL_ATTACHMENT_BYTES) {
            showToast('إجمالي المرفقات يتجاوز 10MB.');
            return prev;
          }
          if (prev.some((item) => item.name === attachment.name && item.size === attachment.size)) {
            showToast('هذا المرفق موجود بالفعل.');
            return prev;
          }
          return [...prev, attachment].slice(0, 6);
        });
        await saveMemoAttachment(attachment);
        setSavedAttachments(await listMemoAttachments());
      } catch (error: any) {
        showToast(error?.message || 'تعذر إضافة المرفق.');
      }
    }
  };

  const restoreSaved = async () => {
    try {
      const saved = await listMemoAttachments();
      setSavedAttachments(saved);
      setAttachments(saved.slice(0, 6));
      showToast(saved.length ? `تم استرداد ${Math.min(saved.length, 6)} مرفقات محفوظة.` : 'لا توجد مرفقات محفوظة للاسترداد.');
    } catch {
      showToast('تعذر استرداد المرفقات المحفوظة.');
    }
  };

  const removeAttachment = async (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const permanentlyDeleteSaved = async (id: string) => {
    await deleteMemoAttachment(id);
    setSavedAttachments((prev) => prev.filter((item) => item.id !== id));
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const imageItem = (Array.from(event.clipboardData.items) as DataTransferItem[]).find((item) => item.type.startsWith('image/'));
    if (!imageItem) return;
    event.preventDefault();
    const blob = imageItem.getAsFile();
    if (blob) {
      const pasted = new File([blob], `صورة-ملصقة-${Date.now()}.png`, { type: blob.type || 'image/png' });
      await addFiles([pasted]);
      showToast('تم لصق الصورة وإضافتها إلى مصادر المذكرة.');
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await addFiles(event.dataTransfer.files);
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('يرجى كتابة عنوان المورد أو الحصة أولاً');
      return;
    }

    setIsLoading(true);
    try {
      const generated = await generatePedagogicalNote(
        selectedGrade,
        topic.trim(),
        attachments.map(({ name, mimeType, size, dataUrl }) => ({ name, mimeType, size, dataUrl })),
        useWebResearch
      );
      setNote(generated);
      showToast('تم توليد المذكرة البيداغوجية الرسمية بنجاح 🌟');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'تعذر توليد المذكرة، يرجى المحاولة ثانية');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!note) return;
    navigator.clipboard.writeText(JSON.stringify(note, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('تم نسخ كود JSON الرسمي للمذكرة');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      dir="rtl"
      onPaste={handlePaste}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl my-4 flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0d544c] via-[#106b61] to-[#0d544c] text-white p-4 sm:p-5 flex items-center justify-between shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 backdrop-blur-md">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                <span>توليد مذكرة بيداغوجية رسمية بالذكاء الاصطناعي</span>
                <span className="text-[11px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full">
                  منهاج الجيل الثاني
                </span>
              </h3>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                توليد مذكرة وزارية متكاملة (الثلاثية، المراحل الأربع، بطاقة العمل الفوجي، شبكة BEM، والكواشف)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Generator Controls Bar */}
        <div className="bg-emerald-50/50 border-b border-emerald-100 p-4 space-y-3 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">المستوى الدراسي:</label>
              <div className="grid grid-cols-4 gap-1">
                {(['1AM', '2AM', '3AM', '4AM'] as GradeLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedGrade(lvl)}
                    className={`py-1.5 text-xs font-black rounded-lg transition cursor-pointer border ${
                      selectedGrade === lvl
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                        : 'bg-white hover:bg-emerald-100 text-emerald-950 border-emerald-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-6 space-y-1">
              <label className="text-xs font-bold text-gray-700 block">المورد التعلمي / عنوان الحصة:</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="مثال: تحولات الأغذية في الأنبوب الهضمي، أو استراتيجيات التكاثر، أو البراكين"
                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 focus:border-emerald-600 outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-black rounded-xl hover:from-emerald-700 hover:to-teal-800 shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>جاري التوليد...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="text-amber-300" />
                    <span>توليد المذكرة الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* مصادر المذكرة: ملفات، صور، لصق من الحافظة، واسترداد محلي */}
          <div className={`rounded-xl border p-3 space-y-2 ${isDragging ? 'border-emerald-500 bg-emerald-100/70' : 'border-gray-200 bg-white'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Paperclip size={15} className="text-emerald-700" />
                <span className="text-xs font-black text-gray-800">مصادر المذكرة</span>
                <span className="text-[10px] text-gray-500">صور وPDF — حتى 6MB للملف و10MB للمجموع</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-black bg-emerald-700 text-white rounded-lg hover:bg-emerald-800">
                  <FileUp size={13} /> إضافة ملف
                </button>
                <button type="button" onClick={restoreSaved} className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-black bg-white text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-50">
                  <RotateCcw size={13} /> استرداد المحفوظ
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                  multiple
                  hidden
                  onChange={(event) => {
                    if (event.target.files) addFiles(event.target.files);
                    event.currentTarget.value = '';
                  }}
                />
              </div>
            </div>

            <div className="border border-dashed border-emerald-200 rounded-lg p-2 text-center text-[10.5px] text-gray-500 bg-emerald-50/30">
              اسحب الملفات هنا أو اضغط <b>Ctrl + V</b>، أو استخدم زر <b>استيراد ملف</b> للصق صورة من الحافظة. المرفقات تحفظ محليًا في جهازك لاسترجاعها بعد إعادة فتح الأداة.
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
                    {item.mimeType.startsWith('image/') ? (
                      <img src={item.dataUrl} alt="" className="w-12 h-12 object-cover rounded-md border" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-red-50 text-red-700 flex items-center justify-center text-[10px] font-black">PDF</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-black text-gray-800 truncate">{item.name}</div>
                      <div className="text-[10px] text-gray-500">{(item.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button type="button" onClick={() => removeAttachment(item.id)} className="p-1 text-gray-400 hover:text-red-600" title="إزالة من التوليد">
                      <XCircle size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {savedAttachments.length > 0 && (
              <details className="text-[10.5px]">
                <summary className="cursor-pointer font-bold text-gray-600">المرفقات المحفوظة على الجهاز ({savedAttachments.length})</summary>
                <div className="mt-2 space-y-1">
                  {savedAttachments.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="truncate flex-1">{item.name}</span>
                      <button type="button" onClick={() => setAttachments((prev) => prev.some(a => a.id === item.id) ? prev : [...prev, item].slice(0, 6))} className="text-emerald-700 font-black">استرداد</button>
                      <button type="button" onClick={() => permanentlyDeleteSaved(item.id)} className="text-red-600" title="حذف نهائي من الجهاز"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Tab Selector & Actions */}
          {note && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200/60">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('note')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                    activeTab === 'note'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  📄 المذكرة البيداغوجية الكاملة
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('worksheet')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                    activeTab === 'worksheet'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  📝 بطاقة العمل الفوجي للتلميذ
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                    activeTab === 'json'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {`{ }`} JSON
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 transition cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'تم النسخ' : 'نسخ JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-2xs cursor-pointer"
                >
                  <Printer size={14} />
                  <span>طباعة / PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body / Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-gray-50/50">
          {!note && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <BookOpen size={32} />
              </div>
              <h4 className="text-base font-black text-gray-800">
                جاهز لتوليد مذكرة بيداغوجية رسمية بالمعايير الجزائرية
              </h4>
              <p className="text-xs text-gray-500 max-w-md">
                اختر المستوى الدراسي (1م، 2م، 3م، 4م)، واكتب موضوع الحصة أو المورد ثم اضغط على زر التوليد لإنشاء المذكرة وبطاقة العمل الفوجي.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <Loader2 size={36} className="animate-spin text-emerald-600" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-emerald-950">
                  جاري صياغة المذكرة البيداغوجية بواسطة Gemini API...
                </h4>
                <p className="text-xs text-gray-500">
                  تطبيق توجيهات المفتشية البيداغوجية لمستوى {selectedGrade} والتحقق من الشيمة المعيارية
                </p>
              </div>
            </div>
          )}

          {note && !isLoading && (
            <div className="print-document bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-gray-900 print:border-none print:shadow-none print:p-0">
              
              {/* TAB 1: Complete Pedagogical Note */}
              {activeTab === 'note' && (
                <div className="space-y-6">
                  {/* Official Header */}
                  <div className="border-b-2 border-emerald-800 pb-4 text-center space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                      <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
                      <span>وزارة التربية الوطنية</span>
                    </div>
                    <h2 className="text-xl font-black text-emerald-900 mt-1">
                      مذكرة بيداغوجية لبناء التعلمات (الجيل الثاني)
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11.5px] font-bold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                      <div>المستوى: <span className="font-black text-emerald-900">{note.meta.gradeLevel}</span></div>
                      <div>الميدان: <span className="font-black text-emerald-900">{note.meta.field}</span></div>
                      <div>المقطع: <span className="font-black text-emerald-900">{note.meta.learningUnit}</span></div>
                      <div>المدة: <span className="font-black text-emerald-900">{note.meta.durationHours} ساعة</span></div>
                      <div className="col-span-2 text-right">المورد: <span className="font-black text-emerald-950">{note.meta.learningResource}</span></div>
                      <div className="col-span-2 text-right">الحصة: <span className="font-black text-emerald-950">{note.meta.lessonTitle}</span></div>
                    </div>

                    <div className="text-right text-xs bg-amber-50/70 border border-amber-200 p-2 rounded-lg font-bold text-amber-950">
                      🎯 مركبة الكفاءة المستهدفة: <span className="font-normal text-gray-800">{note.meta.targetedCompetence}</span>
                    </div>
                  </div>

                  {/* 1. الثلاثية البيداغوجية */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5 border-r-4 border-emerald-600 pr-2">
                      <Layers size={15} /> الثلاثية البيداغوجية لبناء المورد
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-[#f0fdf4] border border-emerald-300 p-3 rounded-xl space-y-1">
                        <span className="font-black text-emerald-900 block">1. المورد المعرفي:</span>
                        <p className="text-gray-700 leading-relaxed">{note.pedagogicalTriad.knowledgeResource}</p>
                      </div>
                      <div className="bg-[#eff6ff] border border-blue-200 p-3 rounded-xl space-y-1">
                        <span className="font-black text-blue-900 block">2. المورد المنهجي:</span>
                        <p className="text-gray-700 leading-relaxed">{note.pedagogicalTriad.methodologicalResource}</p>
                      </div>
                      <div className="bg-[#faf5ff] border border-purple-200 p-3 rounded-xl space-y-1">
                        <span className="font-black text-purple-900 block">3. المورد القيمي والسلوكي:</span>
                        <p className="text-gray-700 leading-relaxed">{note.pedagogicalTriad.valuesResource}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. المتطلبات والوسائل والمصطلحات */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="border border-gray-200 p-3 rounded-xl bg-gray-50/60 space-y-2">
                      <span className="font-black text-gray-800 block">المكتسبات القبلية:</span>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {note.requirements.prerequisites.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                      <span className="font-black text-gray-800 block pt-1 border-t">الوسائل والسندات:</span>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {note.requirements.didacticMeans.map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    </div>

                    {/* المصطلحات العلمية باللغات */}
                    <div className="border border-gray-200 p-3 rounded-xl bg-white space-y-2">
                      <span className="font-black text-gray-800 flex items-center gap-1">
                        <Languages size={14} className="text-indigo-600" /> المصطلحات العلمية باللغتين الفرنسية والإنجليزية:
                      </span>
                      {note.requirements.scientificTerms.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-gray-100 font-bold">
                                <th className="p-1 border">العربية</th>
                                <th className="p-1 border">Français</th>
                                <th className="p-1 border">English</th>
                              </tr>
                            </thead>
                            <tbody>
                              {note.requirements.scientificTerms.map((t, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="p-1 border font-bold text-gray-900">{t.arabic}</td>
                                  <td className="p-1 border font-sans text-gray-700">{t.french}</td>
                                  <td className="p-1 border font-sans text-gray-700">{t.english}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-[11px]">لا توجد مصطلحات خاصة مدخلة.</p>
                      )}
                    </div>
                  </div>

                  {/* 3. التجارب والكواشف الكيميائية (خاصة بالسنة الأولى والثانية أو حسب الحاجة) */}
                  {note.experiments && note.experiments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5 border-r-4 border-amber-600 pr-2">
                        <FlaskConical size={15} /> جدول التجارب والكواشف الكيميائية المعتمدة
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs border border-amber-200 border-collapse">
                          <thead>
                            <tr className="bg-amber-100 text-amber-950 font-black">
                              <th className="p-2 border border-amber-200">المادة الخاضعة للتجربة</th>
                              <th className="p-2 border border-amber-200">الكاشف المستعمل</th>
                              <th className="p-2 border border-amber-200">الملاحظة المتوقعة</th>
                              <th className="p-2 border border-amber-200">الاستنتاج العلمي</th>
                            </tr>
                          </thead>
                          <tbody>
                            {note.experiments.map((exp, idx) => (
                              <tr key={idx} className="hover:bg-amber-50/50">
                                <td className="p-2 border border-amber-200 font-bold">{exp.substanceTested}</td>
                                <td className="p-2 border border-amber-200 font-mono text-emerald-800">{exp.reagentUsed}</td>
                                <td className="p-2 border border-amber-200">{exp.expectedObservation}</td>
                                <td className="p-2 border border-amber-200 font-bold text-gray-900">{exp.scientificConclusion}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 4. مراحل سير الحصة الأربعة */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5 border-r-4 border-emerald-600 pr-2">
                      <Clock size={15} /> سير الحصة التعليمية التعلمية (المراحل الأربع الحتمية)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs border border-gray-300 border-collapse">
                        <thead>
                          <tr className="bg-[#f0fdf4] text-emerald-950 font-black">
                            <th className="p-2 border border-gray-300 w-24">المرحلة</th>
                            <th className="p-2 border border-gray-300 w-16 text-center">المدة</th>
                            <th className="p-2 border border-gray-300">تعليمات ونشاط الأستاذ</th>
                            <th className="p-2 border border-gray-300">نشاط المتعلم والفرضيات</th>
                            <th className="p-2 border border-gray-300 w-32">السندات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {note.sequence.map((stage, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/80">
                              <td className="p-2 border border-gray-300 font-black text-emerald-900 bg-emerald-50/40">
                                {stage.stageName}
                              </td>
                              <td className="p-2 border border-gray-300 font-bold text-center">
                                {stage.timeMinutes} د
                              </td>
                              <td className="p-2 border border-gray-300 text-gray-800 leading-relaxed">
                                {stage.teacherInstructions}
                              </td>
                              <td className="p-2 border border-gray-300 text-gray-800 leading-relaxed">
                                {stage.studentActivities}
                              </td>
                              <td className="p-2 border border-gray-300 text-[11px] text-gray-600">
                                {stage.didacticSupports.join('، ')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 5. شبكة معايير تصحيح وضعية إدماجية متوافقة مع شهادة التعليم المتوسط (BEM) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-purple-900 flex items-center gap-1.5 border-r-4 border-purple-600 pr-2">
                      <Award size={15} /> شبكة معايير تصحيح وضعية إدماجية (معايير شهادة التعليم المتوسط BEM)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="border border-purple-200 bg-purple-50/50 p-3 rounded-xl space-y-1">
                        <span className="font-black text-purple-900 block">1. الوجاهة (الملاءمة):</span>
                        <p className="text-gray-700 leading-relaxed">{note.bemEvaluationGrid.relevance}</p>
                      </div>
                      <div className="border border-purple-200 bg-purple-50/50 p-3 rounded-xl space-y-1">
                        <span className="font-black text-purple-900 block">2. الاستعمال السليم لأدوات المادة:</span>
                        <p className="text-gray-700 leading-relaxed">{note.bemEvaluationGrid.correctUseOfTools}</p>
                      </div>
                      <div className="border border-purple-200 bg-purple-50/50 p-3 rounded-xl space-y-1">
                        <span className="font-black text-purple-900 block">3. الانسجام والتفسير العلمي:</span>
                        <p className="text-gray-700 leading-relaxed">{note.bemEvaluationGrid.coherence}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Teacher Stamp */}
                  <div className="pt-4 border-t flex justify-between items-center text-xs font-bold text-gray-600">
                    <div>متوسطة: {config.schoolName || 'المؤسسة التربوية'}</div>
                    <div className="flex items-center gap-2">
                      <span>ختم الأستاذ(ة):</span>
                      <TeacherOfficialStamp config={config} />
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: Student Worksheet (بطاقة عمل فوجي جاهزة للطباعة) */}
              {activeTab === 'worksheet' && (
                <div className="space-y-5 border-2 border-emerald-600 p-6 rounded-2xl bg-white">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="text-lg font-black text-emerald-950">بطاقة عمل فوجي - مرحلة التقصي والبحث</h3>
                      <p className="text-xs text-gray-500">المستوى: {note.meta.gradeLevel} | المورد: {note.meta.learningResource}</p>
                    </div>
                    <div className="text-left text-xs font-bold text-gray-600 space-y-0.5">
                      <div>الفوج رقم: ............</div>
                      <div>أسماء الأعضاء: ................................................</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-black text-xs text-emerald-900 block">التعليمات والتوجيهات:</span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-800">
                      {note.studentWorksheet.instructions.map((inst, idx) => (
                        <li key={idx} className="font-medium">{inst}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4 pt-2">
                    <span className="font-black text-xs text-emerald-900 block">المهام والأسئلة المطلوبة للإنجاز:</span>
                    {note.studentWorksheet.questionsToAnswer.map((q, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="text-xs font-bold text-gray-900 flex items-start gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 text-[11px] font-black">
                            {idx + 1}
                          </span>
                          <span>{q}</span>
                        </div>
                        <div className="border border-dashed border-gray-300 rounded-xl h-24 p-2 bg-gray-50/40 text-[11px] text-gray-400">
                          تدوين إجابة واستنتاج الفوج هنا...
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center text-xs text-gray-500">
                    <span>مادة علوم الطبيعة والحياة - التعليم المتوسط</span>
                    <span>تقييم الأستاذ: ⚪ ممتاز  ⚪ جيد  ⚪ مقبول  ⚪ بحاجة لتعديل</span>
                  </div>
                </div>
              )}

              {/* TAB 3: JSON Output */}
              {activeTab === 'json' && (
                <div className="space-y-2" dir="ltr">
                  <pre className="p-4 bg-gray-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px]">
                    {JSON.stringify(note, null, 2)}
                  </pre>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-100 border-t border-gray-200 p-3 px-6 flex items-center justify-between print:hidden">
          <span className="text-xs text-gray-500 font-bold">
            مطابق للتوجيهات البيداغوجية الرسمية لوزارة التربية الوطنية بالجزائر
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
