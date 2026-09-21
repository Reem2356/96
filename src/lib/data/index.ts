import { isFirebaseConfigured } from "../firebaseClient";
import { isSupabaseConfigured } from "../supabaseClient";
import { FirebaseSubmissionsRepository } from "./firebaseRepository";
import { MockSubmissionsRepository } from "./mockRepository";
import { SupabaseSubmissionsRepository } from "./supabaseRepository";
import type { SubmissionsRepository } from "./SubmissionsRepository";

/**
 * نقطة الاختيار الوحيدة بين مصادر البيانات: Firebase، Supabase، أو
 * Mock (تجريبي محلي). الأولوية لـ Firebase إن كان مهيّأً، ثم Supabase،
 * وإلا يعمل الموقع تلقائيًا بالبيانات التجريبية (localStorage) دون أي
 * تغيير في بقية الواجهة.
 */
export const submissionsRepository: SubmissionsRepository = isFirebaseConfigured
  ? new FirebaseSubmissionsRepository()
  : isSupabaseConfigured
    ? new SupabaseSubmissionsRepository()
    : new MockSubmissionsRepository();

export type { SubmissionsRepository } from "./SubmissionsRepository";
