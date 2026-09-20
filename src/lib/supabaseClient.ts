import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * إعداد Supabase من جهة العميل (Frontend) فقط باستخدام:
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY  (مفتاح anon العام فقط — Row Level Security مفعّل)
 *
 * ⚠️ لا تضع أبدًا Service Role Key هنا أو في أي ملف داخل src/. هذا المفتاح
 * يجب أن يبقى فقط في بيئة خادم موثوقة (Supabase Edge Function / متغيرات بيئة
 * لوحة تحكم Supabase) وليس داخل حزمة الـ Frontend التي يحمّلها المتصفح.
 * راجع supabase/schema.sql و supabase/README.md لتفاصيل الصلاحيات.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
