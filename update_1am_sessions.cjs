const fs = require('fs');

const data = [
  { id: '1am-t1-w1', level: '1am', trimester: 1, month: 'سبتمبر', weekNumber: 1, midan: 'الإنسان والصحة', maqta: 'التقويم التشخيصي', mawrid: 'تقويم تشخيصي', learningContent: 'حصة 1: استقبال التلاميذ؛ تعارف و تقويم تشخيصي.\nحصة 2: عرض الوضعية الانطلاقية الشاملة ومناقشتها.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w2', level: '1am', trimester: 1, month: 'سبتمبر', weekNumber: 2, midan: 'الإنسان والصحة', maqta: 'التقويم التشخيصي', mawrid: 'معالجة بيداغوجية', learningContent: 'حصة 1: معالجة بيداغوجية للكفاءة الأولى (حفظ الصحة).\nحصة 2: معالجة بيداغوجية للكفاءة الثانية (حماية المحيط) + عرض وضعية الانطلاق.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w3', level: '1am', trimester: 1, month: 'أكتوبر', weekNumber: 3, midan: 'الإنسان والصحة', maqta: 'المقطع I: التغذية عند الإنسان', mawrid: '1 مصدر الأغذية وتركيبها', learningContent: 'حصة 1: نشاط 01: التعرف على مصدر الأغذية + نشاط 02: تصنيف الأغذية حسب الأصل.\nحصة 2: نشاط 01: تحليل الحليب + نشاط 03: المقارنة بين تركيب الأغذية.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w4', level: '1am', trimester: 1, month: 'أكتوبر', weekNumber: 4, midan: 'الإنسان والصحة', maqta: 'المقطع I: التغذية عند الإنسان', mawrid: '2 دور الأغذية في الجسم', learningContent: 'حصة 1: نشاط: عواقب سوء التغذية.\nحصة 2: إرساء الموارد حول دور الأغذية في الجسم.', allocatedHours: 2, notes: 'عطلة الخريف من 28 أكتوبر إلى 2 نوفمبر 2026', status: 'pending' },
  { id: '1am-t1-w5', level: '1am', trimester: 1, month: 'نوفمبر', weekNumber: 5, midan: 'الإنسان والصحة', maqta: 'المقطع I: التغذية عند الإنسان', mawrid: '3 الرواتب الغذائية والتوازن الغذائي', learningContent: 'حصة 1: نشاط 01: الحاجيات الغذائية حسب النشاط + نشاط 02: الحاجيات الغذائية حسب العمر.\nحصة 2: نشاط 01: مفهوم الراتب الغذائي + نشاط 02: أنواع الرواتب الغذائية.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w6', level: '1am', trimester: 1, month: 'نوفمبر', weekNumber: 6, midan: 'الإنسان والصحة', maqta: 'المقطع I: التغذية عند الإنسان', mawrid: '3 الرواتب الغذائية والتوازن الغذائي', learningContent: 'حصة 1: حل وضعية إدماج تخص التوازن الغذائي.\nحصة 2: الفرض المحروس الأول وتصحيحه.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w7', level: '1am', trimester: 1, month: 'نوفمبر', weekNumber: 7, midan: 'الإنسان والمحيط', maqta: 'المقطع II: التغذية عند النبات الأخضر', mawrid: '1 أغذية النبات الأخضر', learningContent: 'حصة 1: طرح وضعية مشكلة انطلاقية + نشاط 01: شروط نمو النبات الأخضر.\nحصة 2: نشاط 02: إظهار أهمية العناصر المعدنية لنمو النبات الأخضر.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w8', level: '1am', trimester: 1, month: 'نوفمبر', weekNumber: 8, midan: 'الإنسان والمحيط', maqta: 'المقطع II: التغذية عند النبات الأخضر', mawrid: '1 أغذية النبات الأخضر', learningContent: 'حصة 1: نشاط 01: تحديد مقر امتصاص المحلول المعدني.\nحصة 2: نشاط 02: تحديد مقر المبادلات الغازية اليخضورية (امتصاص CO2).', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w9', level: '1am', trimester: 1, month: 'ديسمبر', weekNumber: 9, midan: 'الإنسان والمحيط', maqta: 'المقطع II: التغذية عند النبات الأخضر', mawrid: '2 التركيب الضوئي', learningContent: 'حصة 1: نشاط 01: اظهار وجود النشاء في أوراق النبات الأخضر + نشاط 02: إظهار انطلاق غاز ثنائي الأكسجين O2 من طرف النبات الأخضر.\nحصة 2: نشاط 03: إظهار تركيب النبات الأخضر لمواد عضوية أخرى.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w10', level: '1am', trimester: 1, month: 'ديسمبر', weekNumber: 10, midan: 'الإنسان والمحيط', maqta: 'تقويم وإدماج', mawrid: 'اختبارات الفصل الأول', learningContent: 'اختبارات الفصل الأول من 6 إلى 10 ديسمبر 2026', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w11', level: '1am', trimester: 1, month: 'ديسمبر', weekNumber: 11, midan: 'الإنسان والمحيط', maqta: 'المقطع II: التغذية عند النبات الأخضر', mawrid: '3 الاعتناء بالنبات الأخضر كمنتج للمادة', learningContent: 'حصة 1: تصحيح الإختبار الأول.\nحصة 2: نشاط 01: أهمية التحكم في شروط التركيب الضوئي + نشاط 02: سلوكات الإنسان اتجاه النبات الأخضر.', allocatedHours: 2, notes: 'عطلة الشتاء من الخميس 17 ديسمبر 2026 إلى الأحد 3 جانفي 2027', status: 'pending' },
  { id: '1am-t2-w12', level: '1am', trimester: 2, month: 'جانفي', weekNumber: 12, midan: 'الإنسان والمحيط', maqta: 'المقطع II: التغذية عند النبات الأخضر', mawrid: '4 انتقال النسغ', learningContent: 'حصة 1: نشاط 01: دراسة الأوعية الناقلة للنسغ + نشاط 02: مسار النسغ الناقص والنسغ الكامل.\nحصة 2: نشاط 01: النتح وعلاقته بانتقال النسغ.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w13', level: '1am', trimester: 2, month: 'جانفي', weekNumber: 13, midan: 'الإنسان والصحة', maqta: 'المقطع III: التحصل على الطاقة عند الإنسان', mawrid: '1 المبادلات الغازية التنفسية عند الإنسان', learningContent: 'حصة 1: وضعية إدماج الموارد السابقة + وضعية انطلاق.\nحصة 2: نشاط 01: مقارنة تركيب هواء الشهيق وهواء الزفير + نشاط 02: إظهار عماية التنفس ومقرها عند الإنسان.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w14', level: '1am', trimester: 2, month: 'جانفي', weekNumber: 14, midan: 'الإنسان والصحة', maqta: 'المقطع III: التحصل على الطاقة عند الإنسان', mawrid: '2 المعنى البيولوجي للتنفس', learningContent: 'حصة 1: نشاط 01: الحاجة إلى الغلوسيد + نشاط 02: الحاجة لغاز ثنائي الأكسجين.\nحصة 2: الفرض المحروس الثاني.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w15', level: '1am', trimester: 2, month: 'فيفري', weekNumber: 15, midan: 'الإنسان والصحة', maqta: 'المقطع III: التحصل على الطاقة عند الإنسان', mawrid: '3 قواعد التنفس الصحي', learningContent: 'حصة 1: نشاط 01: الأمراض التنفسية وأسبابها + نشاط 02: القواعد الصحية للتنفس.\nحصة 2: تصحيح الفرض المحروس الثاني.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w16', level: '1am', trimester: 2, month: 'فيفري', weekNumber: 16, midan: 'الإنسان والمحيط', maqta: 'المقطع IV: التحصل على الطاقة عند النبات الأخضر', mawrid: '1 المبادلات الغازية التنفسية ومقرها', learningContent: 'حصة 1: طرح وضعية انطلاقية + نشاط 01: إظهار حدوث المبادلات الغازية التنفسية عند النبات الأخضر.\nحصة 2: نشاط 02: إظهار حدوث المبادلات الغازية التنفسية على مستوى أعضاء النبات + نشاط 03: تحديد مقر المبادلات الغازية التنفسية.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w17', level: '1am', trimester: 2, month: 'فيفري', weekNumber: 17, midan: 'الإنسان والمحيط', maqta: 'المقطع IV: التحصل على الطاقة عند النبات الأخضر', mawrid: '2 تعريف تنفس النبات كعملية تحصل على الطاقة', learningContent: 'حصة 1: نشاط 01: تعريف التنفس عند النبات الأخضر.\nحصة 2: استنتاج العلاقة بين استهلاك الغذاء و O2 والنشاط الفيزيولوجي للنبات.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w18', level: '1am', trimester: 2, month: 'فيفري', weekNumber: 18, midan: 'الإنسان والمحيط', maqta: 'المقطع IV: التحصل على الطاقة عند النبات الأخضر', mawrid: '3 تعريف التخمر كنمط آخر للتحصل على الطاقة', learningContent: 'حصة 1: نشاط 01: الملاحظة المجهرية لفطر الخميرة.\nحصة 2: نشاط 02: التخمر كنمط للحصول على الطاقة.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w19', level: '1am', trimester: 2, month: 'مارس', weekNumber: 19, midan: 'الإنسان والصحة', maqta: 'المقطع V: الإطراح عند الإنسان', mawrid: '1 تعريف الإطراح ودوره في ثبات توازن الوسط داخلي', learningContent: 'حصة 1: وضعية الانطلاق + نشاط 01: تركيب البول والعرق.\nحصة 2: نشاط 01: تركيب الجهاز البولي + نشاط 02: دور الكلية في الإطراح + نشاط 03: دور الجلد في الإطراح.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w20', level: '1am', trimester: 2, month: 'مارس', weekNumber: 20, midan: 'الإنسان والصحة', maqta: 'تقويم وإدماج', mawrid: 'اختبارات الفصل الثاني', learningContent: 'اختبارات الفصل الثاني من 7 إلى 11 مارس 2027', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w21', level: '1am', trimester: 2, month: 'مارس', weekNumber: 21, midan: 'الإنسان والصحة', maqta: 'المقطع V: الإطراح عند الإنسان', mawrid: '2 القواعد الصحية للاطراح', learningContent: 'حصة 1: تصحيح الإختبار الثاني.\nحصة 2: نشاط: ابراز أهم القواعد الصحية للإطراح.', allocatedHours: 2, notes: 'عطلة الربيع من الخميس 18 مارس إلى الأحد 4 أفريل 2027', status: 'pending' },
  { id: '1am-t3-w22', level: '1am', trimester: 3, month: 'أفريل', weekNumber: 22, midan: 'الإنسان والصحة', maqta: 'المقطع VI: التكاثر عند الإنسان', mawrid: '1 الأجهزة التكاثرية', learningContent: 'حصة 1: النشاط 01: وصف الجهاز التكاثري الذكري والأنثوي.\nحصة 2: النشاط 02: دور المناسل.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w23', level: '1am', trimester: 3, month: 'أفريل', weekNumber: 23, midan: 'الإنسان والصحة', maqta: 'المقطع VI: التكاثر عند الإنسان', mawrid: '2 الإلقاح و شروطه', learningContent: 'حصة 1: النشاط 01: مفهوم الإلقاح.\nحصة 2: النشاط 02: شروط الإلقاح.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w24', level: '1am', trimester: 3, month: 'أفريل', weekNumber: 24, midan: 'الإنسان والصحة', maqta: 'المقطع VI: التكاثر عند الإنسان', mawrid: '3 القواعد الصحية للتكاثر', learningContent: 'حصة 1: النشاط 01: القواعد الصحية للتكاثر.\nحصة 2: الفرض المحروس الثالث.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w25', level: '1am', trimester: 3, month: 'أفريل', weekNumber: 25, midan: 'الإنسان والمحيط', maqta: 'المقطع VII: التكاثر عند النباتات ذات الأزهار', mawrid: '1 الجهاز التكاثري عند النبات الزهري', learningContent: 'حصة 1: تصحيح الفرض الثالث + وضعية انطلاق المقطع السابع.\nحصة 2: نشاط 01: مكونات الزهرة + نشاط 02: إبراز المناسل ودورها + نشاط 03: تصنيف الأزهار حسب الجنس.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w26', level: '1am', trimester: 3, month: 'ماي', weekNumber: 26, midan: 'الإنسان والمحيط', maqta: 'المقطع VII: التكاثر عند النباتات ذات الأزهار', mawrid: '1 الالقاح وشروطه', learningContent: 'حصة 1: نشاط 01: عملية التأبير.\nحصة 2: نشاط 02: عملية الإلقاح وشروطها.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w27', level: '1am', trimester: 3, month: 'ماي', weekNumber: 27, midan: 'الإنسان والمحيط', maqta: 'المقطع VIII: الخلية', mawrid: '1 الخلية', learningContent: 'حصة 1: نشاط 01: مكونات الخلية الحيوانية.\nحصة 2: نشاط 02: مكونات الخلية النباتية.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w28', level: '1am', trimester: 3, month: 'ماي', weekNumber: 28, midan: 'تقويم وإدماج', maqta: 'إدماج كلي للمقطع 7 و 8', mawrid: 'حصة ادماج كلي', learningContent: 'حصة 1: حصة ادماج كلي للمقطع 7 و 8.\nحصة 2: حل وضعيات مشكلة تقويمية.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w29', level: '1am', trimester: 3, month: 'ماي', weekNumber: 29, midan: 'تقويم وإدماج', maqta: 'اختبارات الفصل الثالث', mawrid: 'اختبارات الفصل الثالث', learningContent: 'اختبارات الفصل الثالث من 17 إلى 21 ماي 2027', allocatedHours: 2, status: 'pending' }
];

let fileContent = fs.readFileSync('src/data/annualDistributionData.ts', 'utf8');
const startIndex = fileContent.indexOf('  // 1AM - السنة الأولى متوسط');
const endIndex = fileContent.indexOf('  // 2AM - السنة الثانية متوسط');

if (startIndex !== -1 && endIndex !== -1) {
  const arrStr = data.map(item => {
    return `  {
    id: '${item.id}',
    level: '${item.level}',
    trimester: ${item.trimester},
    month: '${item.month}',
    weekNumber: ${item.weekNumber},
    midan: '${item.midan}',
    maqta: '${item.maqta}',
    mawrid: '${item.mawrid}',
    learningContent: \`${item.learningContent}\`` +
    (item.notes ? `,\n    notes: '${item.notes}'` : '') +
    `,\n    allocatedHours: ${item.allocatedHours},
    status: '${item.status}'
  },`;
  }).join('\n');

  const newContent = fileContent.substring(0, startIndex) + 
    '  // ==========================================\n' +
    '  // 1AM - السنة الأولى متوسط\n' +
    '  // ==========================================\n' +
    arrStr + '\n' +
    fileContent.substring(endIndex);
    
  fs.writeFileSync('src/data/annualDistributionData.ts', newContent);
  console.log('Successfully updated 1AM data with concise titles and sessions.');
} else {
  console.error('Could not find markers for 1AM and 2AM.');
}
