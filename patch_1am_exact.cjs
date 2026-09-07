const fs = require('fs');

const data = [
  { id: '1am-t1-w1', level: '1am', trimester: 1, month: 'سبتمبر', weekNumber: 1, midan: 'الإنسان والصحة', maqta: 'التقويم التشخيصي', mawrid: 'تقويم تشخيصي', learningContent: '- استقبال التلاميذ؛ تعارف و تقويم تشخيصي\n- عرض الوضعية الانطلاقية الشاملة ومناقشتها وطرح التساؤلات حول', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w2', level: '1am', trimester: 1, month: 'سبتمبر', weekNumber: 2, midan: 'الإنسان والصحة', maqta: 'التقويم التشخيصي', mawrid: 'معالجة بيداغوجية', learningContent: '1 - الكفاءة الأولى: حفظ الصحة المعايير: 3، 4، 5\n2 - الكفاءة الثانية: حماية المحيط المعايير: 3، 4، 5\n- عرض وضعية الانطلاق ومناقشتها', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w3', level: '1am', trimester: 1, month: 'أكتوبر', weekNumber: 3, midan: 'الإنسان والصحة', maqta: 'المقطع I: التغذية عند الإنسان', mawrid: '1 مصدر الأغذية وتركيبها', learningContent: '1- مصدر الأغذية وتركيبها:\nنشاط 1 يكشف - تجريبيا مصدر الأغذية أو يحلل نتائج تجريبية\nنشاط 2 يقارن - تركيب بعض الأغذية (يكشف تجريبيا مركبات الغذاء)\nنشاط 3 ينجز - حوصلة لمصدر الأغذية وتركيبها (مخطط تلخيصي أو نص)', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w4', level: '1am', trimester: 1, month: 'أكتوبر', weekNumber: 4, midan: 'الإنسان والصحة', maqta: 'المقطع I: التغذية عند الإنسان', mawrid: '2 دور الأغذية في الجسم', learningContent: '2 - دور الأغذية في الجسم:\nنشاط 1 يستخرج - العلاقة بين أعراض بعض أمراض سوء التغذية ومميزات الغذاء المستهلك.\nنشاط 2 يلخص - دور الأغذية في العضوية.', allocatedHours: 2, notes: 'عطلة الخريف من 28 أكتوبر إلى 2 نوفمبر 2026', status: 'pending' },
  { id: '1am-t1-w5', level: '1am', trimester: 1, month: 'نوفمبر', weekNumber: 5, midan: 'الإنسان والصحة', maqta: 'المقطع I: التغذية عند الإنسان', mawrid: '3 الرواتب الغذائية والتوازن الغذائي', learningContent: '3 - الرواتب الغذائية والتوازن الغذائي:\nنشاط 1 يحدد - الحاجيات الغذائية للعضوية على أساس دورها\nنشاط 2 يستنتج العوامل التي تتحكم في تغير الحاجيات الغذائية\nالفرض المحروس الأول', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w6', level: '1am', trimester: 1, month: 'نوفمبر', weekNumber: 6, midan: 'الإنسان والصحة', maqta: 'المقطع I: التغذية عند الإنسان', mawrid: '3 الرواتب الغذائية والتوازن الغذائي', learningContent: 'نشاط 3 يحل وضعية إدماج تخص التوازن الغذائي.\n- تصحيح الفرض المحروس الأول', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w7', level: '1am', trimester: 1, month: 'نوفمبر', weekNumber: 7, midan: 'الإنسان والمحيط', maqta: 'المقطع II: التغذية عند النبات الأخضر', mawrid: '1 أغذية النبات الأخضر', learningContent: 'طرح وضعية مشكلة انطلاقية: ... طرح وضعيات تعلم الموارد\nالحاجات الغذائية عند النبات الأخضر\nنشاط 1 يقترح بروتوكولا تجريبيا أو يحلل نتائج تجريبية: الحاجات الغذائية الضرورية لنمو النبات الأخضر', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w8', level: '1am', trimester: 1, month: 'نوفمبر', weekNumber: 8, midan: 'الإنسان والمحيط', maqta: 'المقطع II: التغذية عند النبات الأخضر', mawrid: '1 أغذية النبات الأخضر', learningContent: 'نشاط 2 يستخرج - العناصر الأساسية في محلول كنوب\nيستنتج عواقب التفريط والافراط في العناصر المعدنية للنبات الأخضر\nنشاط 3 يقترح بروتوكولا تجريبيا أو يحلل نتائج تجريبية حول (مقرامتصاص المحلول المعدني)', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w9', level: '1am', trimester: 1, month: 'ديسمبر', weekNumber: 9, midan: 'الإنسان والمحيط', maqta: 'المقطع II: التغذية عند النبات الأخضر', mawrid: '2 التركيب الضوئي', learningContent: 'المبادلات الغازية اليخضورية عند النبات الأخضر ومقرها\nنشاط 1 يحلل - نتائج تجريبية تظهر حدوث المبادلات الغازية اليخضورية عند النبات الأخضر ومقرها.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w10', level: '1am', trimester: 1, month: 'ديسمبر', weekNumber: 10, midan: 'الإنسان والمحيط', maqta: 'تقويم وإدماج', mawrid: 'اختبارات الفصل الأول', learningContent: 'اختبارات الفصل الأول من 6 إلى 10 ديسمبر 2026', allocatedHours: 2, status: 'pending' },
  { id: '1am-t1-w11', level: '1am', trimester: 1, month: 'ديسمبر', weekNumber: 11, midan: 'الإنسان والمحيط', maqta: 'المقطع II: التغذية عند النبات الأخضر', mawrid: '3 الاعتناء بالنبات الأخضر كمنتج للمادة', learningContent: '- تصحيح الإختبار الأول\n3- الاعتناء بالنبات الاخضر كمنتج للمادة العضوية\nنشاط 1 يحلل - نتائج تطبيقات فلاحية لإكثار الإنتاج النباتي بالتحكم في شروط التركيب الضوئي', allocatedHours: 2, notes: 'عطلة الشتاء من الخميس 17 ديسمبر 2026 إلى الأحد 3 جانفي 2027', status: 'pending' },
  { id: '1am-t2-w12', level: '1am', trimester: 2, month: 'جانفي', weekNumber: 12, midan: 'الإنسان والمحيط', maqta: 'المقطع II: التغذية عند النبات الأخضر', mawrid: '4 انتقال النسغ', learningContent: 'نشاط 1 يحدد - مقر انتقال النسغ الخام في النبات الاخضر\nنشاط 2 ينجز تجربة أو يفسر - نتائج تجريبية تبرز دور النتح\nنشاط 3 ينمذج - مسار النسغ في النبات الأخضر أو يكتب فقرة\nطرح وضعية إدماج الموارد التي تم بناءها + معالجة بيداغوجية محتملة', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w13', level: '1am', trimester: 2, month: 'جانفي', weekNumber: 13, midan: 'الإنسان والصحة', maqta: 'المقطع III: التحصل على الطاقة عند الإنسان', mawrid: '1 المبادلات الغازية التنفسية عند الإنسان', learningContent: 'طرح وضعية مشكل انطلاقية: طرح وضعيات تعلم الموارد التالية\n1- المبادلات الغازية - التنفسية و مقرها\nنشاط 1 يحدد - مقر المبادلات الغازية التنفسية عند الانسان .\nنشاط 2 يستخرج - مميزات السنخ الرئوي التي تجعل منه سطح تبادل', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w14', level: '1am', trimester: 2, month: 'جانفي', weekNumber: 14, midan: 'الإنسان والصحة', maqta: 'المقطع III: التحصل على الطاقة عند الإنسان', mawrid: '2 المعنى البيولوجي للتنفس', learningContent: '2-التنفس مصدر للطاقة-\nنشاط 1 يفسر - زيادة استهلاك الغذاء والأكسجين عند زيادة نشاط العضوية لبناء المعنى البيولوجي للتنفس\nالفرض المحروس الثاني', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w15', level: '1am', trimester: 2, month: 'فيفري', weekNumber: 15, midan: 'الإنسان والصحة', maqta: 'المقطع III: التحصل على الطاقة عند الإنسان', mawrid: '3 قواعد التنفس الصحي', learningContent: '3-قواعد التنفس الصحي\nنشاط 1 يناقش - وضعيات اختلال وظيفة التنفس لإبراز أهميتها الصحية.\n- تصحيح الفرض المحروس الثاني', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w16', level: '1am', trimester: 2, month: 'فيفري', weekNumber: 16, midan: 'الإنسان والمحيط', maqta: 'المقطع IV: التحصل على الطاقة عند النبات الأخضر', mawrid: '1 المبادلات الغازية التنفسية ومقرها', learningContent: 'طرح وضعية مشكل انطلاقية: ... طرح وضعيات تعلم الموارد التالية\nنشاط 1 يحدد مقر - المبادلات إما بإنجاز تجارب أو بتحليل نتائج تجريبية\nنشاط 2 يفحص - مجهريا بشرة عضو نباتي أو يستغل وثائق هادفة.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w17', level: '1am', trimester: 2, month: 'فيفري', weekNumber: 17, midan: 'الإنسان والمحيط', maqta: 'المقطع IV: التحصل على الطاقة عند النبات الأخضر', mawrid: '2 تعريف تنفس النبات كعملية تحصل على الطاقة', learningContent: '2 تعريف تنفس النبات كعملية تحصل على الطاقة\nنشاط 1 يضع علاقة سببية بين زيادة استهلاك الغذاء وغاز O2 والنشاط الفيزيولوجي للنبات لبناء المعنى البيولوجي للتنفس.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w18', level: '1am', trimester: 2, month: 'فيفري', weekNumber: 18, midan: 'الإنسان والمحيط', maqta: 'المقطع IV: التحصل على الطاقة عند النبات الأخضر', mawrid: '3 تعريف التخمر كنمط آخر للتحصل على الطاقة', learningContent: '3 تعريف التخمر كنمط آخر للتحصل على الطاقة\nنشاط 1 يعلل لجوء بعض الكائنات الحية للتخمر\nنشاط 2 يستخرج - الفرق بين التنفس والتخمر.\nطرح وضعية إدماج الموارد التي تم بناءها + معالجة بيداغوجية محتملة', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w19', level: '1am', trimester: 2, month: 'مارس', weekNumber: 19, midan: 'الإنسان والصحة', maqta: 'المقطع V: الإطراح عند الإنسان', mawrid: '1 تعريف الإطراح ودوره في ثبات توازن الوسط داخلي', learningContent: 'طرح وضعية مشكل انطلاقية: ... طرح وضعيات تعلم الموارد التالية\n1 تعريف الإطراح ودوره في ثبات توازن الوسط داخلي\nنشاط 1 يقارن - بين تركيب البول والدم والعرق لبناء مفهوم الاطراح\nنشاط 2 يصف - أعضاء الإطراح\n-يصف بنية الكلية والجلد ويحدد دورهما في الإطراح', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w20', level: '1am', trimester: 2, month: 'مارس', weekNumber: 20, midan: 'الإنسان والصحة', maqta: 'تقويم وإدماج', mawrid: 'اختبارات الفصل الثاني', learningContent: 'اختبارات الفصل الثاني من 7 إلى 11 مارس 2027', allocatedHours: 2, status: 'pending' },
  { id: '1am-t2-w21', level: '1am', trimester: 2, month: 'مارس', weekNumber: 21, midan: 'الإنسان والصحة', maqta: 'المقطع V: الإطراح عند الإنسان', mawrid: '2 القواعد الصحية للاطراح', learningContent: '- تصحيح الإختبار الثاني\n2 القواعد الصحية للاطراح\nنشاط 1 يناقش - وضعيات لحالات مرضية تخص الإنتان البولي أو تشكل الحصى في الكلى لاستخراج أهم القواعد الصحية للاطراح.\nطرح وضعية إدماج الموارد التي تم بناءها + معالجة بيداغوجية محتملة', allocatedHours: 2, notes: 'عطلة الربيع من الخميس 18 مارس إلى الأحد 4 أفريل 2027', status: 'pending' },
  { id: '1am-t3-w22', level: '1am', trimester: 3, month: 'أفريل', weekNumber: 22, midan: 'الإنسان والصحة', maqta: 'المقطع VI: التكاثر عند الإنسان', mawrid: '1 الأجهزة التكاثرية', learningContent: '1 - البنية التشريحية للأجهزة التكاثرية عند الإنسان\nنشاط:1 - يميز المجاري التناسلية والمناسل.\nنشاط:2 - يبرز دور كل من المبيض والخصية بتحليل نتائج تجريبية', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w23', level: '1am', trimester: 3, month: 'أفريل', weekNumber: 23, midan: 'الإنسان والصحة', maqta: 'المقطع VI: التكاثر عند الإنسان', mawrid: '2 الإلقاح و شروطه', learningContent: '2 - الالقاح وشروطه\nنشاط : - يستخرج مفهوم الالقاح\nنشاط 1 - يحدد شروط حدوث الالقاح', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w24', level: '1am', trimester: 3, month: 'أفريل', weekNumber: 24, midan: 'الإنسان والصحة', maqta: 'المقطع VI: التكاثر عند الإنسان', mawrid: '3 القواعد الصحية للتكاثر', learningContent: '3- القواعد الصحية للتكاثر\nنشاط 1 - انجاز بحوث موجهة تخص الصحة الجنسية.\nالفرض المحروس الثالث\nوضعية انطلاق المقطع الخامس', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w25', level: '1am', trimester: 3, month: 'أفريل', weekNumber: 25, midan: 'الإنسان والمحيط', maqta: 'المقطع VII: التكاثر عند النباتات ذات الأزهار', mawrid: '1 الجهاز التكاثري عند النبات الزهري', learningContent: 'البنية التشريحية للأجهزة التكاثرية عند النبات الزهري\nنشاط 1 : يقارن بين زهرة ذكرية وأخرى انثوية لإبراز الجنسية\nنشاط 2 : - يحدد دور كل من السداة والمدقة\n- تصحيح الفرض المحروس الثالث', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w26', level: '1am', trimester: 3, month: 'ماي', weekNumber: 26, midan: 'الإنسان والمحيط', maqta: 'المقطع VII: التكاثر عند النباتات ذات الأزهار', mawrid: '1 الالقاح وشروطه', learningContent: 'الالقاح وشروطه\nنشاط 1 : - يستخرج مميزات التكاثر الجنسي عند النباتات ذات الأزهار', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w27', level: '1am', trimester: 3, month: 'ماي', weekNumber: 27, midan: 'الإنسان والمحيط', maqta: 'المقطع VIII: الخلية', mawrid: '1 الخلية', learningContent: 'نشاط 1 : - يفحص مجهريا نسيج حيواني وآخر نباتي\nنشاط 2 : - يستخرج المكونات الأساسية المشتركة للخلية فحص مجهري.', allocatedHours: 2, status: 'pending' },
  { id: '1am-t3-w28', level: '1am', trimester: 3, month: 'ماي', weekNumber: 28, midan: 'تقويم وإدماج', maqta: 'إدماج كلي للمقطع 7 و 8', mawrid: 'حصة ادماج كلي', learningContent: 'حصة ادماج كلي للمقطع 7 و 8 + حل وضعيات مشكلة تقويمية', allocatedHours: 2, status: 'pending' },
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
  console.log('Successfully updated 1AM data with exact multi-line text from images.');
} else {
  console.error('Could not find markers for 1AM and 2AM.');
}
