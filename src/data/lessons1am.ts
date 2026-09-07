import { LessonMemo, Activity } from '../types';
import { seq_1 } from './official_1am_maqta1';
import { seq_2 } from './official_1am_maqta2';
import { seq_3, seq_4 } from './official_1am_maqta3';
import { seq_5, seq_6 } from './official_1am_maqta4';
import { seq_7, seq_8, seq_9 } from './official_1am_maqta5';

const DB_1AM = [seq_1, seq_2, seq_3, seq_4, seq_5, seq_6, seq_7, seq_8, seq_9];

export const LESSONS_1AM: LessonMemo[] = [];
let memoCounter = 1;

for (const seq of DB_1AM) {
  for (const res of seq.resources) {
    for (const unit of res.learning_units) {
      const anshita: Activity[] = unit.activities
        .filter(act => act.ustadh_activity && act.ustadh_activity.trim() !== '')
        .map(act => ({
          title: act.activity_title,
          asila: act.ustadh_activity,
          ajwiba: act.mutaalim_activity,
          zaman: act.zaman || '30 د',
          mola7adha: '',
          diagrams: act.diagrams,
          tables: act.tables
        }));

      // Find if any activity has diagrams, pass the first one up for UI compatibility if needed
      let diagramSvg = undefined;
      let diagramTitle = undefined;
      for (const act of unit.activities) {
        if (act.diagrams && act.diagrams.length > 0) {
          diagramSvg = act.diagrams[0].diagram_svg;
          diagramTitle = act.diagrams[0].diagram_title;
          break;
        }
      }

      // Midan logic
      let midan = 'الإنسان والصحة';
      let kafaa = 'يحل مشكلات متعلقة بالصحة استناداً إلى المعارف المتعلقة بالتغذية والوظائف الحيوية.';
      
      if (seq.sequence_id === 'seq_1am_2' || seq.sequence_id === 'seq_1am_4' || seq.sequence_id === 'seq_1am_6' || seq.sequence_id === 'seq_1am_8' || seq.sequence_id === 'seq_1am_9') {
        midan = 'الإنسان والمحيط';
        kafaa = 'يقترح حلولاً وقائية للتدخلات السلبية للإنسان تجاه المحيط استناداً إلى المعارف المتعلقة بالأنظمة البيئية.';
      }

      LESSONS_1AM.push({
        level: '1am',
        memoNumber: memoCounter.toString().padStart(2, '0'),
        midan: midan,
        maqta: seq.sequence_name,
        mawrid: res.resource_name,
        ta3alom: unit.learning_unit_name,
        markaba: unit.markaba,
        kafaaKhitamiya: kafaa,
        ma3ayirTaqwim: unit.qayimi || 'يتبنى سلوكات إيجابية تجاه صحته وبيئته.',
        marifa: unit.marifa,
        manhaji: unit.manhaji,
        mostalahat: unit.mostalahat || 'مصطلحات علمية',
        wasail: unit.wasail || 'الكتاب المدرسي، جهاز العرض',
        wadiya: unit.wadiya || 'وضعية انطلاقية مناسبة للمورد',
        moshkila: unit.moshkila || 'ما هو المشكل العلمي المطروح؟',
        faradiyat: unit.faradiyat || 'اقتراح فرضيات منطقية',
        irsae: unit.irsae || 'خلاصة تركيبية',
        taqwim: unit.taqwim || 'تطبيق لتقويم مدى إرساء الموارد',
        wadiyaTables: unit.wadiya_tables,
        irsaeTables: unit.irsae_tables,
        taqwimTables: unit.taqwim_tables,
        anshita: anshita,
        diagramSvg: diagramSvg,
        diagramTitle: diagramTitle,
        ustadhNashat: {
          inilitaq: 'يستعرض سياق الوضعية ويطرح المشكل، ويوجه التلاميذ نحو صياغة الفرضيات.',
          taqasi: 'يوزع السندات التعليمية ويوجه استغلالها من خلال طرح تعليمات دقيقة ويراقب سير العمل.',
          irsae: 'يدير المناقشة ويصوّب الإجابات لبناء الحصيلة المعرفية بشكل منهجي.',
          taqwim: 'يطرح نشاطا تقويميا أو وضعية بسيطة لقياس مدى استيعاب المتعلمين للمورد المدروس.'
        },
        mutaalimNashat: {
          inilitaq: 'يقرأ الوضعية بتمعن ويشارك في تحديد المشكل العلمي واقتراح الفرضيات المنطقية.',
          taqasi: 'يعمل ضمن مجموعات أو فردياً على استغلال السندات وتحليلها للإجابة على التعليمات.',
          irsae: 'يساهم في هيكلة المعارف وتدوين الحصيلة المشتركة المستخلصة في نهاية النشاط.',
          taqwim: 'يوظف المعارف المكتسبة في حل تمرين التقويم وإثبات مدى تحكمه في المورد.'
        }
      });

      memoCounter++;
    }
  }
}
