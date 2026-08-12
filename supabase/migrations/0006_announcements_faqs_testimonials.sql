-- =====================================================================
-- 0006 — announcements, faqs, testimonials
-- Spec §27/§28/§29. Idempotent.
-- =====================================================================

create table if not exists public.announcements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  body          text not null,
  title_ar      text,
  body_ar       text,
  is_published  boolean not null default false,
  created_by    uuid references public.users(id) on delete set null,
  published_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_announcements_published
  on public.announcements (published_at desc)
  where is_published = true;

create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  question_ar text,
  answer_ar   text,
  sort_order  integer not null default 0,
  is_published boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_faqs_sort on public.faqs (sort_order asc);

create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          text,
  content       text not null,
  avatar_url    text,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists idx_testimonials_published
  on public.testimonials (created_at desc)
  where is_published = true;

-- RLS
alter table public.announcements enable row level security;
alter table public.faqs          enable row level security;
alter table public.testimonials  enable row level security;

-- announcements: public read of published only; admin write.
drop policy if exists "announcements public read" on public.announcements;
create policy "announcements public read" on public.announcements
  for select using (is_published = true or public.is_admin());
drop policy if exists "announcements admin write" on public.announcements;
create policy "announcements admin write" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- faqs: public read of published only; admin write.
drop policy if exists "faqs public read" on public.faqs;
create policy "faqs public read" on public.faqs
  for select using (is_published = true or public.is_admin());
drop policy if exists "faqs admin write" on public.faqs;
create policy "faqs admin write" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

-- testimonials: public read of published only; admin write.
drop policy if exists "testimonials public read" on public.testimonials;
create policy "testimonials public read" on public.testimonials
  for select using (is_published = true or public.is_admin());
drop policy if exists "testimonials admin write" on public.testimonials;
create policy "testimonials admin write" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- Seed default FAQ items (idempotent — only insert if no rows exist yet).
do $$
begin
  if not exists (select 1 from public.faqs limit 1) then
    insert into public.faqs (question, answer, sort_order, is_published) values
      ('How do I enroll?', 'Visit the Enroll page and submit a request. We review every request manually.', 10, true),
      ('When will I receive my account?', 'Once your request is approved you will be contacted through WhatsApp or email.', 20, true),
      ('How do I log in?', 'Use the Login page with the email and password you were given. You will be asked to change the temporary password on first login.', 30, true),
      ('How do I change my password?', 'After your first login, follow the mandatory password change. You can change it again later from your profile.', 40, true),
      ('How does the course work?', 'Progress lesson by lesson. Mark each lesson complete to earn XP and unlock the next lesson.', 50, true),
      ('How do I track progress?', 'Your dashboard shows current course, progress percentage, XP, level, and streak.', 60, true),
      ('How do certificates work?', 'When you complete every required lesson, a certificate is generated with a unique ID and a QR code anyone can scan to verify.', 70, true),
      ('How do I contact support?', 'Reach us through the contact information shown on the Enroll page or in your dashboard announcements.', 80, true);
  end if;
end $$;

-- Seed default testimonials (idempotent).
do $$
begin
  if not exists (select 1 from public.testimonials limit 1) then
    insert into public.testimonials (name, role, content, is_published) values
      ('Amal K.', 'Student', 'The course structure kept me focused and the certificate was the perfect milestone.', true),
      ('Omar H.', 'Student', 'I appreciated the live classes and the clear progression through lessons.', true),
      ('Layla S.', 'Student', 'The XP and streak system made me come back every day.', true);
  end if;
end $$;