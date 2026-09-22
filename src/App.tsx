import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer,
  FileDown,
  Eye,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  CalendarDays,
  BookOpenCheck,
  UserCog,
  Database,
  GraduationCap,
  Sparkles,
  School,
  Home,
  ArrowRight,
  Menu,
  Bot,
  Info,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { LessonMemo, MemoConfig } from './types';
import { LEVELS } from './data/lessonsData';
import { SidebarControls } from './components/SidebarControls';
import { MemoSheet } from './components/MemoSheet';
import { PreviewModal } from './components/PreviewModal';
import { AnnualDistribution } from './components/AnnualDistribution';
import { DailyLogbook } from './components/DailyLogbook';
import { AccountSettings } from './components/AccountSettings';
import { LevelsHomePage } from './components/LevelsHomePage';
import { PlatformNavigationDrawer } from './components/PlatformNavigationDrawer';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { PlatformInfoModal } from './components/PlatformInfoModal';
import { InteractiveMaqta1 } from './components/InteractiveMaqta1';
import { UserProfile } from './components/UserProfile';
import { FirebaseDataSync } from './components/FirebaseDataSync';
import { CurriculumDatabaseManager } from './components/CurriculumDatabaseManager';
import { loadCurriculumDatabase } from './data/curriculumDb';

export type MainSectionType = 'home' | '1am' | '2am' | '3am' | '4am' | 'logbook' | 'settings' | 'database';

export const App: React.FC = () => {
  // 0. Primary Navigation State: 'home' (Home page of levels) | '1am' | '2am' | '3am' | '4am' | 'logbook' | 'settings'
  const [activeSection, setActiveSection] = useState<MainSectionType>('home');

  // Sub-view inside the active year: 'memos' (المذكرات البيداغوجية) | 'distribution' (تدرج التعلمات)
  const [yearSubTab, setYearSubTab] = useState<'memos' | 'distribution'>('memos');

  // Drawers and Modals
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [infoModalTab, setInfoModalTab] = useState<'about' | 'contact' | 'guide' | null>(null);

  // Is current section a school year?
  const isYearSection = activeSection === '1am' || activeSection === '2am' || activeSection === '3am' || activeSection === '4am';

  const [curriculumLessons, setCurriculumLessons] = useState<LessonMemo[]>(() => loadCurriculumDatabase());

  useEffect(() => {
    const refresh = () => setCurriculumLessons(loadCurriculumDatabase());
    window.addEventListener('curriculum-db-updated', refresh);
    return () => window.removeEventListener('curriculum-db-updated', refresh);
  }, []);
  
  // Selected Level mapped to active year (default to '4am' if on home/logbook/settings)
  const selectedLevel: '1am' | '2am' | '3am' | '4am' = isYearSection ? activeSection : '4am';

  // Filter lessons by level
  const lessonsForLevel = useMemo(() => {
    return curriculumLessons.filter((l) => l.level === selectedLevel);
  }, [curriculumLessons, selectedLevel]);

  const maqatiForLevel = useMemo(() => Array.from(new Set(lessonsForLevel.map(l => l.maqta).filter(Boolean))), [lessonsForLevel]);

  // 2. Selection states for Memos
  const [selectedMaqta, setSelectedMaqta] = useState<string>('');
  const [selectedMawrid, setSelectedMawrid] = useState<string>('');
  const [selectedTa3alom, setSelectedTa3alom] = useState<string>('');

  // 3. Configuration / Teacher Profile State (Stored in sessionStorage for privacy & auto-cleanup on exit)
  const [config, setConfig] = useState<MemoConfig>(() => {
    try {
      const sessionSaved = sessionStorage.getItem('algeria_sciences_session_config_v3');
      if (sessionSaved) {
        return JSON.parse(sessionSaved);
      }
    } catch {
      // ignore
    }
    return {
      level: '4am',
      schoolName: '',
      directorate: '',
      inspectionDistrict: '',
      teacherName: '',
      teacherGrade: '',
      teacherPhone: '',
      teacherEmail: '',
      schoolYear: '',
      memoNumber: '',
      principalName: '',
      inspectorName: '',
      signDate: new Date().toISOString().split('T')[0],
      teacherStamp: null,
      assignedClasses: [],
      weeklyHours: 0,
    };
  });

  // Sync config to sessionStorage whenever updated
  useEffect(() => {
    try {
      sessionStorage.setItem('algeria_sciences_session_config_v3', JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  // Keep config.level in sync with selectedLevel
  useEffect(() => {
    if (isYearSection) {
      setConfig((prev) => ({ ...prev, level: selectedLevel }));
    }
  }, [selectedLevel, isYearSection]);

  // When level changes, reset selections to first valid item for this level
  useEffect(() => {
    const defaultLesson = lessonsForLevel[0];
    if (defaultLesson) {
      setSelectedMaqta(defaultLesson.maqta);
      setSelectedMawrid(defaultLesson.mawrid);
      setSelectedTa3alom(defaultLesson.ta3alom);
    } else if (maqatiForLevel.length > 0) {
      setSelectedMaqta(maqatiForLevel[0]);
      setSelectedMawrid('');
      setSelectedTa3alom('');
    }
  }, [selectedLevel, lessonsForLevel, maqatiForLevel]);

  // 4. Derived lists based on selection
  const mawridList = useMemo(() => {
    const list = lessonsForLevel
      .filter((l) => l.maqta === selectedMaqta)
      .map((l) => l.mawrid);
    return Array.from(new Set(list));
  }, [lessonsForLevel, selectedMaqta]);

  // Auto-select first mawrid when maqta changes
  useEffect(() => {
    if (mawridList.length > 0 && !mawridList.includes(selectedMawrid)) {
      setSelectedMawrid(mawridList[0]);
    }
  }, [mawridList, selectedMawrid]);

  const ta3alomList = useMemo(() => {
    const list = lessonsForLevel
      .filter((l) => l.maqta === selectedMaqta && l.mawrid === selectedMawrid)
      .map((l) => l.ta3alom);
    return Array.from(new Set(list));
  }, [lessonsForLevel, selectedMaqta, selectedMawrid]);

  // Auto-select first ta3alom when mawrid changes
  useEffect(() => {
    if (ta3alomList.length > 0 && !ta3alomList.includes(selectedTa3alom)) {
      setSelectedTa3alom(ta3alomList[0]);
    }
  }, [ta3alomList, selectedTa3alom]);

  // 5. Current Selected Lesson
  const currentLesson = useMemo<LessonMemo | null>(() => {
    const found = lessonsForLevel.find(
      (l) =>
        l.maqta === selectedMaqta &&
        l.mawrid === selectedMawrid &&
        l.ta3alom === selectedTa3alom
    );
    return found || lessonsForLevel[0] || null;
  }, [lessonsForLevel, selectedMaqta, selectedMawrid, selectedTa3alom]);

  // Derived current active midan based on the active lesson or level
  const activeMidan = useMemo(() => {
    if (currentLesson?.midan) return currentLesson.midan;
    return '';
  }, [currentLesson, selectedLevel]);

  // 6. Activities selection state
  const [activeActivities, setActiveActivities] = useState<boolean[]>([]);

  useEffect(() => {
    if (currentLesson) {
      setActiveActivities(new Array(currentLesson.anshita.length).fill(true));
    } else {
      setActiveActivities([]);
    }
  }, [currentLesson]);

  const handleToggleActivity = (index: number) => {
    setActiveActivities((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleSelectAllActivities = () => {
    if (currentLesson) {
      setActiveActivities(new Array(currentLesson.anshita.length).fill(true));
    }
  };

  const handleDeselectAllActivities = () => {
    if (currentLesson) {
      setActiveActivities(new Array(currentLesson.anshita.length).fill(false));
    }
  };

  // 7. Preview Modal & Toast
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 8. Export as real PDF file (not browser print)
  const handlePrint = async () => {
    if (!currentLesson) {
      showToast('الرجاء اختيار مورد تعلمي للتصدير');
      return;
    }

    try {
      showToast('جاري إنشاء ملف PDF...');
      const { generateMemoPdf } = await import('./utils/pdfExport');
      await generateMemoPdf(config, currentLesson.ta3alom || 'مذكرة_بيداغوجية');
      showToast('✅ تم تنزيل ملف PDF بنجاح');
    } catch (error) {
      console.error('PDF export error:', error);
      showToast('❌ تعذر إنشاء PDF. تحقق من اتصال الإنترنت ثم حاول مرة أخرى');
    }
  };

  // 9. Export as Word document (.docx) - محسّن
  const handleExportWord = async () => {
    if (!currentLesson) {
      showToast('الرجاء اختيار مورد تعلمي للتصدير');
      return;
    }

    try {
      showToast('جاري التصدير إلى Word...');
      const { generateDocx } = await import('./utils/docxExport');
      const blob = await generateDocx(
        currentLesson,
        config,
        activeActivities,
        config.memoFormat === 'merged_teacher'
      );

      // إنشاء رابط التحميل
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // إنشاء اسم ملف آمن
      const safeTitle = (currentLesson?.ta3alom || 'مذكرة_بيداغوجية')
        .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 40);
      
      link.download = `مذكرة_${config.level}_${config.teacherName}_${safeTitle}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // تنظيف
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      showToast('✅ تم تصدير المذكرة بنجاح');
    } catch (error) {
      console.error('Export error:', error);
      showToast('❌ حدث خطأ في التصدير. حاول مرة أخرى');
    }
  };

  const handleResetDefaults = () => {
    const defaultData: MemoConfig = {
      level: selectedLevel,
      schoolName: '',
      directorate: '',
      inspectionDistrict: '',
      teacherName: '',
      teacherGrade: '',
      teacherPhone: '',
      teacherEmail: '',
      schoolYear: '',
      memoNumber: '',
      principalName: '',
      inspectorName: '',
      signDate: new Date().toISOString().split('T')[0],
      teacherStamp: null,
      assignedClasses: [],
      weeklyHours: 0,
    };
    setConfig(defaultData);
  };

  const midanTheme = useMemo(() => {
    switch (selectedLevel) {
      case '1am':
        return {
          midanName: '',
          levelLabel: 'السنة الأولى متوسط (1AM)',
          accentColor: '#0284c7',
          subbarBg: 'from-sky-50/90 via-white to-emerald-50/70 border-sky-200',
          badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
          activeTabBg: 'bg-sky-600 text-white shadow-xs',
          hoverTabClass: 'text-gray-700 hover:text-sky-700 hover:bg-white/80',
          pulseBg: 'bg-sky-600',
          canvasBg: 'bg-gradient-to-br from-sky-50/50 via-[#f8fafc] to-emerald-50/30',
          titleColor: 'text-sky-700',
        };
      case '2am':
        return {
          midanName: '',
          levelLabel: 'السنة الثانية متوسط (2AM)',
          accentColor: '#7c3aed',
          subbarBg: 'from-purple-50/90 via-white to-indigo-50/70 border-purple-200',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
          activeTabBg: 'bg-purple-600 text-white shadow-xs',
          hoverTabClass: 'text-gray-700 hover:text-purple-700 hover:bg-white/80',
          pulseBg: 'bg-purple-600',
          canvasBg: 'bg-gradient-to-br from-purple-50/50 via-[#f8fafc] to-indigo-50/30',
          titleColor: 'text-purple-700',
        };
      case '3am':
        return {
          midanName: '',
          levelLabel: 'السنة الثالثة متوسط (3AM)',
          accentColor: '#ea580c',
          subbarBg: 'from-amber-50/90 via-white to-orange-50/70 border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          activeTabBg: 'bg-orange-600 text-white shadow-xs',
          hoverTabClass: 'text-gray-700 hover:text-orange-700 hover:bg-white/80',
          pulseBg: 'bg-orange-600',
          canvasBg: 'bg-gradient-to-br from-amber-50/50 via-[#f8fafc] to-orange-50/30',
          titleColor: 'text-orange-700',
        };
      case '4am':
      default:
        return {
          midanName: '',
          levelLabel: 'السنة الرابعة متوسط (4AM - BEM)',
          accentColor: '#c2185b',
          subbarBg: 'from-pink-50/90 via-white to-rose-50/70 border-pink-200',
          badgeBg: 'bg-rose-100 text-[#c2185b] border-rose-300',
          activeTabBg: 'bg-[#c2185b] text-white shadow-xs',
          hoverTabClass: 'text-gray-700 hover:text-[#c2185b] hover:bg-white/80',
          pulseBg: 'bg-[#c2185b]',
          canvasBg: 'bg-gradient-to-br from-rose-50/50 via-[#f8fafc] to-pink-50/30',
          titleColor: 'text-[#c2185b]',
        };
    }
  }, [selectedLevel]);

  const currentLevelLabel = midanTheme.levelLabel;

  // Realistic curriculum background: the interface stays unchanged while the
  // visual atmosphere follows the current school field + learning sequence.
  const curriculumBackground = useMemo(() => {
    const text = [activeMidan, selectedMaqta, selectedMawrid, selectedTa3alom].join(' ');
    const has = (...words: string[]) => words.some((word) => text.includes(word));

    if (selectedLevel === '4am') {
      if (has('انتقال الصفات الوراثية', 'الوراث', 'الطفر')) return 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=2400&q=85';
      if (has('التنسيق الوظيفي', 'المناعة', 'التلقيح', 'الدم')) return 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=2400&q=85';
      if (has('التغذية')) return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=2400&q=85';
      return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2400&q=85';
    }

    if (selectedLevel === '3am') {
      if (has('التربة')) return 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=2400&q=85';
      if (has('الموارد الطبيعية الباطنية', 'الموارد', 'الباطنية')) return 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2400&q=85';
      if (has('الديناميكية الداخلية', 'الداخلية', 'الكرة الأرضية')) return 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=2400&q=85';
      if (has('الديناميكية الخارجية', 'التعرية')) return 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=2400&q=85';
      return 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2400&q=85';
    }

    if (selectedLevel === '2am') {
      if (has('التكاثر', 'إعمار')) return 'https://images.unsplash.com/photo-1464207687429-7505649dae38?auto=format&fit=crop&w=2400&q=85';
      if (has('تصنيف', 'الكائنات')) return 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=2400&q=85';
      if (has('توزع', 'أوساطها')) return 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=85';
      return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=85';
    }

    if (selectedLevel === '1am') {
      if (activeMidan === 'الإنسان والصحة' || has('التغذية عند الإنسان', 'التحصل على الطاقة', 'الإطراح عند الإنسان', 'التكاثر عند الإنسان')) {
        return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=2400&q=85';
      }
      if (has('التغذية عند النبات', 'الوسط الحي', 'توزع الكائنات', 'التكاثر وإعمار', 'تصنيف الكائنات')) {
        return 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=2400&q=85';
      }
      return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=85';
    }

    return 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2400&q=85';
  }, [selectedLevel, activeMidan, selectedMaqta, selectedMawrid, selectedTa3alom]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-5 left-5 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-[13px] font-bold z-50 flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          {toastMessage}
        </div>
      )}

      {/* Main Streamlined Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Right Section: Menu Drawer Trigger + Identity / Navigation / Year Tabs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Global Navigation Drawer Toggle */}
            <button
              type="button"
              id="btn-open-nav-drawer"
              onClick={() => setIsNavDrawerOpen(true)}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 transition cursor-pointer"
              title="القائمة الشاملة للمنصة"
            >
              <Menu className="w-5 h-5" />
            </button>

            {activeSection === 'home' ? (
              /* Home Platform Brand - Clean and focused */
              <div className="flex items-center gap-2.5 text-right">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f766e] to-[#115e59] flex items-center justify-center text-white font-extrabold shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-black text-[15px] text-gray-900 leading-tight">
                    المنصة البيداغوجية الوطنية لأساتذة علوم الطبيعة والحياة
                  </h1>
                </div>
              </div>
            ) : (
              /* Year or Tool Active Header: Back Button + Level Badge + Direct Sub-tabs */
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Back to Home */}
                <button
                  id="header-btn-back-home"
                  type="button"
                  onClick={() => {
                    setActiveSection('home');
                    showToast('العودة إلى الصفحة ال��ئيسية');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 text-white text-[12.5px] font-black hover:bg-gray-800 shadow-xs transition cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>الرئيسية</span>
                </button>

                {/* 2. Current Year Indicator or Tool Title */}
                {isYearSection ? (
                  <>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                      <span className={`w-2.5 h-2.5 rounded-full ${midanTheme.pulseBg}`} />
                      <span className="text-[13px] font-black text-gray-900">{currentLevelLabel}</span>
                    </div>

                    {/* 3. Direct Subtabs (المذكرات البيداغوجية | تدرج التعلمات) */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                      <button
                        type="button"
                        id="year-subtab-memos"
                        onClick={() => setYearSubTab('memos')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-black transition cursor-pointer ${
                          yearSubTab === 'memos'
                            ? midanTheme.activeTabBg
                            : 'text-gray-700 hover:text-gray-900 hover:bg-white/80'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>المذكرات البيداغوجية</span>
                      </button>

                      <button
                        type="button"
                        id="year-subtab-distribution"
                        onClick={() => setYearSubTab('distribution')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-black transition cursor-pointer ${
                          yearSubTab === 'distribution'
                            ? midanTheme.activeTabBg
                            : 'text-gray-700 hover:text-gray-900 hover:bg-white/80'
                        }`}
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>تدرج التعلمات</span>
                      </button>
                    </div>
                  </>
                ) : activeSection === 'logbook' ? (
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-900 font-black text-[13px]">
                    <BookOpenCheck className="w-4 h-4 text-emerald-700" />
                    <span>الدفتر اليومي ودفتر النصوص</span>
                  </div>
                ) : activeSection === 'database' ? (
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-900 font-black text-[13px]">
                    <Database className="w-4 h-4 text-emerald-700" />
                    <span>إدارة قاعدة البيانات</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-900 font-black text-[13px]">
                    <UserCog className="w-4 h-4 text-gray-700" />
                    <span>إعدادات الحساب والخاتم</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Left Section: Action Buttons + AI Assistant */}
          <div className="flex items-center gap-2">
            {/* Designer Badge - Always Visible */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-emerald-200 shadow-sm transition-all hover:shadow-md hover:bg-emerald-100" title="تصميم وتطوير المنصة: بغداد الطيب">
              <img 
                src="/formal_studio_portrait.jpg" 
                alt="مصمم المنصة بغداد الطيب" 
                className="w-6 h-6 rounded-full border border-emerald-500 object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== "https://ui-avatars.com/api/?name=بغداد+الطيب&background=047857&color=fff&size=128&bold=true") {
                    target.src = "https://ui-avatars.com/api/?name=بغداد+الطيب&background=047857&color=fff&size=128&bold=true";
                  }
                }}
              />
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[9px] text-emerald-600 font-bold leading-none mb-0.5">تصميم وتطوير</span>
                <span className="text-[11px] font-black text-emerald-900 leading-none">بغداد الطيب</span>
              </div>
            </div>

            {/* Quick AI Assistant Trigger */}
            <button
              type="button"
              id="header-btn-ai-assistant"
              onClick={() => setIsAssistantOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-l from-teal-700 to-emerald-800 text-white text-[12px] font-black hover:opacity-95 shadow-xs transition cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">المساعد الذكي</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </button>

            {activeSection === 'home' ? (
              <UserProfile />
            ) : isYearSection && yearSubTab === 'memos' ? (
              <>
                <button
                  id="btn-preview-memo"
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-gray-700 text-[12px] font-bold hover:bg-gray-50 shadow-2xs transition cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                  معاينة
                </button>
                <button
                  id="btn-export-word"
                  type="button"
                  onClick={handleExportWord}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 shadow-xs transition cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  Word
                </button>
                <button
                  id="btn-print-memo"
                  type="button"
                  onClick={handlePrint}
                  style={{ backgroundColor: midanTheme.accentColor }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-[12px] font-extrabold hover:opacity-90 shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  PDF
                </button>
                <button
                  id="btn-reset-defaults"
                  type="button"
                  onClick={handleResetDefaults}
                  title="استعادة الإعدادات الافتراضية"
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Dynamic Workspace Views */}
      {activeSection === 'home' && (
        <LevelsHomePage
          onSelectYear={(lvl) => {
            setActiveSection(lvl);
            setYearSubTab('memos');
          }}
          onOpenLogbook={() => setActiveSection('logbook')}
          onOpenSettings={() => setActiveSection('settings')}
          config={config}
        />
      )}

      {isYearSection && yearSubTab === 'memos' && (
        <div
          className="flex-1 flex flex-col lg:flex-row relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(248,250,252,0.90), rgba(248,250,252,0.94)), url(${curriculumBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 pointer-events-none bg-white/10" aria-hidden="true" />
          {/* Sidebar Controls for Memos */}
          <SidebarControls
            selectedLevel={selectedLevel}
            setSelectedLevel={(lvl) => setActiveSection(lvl)}
            selectedMidan={activeMidan}
            setSelectedMidan={() => {}}
            selectedMaqta={selectedMaqta}
            setSelectedMaqta={setSelectedMaqta}
            selectedMawrid={selectedMawrid}
            setSelectedMawrid={setSelectedMawrid}
            selectedTa3alom={selectedTa3alom}
            setSelectedTa3alom={setSelectedTa3alom}
            currentLesson={currentLesson}
            activeActivities={activeActivities}
            onToggleActivity={handleToggleActivity}
            onSelectAllActivities={handleSelectAllActivities}
            onDeselectAllActivities={handleDeselectAllActivities}
            config={config}
            setConfig={setConfig}
            mawridList={mawridList}
            ta3alomList={ta3alomList}
            maqatiList={maqatiForLevel}
            showToast={showToast}
          />

          {/* Paper Canvas */}
          <main id="main-content" className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col items-center">
            <div className="w-full max-w-[960px] mb-3 flex items-center justify-between text-[12px] text-gray-500">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('home')}
                  className="text-gray-700 hover:text-black font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>الرئيسية</span>
                </button>
                <span>/</span>
                <span>المستوى الدراسي:</span>
                <strong className={midanTheme.titleColor}>
                  {currentLevelLabel}
                </strong>
              </div>
              <div className="hidden sm:block text-gray-500 font-medium">
                انقر على أي مربع في المذكرة للتعديل المباشر أو استخدم القائمة الجانبية
              </div>
            </div>

            <MemoSheet
              lesson={currentLesson}
              config={config}
              activeActivities={activeActivities}
              onToggleActivity={handleToggleActivity}
              onFormatChange={(fmt) => {
                setConfig((prev) => ({ ...prev, memoFormat: fmt }));
                showToast(
                  fmt === 'merged_teacher'
                    ? 'تم تفعيل نموذج المذكرة المدمجة (بدون خانة نشاط المتعلم)'
                    : 'تم تفعيل النموذج المفصل (أستاذ + متعلم)'
                );
              }}
              editable={true}
            />
          </main>
        </div>
      )}

      {isYearSection && yearSubTab === 'distribution' && (
        <div
          className="flex-1 flex flex-col relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(248,250,252,0.93), rgba(248,250,252,0.96)), url(${curriculumBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 pointer-events-none bg-white/10" aria-hidden="true" />
          <AnnualDistribution
            selectedLevel={selectedLevel}
            setSelectedLevel={(lvl) => setActiveSection(lvl)}
            config={config}
            showToast={showToast}
            curriculumLessons={curriculumLessons}
          />
        </div>
      )}

      {activeSection === 'logbook' && (
        <DailyLogbook
          curriculumLessons={curriculumLessons}
          selectedLevel={selectedLevel}
          setSelectedLevel={(lvl) => {
            if (lvl) {
              setConfig((prev) => ({ ...prev, level: lvl }));
            }
          }}
          config={config}
          showToast={showToast}
        />
      )}

      {activeSection === 'database' && (
        <CurriculumDatabaseManager
          lessons={curriculumLessons}
          setLessons={setCurriculumLessons}
          showToast={showToast}
        />
      )}

      {activeSection === 'settings' && (
        <AccountSettings
          config={config}
          setConfig={setConfig}
          showToast={showToast}
        />
      )}

      {/* Global Navigation Drawer */}
      <PlatformNavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        activeSection={activeSection}
        onNavigate={(sec) => {
          setActiveSection(sec as MainSectionType);
          setYearSubTab('memos');
        }}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenInfoModal={(tab) => setInfoModalTab(tab)}
        config={config}
      />

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        selectedLevel={selectedLevel}
        currentLesson={currentLesson}
        curriculumLessons={curriculumLessons}
      />

      {/* Platform Info and Contact Modal */}
      <PlatformInfoModal
        isOpen={infoModalTab !== null}
        defaultTab={infoModalTab || 'about'}
        onClose={() => setInfoModalTab(null)}
      />

      {/* Modal for Print Preview of Memos */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        lesson={currentLesson}
        config={config}
        activeActivities={activeActivities}
        onPrint={handlePrint}
        onExportWord={handleExportWord}
      />
      <FirebaseDataSync />
    </div>
  );
};

export default App;
