import React, { useMemo, useState } from 'react';
import { generateDistributionDocx } from "../utils/docxExportDistribution";
import { MemoConfig } from '../types';
import { TeacherOfficialStamp } from './TeacherOfficialStamp';
import { LESSONS_1AM } from '../data/lessons1am';
import { LESSONS_2AM } from '../data/lessons2am';
import { LESSONS_3AM } from '../data/lessons3am';
import { LESSONS_4AM } from '../data/lessons4am';
import { generateAnnualDistribution } from '../utils/annualDistributionGenerator';

import { Printer, FileDown, Eye, X } from 'lucide-react';

interface Props {
  level: "1am" | "2am" | "3am" | "4am";
  config: MemoConfig;
  showToast: (msg: string) => void;
}

export const OfficialAnnualDistribution: React.FC<Props> = ({ level, config, showToast }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [startDate, setStartDate] = useState('2023-09-17');

  // Group by pages based on the midan (Page 1: الإنسان والصحة, Page 2: التنسيق الوظيفي, Page 3: انتقال الصفات)
  
  
  const pages = useMemo(() => {
    let baseLessons = LESSONS_4AM;
    if (level === '2am') baseLessons = LESSONS_2AM;
    if (level === '3am') baseLessons = LESSONS_3AM;
    if (level === '1am') baseLessons = LESSONS_1AM;

    // Use empty holidays array for now, or you could pass config.holidays if added to MemoConfig
    const dynamicCurriculum = generateAnnualDistribution(baseLessons, startDate, [
      { startDate: '2023-10-31', endDate: '2023-11-05', label: 'عطلة الخريف' },
      { startDate: '2023-12-21', endDate: '2024-01-06', label: 'عطلة الشتاء' },
      { startDate: '2024-03-21', endDate: '2024-04-06', label: 'عطلة الربيع' }
    ]);

    if (level === '4am') {
      return [
        dynamicCurriculum.filter(item => item.midan === 'الإنسان والصحة'),
        dynamicCurriculum.filter(item => item.midan === 'التنسيق الوظيفي في العضوية'),
        dynamicCurriculum.filter(item => item.midan === 'انتقال الصفات الوراثية')
      ];
    } else if (level === '1am') {
       return [
         dynamicCurriculum.slice(0, 13),
         dynamicCurriculum.slice(13, 25),
         dynamicCurriculum.slice(25)
       ];
    } else if (level === '2am') {
       // Page 1: September -> November
       // Page 2: December -> March
       // Page 3: March -> May
       return [
         dynamicCurriculum.slice(0, 11),
         dynamicCurriculum.slice(11, 25),
         dynamicCurriculum.slice(25)
       ];
    } else if (level === '3am') {
       return [
         dynamicCurriculum.slice(0, 11),
         dynamicCurriculum.slice(11, 26),
         dynamicCurriculum.slice(26)
       ];
    }
    
    return [dynamicCurriculum];
  }, [startDate, level]);



  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = async () => {
    try {
      const blob = await generateDistributionDocx(pages, config, level, orientation);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `التدرج_السنوي_${level}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast("تم تصدير التدرج السنوي بنجاح (Word)");
    } catch (error) {
      console.error(error);
      showToast("حدث خطأ أثناء التصدير");
    }
    return;
  };

    const DocumentPages = () => (
    <div id="official-distribution-content" className="bg-gray-100 flex flex-col items-center p-4 print:p-0 print:bg-white w-full">
      <style>{`
        @page { size: A4 ${orientation}; margin: 1cm; }
        .editable-cell:hover { background-color: rgba(0,0,0,0.02); }
        .editable-cell:focus { outline: 1px dashed #c2185b; background-color: rgba(255,255,255,0.9); }
      `}</style>

      {pages.map((page, pageIndex) => (
        <div key={pageIndex} className={`bg-white p-[10mm] mb-8 shadow-md print:shadow-none print:m-0 relative ${orientation === 'portrait' ? 'w-[210mm] min-h-[297mm]' : 'w-[297mm] min-h-[210mm]'}`} style={{ pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto' }}>
          
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-sm font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</h1>
            <h2 className="text-sm font-bold mb-2">وزارة التربية والتعليم</h2>
            
            <div className="flex justify-center items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 print:hidden">
                <span className="text-xl">🔬</span>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-black text-black drop-shadow-sm">التدرج السنوي لبناء التعلمات</h1>
                <h3 className="text-sm font-bold text-black mt-1">مادة علوم الطبيعة والحياة - السنة {level === "4am" ? "الرابعة" : level === "3am" ? "الثالثة" : level === "2am" ? "الثانية" : "الأولى"} متوسط</h3>
              </div>
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 print:hidden">
                <span className="text-xl">🧠</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center border border-black p-2 font-bold text-[12px]">
              <div>الأستاذ(ة): <span>{config.teacherName}</span></div>
              <div className="flex items-center gap-2">السنة الدراسية: <span>{config.schoolYear}</span></div>
              <div>متوسطة: <span>{config.schoolName}</span></div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-black text-center text-[10px] leading-tight">
            <thead>
              {level !== '3am' && (
              <tr className="bg-[#f0f0f0]">
                <th colSpan={6} className="border border-black p-2 text-sm font-black">
                  الميــــــدان: {
                    level === '4am' ? (
                      pageIndex === 0 ? 'الإنســـــــان والصحــــــــــــــة' : 
                      pageIndex === 1 ? 'التنســـــــيق الوظيفـــي في العضويـــة' : 
                      'انتقــــــال الصفــــــات الوراثيــــــة'
                    ) : level === '2am' ? 'الإنســـــــان والمحيــــــــــــط' : level === '1am' ? 'الإنســـــــان والصحــــــــــــــة / الإنســـــــان والمحيــــــــــــط' : ''
                  }
                </th>
              </tr>
            )}
              <tr className="bg-[#f8f8f8]">
                <th className="border border-black p-1 w-[8%]">الأشهر</th>
                <th className="border border-black p-1 w-[12%]">الأسابيع</th>
                <th className="border border-black p-1 w-[20%]">المقطع التعلمي</th>
                <th className="border border-black p-1 w-[20%]">المورد المعرفي</th>
                <th className="border border-black p-1 w-[20%]">الحصة الأولى</th>
                <th className="border border-black p-1 w-[20%]">الحصة الثانية</th>
              </tr>
            </thead>
            <tbody>
              {page.map((row, i) => {
                if (row.isHoliday) {
                  return (
                    <tr key={i} className="bg-[#dcfce7] print:bg-[#f0f0f0] font-bold">
                      <td contentEditable suppressContentEditableWarning className="border border-black p-1 editable-cell outline-none">{row.month}</td>
                      <td contentEditable suppressContentEditableWarning className="border border-black p-1 font-mono text-[10px] editable-cell outline-none">{row.dates}</td>
                      <td colSpan={4} contentEditable suppressContentEditableWarning className="border border-black p-1 text-center text-[12px] editable-cell outline-none">{row.holidayLabel}</td>
                    </tr>
                  );
                }

                return (
                  <tr key={i} className={`${row.isExam ? 'bg-[#fdf2f8] print:bg-transparent' : 'hover:bg-gray-50 print:bg-transparent'}`}>
                    <td className="border border-black p-1 font-black whitespace-nowrap align-middle">
                      <div className="flex justify-center items-center h-full">
                        <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} contentEditable suppressContentEditableWarning className="editable-cell outline-none">{row.month}</span>
                      </div>
                    </td>
                    <td contentEditable suppressContentEditableWarning className="border border-black p-1 font-mono text-[10px] font-bold align-middle editable-cell outline-none">{row.dates}</td>
                    <td contentEditable suppressContentEditableWarning className="border border-black p-1 font-bold align-middle editable-cell outline-none">{row.maqta}</td>
                    <td contentEditable suppressContentEditableWarning className="border border-black p-1 font-bold align-middle editable-cell outline-none">{row.mawrid}</td>
                    <td contentEditable suppressContentEditableWarning className="border border-black p-1.5 text-right font-medium align-middle editable-cell outline-none">{row.session1}</td>
                    <td contentEditable suppressContentEditableWarning className="border border-black p-1.5 text-right font-medium align-middle editable-cell outline-none">{row.session2}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer with Signatures */}
          <div className="mt-6 flex justify-between items-start pt-2 px-8 font-bold text-[12px]">
            <div className="text-center w-40">
              <p className="border-b border-gray-300 pb-1">السيد(ة) مدير المتوسطة</p>
              <div className="h-20"></div>
            </div>
            <div className="text-center w-40 relative">
              <p className="border-b border-gray-300 pb-1">أستاذ(ة) المادة</p>
              <div className="h-20 flex justify-center items-center mt-1">
                <TeacherOfficialStamp
              config={config}
              size="sm"
              color={level === '1am' ? 'blue' : level === '2am' ? 'purple' : level === '3am' ? 'teal' : 'red'}
            />
              </div>
            </div>
            <div className="text-center w-40">
              <p className="border-b border-gray-300 pb-1">السيد(ة) مفتش المادة</p>
              <div className="h-20"></div>
            </div>
          </div>

          {/* Page Number */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500">
            الصفحة {pageIndex + 1}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 relative w-full max-w-7xl mx-auto py-6 px-4" dir="rtl">
      
      {/* Control Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        
        <div>
          <h2 className="text-xl font-bold text-[#c2185b]">التدرج السنوي - {level === "4am" ? "4" : level === "3am" ? "3" : level === "2am" ? "2" : "1"} متوسط (الوثيقة الرسمية)</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">يمكنك تعديل أي نص في الجدول بالنقر عليه، ويتم حساب التواريخ تلقائياً</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 border-r pr-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">تاريخ الدخول</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">اتجاه الورقة</label>
            <select 
              value={orientation} 
              onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
              className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
            >
              <option value="portrait">عمودي (Portrait)</option>
              <option value="landscape">أفقي (Landscape)</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">

          <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition">
            <Eye size={18} /> معاينة الطباعة
          </button>
          <button onClick={handleExportWord} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm transition">
            <FileDown size={18} /> Word
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-[#c2185b] text-white rounded-xl font-bold hover:bg-rose-700 shadow-sm transition">
            <Printer size={18} /> طباعة / PDF
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200 print:border-none print:shadow-none print:overflow-visible">
        <DocumentPages />
      </div>

      {/* Full Screen Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col print:hidden">
          {/* Modal Header */}
          <div className="bg-white p-4 flex justify-between items-center shadow-md shrink-0">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Eye className="text-indigo-600" /> معاينة التدرج السنوي (A4 عمودي)
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition">
                <Printer size={18} /> طباعة
              </button>
              <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 flex items-center gap-2 transition">
                <X size={18} /> إغلاق
              </button>
            </div>
          </div>
          
          {/* Modal Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
            {/* Scale wrapper for preview */}
            <div className="origin-top scale-[0.85] md:scale-100 transition-transform">
              <DocumentPages />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
