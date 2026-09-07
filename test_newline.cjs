const fs = require('fs');

const data = [
  { id: '1am-t1-w1', level: '1am', trimester: 1, month: 'سبتمبر', weekNumber: 1, midan: 'الإنسان والصحة', maqta: 'التقويم التشخيصي', mawrid: 'تقويم تشخيصي', learningContent: 'الحصة 1: استقبال التلاميذ؛ تعارف و تقويم تشخيصي\nالحصة 2: عرض الوضعية الانطلاقية الشاملة ومناقشتها وطرح التساؤلات حولها', allocatedHours: 2, status: 'pending' },
];

const arrStr = data.map(item => {
    return `  {
    learningContent: ${JSON.stringify(item.learningContent)},
  },`;
}).join('\n');

console.log(arrStr);
