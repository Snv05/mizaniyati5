import React from 'react';
import {
  GraduationCap,
  CalendarDays,
  ChevronLeft,
  BookOpenCheck,
  UserCog,
  FileText,
  Dna,
  Mountain,
  TreePine,
  Sprout,
  Activity,
  HeartPulse,
  Flame,
  Globe2,
  ShieldCheck,
  Compass,
  Sparkles,
} from 'lucide-react';
import { LESSONS_DATA } from '../data/lessonsData';
import { MemoConfig } from '../types';

interface LevelsHomePageProps {
  onSelectYear: (level: '1am' | '2am' | '3am' | '4am') => void;
  onOpenLogbook: () => void;
  onOpenSettings: () => void;
  config: MemoConfig;
}

export const LevelsHomePage: React.FC<LevelsHomePageProps> = ({
  onSelectYear,
  onOpenLogbook,
  onOpenSettings,
  config,
}) => {
  // Level theme cards custom-designed for each curriculum Midan (Domain)
  const levelThemes = [
    {
      id: '1am' as const,
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
      title: '3 متوسط',
      subtitle: 'السنة الثالثة متوسط',
      midanName: 'ميدان: الإنسان والمحيط (الدينامية الداخلية للأرض)',
      midanFocus: 'علم الجيولوجيا • الزلازل والبراكين • تكتونية الصفائح والبنية الباطنية للأرض',
      accentColor: '#ea580c', // Terracotta / Earth Lava
      darkAccent: '#c2410c',
      bgGradient: 'from-amber-50/80 via-white to-orange-50/40',
      borderClass: 'border-amber-300 hover:border-orange-500 hover:shadow-orange-100',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      iconBadge: <Mountain className="w-5 h-5 text-orange-600" />,
      patternOverlay: (
        <div className="absolute left-0 top-0 bottom-0 w-48 opacity-[0.08] pointer-events-none overflow-hidden flex items-center justify-center">
          <Mountain className="w-40 h-40 text-orange-900" />
        </div>
      ),
    },
    {
      id: '4am' as const,
      title: '4 متوسط',
      subtitle: 'السنة الرابعة متوسط (BEM)',
      midanName: 'ميدان: الإنسان والصحة',
      midanFocus: 'التغذية والأيض الخلوي • التنسيق الوظيفي العصبي والمناعي • الوراثة والجينات',
      accentColor: '#c2185b', // Crimson Rose / Human Biology
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
    <div className="flex-1 bg-gradient-to-b from-slate-50 via-gray-100/50 to-slate-100 py-8 px-4 sm:px-6 lg:px-12 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Section Header with Graduation Icon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center shadow-2xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                المستويات الدراسية
              </h2>
            </div>
            <p className="text-gray-600 text-[13.5px] mt-1 font-medium">
              اختر المستوى الدراسي لتصفح المذكرات البيداغوجية وتدرج التعلمات الخاص بكل ميدان
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-teal-800 font-bold shadow-2xs">
              منهاج الجيل الثاني المعتمد
            </span>
          </div>
        </div>

        {/* 4 Levels Cards List styled according to each specific Midan */}
        <div className="space-y-4">
          {levelThemes.map((lvl) => {
            const count = LESSONS_DATA.filter((l) => l.level === lvl.id).length;
            return (
              <button
                key={lvl.id}
                id={`card-select-level-${lvl.id}`}
                type="button"
                onClick={() => onSelectYear(lvl.id)}
                className={`relative overflow-hidden w-full text-right p-6 rounded-2xl border-2 transition-all duration-200 shadow-xs hover:shadow-lg cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-l ${lvl.bgGradient} ${lvl.borderClass} group`}
              >
                {/* Background Pattern Watermark for the specific Midan */}
                {lvl.patternOverlay}

                {/* Right side: Titles and Midan Info */}
                <div className="relative z-10 flex-1 space-y-2">
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

                    {/* Midan Badge */}
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

                  <p className="text-[13px] text-gray-600 font-medium">
                    {lvl.midanFocus}
                  </p>

                  <div className="flex items-center gap-4 pt-1 text-[12px] text-gray-600 font-bold">
                    <span className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-gray-200">
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      <span>{count > 0 ? `${count} مذكرة جاهزة` : '10 مذكرات جاهزة'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-gray-200">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-500" />
                      <span>تدرج التعلمات</span>
                    </span>
                  </div>
                </div>

                {/* Left side: Action Button */}
                <div className="relative z-10 flex items-center gap-2 self-end sm:self-center">
                  <div
                    className="px-4 py-2.5 rounded-xl text-white text-[13px] font-black flex items-center gap-1.5 transition-all group-hover:scale-105 shadow-xs"
                    style={{ backgroundColor: lvl.accentColor }}
                  >
                    <span>دخول إلى مذكرات وتدرج التعلمات</span>
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Access to Independent Tools: Logbook & Profile Settings */}
        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Daily Logbook Card */}
          <button
            type="button"
            id="home-btn-logbook"
            onClick={onOpenLogbook}
            className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition shadow-2xs flex items-center justify-between text-right group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <BookOpenCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-[14.5px] text-gray-900">
                  الدفتر اليومي ودفتر النصوص
                </h4>
                <p className="text-[12px] text-gray-500">
                  مستقل لمتابعة وتسجيل الحصص اليومية والأفواج
                </p>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-emerald-700 group-hover:-translate-x-1 transition" />
          </button>

          {/* Account Settings Card */}
          <button
            type="button"
            id="home-btn-settings"
            onClick={onOpenSettings}
            className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition shadow-2xs flex items-center justify-between text-right group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold">
                <UserCog className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-[14.5px] text-gray-900">
                  إعدادات الحساب والخاتم
                </h4>
                <p className="text-[12px] text-gray-500">
                  تعديل اسم الأستاذ، المؤسسة، وتأشيرة الخاتم
                </p>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:-translate-x-1 transition" />
          </button>
        </div>

      </div>
    </div>
  );
};
