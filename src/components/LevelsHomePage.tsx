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

