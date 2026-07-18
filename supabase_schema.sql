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
  avatar_url text,
  role user_role not null default 'student',
  current_streak integer not null default 0,
  total_xp integer not null default 0,
  current_level integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Instructors Table (Instructor-specific detail expansion)
create table public.instructors (
  id uuid references public.profiles(id) on delete cascade primary key,
  role_title text not null default 'Design System Specialist',
  bio text,
  courses_count integer not null default 0,
  students_count integer not null default 0
);

-- 3. Courses Table
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subtitle text,
  duration text not null default '0h',
  rating numeric(3, 2) not null default 5.00,
  lessons_count integer not null default 0,
  xp_reward integer not null default 500,
  cover_image text,
  category text not null default 'General',
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  price numeric(10, 2) not null default 0.00,
  description text,
  outcomes text[] default '{}'::text[],
  requirements text[] default '{}'::text[],
  instructor_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Lessons Table
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  duration text not null default '0:00',
  video_url text not null,
  is_locked boolean not null default true,
  xp_reward integer not null default 100,
  attachments jsonb default '[]'::jsonb, -- Array of name, size, url
  transcript jsonb default '[]'::jsonb,  -- Array of time, text
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Teaching Assistant Course Assignments & Permissions
create table public.ta_assignments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  permissions text[] default '{}'::text[], -- 'review_assignments', 'view_progress', 'manage_live', 'announcements', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, course_id)
);

-- 6. Dynamic Course Enrollments (Tracks which students have completed which lessons)
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  completed_lessons uuid[] default '{}'::uuid[], -- List of lesson UUIDs completed by student
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, course_id)
);

-- 7. Voucher Codes Table
create table public.vouchers (
  code text primary key,
  discount_percent integer not null check (discount_percent between 1 and 100),
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Certified Accreditations
create table public.certificates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  course_title text not null,
  recipient_name text not null,
  date_earned text not null,
  hash text not null unique,
  qr_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Live Classes & Seminars
create table public.live_classes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  speaker_id uuid references public.profiles(id) on delete set null,
  starts_in_minutes integer not null default 60,
  participants_count integer not null default 0,
  is_live boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Platform Settings (WhatsApp, Platform Name, Heros, Banners, dynamic landing)
create table public.platform_settings (
  key text primary key,
  value jsonb not null
);

-- 11. Testimonials
create table public.testimonials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  avatar_url text,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. FAQ List
create table public.faqs (
  id uuid default uuid_generate_v4() primary key,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_courses_instructor on public.courses(instructor_id);
create index idx_lessons_course on public.lessons(course_id);
create index idx_ta_user on public.ta_assignments(user_id);
create index idx_enrollments_user_course on public.enrollments(user_id, course_id);
create index idx_certificates_user on public.certificates(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.instructors enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.ta_assignments enable row level security;
alter table public.enrollments enable row level security;
alter table public.vouchers enable row level security;
alter table public.certificates enable row level security;
alter table public.live_classes enable row level security;
alter table public.platform_settings enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;

-- 1. Profiles Policies
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. Instructors Policies
create policy "Public read instructors" on public.instructors for select using (true);
create policy "Admins can manage instructors" on public.instructors for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 3. Courses Policies
create policy "Anyone can view courses" on public.courses for select using (true);
create policy "Instructors/Admins can edit courses" on public.courses for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'instructor'))
);

-- 4. Lessons Policies
create policy "Anyone can view lessons" on public.lessons for select using (true);
create policy "Instructors/Admins can manage lessons" on public.lessons for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'instructor'))
);

-- 5. TA Assignments Policies
create policy "Admins/TAs can view assignments" on public.ta_assignments for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'ta'))
);
create policy "Admins can manage TA assignments" on public.ta_assignments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 6. Enrollments Policies
create policy "Students can view/update own enrollment" on public.enrollments for all using (auth.uid() = user_id);
create policy "Instructors/Admins can view all enrollments" on public.enrollments for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'instructor', 'ta'))
);

-- 7. Vouchers Policies
create policy "Anyone can view vouchers" on public.vouchers for select using (true);
create policy "Only Admins can manage vouchers" on public.vouchers for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 8. Certificates Policies
create policy "Users can view own certificates" on public.certificates for select using (auth.uid() = user_id);
create policy "Admins can manage certificates" on public.certificates for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 9. Live Classes Policies
create policy "Anyone can view live classes" on public.live_classes for select using (true);
create policy "Instructors/TAs/Admins can manage live classes" on public.live_classes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'instructor', 'ta'))
);

-- 10. Platform Settings Policies
create policy "Anyone can read platform settings" on public.platform_settings for select using (true);
create policy "Only Admins can write platform settings" on public.platform_settings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 11. Testimonials / FAQs Policies
create policy "Anyone can read testimonials" on public.testimonials for select using (true);
create policy "Admins can manage testimonials" on public.testimonials for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Anyone can read faqs" on public.faqs for select using (true);
create policy "Admins can manage faqs" on public.faqs for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
