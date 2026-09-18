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
      const anshita: Activity[] = unit.activities.map(act => ({
        sourceActivityId: act.activity_id,
        title: act.activity_title,
        asila: act.ustadh_activity,
        ajwiba: act.mutaalim_activity,
        zaman: act.zaman,
        mola7adha: '',
        diagrams: act.diagrams,
        tables: act.tables
      }));

      const diagrams = unit.activities.flatMap(act => (act.diagrams || []).map(d => ({
        title: d.diagram_title,
        svg: d.diagram_svg,
        description: d.diagram_description
      }))).filter(d => !!d.svg);

      LESSONS_1AM.push({
        sourceSequenceId: seq.sequence_id,
        sourceResourceId: res.resource_id,
        sourceLearningUnitId: unit.learning_unit_id,
        sourceOfficial: unit.official_source === true,
        level: '1am',
        memoNumber: memoCounter.toString().padStart(2, '0'),
        midan: seq.field_name || '',
        maqta: seq.sequence_name,
        mawrid: res.resource_name,
        ta3alom: unit.learning_unit_name,
        markaba: unit.markaba,
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
        diagrams,
        diagramSvg: diagrams[0]?.svg,
        diagramTitle: diagrams[0]?.title,
        diagramDescription: diagrams[0]?.description
      });

      memoCounter++;
    }
  }
}
