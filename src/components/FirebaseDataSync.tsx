import React, { useEffect, useState } from 'react';
import { useAuth } from './Auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const FirebaseDataSync: React.FC = () => {
  const { user } = useAuth();
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const syncFromCloud = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'users', user.uid, 'data', 'config'));
        if (configDoc.exists()) {
          const data = configDoc.data();
          const config = data?.config;
          if (config) {
            sessionStorage.setItem('algeria_sciences_session_config_v3', JSON.stringify(config));
            localStorage.setItem('algeria_sciences_config', JSON.stringify(config));
            window.dispatchEvent(new CustomEvent('firebase-sync-complete', { detail: { type: 'config' } }));
          }
        }

        const distDoc = await getDoc(doc(db, 'users', user.uid, 'data', 'annualDist'));
        if (distDoc.exists()) {
          const data = distDoc.data();
          const items = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.distribution)
              ? data.distribution
              : [];

          if (items.length > 0) {
            localStorage.setItem('algeria_sciences_annual_dist_v5', JSON.stringify(items));
            window.dispatchEvent(new CustomEvent('firebase-sync-complete', { detail: { type: 'dist' } }));
          }
        }

        const curriculumDoc = await getDoc(doc(db, 'users', user.uid, 'data', 'curriculum'));
        if (curriculumDoc.exists()) {
          const data = curriculumDoc.data();
          const lessons = Array.isArray(data?.lessons) ? data.lessons : [];
          if (lessons.length > 0) {
            localStorage.setItem('mizaniyati_curriculum_db_v1', JSON.stringify(lessons));
            window.dispatchEvent(new CustomEvent('curriculum-db-updated'));
          }
        }

        const logbookDoc = await getDoc(doc(db, 'users', user.uid, 'data', 'logbook'));
        if (logbookDoc.exists()) {
          const data = logbookDoc.data();
          const logbookData = data?.data;
          if (logbookData) {
            localStorage.setItem('daftar_table_v2027', JSON.stringify(logbookData));
            window.dispatchEvent(new CustomEvent('firebase-sync-complete', { detail: { type: 'logbook' } }));
          }
        }

        setLastSync(new Date().toLocaleTimeString());
        window.dispatchEvent(new Event('firebase-sync-complete'));
      } catch (error) {
        console.error('Error syncing from cloud:', error);
      }
    };

    syncFromCloud();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    (window as any).syncToCloud = async (
      type: 'config' | 'dist' | 'logbook' | 'curriculum',
      data: any
    ) => {
      try {
        if (type === 'config') {
          await setDoc(
            doc(db, 'users', user.uid, 'data', 'config'),
            { userId: user.uid, config: data, updatedAt: serverTimestamp() },
            { merge: true }
          );
        } else if (type === 'dist') {
          await setDoc(
            doc(db, 'users', user.uid, 'data', 'annualDist'),
            { userId: user.uid, items: data, updatedAt: serverTimestamp() },
            { merge: true }
          );
        } else if (type === 'curriculum') {
          await setDoc(
            doc(db, 'users', user.uid, 'data', 'curriculum'),
            { userId: user.uid, lessons: data, updatedAt: serverTimestamp() },
            { merge: true }
          );
        } else if (type === 'logbook') {
          await setDoc(
            doc(db, 'users', user.uid, 'data', 'logbook'),
            { userId: user.uid, data: data, updatedAt: serverTimestamp() },
            { merge: true }
          );
        }

        setLastSync(new Date().toLocaleTimeString());
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/data/${type}`);
      }
    };

    return () => {
      delete (window as any).syncToCloud;
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-emerald-200 rounded-lg p-2 shadow-sm flex items-center gap-2 text-[10px] text-emerald-700 font-bold">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
      المزامنة السحابية نشطة {lastSync && `(آخر مزامنة: ${lastSync})`}
    </div>
  );
};
