import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseClient";
import { extractKeywords, countWords } from "../keywordExtraction";
import { completionRatio, tileIndexForApprovalOrder, TOTAL_TILES } from "../mosaicGrid";
import { sanitizeText } from "../sanitize";
import type { MosaicStats, NewSubmissionInput, Submission, SubmissionStatus } from "../types";
import type { SubmissionsRepository, Unsubscribe } from "./SubmissionsRepository";

const COLLECTION = "submissions";

interface SubmissionDoc {
  text: string;
  inputType: "voice" | "text";
  keywords: string[];
  tileIndex: number | null;
  status: SubmissionStatus;
  createdAt: string;
}

function fromDoc(snap: QueryDocumentSnapshot): Submission {
  const data = snap.data() as SubmissionDoc;
  return {
    id: snap.id,
    text: data.text,
    inputType: data.inputType,
    keywords: data.keywords ?? [],
    tileIndex: data.tileIndex,
    status: data.status,
    createdAt: data.createdAt,
  };
}

function uuid(): string {
  return crypto.randomUUID();
}

/**
 * تطبيق حقيقي متصل بـ Firebase (Firestore + Auth). النشر فوري بدون
 * مراجعة إشرافية مسبقة (بطلب صاحب الموقع) — راجع firebase/firestore.rules
 * لقواعد الأمان: أي زائر يمكنه إنشاء مشاركة بحالة approved فقط، والتحديث/
 * الحذف يتطلبان مستخدمًا موجودًا في مجموعة admins.
 */
export class FirebaseSubmissionsRepository implements SubmissionsRepository {
  private get firestore() {
    if (!db) {
      throw new Error(
        "Firebase غير مهيأ. تأكد من متغيرات البيئة VITE_FIREBASE_API_KEY و VITE_FIREBASE_PROJECT_ID و VITE_FIREBASE_APP_ID.",
      );
    }
    return db;
  }

  async createSubmission(input: NewSubmissionInput): Promise<Submission> {
    const text = sanitizeText(input.text);
    if (!text) throw new Error("النص فارغ.");

    const approvedSnap = await getDocs(query(collection(this.firestore, COLLECTION), where("status", "==", "approved")));

    // ملاحظة: حساب tile_index هنا بسيط وليس ذريًا — عند مشاركتين متزامنتين
    // تمامًا من مستخدمين مختلفين قد تتشارك القطعة نفسها نادرًا. مقبول
    // لحجم الاستخدام المتوقع.
    const submission: SubmissionDoc = {
      text,
      inputType: input.inputType,
      keywords: extractKeywords(text),
      tileIndex: tileIndexForApprovalOrder(approvedSnap.size),
      status: "approved",
      createdAt: new Date().toISOString(),
    };

    const id = uuid();
    await setDoc(doc(this.firestore, COLLECTION, id), submission);
    return { id, ...submission };
  }

  async listAll(): Promise<Submission[]> {
    const snap = await getDocs(query(collection(this.firestore, COLLECTION), orderBy("createdAt", "desc")));
    return snap.docs.map(fromDoc);
  }

  async listApproved(): Promise<Submission[]> {
    const snap = await getDocs(
      query(collection(this.firestore, COLLECTION), where("status", "==", "approved"), orderBy("createdAt", "asc")),
    );
    return snap.docs.map(fromDoc);
  }

  async getById(id: string): Promise<Submission | null> {
    const all = await this.listAll();
    return all.find((s) => s.id === id) ?? null;
  }

  async updateStatus(id: string, status: SubmissionStatus): Promise<Submission> {
    // يتطلب جلسة Admin مسجّلة دخول — قواعد أمان Firestore هي ما يمنع فعليًا
    // أي مستخدم آخر من نجاح هذا الاستدعاء، وليس منطق الواجهة هنا.
    const ref = doc(this.firestore, COLLECTION, id);
    const updates: Partial<SubmissionDoc> = { status };

    if (status === "approved") {
      const current = await this.getById(id);
      if (current?.tileIndex == null) {
        const approvedSnap = await getDocs(
          query(collection(this.firestore, COLLECTION), where("status", "==", "approved")),
        );
        updates.tileIndex = tileIndexForApprovalOrder(approvedSnap.size);
      }
    }

    await updateDoc(ref, updates);
    const updated = await this.getById(id);
    if (!updated) throw new Error("المشاركة غير موجودة.");
    return updated;
  }

  async deleteSubmission(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, COLLECTION, id));
  }

  async getStats(): Promise<MosaicStats> {
    const approved = await this.listApproved();

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
      totalSubmissions: approved.length,
      approvedCount: approved.length,
      pendingCount: 0,
      totalWords,
      completionRatio: completionRatio(approved.length),
      gridSize: Math.sqrt(TOTAL_TILES),
      totalTiles: TOTAL_TILES,
      topKeywords,
    };
  }

  subscribeToApproved(callback: (submissions: Submission[]) => void): Unsubscribe {
    const q = query(collection(this.firestore, COLLECTION), where("status", "==", "approved"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(fromDoc));
    });
  }
}
