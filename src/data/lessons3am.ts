import { DB_Sequence, DB_Resource, DB_LearningUnit, DB_Activity } from './schema';
import { seq_3am_1 } from './official_3am_maqta1';
import { seq_3am_2 } from './official_3am_maqta2';
import { seq_3am_3 } from './official_3am_maqta3';
import { seq_3am_4 } from './official_3am_maqta4';

export const MAQATI_3AM: DB_Sequence[] = [
  seq_3am_1,
  seq_3am_2,
  seq_3am_3,
  seq_3am_4
];

export function buildLessons3AM(): any[] {
  const allLessons: any[] = [];
  let memoCounter = 1;

  for (const seq of MAQATI_3AM) {
    for (const res of seq.resources) {
      for (const lu of res.learning_units) {
        let diagramSvg = undefined;
        let diagramTitle = undefined;
        
        const firstAct = lu.activities[0];
        if (firstAct && firstAct.diagrams && firstAct.diagrams.length > 0) {
          diagramSvg = firstAct.diagrams[0].diagram_svg;
          diagramTitle = firstAct.diagrams[0].diagram_title;
        }

        allLessons.push({
          level: '3am',
          memoNumber: memoCounter.toString().padStart(2, '0'),
          midan: 'الإنسان والمحيط',
          maqta: seq.sequence_name,
          mawrid: res.resource_name,
          ta3alom: lu.learning_unit_name,
          markaba: lu.markaba,
          marifa: lu.marifa,
          manhaji: lu.manhaji,
          qayimi: lu.qayimi,
          mostalahat: lu.mostalahat,
          wasail: lu.wasail,
          zamanKoli: firstAct ? firstAct.zaman : '1 ساعة',
          diagramTitle,
          diagramSvg,
          wadiya: lu.wadiya,
          moshkila: lu.moshkila,
          faradiyat: lu.faradiyat,
          ustadhNashat: {
            inilitaq: 'يعرض الوضعية الانطلاقية ويوجه التلاميذ للمناقشة.',
            taqasi: firstAct ? firstAct.ustadh_activity : '',
            irsae: lu.irsae,
            taqwim: lu.taqwim
          },
          mutaalimNashat: {
            inilitaq: 'يستمع ويقترح فرضيات.',
            taqasi: firstAct ? firstAct.mutaalim_activity : '',
            irsae: 'يدون الحصيلة في الكراس.',
            taqwim: 'ينجز التقويم.'
          },
          anshita: lu.activities.map(a => ({
            title: a.activity_title,
            asila: a.ustadh_activity,
            ajwiba: a.mutaalim_activity
          }))
        });
        memoCounter++;
      }
    }
  }
  return allLessons;
}

export const LESSONS_3AM = buildLessons3AM();
