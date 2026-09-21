import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { isFirebaseConfigured, firebaseAuth } from "./firebaseClient";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

const MOCK_SESSION_KEY = "watan-mosaic:admin-session";
// كلمة مرور تجريبية فقط لوضع Mock (بدون Firebase/Supabase). لا علاقة لها
// بالأمان الحقيقي — بمجرد ربط Firebase أو Supabase يصبح الدخول عبر نظام
// مصادقة حقيقي (بريد/كلمة مرور) وتُهمَل هذه القيمة تمامًا.
const MOCK_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_MOCK_PASSWORD ?? "watan2026";

export async function signInAdmin(email: string, password: string): Promise<void> {
  if (isFirebaseConfigured && firebaseAuth) {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch {
      throw new Error("بيانات الدخول غير صحيحة.");
    }
    return;
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("بيانات الدخول غير صحيحة.");
    return;
  }

  if (password !== MOCK_ADMIN_PASSWORD) {
    throw new Error("كلمة المرور غير صحيحة.");
  }
  sessionStorage.setItem(MOCK_SESSION_KEY, "1");
}

export async function signOutAdmin(): Promise<void> {
  if (isFirebaseConfigured && firebaseAuth) {
    await signOut(firebaseAuth);
    return;
  }
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
    return;
  }
  sessionStorage.removeItem(MOCK_SESSION_KEY);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (isFirebaseConfigured && firebaseAuth) {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(firebaseAuth!, (user) => {
        unsubscribe();
        resolve(Boolean(user));
      });
    });
  }

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    return Boolean(data.session);
  }
  return sessionStorage.getItem(MOCK_SESSION_KEY) === "1";
}
