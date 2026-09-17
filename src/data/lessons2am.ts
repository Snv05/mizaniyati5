import { LessonMemo, Activity } from '../types';
import { seq_1 } from './official_2am_maqta1';
import { seq_2 } from './official_2am_maqta2';
import { seq_3 } from './official_2am_maqta3';
import { seq_4, seq_5 } from './official_2am_maqta4_5';

const DB_2AM = [seq_1, seq_2, seq_3, seq_4, seq_5];

export const LESSONS_2AM: LessonMemo[] = [];

let memoCounter = 1;

for (const seq of DB_2AM) {
  for (const res of seq.resources) {
    for (const unit of res.learning_units) {
      const anshita: Activity[] = unit.activities.map(act => ({
        title: act.activity_title,
        asila: act.ustadh_activity,
        ajwiba: act.mutaalim_activity,
        zaman: act.zaman,
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

      LESSONS_2AM.push({
        level: '2am',
        memoNumber: memoCounter.toString().padStart(2, '0'),
        midan: 'الإنسان والمحيط', // Hardcoded for 2AM as per DB
        maqta: seq.sequence_name,
        mawrid: res.resource_name,
        ta3alom: unit.learning_unit_name,
        markaba: unit.markaba,
        kafaaKhitamiya: 'يقترح حلولاً وقائية وتدخليّة ناجعة للتدخلات السلبية للإنسان تجاه المحيط استناداً إلى المعارف المتعلقة بالأنظمة البيئية وتوزع الكائنات الحية فيها.',
        ma3ayirTaqwim: unit.qayimi,
        marifa: unit.marifa,
        manhaji: unit.manhaji,
        mostalahat: unit.mostalahat,
        wasail: unit.wasail,
        wadiya: unit.wadiya,
        moshkila: unit.moshkila,
        faradiyat: unit.faradiyat,
        irsae: unit.irsae,
        taqwim: unit.taqwim,
        wadiyaTables: unit.wadiya_tables,
        irsaeTables: unit.irsae_tables,
        taqwimTables: unit.taqwim_tables,
        anshita: anshita,
        diagramSvg,
        diagramTitle
      });
      memoCounter++;
    }
  }
}

