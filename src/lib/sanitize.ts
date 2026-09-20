/**
 * تنقية النصوص قبل تخزينها/عرضها. React يقوم أصلاً بترميز أي نص يُعرض داخل
 * JSX (لا نستخدم dangerouslySetInnerHTML في أي مكان بالمشروع)، لكننا نضيف
 * طبقة دفاع إضافية هنا لإزالة وسوم HTML ومحارف التحكم قبل الحفظ في القاعدة،
 * تحسبًا لأي استهلاك مستقبلي للبيانات خارج React (تصدير، لوحة تحكم خارجية...).
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
}

export function clampLength(input: string, max: number): string {
  return input.slice(0, max);
}
