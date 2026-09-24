import React from 'react';
import {
  GraduationCap,
  CalendarDays,
  ChevronLeft,
  BookOpenCheck,
  UserCog,
  FileText,
  Dna,
  TreePine,
  Sprout,
  Globe2,
  Bot,
  Sparkles,
  Info,
  Layers,
  FileDown,
  Printer,
  Compass,
  Award,
  Zap,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { LESSONS_DATA } from '../data/lessonsData';
import { MemoConfig } from '../types';

interface LevelsHomePageProps {
  onSelectYear: (level: '1am' | '2am' | '3am' | '4am', subTab?: 'memos' | 'distribution') => void;
  onOpenLogbook: () => void;
  onOpenSettings: () => void;
  onOpenAssistant?: () => void;
  onOpenInfoModal?: (tab: 'about' | 'guide' | 'contact') => void;
  config: MemoConfig;
  curriculumBackground?: string;
}

export const LevelsHomePage: React.FC<LevelsHomePageProps> = ({
  onSelectYear,
  onOpenLogbook,
  onOpenSettings,
  onOpenAssistant,
  onOpenInfoModal,
  config,
  curriculumBackground,
}) => {
  // Level theme cards custom-designed for each curriculum Midan (Domain)
  const levelThemes = [
    {
      id: '1am' as const,
      backgroundImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1800&q=85',
      title: '1 متوسط',
      subtitle: 'السنة الأولى متوسط',
      midanName: 'ميدان: الإنسان والصحة + الإنسان والمحيط',
      midanFocus: 'التغذية والوظائف الحيوية • التغذية عند النبات الأخضر والتحصل على الطاقة',
      accentColor: '#0284c7', // Sky / Bio Blue
      darkAccent: '#0369a1',
      bgGradient: 'from-sky-50/80 via-white to-emerald-50/40',
      borderClass: 'border-sky-300 hover:border-sky-500 hover:shadow-sky-100',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
      iconBadge: <Sprout className="w-5 h-5 text-emerald-600" />,
      patternOverlay: (
        <div className="absolute left-0 top-0 bottom-0 w-48 opacity-[0.07] pointer-events-none overflow-hidden flex items-center justify-center">
          <Sprout className="w-40 h-40 text-sky-900" />
        </div>
      ),
    },
    {
      id: '2am' as const,
      backgroundImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=85',
      title: '2 متوسط',
      subtitle: 'السنة الثانية متوسط',
      midanName: 'ميدان: الإنسان والمحيط',
      midanFocus: 'الوسط الحي • التكيف وإعمار الأوساط • التنوع البيولوجي وتاريخ الأرض',
      accentColor: '#7c3aed', // Purple / Ecology Violet
      darkAccent: '#6d28d9',
      bgGradient: 'from-purple-50/80 via-white to-indigo-50/40',
      borderClass: 'border-purple-300 hover:border-purple-500 hover:shadow-purple-100',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      iconBadge: <TreePine className="w-5 h-5 text-purple-600" />,
      patternOverlay: (
        <div className="absolute left-0 top-0 bottom-0 w-48 opacity-[0.07] pointer-events-none overflow-hidden flex items-center justify-center">
          <TreePine className="w-40 h-40 text-purple-900" />
        </div>
      ),
    },
    {
      id: '3am' as const,
      backgroundImage: '/src/assets/images/card_3am_geology_1790188430402.jpg',
      title: '3 متوسط',
      subtitle: 'السنة الثالثة متوسط',
      midanName: 'ميدان: الإنسان والمحيط (الدينامية الداخلية للأرض والجيولوجيا)',
      midanFocus: 'علم الجيولوجيا • تكتونية الصفائح • الزلازل والبراكين • البنية الباطنية للكرة الأرضية',
      accentColor: '#0f766e',
      darkAccent: '#115e59',
      bgGradient: 'from-teal-50/90 via-white to-amber-50/40',
      borderClass: 'border-teal-300 hover:border-teal-500 hover:shadow-teal-100',
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      iconBadge: <Globe2 className="w-5 h-5 text-teal-600" />,
      patternOverlay: (
        <div className="absolute left-0 top-0 bottom-0 w-48 opacity-[0.10] pointer-events-none overflow-hidden flex items-center justify-center">
          <Globe2 className="w-40 h-40 text-teal-900" />
        </div>
      ),
    },
    {
      id: '4am' as const,
      backgroundImage: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1800&q=85',
      title: '4 متوسط',
      subtitle: 'السنة الرابعة متوسط (BEM)',
      midanName: 'ميدان: الإنسان والصحة',
      midanFocus: 'التغذية والأيض الخلوي • التنسيق الوظيفي العصبي والمناعي • الوراثة والجينات',
      accentColor: '#c2185b',
      darkAccent: '#9d174d',
      bgGradient: 'from-rose-50/80 via-white to-pink-50/40',
      borderClass: 'border-rose-300 hover:border-[#c2185b] hover:shadow-pink-100',
      badgeBg: 'bg-rose-100 text-[#c2185b] border-rose-300',
      iconBadge: <Dna className="w-5 h-5 text-[#c2185b]" />,
      patternOverlay: (
        <div className="absolute left-0 top-0 bottom-0 w-48 opacity-[0.08] pointer-events-none overflow-hidden flex items-center justify-center">
          <Dna className="w-40 h-40 text-rose-900" />
        </div>
      ),
    },
  ];

  return (
    <div className="relative flex-1 min-h-full py-8 px-4 sm:px-6 lg:px-12 flex flex-col items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${curriculumBackground || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=90'})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/85 to-slate-100/95" aria-hidden="true" />
      
      <div className="w-full max-w-6xl space-y-8 relative z-10">

        {/* Designer Signature Top Banner */}
        <div className="w-full glass-panel rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden bg-white/90 border border-emerald-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-full opacity-50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-50 rounded-tr-full opacity-60 pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10 text-right">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-emerald-500 p-0.5 shadow-sm bg-white shrink-0">
              <img 
                src="/formal_studio_portrait.jpg" 
                alt="مصمم المنصة بغداد الطيب" 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== "https://ui-avatars.com/api/?name=بغداد+الطيب&background=047857&color=fff&size=128&bold=true") {
                    target.src = "https://ui-avatars.com/api/?name=بغداد+الطيب&background=047857&color=fff&size=128&bold=true";
                  }
                }}
              />
            </div>
            <div>
              <div className="text-[12px] sm:text-[13px] text-gray-500 font-bold mb-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> تصميم وتطوير المنصة
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">بغداد الطيب</h2>
              <div className="text-[12px] font-extrabold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 border border-emerald-200/50">
                <UserCog className="w-3.5 h-3.5" /> منصة المذكرة البيداغوجية لعلوم الطبيعة والحياة
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex relative z-10 text-left items-center gap-3">
            <div className="bg-emerald-50/80 px-5 py-3 rounded-2xl border border-emerald-200 shadow-2xs text-right">
              <div className="text-[13px] font-black text-emerald-950">منهاج الجيل الثاني المعتمد</div>
              <div className="text-[11.5px] font-medium text-emerald-700 mt-0.5">الجمهورية الجزائرية الديمقراطية الشعبية</div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            قسم الأزرار السريعة الأساسية (المذكرة، التدرج، الدفتر، الإعدادات)
           ═══════════════════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>الوصول السريع للأدوات البيداغوجية</span>
            </h3>
            <span className="text-xs text-gray-500 font-medium">كل ما يحتاجه الأستاذ بنقرة واحدة</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* زر سريع 1: المذكرة البيداغوجية */}
            <button
              type="button"
              id="quick-btn-memos"
              onClick={() => onSelectYear(config.level || '1am', 'memos')}
              className="p-4 rounded-2xl bg-white border border-teal-200 hover:border-teal-500 hover:shadow-md transition text-right group cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold group-hover:scale-110 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-[14px] text-gray-900 group-hover:text-teal-700 transition">
                  المذكرة البيداغوجية
                </h4>
                <p className="text-[11.5px] text-gray-500 mt-0.5 line-clamp-1">
                  تحضير وتعديل المذكرات الرسمية
                </p>
              </div>
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition">
                <ChevronLeft className="w-4 h-4 text-teal-600" />
              </div>
            </button>

            {/* زر سريع 2: التدرج السنوي للتعلمات */}
            <button
              type="button"
              id="quick-btn-distribution"
              onClick={() => onSelectYear(config.level || '1am', 'distribution')}
              className="p-4 rounded-2xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-md transition text-right group cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-[14px] text-gray-900 group-hover:text-blue-700 transition">
                  التدرج السنوي
                </h4>
                <p className="text-[11.5px] text-gray-500 mt-0.5 line-clamp-1">
                  مخطط التوزيع الوزاري وتتبع الأسابيع
                </p>
              </div>
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition">
                <ChevronLeft className="w-4 h-4 text-blue-600" />
              </div>
            </button>

            {/* زر سريع 3: الدفتر اليومي */}
            <button
              type="button"
              id="quick-btn-logbook"
              onClick={onOpenLogbook}
              className="p-4 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-md transition text-right group cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 transition">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-[14px] text-gray-900 group-hover:text-emerald-700 transition">
                  الدفتر اليومي
                </h4>
                <p className="text-[11.5px] text-gray-500 mt-0.5 line-clamp-1">
                  دفتر النصوص وتسجيل الحصص
                </p>
              </div>
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition">
                <ChevronLeft className="w-4 h-4 text-emerald-600" />
              </div>
            </button>

            {/* زر سريع 4: إعدادات الحساب */}
            <button
              type="button"
              id="quick-btn-settings"
              onClick={onOpenSettings}
              className="p-4 rounded-2xl bg-white border border-purple-200 hover:border-purple-500 hover:shadow-md transition text-right group cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-110 transition">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-[14px] text-gray-900 group-hover:text-purple-700 transition">
                  إعدادات الحساب
                </h4>
                <p className="text-[11.5px] text-gray-500 mt-0.5 line-clamp-1">
                  بيانات المؤسسة والختم الرسمي
                </p>
              </div>
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition">
                <ChevronLeft className="w-4 h-4 text-purple-600" />
              </div>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            بطاقات المستويات الدراسية الأربعة (1، 2، 3، 4 متوسط)
           ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center shadow-2xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                  المستويات الدراسية (التعليم المتوسط)
                </h2>
              </div>
              <p className="text-gray-600 text-[13.5px] mt-1 font-medium">
                اختر المستوى الدراسي لتصفح المذكرات البيداغوجية وتدرج التعلمات الخاص بكل ميدان
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-teal-800 font-bold shadow-2xs">
                مناهج الجيل الثاني الرسمية
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {levelThemes.map((lvl) => {
              const count = LESSONS_DATA.filter((l) => l.level === lvl.id).length;
              return (
                <div
                  key={lvl.id}
                  id={`card-select-level-${lvl.id}`}
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.78), rgba(255,255,255,0.88)), url(${lvl.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  className={`relative overflow-hidden w-full text-right p-6 rounded-3xl border transition-all duration-300 shadow-md hover:shadow-xl bg-white/85 backdrop-blur-md ${lvl.borderClass} group`}
                >
                  {lvl.patternOverlay}

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3
                          className="text-2xl sm:text-3xl font-black tracking-tight"
                          style={{ color: lvl.accentColor }}
                        >
                          {lvl.title}
                        </h3>
                        <span className="text-base sm:text-lg font-black text-gray-800">
                          {lvl.subtitle}
                        </span>

                        <span className={`text-[11.5px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${lvl.badgeBg}`}>
                          {lvl.iconBadge}
                          <span>{lvl.midanName}</span>
                        </span>

                        {lvl.id === '4am' && (
                          <span className="bg-[#c2185b] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                            شهادة BEM
                          </span>
                        )}
                      </div>

                      <p className="text-[13px] text-slate-700 font-semibold leading-6">
                        {lvl.midanFocus}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[12px] text-gray-600 font-bold">
                        <span className="flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-lg border border-gray-200">
                          <FileText className="w-3.5 h-3.5 text-gray-500" />
                          <span>{count} مذكرة معتمدة</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-lg border border-gray-200">
                          <Layers className="w-3.5 h-3.5 text-gray-500" />
                          <span>نموذج مفصل ومدمج</span>
                        </span>
                      </div>
                    </div>

                    {/* أزرار الإجراء المزدوجة: المذكرات والتدرج السنوي */}
                    <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-gray-200/60">
                      <button
                        type="button"
                        onClick={() => onSelectYear(lvl.id, 'memos')}
                        style={{ backgroundColor: lvl.accentColor }}
                        className="px-4 py-2 rounded-xl text-white text-[12.5px] font-black flex items-center gap-1.5 transition-all hover:opacity-95 shadow-xs cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>فتح المذكرات البيداغوجية</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectYear(lvl.id, 'distribution')}
                        className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-800 text-[12.5px] font-bold flex items-center gap-1.5 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <CalendarDays className="w-4 h-4 text-gray-500" />
                        <span>التدرج السنوي</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            قسم المساعد البيداغوجي الذكي (AI Pedagogical Assistant)
           ═══════════════════════════════════════════════════════════════ */}
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-l from-teal-900 via-teal-800 to-emerald-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>مساعد بيداغوجي متخصص في منهاج علوم الطبيعة والحياة</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">
                المساعد الذكي للأستاذ في التحضير والتقويم
              </h3>
              <p className="text-teal-100 text-sm max-w-2xl leading-relaxed">
                استشر المساعد الذكي في صياغة الفرضيات، وضعيات الانطلاق، تكييف النشاطات التعليمية،
                واقتراح بروتوكولات تجريبية مطابقة للتوجيهات البيداغوجية الرسمية لوزارة التربية الوطنية.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white font-medium">✓ صياغة المشكل العلمي</span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white font-medium">✓ اقتراح استراتيجيات تعليمية</span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white font-medium">✓ تحليل النشاطات التجريبية</span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white font-medium">✓ معايير التقويم البيداغوجي</span>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                id="home-open-assistant-btn"
                onClick={onOpenAssistant}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Bot className="w-5 h-5 text-teal-950" />
                <span>فتح المساعد الذكي الآن</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            قسم معلومات وميزات المنصة البيداغوجية
           ═══════════════════════════════════════════════════════════════ */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-700" />
                <span>حول منصة المذكرة البيداغوجية</span>
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">
                بيئة عمل متكاملة مخصصة لأساتذة مادة علوم الطبيعة والحياة بمرحلة التعليم المتوسط
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenInfoModal && onOpenInfoModal('about')}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                نبذة تعريفية
              </button>
              <button
                type="button"
                onClick={() => onOpenInfoModal && onOpenInfoModal('guide')}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                دليل الاستخدام
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-gray-900">مطابقة المناهج الرسمية</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                مذكرات وتدرجات مبنية حرفياً على وثائق منهاج الجيل الثاني، الأدلة البيداغوجية والمخططات السنوية الاستثنائية.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <FileDown className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-gray-900">تصدير Word و PDF</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                تصدير احترافي متوافق تماماً مع جداول Microsoft Word وطباعة نظيفة جاهزة للمصادقة والتأشيرة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-gray-900">تزامن وحفظ آمن</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                حفظ التعديلات محلياً وسحابياً عبر حساب Google، مع الحفاظ الكامل على خصوصية بيانات الأستاذ والمؤسسة.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

