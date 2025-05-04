// lib/firebase.js -------------------------------------------------
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/** .env で NEXT_PUBLIC_ プレフィックスを付けている想定 */
const firebaseConfig = {
  apiKey:        process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:     process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ↓ 追加しても可
  // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID,
  // appId:           process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Hot‑Reload 時に重複初期化しない */
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

/**
 * 匿名ユーザーがいなければ作成し、
 * ユーザーオブジェクトを返すユーティリティ
 */
export async function ensureAnon() {
  if (auth.currentUser) return auth.currentUser;

  const cred = await signInAnonymously(auth); // 失敗時は catch でハンドル
  return cred.user;
}
