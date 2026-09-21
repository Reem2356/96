import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

/**
 * إعداد Firebase من جهة العميل (Frontend) فقط باستخدام متغيرات بيئة عامة
 * (Config العام لمشاريع Firebase ليس سريًا بطبيعته — الحماية الحقيقية تأتي
 * من Firestore Security Rules في firebase/firestore.rules، تمامًا كمبدأ
 * anon key + RLS في Supabase).
 *
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_APP_ID
 *
 * راجع firebase/README.md لخطوات الإعداد الكاملة.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuthInstance: Auth | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  firestoreDb = getFirestore(app);
  firebaseAuthInstance = getAuth(app);
}

export const db = firestoreDb;
export const firebaseAuth = firebaseAuthInstance;
