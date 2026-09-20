# صوتك يرسم الوطن

> كلماتنا... لوحة لقائدنا

منصة تفاعلية للاحتفاء باليوم الوطني السعودي: يشارك الزوار بصوتهم أو بكلماتهم،
وتتحول كل مشاركة معتمدة إلى قطعة فسيفساء (Mosaic Tile) صغيرة تُضاف إلى لوحة
وطنية ضخمة تتشكل تدريجيًا لتكوّن صورة خادم الحرمين الشريفين الملك سلمان بن
عبدالعزيز آل سعود.

## التقنيات

React · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase

## التشغيل محليًا

```bash
npm install
npm run dev
```

يعمل الموقع افتراضيًا ببيانات تجريبية محلية (Mock، عبر localStorage) دون أي
إعداد إضافي. لربطه بـ Supabase حقيقي، راجع [`supabase/README.md`](./supabase/README.md).

## الصورة المرجعية

اللوحة تحتاج صورة رسمية مصرَّح باستخدامها لخادم الحرمين الشريفين لتُستخدم
كمرجع لتلوين القطع. ضعها في `public/reference/king-salman.jpg` — التفاصيل
في [`public/reference/README.md`](./public/reference/README.md) وفي تعليقات
`src/lib/referenceImage.ts`. بدونها يعمل الموقع بنمط بديل تجريبي.

## بنية المشروع

```
src/
  components/       مكونات الواجهة (Hero, VoiceRecorder, MosaicCanvas...)
  pages/            صفحات المسارات (/, /participate, /mosaic, /pulse, /display, /admin)
  hooks/            React hooks (بيانات حيّة، إحصائيات، ألوان الصورة المرجعية)
  lib/
    data/           طبقة البيانات (واجهة موحّدة + تطبيق تجريبي + تطبيق Supabase)
    ...             استخراج كلمات مفتاحية، رياضيات الشبكة، الألوان، الأمان
supabase/
  schema.sql        مخطط قاعدة البيانات وسياسات RLS
  README.md         خطوات إعداد Supabase الكاملة
```

## الأمان

- Row Level Security مفعّل بالكامل — لا يمكن لأي عميل تحديد `status=approved`.
- لا يوجد أي مفتاح Supabase حسّاس (service role) داخل كود الواجهة.
- تنقية للنصوص قبل الحفظ، وحد أدنى زمني بين المشاركات (Rate Limiting).
- لا يُخزَّن أي تسجيل صوتي — فقط النص الناتج بعد التحويل.

تفاصيل كاملة في [`supabase/README.md`](./supabase/README.md).
