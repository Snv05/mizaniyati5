const fs = require('fs');

let content = fs.readFileSync('src/data/official_1am_maqta2.ts', 'utf8');

// The file looks like:
/*
      resource_id: 'res_1am_1_4',
      resource_name: 'أغذية النبات الأخضر',
      learning_units: [
        {
          learning_unit_id: 'lu_1am_1_4_1', ...
        },
        {
          learning_unit_id: 'lu_1am_1_4_2', ...
        },
        {
          learning_unit_id: 'lu_1am_1_4_3', ... // this is Mawrid 02
        },
        {
          learning_unit_id: 'lu_1am_1_4_4', ... // this is Mawrid 03
        },
        {
          learning_unit_id: 'lu_1am_1_4_5', ... // this is Mawrid 04
        },
        {
          learning_unit_id: 'lu_1am_1_4_6', ... // this is Mawrid 04
        }
      ]
*/

// We need to insert `      ]\n    },\n    {\n      resource_id: 'res_1am_1_5',\n      resource_name: 'التركيب الضوئي',\n      learning_units: [\n` before `lu_1am_1_4_3`

content = content.replace(
  `        {\n          learning_unit_id: 'lu_1am_1_4_3',`,
  `      ]\n    },\n    {\n      resource_id: 'res_1am_1_5',\n      resource_name: 'التركيب الضوئي',\n      learning_units: [\n        {\n          learning_unit_id: 'lu_1am_1_4_3',`
);

// We need to insert `      ]\n    },\n    {\n      resource_id: 'res_1am_1_6',\n      resource_name: 'أهمية التحكم في شروط التركيب الضوئي',\n      learning_units: [\n` before `lu_1am_1_4_4`

content = content.replace(
  `        {\n          learning_unit_id: 'lu_1am_1_4_4',`,
  `      ]\n    },\n    {\n      resource_id: 'res_1am_1_6',\n      resource_name: 'أهمية التحكم في شروط التركيب الضوئي',\n      learning_units: [\n        {\n          learning_unit_id: 'lu_1am_1_4_4',`
);

// We need to insert `      ]\n    },\n    {\n      resource_id: 'res_1am_1_7',\n      resource_name: 'ظاهرة النتح وأهميتها في انتقال النسغ',\n      learning_units: [\n` before `lu_1am_1_4_5`

content = content.replace(
  `        {\n          learning_unit_id: 'lu_1am_1_4_5',`,
  `      ]\n    },\n    {\n      resource_id: 'res_1am_1_7',\n      resource_name: 'ظاهرة النتح وأهميتها في انتقال النسغ',\n      learning_units: [\n        {\n          learning_unit_id: 'lu_1am_1_4_5',`
);

fs.writeFileSync('src/data/official_1am_maqta2.ts', content);
console.log('Split resources in Maqta 2');
