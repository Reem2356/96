import { extractKeywords, countWords } from "../keywordExtraction";
import { completionRatio, tileIndexForApprovalOrder, TOTAL_TILES } from "../mosaicGrid";
import { sanitizeText } from "../sanitize";
import type { MosaicStats, NewSubmissionInput, Submission, SubmissionStatus } from "../types";
import type { SubmissionsRepository, Unsubscribe } from "./SubmissionsRepository";

const STORAGE_KEY = "watan-mosaic:submissions";
const RATE_LIMIT_KEY = "watan-mosaic:last-submit-at";
const RATE_LIMIT_MS = 20_000; // حد أدنى 20 ثانية بين مشاركتين من نفس المتصفح (Rate Limiting بسيط من جهة العميل)

const SEED_TEXTS: { text: string; inputType: "voice" | "text" }[] = [
  { text: "وطني هو الأمان والطموح والمستقبل.", inputType: "text" },
  { text: "قائدنا رمز الحكمة والعطاء لهذا الوطن الغالي.", inputType: "voice" },
  { text: "بفخر أقول إن هويتنا وأصالتنا سر تطورنا.", inputType: "text" },
  { text: "الوفاء لهذا الوطن واجب، والانتماء له شرف.", inputType: "voice" },
  { text: "رؤية طموحة تجمعنا نحو مستقبل مشرق للجميع.", inputType: "text" },
  { text: "العلم السعودي يرفرف فخرًا فوق أرض الحرمين.", inputType: "voice" },
  { text: "الأمان نعمة كبرى نعيشها بفضل قيادتنا الحكيمة.", inputType: "text" },
  { text: "من هذه الأرض الطيبة تنطلق كل أحلامنا وطموحاتنا.", inputType: "text" },
];

function uuid(): string {
  return crypto.randomUUID();
}

function loadAll(): Submission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedInitialData();
    return JSON.parse(raw) as Submission[];
  } catch {
    return seedInitialData();
  }
}

function saveAll(items: Submission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("watan-mosaic:updated"));
}

function seedInitialData(): Submission[] {
  const now = Date.now();
  const items: Submission[] = SEED_TEXTS.map((seed, i) => {
    const keywords = extractKeywords(seed.text);
    return {
      id: uuid(),
      text: seed.text,
      inputType: seed.inputType,
      keywords,
      tileIndex: tileIndexForApprovalOrder(i),
      status: "approved" as SubmissionStatus,
      createdAt: new Date(now - (SEED_TEXTS.length - i) * 3_600_000).toISOString(),
    };
  });
  saveAll(items);
  return items;
}

export class MockSubmissionsRepository implements SubmissionsRepository {
  async createSubmission(input: NewSubmissionInput): Promise<Submission> {
    const lastSubmitAt = Number(localStorage.getItem(RATE_LIMIT_KEY) ?? 0);
    if (Date.now() - lastSubmitAt < RATE_LIMIT_MS) {
      const waitSeconds = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSubmitAt)) / 1000);
      throw new Error(`الرجاء الانتظار ${waitSeconds} ثانية قبل إرسال مشاركة جديدة.`);
    }

    const text = sanitizeText(input.text);
    if (!text) throw new Error("النص فارغ.");

    const submission: Submission = {
      id: uuid(),
      text,
      inputType: input.inputType,
      keywords: extractKeywords(text),
      tileIndex: null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const all = loadAll();
    all.push(submission);
    saveAll(all);
    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
    return submission;
  }

  async listAll(): Promise<Submission[]> {
    return [...loadAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listApproved(): Promise<Submission[]> {
    return loadAll().filter((s) => s.status === "approved");
  }

  async getById(id: string): Promise<Submission | null> {
    return loadAll().find((s) => s.id === id) ?? null;
  }

  async updateStatus(id: string, status: SubmissionStatus): Promise<Submission> {
    const all = loadAll();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("المشاركة غير موجودة.");

    const approvedCountBefore = all.filter((s) => s.status === "approved").length;
    const updated: Submission = {
      ...all[idx],
      status,
      tileIndex:
        status === "approved"
          ? (all[idx].tileIndex ?? tileIndexForApprovalOrder(approvedCountBefore))
          : all[idx].tileIndex,
    };
    all[idx] = updated;
    saveAll(all);
    return updated;
  }

  async deleteSubmission(id: string): Promise<void> {
    const all = loadAll().filter((s) => s.id !== id);
    saveAll(all);
  }

  async getStats(): Promise<MosaicStats> {
    const all = loadAll();
    const approved = all.filter((s) => s.status === "approved");
    const pending = all.filter((s) => s.status === "pending");
    const wordCounts = new Map<string, number>();
    let totalWords = 0;

    for (const s of approved) {
      totalWords += countWords(s.text);
      for (const kw of s.keywords) {
        wordCounts.set(kw, (wordCounts.get(kw) ?? 0) + 1);
      }
    }

    const topKeywords = Array.from(wordCounts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    return {
      totalSubmissions: all.length,
      approvedCount: approved.length,
      pendingCount: pending.length,
      totalWords,
      completionRatio: completionRatio(approved.length),
      gridSize: Math.sqrt(TOTAL_TILES),
      totalTiles: TOTAL_TILES,
      topKeywords,
    };
  }

  subscribeToApproved(callback: (submissions: Submission[]) => void): Unsubscribe {
    const handler = () => {
      this.listApproved().then(callback);
    };
    window.addEventListener("watan-mosaic:updated", handler);
    window.addEventListener("storage", handler);
    // بث أولي فوري
    handler();
    return () => {
      window.removeEventListener("watan-mosaic:updated", handler);
      window.removeEventListener("storage", handler);
    };
  }
}
