import { supabase } from "../supabaseClient";
import { extractKeywords, countWords } from "../keywordExtraction";
import { completionRatio, tileIndexForApprovalOrder, TOTAL_TILES } from "../mosaicGrid";
import { sanitizeText } from "../sanitize";
import type { MosaicStats, NewSubmissionInput, Submission, SubmissionStatus } from "../types";
import type { SubmissionsRepository, Unsubscribe } from "./SubmissionsRepository";

interface SubmissionRow {
  id: string;
  text: string;
  input_type: "voice" | "text";
  keywords: string[];
  tile_index: number | null;
  status: SubmissionStatus;
  created_at: string;
}

function fromRow(row: SubmissionRow): Submission {
  return {
    id: row.id,
    text: row.text,
    inputType: row.input_type,
    keywords: row.keywords ?? [],
    tileIndex: row.tile_index,
    status: row.status,
    createdAt: row.created_at,
  };
}

const TABLE = "submissions";

/**
 * تطبيق حقيقي متصل بـ Supabase. يعتمد على أن سياسات RLS المعرّفة في
 * supabase/schema.sql تمنع أي عميل مجهول من تحديد status عند الإدراج
 * (يُفرض pending دائمًا)، ومن تعديل status لاحقًا إلا عبر مستخدم Admin
 * مسجّل دخول (auth.uid() ضمن جدول admins). راجع الملف للتفاصيل الكاملة.
 */
export class SupabaseSubmissionsRepository implements SubmissionsRepository {
  private get client() {
    if (!supabase) throw new Error("Supabase غير مهيأ. تأكد من متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.");
    return supabase;
  }

  async createSubmission(input: NewSubmissionInput): Promise<Submission> {
    const text = sanitizeText(input.text);
    if (!text) throw new Error("النص فارغ.");

    // ملاحظة أمان: لا نرسل status إطلاقًا — القيمة الافتراضية في القاعدة
    // هي 'pending' وسياسة RLS ترفض أي إدراج يحاول تحديد status صراحة.
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        text,
        input_type: input.inputType,
        keywords: extractKeywords(text),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return fromRow(data as SubmissionRow);
  }

  async listAll(): Promise<Submission[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as SubmissionRow[]).map(fromRow);
  }

  async listApproved(): Promise<Submission[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data as SubmissionRow[]).map(fromRow);
  }

  async getById(id: string): Promise<Submission | null> {
    const { data, error } = await this.client.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data as SubmissionRow) : null;
  }

  async updateStatus(id: string, status: SubmissionStatus): Promise<Submission> {
    // يتطلب جلسة Admin مسجّلة دخول — سياسة RLS "admins can update" هي ما
    // يمنع فعليًا أي مستخدم آخر من نجاح هذا الاستدعاء، وليس منطق الواجهة هنا.
    let tileIndex: number | null = null;
    if (status === "approved") {
      const { count } = await this.client
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("status", "approved");
      tileIndex = tileIndexForApprovalOrder(count ?? 0);
    }

    const { data, error } = await this.client
      .from(TABLE)
      .update(tileIndex !== null ? { status, tile_index: tileIndex } : { status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return fromRow(data as SubmissionRow);
  }

  async deleteSubmission(id: string): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getStats(): Promise<MosaicStats> {
    const approved = await this.listApproved();
    const { count: totalSubmissions } = await this.client
      .from(TABLE)
      .select("id", { count: "exact", head: true });
    const { count: pendingCount } = await this.client
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    const wordCounts = new Map<string, number>();
    let totalWords = 0;
    for (const s of approved) {
      totalWords += countWords(s.text);
      for (const kw of s.keywords) wordCounts.set(kw, (wordCounts.get(kw) ?? 0) + 1);
    }
    const topKeywords = Array.from(wordCounts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    return {
      totalSubmissions: totalSubmissions ?? approved.length,
      approvedCount: approved.length,
      pendingCount: pendingCount ?? 0,
      totalWords,
      completionRatio: completionRatio(approved.length),
      gridSize: Math.sqrt(TOTAL_TILES),
      totalTiles: TOTAL_TILES,
      topKeywords,
    };
  }

  subscribeToApproved(callback: (submissions: Submission[]) => void): Unsubscribe {
    const channel = this.client
      .channel("submissions-approved")
      .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, () => {
        this.listApproved().then(callback);
      })
      .subscribe();

    this.listApproved().then(callback);

    return () => {
      this.client.removeChannel(channel);
    };
  }
}
