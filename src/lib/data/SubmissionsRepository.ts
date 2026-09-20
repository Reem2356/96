import type { MosaicStats, NewSubmissionInput, Submission, SubmissionStatus } from "../types";

export type Unsubscribe = () => void;

/**
 * طبقة فصل الواجهة عن مصدر البيانات. لدينا تطبيقان يحقّقان نفس الواجهة:
 *  - MockSubmissionsRepository: بيانات تجريبية محليّة (localStorage) لتطوير
 *    واختبار كامل الواجهة دون الحاجة لإعداد Supabase.
 *  - SupabaseSubmissionsRepository: يتصل فعليًا بقاعدة بيانات Supabase.
 * اختيار التطبيق المستخدم فعليًا يتم في data/index.ts بحسب متغيرات البيئة.
 */
export interface SubmissionsRepository {
  /** إرسال مشاركة جديدة — تُحفظ دائمًا بحالة pending، ولا يمكن للعميل تحديد الحالة */
  createSubmission(input: NewSubmissionInput): Promise<Submission>;

  /** كل المشاركات (تُستخدم في لوحة الإدارة فقط) */
  listAll(): Promise<Submission[]>;

  /** المشاركات المعتمدة فقط (تُستخدم في اللوحة العامة وشاشة العرض) */
  listApproved(): Promise<Submission[]>;

  getById(id: string): Promise<Submission | null>;

  /** اعتماد/رفض من لوحة الإدارة فقط — يُمنع تنفيذها من العميل العام عبر RLS في Supabase */
  updateStatus(id: string, status: SubmissionStatus): Promise<Submission>;

  deleteSubmission(id: string): Promise<void>;

  getStats(): Promise<MosaicStats>;

  /** إشعار حي عند إضافة/تحديث مشاركات (Realtime في Supabase، Custom Event في Mock) */
  subscribeToApproved(callback: (submissions: Submission[]) => void): Unsubscribe;
}
