// src/lib/schedules.js
import { db, ensureAnon } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * Firestore が受け付けない `undefined` プロパティを除去
 */
function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')
  );
}

/**
 * 予定を追加
 * @param {{ place: string, startAt: string, endAt: string, status?: string }} data
 */
export async function addSchedule(data) {
  const user = await ensureAnon();
  if (!user?.uid) throw new Error('UID not found – anonymous sign‑in failed');

  const col = collection(db, `users/${user.uid}/schedules`);

  // Firestore が受け取れる形に整形
  const doc = stripUndefined({
    ...data,
    createdAt: serverTimestamp(),
  });

  await addDoc(col, doc);
}

/** 予定一覧を取得 */
export async function fetchSchedules() {
  const user = await ensureAnon();
  if (!user?.uid) throw new Error('UID not found – anonymous sign‑in failed');

  const col  = collection(db, `users/${user.uid}/schedules`);
  const snap = await getDocs(query(col, orderBy('startAt')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
