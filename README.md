# صوتك يرسم الوطن

> كلماتنا... لوحة لقائدنا

منصة تفاعلية للاحتفاء باليوم الوطني السعودي: يشارك الزوار بصوتهم أو بكلماتهم،
وتتحول كل مشاركة إلى قطعة فسيفساء (Mosaic Tile) صغيرة تُضاف فورًا إلى لوحة
وطنية ضخمة تتشكل تدريجيًا لتكوّن صورة خادم الحرمين الشريفين الملك سلمان بن
عبدالعزيز آل سعود، بمبادرة من المتوسطة السابعة بعرعر.

## التقنيات

React · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · Firebase / Supabase

## التشغيل محليًا

```bash
npm install
npm run dev
```

يعمل الموقع افتراضيًا ببيانات تجريبية محلية (Mock، عبر localStorage) دون أي
إعداد إضافي. لربطه بقاعدة بيانات حقيقية مشتركة بين كل الزوار، اختر إحدى:

- **Firebase** (الأسهل إعدادًا): راجع [`firebase/README.md`](./firebase/README.md).
- **Supabase**: راجع [`supabase/README.md`](./supabase/README.md).

الأولوية دائمًا لـ Firebase إن كانت متغيرات بيئته موجودة (`src/lib/data/index.ts`).

## الصورة المرجعية

اللوحة تحتاج صورة رسمية مصرَّح باستخدامها لخادم الحرمين الشريفين لتُستخدم
كمرجع لتلوين القطع. ضعها في `public/reference/king-salman.webp` — التفاصيل
في [`public/reference/README.md`](./public/reference/README.md) وفي تعليقات
`src/lib/referenceImage.ts`. بدونها يعمل الموقع بنمط بديل تجريبي.

## بنية المشروع

```
src/
  components/       مكونات الواجهة (Hero, VoiceRecorder, MosaicCanvas...)
  pages/            صفحات المسارات (/, /participate, /mosaic, /pulse, /display, /admin)
  hooks/            React hooks (بيانات حيّة، إحصائيات، ألوان الصورة المرجعية)
  lib/
    data/           طبقة البيانات (واجهة موحّدة + Mock + Firebase + Supabase)
    ...             استخراج كلمات مفتاحية، رياضيات الشبكة، الألوان، الأمان
firebase/
  firestore.rules   قواعد أمان Firestore
  README.md         خطوات إعداد Firebase الكاملة
supabase/
  schema.sql        مخطط قاعدة البيانات وسياسات RLS
  README.md         خطوات إعداد Supabase الكاملة
```

## الأمان

- قواعد أمان صارمة (Firestore Rules / RLS حسب المصدر) — لا يمكن لأي عميل
  تعديل أو حذف مشاركة غير خاصته؛ الحذف/الرفض للمشرفين فقط.
- لا يوجد أي مفتاح حسّاس (Service Role / Admin SDK) داخل كود الواجهة.
- تنقية للنصوص قبل الحفظ، وحد أدنى زمني بين المشاركات (Rate Limiting).
- لا يُخزَّن أي تسجيل صوتي — فقط النص الناتج بعد التحويل.

تفاصيل كاملة في [`firebase/README.md`](./firebase/README.md) أو
[`supabase/README.md`](./supabase/README.md) حسب ما تستخدمه.
