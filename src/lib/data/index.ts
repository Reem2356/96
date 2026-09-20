import { isSupabaseConfigured } from "../supabaseClient";
import { MockSubmissionsRepository } from "./mockRepository";
import { SupabaseSubmissionsRepository } from "./supabaseRepository";
import type { SubmissionsRepository } from "./SubmissionsRepository";

/**
 * نقطة الاختيار الوحيدة بين مصدر البيانات التجريبي (Mock) والحقيقي (Supabase).
 * إن توفرت متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY يعمل
 * الموقع مباشرة مع Supabase الحقيقي، وإلا يعمل تلقائيًا بالبيانات التجريبية
 * المخزّنة محليًا (localStorage) دون أي تغيير في بقية الواجهة.
 */
export const submissionsRepository: SubmissionsRepository = isSupabaseConfigured
  ? new SupabaseSubmissionsRepository()
  : new MockSubmissionsRepository();

export type { SubmissionsRepository } from "./SubmissionsRepository";
