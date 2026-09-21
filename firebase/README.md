# إعداد Firebase لمشروع «صوتك يرسم الوطن»

## 1) إنشاء المشروع

1. اذهب إلى [console.firebase.google.com](https://console.firebase.google.com) وأنشئ مشروعًا جديدًا.
2. من القائمة الجانبية: **Build → Firestore Database** → **Create database**
   → اختر **Start in production mode** → اختر أقرب منطقة (مثل `eur3` أو
   `me-central1` إن توفرت).
3. من **Build → Authentication** → تبويب **Sign-in method** → فعّل
   **Email/Password**.

## 2) نشر قواعد الأمان

من **Firestore Database → Rules**، انسخ محتوى
[`firestore.rules`](./firestore.rules) كاملاً والصقه ثم اضغط **Publish**.

## 3) متغيرات البيئة (Frontend)

من **Project settings** (⚙️ بجانب Project Overview) → انزل إلى **Your apps**
→ أضف تطبيق ويب جديد (</> Web) إن لم يكن موجودًا → انسخ القيم من كائن
`firebaseConfig` إلى ملف `.env.local` (انسخه أولاً من `.env.example`):

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

بدون هذه المتغيرات، يعمل الموقع تلقائيًا بوضع البيانات التجريبية
(localStorage) أو بـ Supabase إن كان مُهيّأ بدلاً منه.

## 4) إنشاء حساب مشرف (Admin)

1. من **Authentication → Users → Add user**، أنشئ مستخدمًا بالبريد
   وكلمة المرور لكل مشرف تريد منحه صلاحية الدخول إلى `/admin`.
2. انسخ الـ **User UID** الخاص به من نفس الصفحة.
3. من **Firestore Database → Data**، أنشئ مجموعة (Collection) باسم
   `admins`، وأضف وثيقة (Document) معرّفها (Document ID) هو نفس الـ UID
   المنسوخ (لا حاجة لأي حقول داخلها — مجرد وجود الوثيقة كافٍ).
4. سجّل الدخول من `/admin` بنفس البريد وكلمة المرور.

## 5) الصورة المرجعية والأمان

نفس التعليمات الموجودة في [`../supabase/README.md`](../supabase/README.md)
تنطبق هنا (الصورة المرجعية، تنقية النصوص، عدم تخزين الصوت). الفرق الوحيد
هو مصدر البيانات: Firestore بدل Postgres، وقواعد الأمان بصيغة Firestore
Security Rules بدل RLS.

## 6) لماذا لا يوجد Rate Limiting على مستوى القاعدة هنا؟

Firestore لا يدعم دوال SQL مخصصة كما في Postgres. الحد الزمني الحالي بين
مشاركتين (20 ثانية) مطبّق من جهة العميل فقط (`mockRepository.ts` كمرجع
لنفس الفكرة). لتطبيق حد صارم من جهة الخادم لاحقًا، استخدم **Cloud
Functions for Firebase** مع App Check لمنع الطلبات الآلية.
