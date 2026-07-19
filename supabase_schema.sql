-- SUPABASE SCHEMA FOR LUVIA PLATFORM
-- Production-grade, fully normalized schema with Role Based Access Control (RBAC)
-- Run this in your Supabase SQL Editor.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Define Roles Type
create type user_role as enum ('admin', 'instructor', 'ta', 'student');

-- 1. Profiles Table (Auth Users mapped to role-based profiles)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  role user_role not null default 'student',
  points integer not null default 0,
  is_active boolean not null default true,
  is_banned boolean not null default false,
  gender text check (gender in ('male', 'female')) not null default 'female',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Courses Table
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title_en text not null,
  title_ar text not null,
  description_en text,
  description_ar text,
  instructor_name_en text,
  instructor_name_ar text,
  price_usd numeric(10, 2) not null default 0.00,
  thumbnail_url text,
  is_published boolean not null default true,
  instructor_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Lessons Table
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title_en text not null,
  title_ar text not null,
  google_drive_video_id text not null,
  order_index integer not null default 0,
  lesson_type text not null default 'video',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Dynamic Course Enrollments (Tracks which students are enrolled in which courses)
create table public.user_courses (
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, course_id)
);

-- 5. Lesson Progress Tracker
create table public.lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  is_completed boolean not null default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, lesson_id)
);

-- 6. Voucher Codes Table
create table public.vouchers (
  code text primary key,
  is_used boolean not null default false,
  expiry_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Live Classes & Seminars
create table public.live_lectures (
  id uuid default uuid_generate_v4() primary key,
  is_active boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Platform Settings Table
create table public.settings (
  key text primary key,
  value text not null
);

-- 9. Certified Accreditations
create table public.certificates (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  student_full_name text not null,
  description_en text,
  description_ar text,
  instructor_signature_text text,
  qr_code_data text,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_courses_instructor on public.courses(instructor_id);
create index idx_lessons_course on public.lessons(course_id);
create index idx_user_courses_user on public.user_courses(user_id);
create index idx_lesson_progress_user on public.lesson_progress(user_id);
create index idx_certificates_student on public.certificates(student_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.user_courses enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.vouchers enable row level security;
alter table public.live_lectures enable row level security;
alter table public.settings enable row level security;
alter table public.certificates enable row level security;

-- Profiles Policies
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Courses Policies
create policy "Anyone can view courses" on public.courses for select using (true);
create policy "Instructors/Admins can manage courses" on public.courses for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'instructor'))
);

-- Lessons Policies
create policy "Anyone can view lessons" on public.lessons for select using (true);
create policy "Instructors/Admins can manage lessons" on public.lessons for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'instructor'))
);

-- user_courses Policies
create policy "Students can view/update own enrollment" on public.user_courses for all using (auth.uid() = user_id);
create policy "Instructors/Admins can view all enrollments" on public.user_courses for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'instructor', 'ta'))
);

-- lesson_progress Policies
create policy "Students can view/update own progress" on public.lesson_progress for all using (auth.uid() = user_id);
create policy "Instructors/Admins can view progress" on public.lesson_progress for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'instructor', 'ta'))
);

-- Vouchers Policies
create policy "Anyone can view vouchers" on public.vouchers for select using (true);
create policy "Only Admins can manage vouchers" on public.vouchers for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Live Lectures Policies
create policy "Anyone can view live lectures" on public.live_lectures for select using (true);
create policy "Instructors/TAs/Admins can manage live lectures" on public.live_lectures for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'instructor', 'ta'))
);

-- Settings Policies
create policy "Anyone can read platform settings" on public.settings for select using (true);
create policy "Only Admins can write platform settings" on public.settings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Certificates Policies
create policy "Users can view own certificates" on public.certificates for select using (auth.uid() = student_id);
create policy "Admins can manage certificates" on public.certificates for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
