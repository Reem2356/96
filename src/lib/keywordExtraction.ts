/**
 * استخراج كلمات مفتاحية بسيط من نص عربي دون الحاجة لأي خدمة AI خارجية.
 * الفكرة: إزالة أدوات الربط وكلمات الوقف الشائعة، ثم ترتيب الكلمات المتبقية
 * حسب الطول والتكرار، مع إعطاء وزن إضافي لكلمات ذات دلالة وطنية معروفة.
 */

const STOP_WORDS = new Set([
  "في", "من", "إلى", "على", "عن", "مع", "هذا", "هذه", "ذلك", "تلك",
  "الذي", "التي", "الذين", "و", "أو", "ثم", "لكن", "أن", "إن", "كان",
  "يكون", "هو", "هي", "أنا", "أنت", "نحن", "هم", "كل", "بعض", "لا",
  "لم", "لن", "ما", "قد", "كما", "حتى", "إذا", "لو", "لأن", "لأني",
  "له", "لها", "لهم", "بها", "به", "فيه", "فيها", "عليه", "عليها",
  "هناك", "هنا", "بين", "عند", "بعد", "قبل", "منذ", "كل", "أي",
  "الى", "او", "ان", "قد", "كي", "لدي", "لدى", "يا", "أيضا", "ايضا",
]);

const NATIONAL_BOOST_WORDS = new Set([
  "الوطن", "وطني", "الأمان", "الطموح", "المستقبل", "العلم", "الوفاء",
  "الانتماء", "القائد", "قائدنا", "الملك", "سلمان", "الحرمين",
  "الفخر", "الاعتزاز", "الإنجاز", "التطور", "الرؤية", "الأمل",
  "العزة", "الريادة", "التاريخ", "الأصالة", "الهوية", "الحضارة",
]);

function normalizeArabic(word: string): string {
  return word
    .replace(/[ً-ٰٟ]/g, "") // تشكيل
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .trim();
}

export function extractKeywords(text: string, max = 5): string[] {
  const rawWords = text
    .replace(/[.,!؟?؛:"'“”‘’(){}\[\]0-9]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const frequency = new Map<string, { original: string; count: number; score: number }>();

  for (const raw of rawWords) {
    const normalized = normalizeArabic(raw);
    if (normalized.length < 2) continue;
    if (STOP_WORDS.has(raw) || STOP_WORDS.has(normalized)) continue;

    const existing = frequency.get(normalized);
    const lengthScore = Math.min(normalized.length, 8);
    const boost = NATIONAL_BOOST_WORDS.has(raw) || NATIONAL_BOOST_WORDS.has(normalized) ? 6 : 0;

    if (existing) {
      existing.count += 1;
      existing.score += 1 + boost;
    } else {
      frequency.set(normalized, { original: raw, count: 1, score: lengthScore + boost });
    }
  }

  return Array.from(frequency.values())
    .sort((a, b) => b.score - a.score || b.count - a.count)
    .slice(0, max)
    .map((item) => item.original);
}

/** يحسب عدد الكلمات الفعلي في نص (لإحصائيات نبض الوطن) */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
