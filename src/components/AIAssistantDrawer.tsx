import React, { useMemo, useState } from 'react';
import { LessonMemo } from '../types';
import { askSmartAi } from '../services/smartAi';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  FlaskConical,
  HelpCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  category?: string;
}

const QUICK_PROMPTS = [
  'كيف أصيغ وضعية مشكلة انطلاقية في مقطع التغذية؟',
  'ما هو الفرق بين الحركة الإرادية واللاإرادية في 4AM؟',
  'اقتراح تجارب علمية بسيطة للكشف عن النشا والغلوكوز',
  'كيف أوزع التوقيت البيداغوجي لدرس مدته ساعتان؟',
  'معايير ومؤشرات تقويم كفاءة ختامية في علوم الطبيعة',
];

export const AIAssistantDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedLevel?: string;
  currentLesson?: LessonMemo | null;
  curriculumLessons?: LessonMemo[];
}> = ({ isOpen, onClose, selectedLevel, currentLesson, curriculumLessons = [] }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `مرحباً بك زميلي الأستاذ(ة)! 🌿\nأنا **المساعد البيداغوجي الذكي** لأساتذة مادة علوم الطبيعة والحياة للتعليم المتوسط.\n\nيمكنني مساعدتك في:\n• صياغة المشكلات العلمية والفرضيات التعليمية.\n• اقتراح خطوات التجارب المخبرية وبدائل الوسائل المتاحة.\n• ضبط صياغة معايير ومؤشرات التقويم والكفاءات الختامية.\n• تكييف الأنشطة البيداغوجية حسب المنهاج الجزائري المعتمد.\n\nكيف يمكنني دعمك اليوم في تحضير حصتك؟`,
      timestamp: 'الآن',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const smartContext = useMemo(() => currentLesson ? [
    'المستوى: ' + (selectedLevel || currentLesson.level),
    'الميدان: ' + currentLesson.midan,
    'المقطع: ' + currentLesson.maqta,
    'المورد: ' + currentLesson.mawrid,
    'تعلم المورد: ' + currentLesson.ta3alom,
    'عدد الأنشطة: ' + currentLesson.anshita.length,
    'حالة المصدر: ' + (currentLesson.sourceOfficial ? 'رسمي' : 'عمل')
  ].join(' • ') : 'لا يوجد مورد تعلم محدد حالياً.', [currentLesson, selectedLevel]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    const activeContext = smartContext;
    if (!query) return;
    const q = query.toLowerCase();

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(async () => {
      let reply = '';
      try {
        const liveReply = await askSmartAi({ question: query, lesson: currentLesson, curriculum: curriculumLessons });
        if (liveReply) {
          reply = liveReply;
        }
      } catch (error) {
        console.error('[smart-ai]', error);
      }
      if (reply) {
        const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: reply, timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }) };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }
      if ((q.includes('المورد الحالي') || q.includes('السياق الحالي')) && currentLesson) {
        reply = 'السياق الذكي للمورد الحالي:\n' + activeContext + '\n\nالمركبة: ' + (currentLesson.markaba || 'غير محددة') + '\nالمعرفة: ' + (currentLesson.marifa || 'غير محددة') + '\nالمنهجية: ' + (currentLesson.manhaji || 'غير محددة') + '\nالوضعية: ' + (currentLesson.wadiya || 'غير محددة') + '\nالمشكلة: ' + (currentLesson.moshkila || 'غير محددة') + '\nالفرضيات: ' + (currentLesson.faradiyat || 'غير محددة');
      } else if (q.includes('كم نشاط') && currentLesson) {
        reply = 'وفق قاعدة البيانات الحالية، هذا المورد يحتوي على ' + currentLesson.anshita.length + ' نشاط/أنشطة.';
      }
      if (q.includes('وضعية') || q.includes('مشكلة') || q.includes('انطلاق')) {
        reply = `**إرشادات لصياغة وضعية انطلاق فعالة:**\n1. **السياق**: الانطلاق من واقع المتعلم المعيش أو حدث صحي/بيئي ملموس (مثال: وجبة عائلية، ممارسة رياضة، حادث منزلي).\n2. **السندات**: صورة معبرة، نتائج تحاليل دم، أو وثيقة جدولية بسيطة تثير تساؤلاً.\n3. **المشكل العلمي**: صياغة سؤال دقيق يبدأ بـ (كيف..؟ / ما هو دور..؟ / فسر..؟) يحمل تناقضاً ظاهرياً يدفع المتعلم لبناء فرضيات.\n4. **التعليمات**: توجيه المتعلم لاقتراح فرضيات تفسيرية قابلة للتحقق تجريبياً أو وثائقياً.`;
      } else if (q.includes('تجربة') || q.includes('مخبر') || q.includes('نشا') || q.includes('كشف')) {
        reply = `**البروتوكول التجريبي المقترح:**\n• **الكشف عن النشا**: إضافة قطرات من ماء اليود (Lugol) ➔ ظهور لون أزرق بنفسجي دلالة وجود النشا.\n• **الكشف عن السكريات المرجعة**: إضافة محلول فهلنك (A+B) مع التسخين المعتدل ➔ ظهور راسب أحمر آجوري.\n• **الكشف عن البروتينات**: تفاعل حمض الآزوت أو تفاعل البيوري (NaOH + CuSO4) ➔ ظهور لون أصفر أو بنفسجي.\n• **بدائل مدرسية**: استخدام قطع الخبز، زلال البيض المخفف، عصير العنب الطازج.`;
      } else if (q.includes('إرادية') || q.includes('لاإرادية') || q.includes('عصبي')) {
        reply = `**مقارنة بيداغوجية لمستوى 4 متوسط:**\n• **الحركة الإرادية**: مركزها العصبي هو **القشرة المخية** (السطح الحركي)، الرسالة نابذة، الهدف منها تحقيق رغبة شعورية.\n• **الفعل اللاإرادي (المنعكس الفطري)**: مركزه العصبي هو **النخاع الشوكي**، استجابة متماثلة وسريعة لحماية العضوية من الأخطار.\n• **عناصر القوس الانعكاسي**: مستقبل حسي ➔ ناقل حسي (عصب جابذ) ➔ مركز عصبي (نخاع شوكي) ➔ ناقل حركي (عصب نابذ) ➔ عضو منفذ (عضلة).`;
      } else if (q.includes('توقيت') || q.includes('زمن') || q.includes('ساعة')) {
        reply = `**التوزيع الزمني النموذجي لحصة (60 دقيقة):**\n• **وضعية الانطلاق والمشكل العلمي**: 5 إلى 10 دقائق.\n• **مرحلة البحث وتقصي الأنشطة (العمل الميداني/الفوجي)**: 30 إلى 35 دقيقة.\n• **إرساء الموارد وصياغة الخلاصة المعرفية**: 10 إلى 15 دقيقة.\n• **تقويم الموارد والتمرين التطبيقي**: 5 دقائق.`;
      } else {
        const levelCount = curriculumLessons.filter(l => l.level === currentLesson?.level).length;
        reply = `شكراً لسؤالك البيداغوجي القيم! بخصوص **"${query}"**:\n\nبناءً على التدرج البيداغوجي لوزارة التربية الوطنية لمادة علوم الطبيعة والحياة:\n• يُنصح دائماً بربط التعلمات بمؤشرات الكفاءة الختامية وتفعيل أسلوب التقصي وحل المشكلات.\n• يمكنك تضمين هذه الملاحظات في خانة الملاحظات بالدفتر اليومي أو في المذكرة البيداغوجية مباشرة.\n• النظام الذكي مرتبط حالياً بـ ${levelCount} سجل في مستوى المورد الحالي.\n• هل ترغب في اقتراح نشاط صفي مدعم أو وضعية تقويمية محددة لهذا المورد؟`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div
      id="ai-assistant-drawer"
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-l from-[#0f766e]/10 to-teal-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-gray-900 text-[15px]">المساعد البيداغوجي الذكي</h3>
                <span className="bg-teal-100 text-teal-800 text-[10.5px] font-black px-2 py-0.5 rounded-full">
                  AI
                </span>
              </div>
              <p className="text-[11.5px] text-gray-500 font-medium">
                استشارات المنهاج، صياغة المشكلات العلمية والتجارب المخبرية
              </p>
              <div className="mt-1 text-[10px] text-emerald-700 font-bold truncate max-w-[340px]">
                السياق الذكي: {currentLesson?.ta3alom || 'لا يوجد مورد محدد'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome',
                    sender: 'ai',
                    text: 'تمت إعادة تهيئة المحادثة. كيف يمكنني مساعدتك في تحضير حصص علوم الطبيعة والحياة؟',
                    timestamp: 'الآن',
                  },
                ])
              }
              title="مسح المحادثة"
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 font-black text-lg transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  m.sender === 'user' ? 'bg-gray-800' : 'bg-teal-700'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-[13px] leading-relaxed font-medium shadow-2xs whitespace-pre-line ${
                  m.sender === 'user'
                    ? 'bg-gray-900 text-white rounded-tl-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tr-none'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-1.5 text-left ${
                    m.sender === 'user' ? 'text-gray-400' : 'text-gray-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold p-2">
              <Bot className="w-4 h-4 text-teal-700 animate-spin" />
              <span>المساعد يحلل طلبك ويكتب الإجابة...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 border-t border-gray-200 bg-white space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>أسئلة ومقترحات سريعة:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-gray-100 hover:bg-teal-50 hover:text-teal-900 border border-gray-200 text-gray-700 font-medium transition cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب استفسارك البيداغوجي أو المنهجي هنا..."
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800 disabled:opacity-40 transition shadow-xs cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
