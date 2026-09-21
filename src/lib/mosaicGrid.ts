/**
 * رياضيات شبكة الفسيفساء (Mosaic Grid).
 *
 * المواصفة الأصلية تقترح شبكة 100×100 (10,000 قطعة). لأسباب أداء المتصفح
 * (رسم وتحريك 10,000 عنصر DOM/SVG دفعة واحدة بطيء على الأجهزة المتوسطة)
 * نستخدم افتراضيًا شبكة أصغر قابلة للتهيئة. يمكن رفعها إلى 100 بأمان إذا
 * تم الرسم عبر Canvas بدل DOM (انظر MosaicCanvas.tsx).
 */
export const GRID_SIZE = 80; // 80×80 = 6,400 قطعة — عدّلها هنا لتغيير كثافة اللوحة
export const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

export function indexToRowCol(index: number): { row: number; col: number } {
  return { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE };
}

export function rowColToIndex(row: number, col: number): number {
  return row * GRID_SIZE + col;
}

/** مولّد أرقام عشوائية بذرة ثابتة (Deterministic) حتى يتفق كل المستخدمين على نفس ترتيب الكشف */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * ترتيب كشف القطع: بدل تعبئة اللوحة صفًا صفًا (ما يجعل الوجه يظهر من الأعلى فقط)،
 * نوزّع ترتيب الكشف عشوائيًا (لكن بشكل ثابت/قابل لإعادة الإنتاج) على كامل الشبكة،
 * بحيث تتضح ملامح صورة خادم الحرمين الشريفين تدريجيًا من كل الاتجاهات معًا.
 */
const REVEAL_SEED = 96_1348; // بذرة ثابتة — لا تغيّرها بعد إطلاق الموقع حتى لا يتغير ترتيب القطع المعتمدة سابقًا

let cachedRevealOrder: number[] | null = null;

export function getRevealOrder(): number[] {
  if (cachedRevealOrder) return cachedRevealOrder;
  const order = Array.from({ length: TOTAL_TILES }, (_, i) => i);
  const rand = mulberry32(REVEAL_SEED);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  cachedRevealOrder = order;
  return order;
}

/** يحدد موضع القطعة رقم N داخل الشبكة بحسب ترتيب الكشف الثابت */
export function tileIndexForApprovalOrder(approvalOrderIndex: number): number {
  const order = getRevealOrder();
  return order[approvalOrderIndex % TOTAL_TILES];
}

export function completionRatio(approvedCount: number): number {
  return Math.min(1, approvedCount / TOTAL_TILES);
}
