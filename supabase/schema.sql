-- ============================================================================
-- صوتك يرسم الوطن — مخطط قاعدة بيانات Supabase
-- نفّذ هذا الملف كاملاً في SQL Editor داخل مشروع Supabase الخاص بك.
-- ============================================================================

create extension if not exists "pgcrypto"; -- من أجل gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 1) نوع الحالة ونوع طريقة المشاركة
-- ----------------------------------------------------------------------------
do $$ begin
  create type submission_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_input_type as enum ('voice', 'text');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2) جدول المشاركات
--    ملاحظة خصوصية: لا نخزّن الملف الصوتي إطلاقًا، فقط النص الناتج بعد
--    التحويل (أو الذي كتبه المستخدم يدويًا).
-- ----------------------------------------------------------------------------
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) between 1 and 150),
  input_type submission_input_type not null,
  keywords text[] not null default '{}',
  tile_index integer,
  status submission_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists submissions_status_idx on public.submissions (status);
create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

alter table public.submissions enable row level security;

-- ----------------------------------------------------------------------------
-- 3) جدول المشرفين (Admins)
--    كل صف يمثّل مستخدم Supabase Auth مصرّح له بإدارة المشاركات.
--    أضِف المشرفين يدويًا من SQL Editor بعد إنشاء حساباتهم في Auth:
--      insert into public.admins (user_id) values ('<uuid-من-auth.users>');
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.admins enable row level security;

-- لا نمنح أي صلاحية عامة على جدول admins نفسه — القراءة تتم فقط عبر
-- الدوال الأمنية (security definer) أدناه.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ----------------------------------------------------------------------------
-- 4) سياسات RLS لجدول submissions
-- ----------------------------------------------------------------------------

-- القراءة العامة: أي زائر (anon) يمكنه رؤية المشاركات المعتمدة فقط.
drop policy if exists "public can read approved" on public.submissions;
create policy "public can read approved"
  on public.submissions for select
  to anon, authenticated
  using (status = 'approved');

-- المشرفون فقط يمكنهم رؤية كل المشاركات (بما فيها pending/rejected) في لوحة الإدارة.
drop policy if exists "admins can read all" on public.submissions;
create policy "admins can read all"
  on public.submissions for select
  to authenticated
  using (public.is_admin());

-- الإدراج: أي زائر يمكنه إرسال مشاركة جديدة وتُنشر فورًا بدون مراجعة
-- إشرافية مسبقة (بطلب صاحب الموقع). لوحة الإدارة تبقى متاحة لحذف أو
-- إخفاء (status = 'rejected') أي مشاركة غير لائقة بعد نشرها.
drop policy if exists "anyone can insert pending" on public.submissions;
drop policy if exists "anyone can insert approved" on public.submissions;
create policy "anyone can insert approved"
  on public.submissions for insert
  to anon, authenticated
  with check (status = 'approved');

-- التحديث (اعتماد/رفض وتعيين رقم القطعة): للمشرفين فقط.
drop policy if exists "admins can update" on public.submissions;
create policy "admins can update"
  on public.submissions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- الحذف: للمشرفين فقط.
drop policy if exists "admins can delete" on public.submissions;
create policy "admins can delete"
  on public.submissions for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5) Realtime: فعّل النشر لجدول submissions من إعدادات Supabase
--    Database → Replication → أضف جدول submissions إلى publication
--    supabase_realtime حتى تعمل التحديثات الحية في /mosaic و /display.
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- 6) Rate limiting على مستوى القاعدة (طبقة دفاع إضافية إلى جانب الحد الزمني
--    في الواجهة). يمنع أكثر من 3 مشاركات من نفس عنوان IP خلال ساعة عبر دالة
--    تُستدعى من Supabase Edge Function (وليس مباشرة من العميل) — اختياري
--    للنسخة الأولى ويتطلب تمرير عنوان IP من الـ Edge Function.
-- ----------------------------------------------------------------------------
create table if not exists public.submission_rate_limits (
  client_key text primary key,
  submission_count integer not null default 0,
  window_started_at timestamptz not null default now()
);

alter table public.submission_rate_limits enable row level security;
-- لا سياسات = لا وصول مباشر من العميل؛ يُستخدم هذا الجدول فقط من خلال
-- Supabase Edge Function موقّعة بمفتاح service role (خادم فقط).
