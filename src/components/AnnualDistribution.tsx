import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Printer,
  FileDown,
  Plus,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  Search,
  Check,
  Award,
} from 'lucide-react';
import { AnnualDistributionItem, MemoConfig } from '../types';
import { ANNUAL_DISTRIBUTIONS } from '../data/annualDistributionData';
import { TeacherOfficialStamp } from './TeacherOfficialStamp';
import { OfficialAnnualDistribution } from './OfficialAnnualDistribution';


interface AnnualDistributionProps {
  selectedLevel: '1am' | '2am' | '3am' | '4am';
  setSelectedLevel: (lvl: '1am' | '2am' | '3am' | '4am') => void;
  config: MemoConfig;
  showToast: (msg: string) => void;
}



export const AnnualDistribution: React.FC<AnnualDistributionProps> = ({
  selectedLevel,
  setSelectedLevel,
  config,
  showToast,
}) => {
  if (selectedLevel === '4am' || selectedLevel === '3am' || selectedLevel === '2am' || selectedLevel === '1am') {
    return <OfficialAnnualDistribution level={selectedLevel} config={config} showToast={showToast} />;
  }

  const [items, setItems] = useState<AnnualDistributionItem[]>(() => {
    try {
      const saved = localStorage.getItem('algeria_sciences_annual_dist_v4');
      if (saved) {
        // We always want to merge the latest ANNUAL_DISTRIBUTIONS with any custom items saved by the user
        // This ensures updates to the source code apply to existing users.
        const parsed = JSON.parse(saved);
        const customItems = parsed.filter((it: any) => it.id.startsWith('custom-'));
        const defaultItems = ANNUAL_DISTRIBUTIONS.map(defaultItem => {
          const savedItem = parsed.find((it: any) => it.id === defaultItem.id);
          // Keep status from saved, but content from code
          return savedItem ? { ...defaultItem, status: savedItem.status } : defaultItem;
        });
        return [...defaultItems, ...customItems];
      }
      
      // Migration from v1
      // Legacy storage is intentionally not merged automatically: the v4 key is the single source of truth.
      const oldSaved = null;
      if (oldSaved) {
         const oldItems = JSON.parse(oldSaved);
         const customItems = oldItems.filter((it: any) => it.id.startsWith('custom-'));
         return [...ANNUAL_DISTRIBUTIONS, ...customItems];
      }
    } catch {
      // ignore
    }
    return ANNUAL_DISTRIBUTIONS;
  });

  const [activeTrimester, setActiveTrimester] = useState<number | 'all'>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New item state
  const [newItem, setNewItem] = useState<Partial<AnnualDistributionItem>>({
    level: selectedLevel,
    trimester: 1,
    month: 'أكتوبر',
    weekNumber: 1,
    weekDates: '',
    midan: selectedLevel === '4am' ? 'الإنسان والصحة' : 'الإنسان والمحيط',
    maqta: 'المقطع الأول',
    mawrid: '',
    learningContent: '',
    allocatedHours: 2,
    notes: '',
    status: 'pending',
  });

  // Filter items for current level and trimester and search
  const filteredItems = useMemo(() => {
    return items
      .filter((it) => it.level === selectedLevel)
      .filter((it) => (activeTrimester === 'all' ? true : it.trimester === activeTrimester))
      .filter((it) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          it.mawrid.toLowerCase().includes(q) ||
          it.maqta.toLowerCase().includes(q) ||
          it.learningContent.toLowerCase().includes(q) ||
          it.midan.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }, [items, selectedLevel, activeTrimester, searchQuery]);

  // Statistics for progress
  const stats = useMemo(() => {
    const levelItems = items.filter((it) => it.level === selectedLevel);
    const completed = levelItems.filter((it) => it.status === 'completed').length;
    const total = levelItems.length;
    const totalHours = levelItems.reduce((acc, curr) => acc + (curr.allocatedHours || 2), 0);
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, totalHours, progressPercent };
  }, [items, selectedLevel]);

  const handleStatusToggle = (id: string) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const nextStatus: 'completed' | 'in_progress' | 'pending' =
            item.status === 'completed'
              ? 'in_progress'
              : item.status === 'in_progress'
              ? 'pending'
              : 'completed';
          return { ...item, status: nextStatus };
        }
        return item;
      });
      try {
        localStorage.setItem('algeria_sciences_annual_dist_v4', JSON.stringify(updated));
        if ((window as any).syncToCloud) (window as any).syncToCloud('dist', updated);
      } catch {
        // ignore
      }
      return updated;
    });
    showToast('تم تحديث حالة إنجاز الحصة');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.mawrid || !newItem.learningContent) {
      showToast('يرجى ملء الحقول الإلزامية');
      return;
    }
    const itemToAdd: AnnualDistributionItem = {
      id: `custom-${Date.now()}`,
      level: selectedLevel,
      trimester: newItem.trimester as 1 | 2 | 3,
      month: newItem.month || '',
      weekNumber: Number(newItem.weekNumber) || 0,
      weekDates: newItem.weekDates || '',
      midan: newItem.midan || '',
      maqta: newItem.maqta || '',
      mawrid: newItem.mawrid || '',
      learningContent: newItem.learningContent || '',
      allocatedHours: Number(newItem.allocatedHours) || 0,
      notes: newItem.notes || '',
      status: 'pending',
    };

    setItems((prev) => {
      const updated = [...prev, itemToAdd];
      try {
        localStorage.setItem('algeria_sciences_annual_dist_v4', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setIsAddModalOpen(false);
    showToast('تمت إضافة الأسبوع البيداغوجي للتوزيع السنوي');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    const tableElement = document.getElementById('annual-dist-table');
    if (!tableElement) {
      showToast('تعذر العثور على تدرج التعلمات للتصدير');
      return;
    }

    const levelTitle =
      selectedLevel === '4am'
        ? 'السنة الرابعة متوسط'
        : selectedLevel === '3am'
        ? 'السنة الثالثة متوسط'
        : selectedLevel === '2am'
        ? 'السنة الثانية متوسط'
        : 'السنة الأولى متوسط';

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>تدرج التعلمات - ${levelTitle}</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #444; padding: 6px 8px; font-size: 10.5pt; text-align: right; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header-box { text-align: center; border: 2px solid #c2185b; padding: 10px; margin-bottom: 15px; }
          .title { color: #c2185b; font-size: 14pt; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <p>الجمهورية الجزائرية الديمقراطية الشعبية - وزارة التربية الوطنية</p>
          <p>مديرية التربية لولاية: ${config.directorate} | المؤسسة: ${config.schoolName}</p>
          <p class="title">تدرج التعلمات لمادة علوم الطبيعة والحياة - ${levelTitle}</p>
          <p>السنة الدراسية: ${config.schoolYear} | الأستاذ: ${config.teacherName}</p>
        </div>
        ${tableElement.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], {
      type: 'text/html;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تدرج_التعلمات_${selectedLevel}_${config.schoolYear.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('تم تصدير وثيقة تدرج التعلمات كملف Word');
  };

  const is4am = selectedLevel === '4am';
  const is3am = selectedLevel === '3am';
  const is2am = selectedLevel === '2am';
  const is1am = selectedLevel === '1am';

  const levelTheme = is1am
    ? {
        name: 'السنة الأولى متوسط (1AM)',
        midan: 'ميدان: الإنسان والصحة + الإنسان والمحيط',
        accentColor: '#0284c7',
        btnBg: 'bg-sky-600 hover:bg-sky-700',
        badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
        gradient: 'from-sky-600 to-sky-700',
      }
    : is2am
    ? {
        name: 'السنة الثانية متوسط (2AM)',
        midan: 'ميدان: الإنسان والمحيط',
        accentColor: '#7c3aed',
        btnBg: 'bg-purple-600 hover:bg-purple-700',
        badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
        gradient: 'from-purple-600 to-purple-700',
      }
    : is3am
    ? {
        name: 'السنة الثالثة متوسط (3AM)',
        midan: 'ميدان: الإنسان والمحيط (الدينامية الداخلية للأرض)',
        accentColor: '#ea580c',
        btnBg: 'bg-orange-600 hover:bg-orange-700',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        gradient: 'from-orange-600 to-amber-700',
      }
    : {
        name: 'السنة الرابعة متوسط (4AM - BEM)',
        midan: 'ميدان: الإنسان والصحة',
        accentColor: '#c2185b',
        btnBg: 'bg-[#c2185b] hover:bg-[#ad1457]',
        badgeBg: 'bg-rose-100 text-[#c2185b] border-rose-300',
        gradient: 'from-[#c2185b] to-[#ad1457]',
      };

  const levelName = levelTheme.name;

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4" dir="rtl">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${levelTheme.gradient} text-white flex items-center justify-center shadow-md`}>
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-900">
                تدرج التعلمات للمنهاج البيداغوجي
              </h2>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${levelTheme.badgeBg}`}>
                {levelName}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {levelTheme.midan}
              </span>
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">
              مخطط التدرج السنوي المعتمد من المفتشية العامة للبيداغوجيا ووزارة التربية الوطنية
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            إضافة أسبوع / مورد
          </button>
          <button
            type="button"
            onClick={handleExportWord}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 shadow-xs transition"
          >
            <FileDown className="w-4 h-4" />
            تصدير Word
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[13px] font-bold shadow-sm transition ${levelTheme.btnBg}`}
          >
            <Printer className="w-4 h-4" />
            طباعة تدرج التعلمات
          </button>
        </div>
      </div>

      {/* Progress & Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-gray-400">إجمالي الأسابيع البيداغوجية</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{stats.total} أسبوع</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-gray-400">الحجم الساعي المقدر</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{stats.totalHours} ساعة</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-gray-400">الأسابيع المنجزة</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {stats.completed} من {stats.total}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col justify-center">
          <div className="flex items-center justify-between text-[12px] font-bold mb-1.5">
            <span className="text-gray-500">نسبة التقدم في المنهاج</span>
            <span className="text-[#c2185b] font-black">{stats.progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#c2185b] to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Trimester Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Trimester Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTrimester(1)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition whitespace-nowrap ${
              activeTrimester === 1
                ? 'bg-white text-[#c2185b] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            الثلاثي الأول
          </button>
          <button
            type="button"
            onClick={() => setActiveTrimester(2)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition whitespace-nowrap ${
              activeTrimester === 2
                ? 'bg-white text-[#c2185b] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            الثلاثي الثاني
          </button>
          <button
            type="button"
            onClick={() => setActiveTrimester(3)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition whitespace-nowrap ${
              activeTrimester === 3
                ? 'bg-white text-[#c2185b] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            الثلاثي الثالث
          </button>
          <button
            type="button"
            onClick={() => setActiveTrimester('all')}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition whitespace-nowrap ${
              activeTrimester === 'all'
                ? 'bg-white text-[#c2185b] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            كامل السنة الدراسية
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الموارد، المقاطع، والمحتوى..."
            className="w-full border border-gray-300 rounded-xl pr-9 pl-3.5 py-2 text-[13px] focus:outline-none focus:border-[#c2185b] bg-white font-medium"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Main Table Document */}
      <div id="annual-dist-table" className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Printable Official Header */}
        <div className="p-6 border-b border-gray-200 bg-[#fdfafb] flex flex-col md:flex-row items-center justify-between text-center md:text-right gap-4">
          <div>
            <h3 className="font-black text-[16px] text-gray-900">
              الجمهورية الجزائرية الديمقراطية الشعبية - وزارة التربية الوطنية
            </h3>
            <p className="text-[13px] text-gray-600 font-bold mt-1">
              مديرية التربية لولاية {config.directorate || 'سطيف'} — {config.schoolName || 'المتوسطة'}
            </p>
          </div>
          <div className="border border-[#c2185b]/30 bg-white px-4 py-2 rounded-xl text-center shadow-2xs">
            <span className="text-[11px] font-bold text-gray-400 block">تدرج التعلمات</span>
            <span className="text-[14px] font-extrabold text-[#c2185b] block">{levelName}</span>
            <span className="text-[11.5px] font-bold text-gray-700">الموسم: {config.schoolYear}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-100/80 text-gray-800 text-[12.5px] font-extrabold border-b border-gray-300">
                <th className="p-3 w-12 text-center">الأسبوع</th>
                <th className="p-3 w-28">الشهر / الفترة</th>
                <th className="p-3 w-32">الميدان</th>
                <th className="p-3 w-48">المقطع التعلمي</th>
                <th className="p-3 w-48">المورد المعرفي</th>
                <th className="p-3">المحتوى المعرفي والنشاطات المستهدفة</th>
                <th className="p-3 w-16 text-center">الحجم</th>
                <th className="p-3 w-28 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-[12.5px]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-bold">
                    لا توجد موارد مسجلة تطابق خيارات التصفية الحالية
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isDone = item.status === 'completed';
                  const isInProgress = item.status === 'in_progress';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-pink-50/40 transition duration-150 ${
                        isDone ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="p-3 text-center font-black text-gray-700">
                        {item.weekNumber}
                      </td>
                      <td className="p-3 text-gray-600 font-bold">
                        <div>{item.month}</div>
                        {item.weekDates && (
                          <div className="text-[10.5px] text-gray-400 font-normal mt-0.5">
                            {item.weekDates}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-extrabold text-[#c2185b]">
                        {item.midan}
                      </td>
                      <td className="p-3 font-bold text-gray-800">
                        {item.maqta}
                      </td>
                      <td className="p-3 font-extrabold text-gray-900">
                        {item.mawrid}
                      </td>
                      <td className="p-3 text-gray-700 leading-relaxed whitespace-pre-line">
                        {item.learningContent}
                        {item.notes && (
                          <div className="text-[11px] text-amber-700 font-medium mt-1 bg-amber-50 px-2 py-0.5 rounded inline-block">
                            📌 {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-gray-700">
                        {item.allocatedHours || 2} سا
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(item.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition cursor-pointer ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isInProgress
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-700" />
                              منجز
                            </>
                          ) : isInProgress ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-700" />
                              جاري
                            </>
                          ) : (
                            'متبقي'
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures Footer with Official Stamp */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 text-[12px] font-bold text-gray-700">
          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="block text-[11px] text-gray-500 font-bold mb-0.5">ختم وتوقيع أستاذ(ة) المادة</span>
              <span className="font-extrabold text-[14px] text-gray-900 block">{config.teacherName || 'أستاذ المادة'}</span>
              <span className="text-[11px] text-gray-600">{config.schoolName || 'المتوسطة'} — {config.directorate || 'مديرية التربية'}</span>
            </div>
            <TeacherOfficialStamp
              config={config}
              size="sm"
              color={selectedLevel === '1am' ? 'blue' : selectedLevel === '2am' ? 'purple' : selectedLevel === '3am' ? 'teal' : 'red'}
            />
          </div>

          <div className="text-center border-t md:border-t-0 md:border-r border-gray-200 pt-3 md:pt-0 md:pr-6">
            <span className="block text-[11px] text-gray-500 font-bold mb-1">تأشيرة السيد مدير المؤسسة</span>
            <span className="font-extrabold text-gray-900 block">{config.principalName || 'السيد المدير'}</span>
            <div className="w-32 h-12 border border-dashed border-gray-300 rounded mx-auto mt-1 flex items-center justify-center text-[10px] text-gray-400">
              ختم الإدارة
            </div>
          </div>

          <div className="text-center border-t md:border-t-0 md:border-r border-gray-200 pt-3 md:pt-0 md:pr-6">
            <span className="block text-[11px] text-gray-500 font-bold mb-1">تأشيرة السيد مفتش المادة</span>
            <span className="font-extrabold text-gray-900 block">{config.inspectorName || 'السيد المفتش التربوي'}</span>
            <div className="w-32 h-12 border border-dashed border-gray-300 rounded mx-auto mt-1 flex items-center justify-center text-[10px] text-gray-400">
              ختم التفتيش
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add New Week/Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150" dir="rtl">
            <h3 className="text-lg font-extrabold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              إضافة أسبوع / مورد جديد للتوزيع السنوي
            </h3>

            <form onSubmit={handleAddItem} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">الثلاثي</label>
                  <select
                    value={newItem.trimester}
                    onChange={(e) => setNewItem({ ...newItem, trimester: Number(e.target.value) as 1 | 2 | 3 })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[12.5px] bg-white"
                  >
                    <option value={1}>الثلاثي الأول</option>
                    <option value={2}>الثلاثي الثاني</option>
                    <option value={3}>الثلاثي الثالث</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">رقم الأسبوع</label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={newItem.weekNumber}
                    onChange={(e) => setNewItem({ ...newItem, weekNumber: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[12.5px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">الشهر</label>
                  <input
                    type="text"
                    value={newItem.month}
                    onChange={(e) => setNewItem({ ...newItem, month: e.target.value })}
                    placeholder="مثال: أكتوبر"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[12.5px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">الفترة الزمنية</label>
                  <input
                    type="text"
                    value={newItem.weekDates}
                    onChange={(e) => setNewItem({ ...newItem, weekDates: e.target.value })}
                    placeholder="مثال: 05 أكتوبر - 09 أكتوبر"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[12.5px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">المقطع التعلمي</label>
                <input
                  type="text"
                  value={newItem.maqta}
                  onChange={(e) => setNewItem({ ...newItem, maqta: e.target.value })}
                  placeholder="المقطع 01: ..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[12.5px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">المورد المعرفي</label>
                <input
                  type="text"
                  required
                  value={newItem.mawrid}
                  onChange={(e) => setNewItem({ ...newItem, mawrid: e.target.value })}
                  placeholder="المورد 01: ..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[12.5px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">المحتوى المعرفي والنشاطات المستهدفة</label>
                <textarea
                  rows={2}
                  required
                  value={newItem.learningContent}
                  onChange={(e) => setNewItem({ ...newItem, learningContent: e.target.value })}
                  placeholder="وصف الأنشطة والمفاهيم..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-[12.5px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-[12.5px] font-bold hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c2185b] text-white text-[12.5px] font-extrabold hover:bg-[#ad1457]"
                >
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
