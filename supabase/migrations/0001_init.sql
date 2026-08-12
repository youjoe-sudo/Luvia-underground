-- =====================================================================
-- Luvia Educational Platform — single consolidated migration
-- Run in Supabase SQL editor. Idempotent: safe to re-run.
--
-- Implements PRD §7 (full table blueprint) plus auxiliary tables the
-- client uses (lessons, exams, community, certificates, tickets, …).
-- Includes security helpers, RPCs for session lifecycle, and full RLS.
--
-- Single-session enforcement (PRD §5.2 + chat directive):
--   - users.active_session_id        : text — the only session id the server accepts
--   - users.active_session_started_at : timestamptz
--   - start_session()                : mints a new id, revokes the old one
--   - heartbeat_ping(p_fingerprint, p_session_id) raises 'session_invalid'
--     whenever the stored id does not match p_session_id.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums (idempotent)
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('student','instructor','coordinator','admin','super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type session_status as enum ('pending','live','ended','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendance_final as enum ('present','absent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status as enum ('open','in_progress','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type question_type as enum ('single_choice','multiple_choice');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- users  (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id                         uuid primary key references auth.users(id) on delete cascade,
  email                      text unique not null,
  full_name                  text not null,
  phone                      text,
  role                       user_role not null default 'student',
  is_active                  boolean not null default true,
  is_banned                  boolean not null default false,
  must_change_password       boolean not null default true,
  last_login_ip              text,
  browser_fingerprint        text,
  -- single-session enforcement
  active_session_id          text,
  active_session_started_at  timestamptz,
  last_seen_at               timestamptz,
  created_at                 timestamptz not null default now()
);
create index if not exists idx_users_role on public.users(role);

-- ---------------------------------------------------------------------
-- account_requests
-- ---------------------------------------------------------------------
create table if not exists public.account_requests (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null,
  phone         text,
  status        request_status not null default 'pending',
  requested_at  timestamptz not null default now(),
  reviewed_by   uuid references public.users(id) on delete set null,
  reviewed_at   timestamptz
);
create index if not exists idx_account_requests_status on public.account_requests(status);

-- ---------------------------------------------------------------------
-- brand_settings  (single-row config)
-- ---------------------------------------------------------------------
create table if not exists public.brand_settings (
  id             uuid primary key default gen_random_uuid(),
  platform_name  text not null default 'Luvia',
  primary_font   text not null default 'Poppins',
  colors         jsonb not null default '{
    "primary_purple":"#3F2CD9",
    "cyan_blue":"#2C9DFC",
    "electric_blue":"#4040EB",
    "dark_navy":"#000412",
    "white":"#FFFFFF",
    "rich_black":"#000000"
  }'::jsonb,
  logos          jsonb not null default '{}'::jsonb,
  updated_at     timestamptz not null default now()
);

insert into public.brand_settings (platform_name) values ('Luvia') on conflict do nothing;

-- ---------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- cohorts
-- ---------------------------------------------------------------------
create table if not exists public.cohorts (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references public.courses(id) on delete cascade,
  group_name      text not null,
  coordinator_id  uuid references public.users(id) on delete set null,
  instructor_id   uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists idx_cohorts_course on public.cohorts(course_id);

-- ---------------------------------------------------------------------
-- student_cohorts  (junction)
-- ---------------------------------------------------------------------
create table if not exists public.student_cohorts (
  student_id   uuid not null references public.users(id) on delete cascade,
  cohort_id    uuid not null references public.cohorts(id) on delete cascade,
  enrolled_at  timestamptz not null default now(),
  primary key (student_id, cohort_id)
);

-- ---------------------------------------------------------------------
-- enrollments  (Course Lock activation)
-- ---------------------------------------------------------------------
create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index if not exists idx_enrollments_user on public.enrollments(user_id);

-- ---------------------------------------------------------------------
-- vouchers
-- ---------------------------------------------------------------------
create table if not exists public.vouchers (
  id               uuid primary key default gen_random_uuid(),
  code             text unique not null,
  course_id        uuid not null references public.courses(id) on delete cascade,
  is_used          boolean not null default false,
  used_by_user_id  uuid references public.users(id) on delete set null,
  used_at          timestamptz,
  created_at       timestamptz not null default now()
);

create table if not exists public.voucher_redemptions (
  id          uuid primary key default gen_random_uuid(),
  voucher_id  uuid not null references public.vouchers(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (voucher_id, user_id)
);

-- ---------------------------------------------------------------------
-- virtual_sessions
-- ---------------------------------------------------------------------
create table if not exists public.virtual_sessions (
  id                       uuid primary key default gen_random_uuid(),
  cohort_id                uuid not null references public.cohorts(id) on delete cascade,
  course_id                uuid not null references public.courses(id) on delete cascade,
  title                    text not null,
  start_time               timestamptz not null,
  end_time                 timestamptz not null,
  meeting_link             text,
  is_link_active           boolean not null default false,
  status                   session_status not null default 'pending',
  is_attendance_confirmed  boolean not null default false
);
create index if not exists idx_vsessions_cohort on public.virtual_sessions(cohort_id);
create index if not exists idx_vsessions_course on public.virtual_sessions(course_id);

-- ---------------------------------------------------------------------
-- attendance_records
-- ---------------------------------------------------------------------
create table if not exists public.attendance_records (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.virtual_sessions(id) on delete cascade,
  student_id    uuid not null references public.users(id) on delete cascade,
  first_check   boolean not null default false,
  second_check  boolean not null default false,
  final_status  attendance_final not null default 'absent',
  unique (session_id, student_id)
);

-- ---------------------------------------------------------------------
-- session_heartbeats  (history; session id check happens in RPC)
-- ---------------------------------------------------------------------
create table if not exists public.session_heartbeats (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  fingerprint text not null,
  pinged_at   timestamptz not null default now()
);
create index if not exists idx_heartbeats_user on public.session_heartbeats(user_id, pinged_at desc);

-- ---------------------------------------------------------------------
-- device_locks  (new-device detection log for admin review)
-- ---------------------------------------------------------------------
create table if not exists public.device_locks (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  device_fingerprint  text not null,
  ip_address          text,
  is_approved         boolean not null default false,
  flagged_at          timestamptz not null default now()
);
create index if not exists idx_device_locks_user on public.device_locks(user_id, flagged_at desc);

-- ---------------------------------------------------------------------
-- lessons  (self-paced content)
-- ---------------------------------------------------------------------
create table if not exists public.lessons (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references public.cohorts(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  description text,
  video_id    text not null,         -- Google Drive video ID
  duration_seconds integer not null default 0,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_lessons_course on public.lessons(course_id, sort_order);

create table if not exists public.lesson_attachments (
  id         uuid primary key default gen_random_uuid(),
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  file_name  text not null,
  storage_url text not null,
  size_bytes integer,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.users(id) on delete cascade,
  lesson_id       uuid not null references public.lessons(id) on delete cascade,
  completed_at    timestamptz not null default now(),
  watch_seconds   integer not null default 0,
  unique (student_id, lesson_id)
);

-- ---------------------------------------------------------------------
-- exams
-- ---------------------------------------------------------------------
create table if not exists public.exams (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references public.courses(id) on delete cascade,
  cohort_id       uuid not null references public.cohorts(id) on delete cascade,
  session_id      uuid references public.virtual_sessions(id) on delete set null,
  lesson_id       uuid references public.lessons(id) on delete set null,
  title           text not null,
  is_periodic     boolean not null default true,
  is_final        boolean not null default false,
  -- gating: requires attendance for `session_id` to be Present + is_attendance_confirmed
  requires_attendance boolean not null default true,
  requires_lesson_complete boolean not null default false,
  time_limit_minutes integer,
  created_at      timestamptz not null default now()
);
create index if not exists idx_exams_course on public.exams(course_id);

create table if not exists public.exam_questions (
  id           uuid primary key default gen_random_uuid(),
  exam_id      uuid not null references public.exams(id) on delete cascade,
  question     text not null,
  question_type question_type not null default 'single_choice',
  options      jsonb not null,        -- array of strings
  correct      jsonb not null,        -- array of correct indices (1-based)
  sort_order   integer not null default 0,
  points       integer not null default 1
);

create table if not exists public.exam_attempts (
  id           uuid primary key default gen_random_uuid(),
  exam_id      uuid not null references public.exams(id) on delete cascade,
  student_id   uuid not null references public.users(id) on delete cascade,
  started_at   timestamptz not null default now(),
  submitted_at timestamptz,
  score        integer,
  total_points integer,
  passed       boolean
);
create index if not exists idx_attempts_student on public.exam_attempts(student_id, exam_id);

create table if not exists public.exam_answers (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.exam_questions(id) on delete cascade,
  selected    jsonb not null,        -- array of selected indices
  is_correct  boolean not null default false,
  awarded     integer not null default 0
);

-- ---------------------------------------------------------------------
-- community
-- ---------------------------------------------------------------------
create table if not exists public.community_posts (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references public.cohorts(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  author_id   uuid not null references public.users(id) on delete cascade,
  title       text,
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_posts_cohort on public.community_posts(cohort_id, created_at desc);

create table if not exists public.community_replies (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.community_posts(id) on delete cascade,
  author_id   uuid not null references public.users(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- resources
-- ---------------------------------------------------------------------
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  description text,
  storage_url text,
  external_url text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- support_tickets
-- ---------------------------------------------------------------------
create table if not exists public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  subject     text not null,
  body        text not null,
  status      ticket_status not null default 'open',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_tickets_user on public.support_tickets(user_id, created_at desc);

create table if not exists public.support_ticket_replies (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.support_tickets(id) on delete cascade,
  author_id   uuid not null references public.users(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- certificates
-- ---------------------------------------------------------------------
create table if not exists public.certificates (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  course_id       uuid not null references public.courses(id) on delete cascade,
  cohort_id       uuid references public.cohorts(id) on delete set null,
  issued_at       timestamptz not null default now(),
  instructor_signature_name text,
  pdf_storage_url text,
  unique (user_id, course_id)
);

-- ---------------------------------------------------------------------
-- utility functions
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;

drop trigger if exists trg_tickets_updated on public.support_tickets;
create trigger trg_tickets_updated before update on public.support_tickets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Role helpers (SECURITY DEFINER so RLS policies can call them safely)
-- ---------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('admin','super_admin') and is_banned = false
  );
$$;

create or replace function public.current_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid();
$$;

-- ---------------------------------------------------------------------
-- admin_create_user  (called from the access-request approval flow)
-- ---------------------------------------------------------------------
create or replace function public.admin_create_user(
  p_email         text,
  p_full_name     text,
  p_phone         text,
  p_role          user_role,
  p_temp_password text
) returns uuid
language plpgsql security definer set search_path = public, auth as $$
declare v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  v_user_id := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated', p_email,
    crypt(p_temp_password, gen_salt('bf')),
    now(),
    jsonb_build_object('provider','email','providers', array['email']),
    jsonb_build_object('full_name', p_full_name, 'phone', p_phone),
    now(), now(), '', '', '', ''
  );

  insert into public.users (id, email, full_name, phone, role, must_change_password)
  values (v_user_id, p_email, p_full_name, p_phone, p_role, true);

  return v_user_id;
end $$;

grant execute on function public.admin_create_user(text,text,text,user_role,text) to authenticated;

-- ---------------------------------------------------------------------
-- start_session  (mint a new session id; revoke any older one)
-- ---------------------------------------------------------------------
create or replace function public.start_session(p_fingerprint text) returns text
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_sid text;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  v_sid := gen_random_uuid()::text;
  update public.users
    set active_session_id = v_sid,
        active_session_started_at = now(),
        browser_fingerprint = p_fingerprint
    where id = v_uid;
  -- delete old heartbeats from the previous session
  delete from public.session_heartbeats where user_id = v_uid;
  return v_sid;
end $$;

grant execute on function public.start_session(text) to authenticated;

-- ---------------------------------------------------------------------
-- end_session  (called from sign-out)
-- ---------------------------------------------------------------------
create or replace function public.end_session() returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then return; end if;
  update public.users
    set active_session_id = null,
        active_session_started_at = null
    where id = v_uid;
  delete from public.session_heartbeats where user_id = v_uid;
end $$;

grant execute on function public.end_session() to authenticated;

-- ---------------------------------------------------------------------
-- heartbeat_ping  (called by the client every 30–45 seconds)
--   - verifies active_session_id matches
--   - rejects if the session is older than 90s without a fresh ping
--     (the server uses the most recent heartbeat row to enforce this)
-- ---------------------------------------------------------------------
create or replace function public.heartbeat_ping(
  p_fingerprint text,
  p_session_id  text
) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := now();
  v_stored_id      text;
  v_last_ping_at   timestamptz;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  -- Single-session check
  select active_session_id into v_stored_id from public.users where id = v_uid;
  if v_stored_id is null or v_stored_id <> p_session_id then
    raise exception 'session_invalid';
  end if;

  -- 90s liveness check: if the last heartbeat is older than 90s, the
  -- session is considered dead. (If there is no last heartbeat yet,
  -- allow it — this is the first ping.)
  select max(pinged_at) into v_last_ping_at from public.session_heartbeats where user_id = v_uid;
  if v_last_ping_at is not null and (v_now - v_last_ping_at) > interval '90 seconds' then
    raise exception 'session_timeout';
  end if;

  insert into public.session_heartbeats (user_id, fingerprint, pinged_at)
  values (v_uid, p_fingerprint, v_now);

  update public.users
    set last_seen_at = v_now,
        browser_fingerprint = p_fingerprint
    where id = v_uid;

  return v_now;
end $$;

grant execute on function public.heartbeat_ping(text,text) to authenticated;

-- ---------------------------------------------------------------------
-- can_attempt_exam  (gating check used by the exam page)
-- ---------------------------------------------------------------------
create or replace function public.can_attempt_exam(p_exam_id uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_exam record;
  v_attendance attendance_final;
  v_confirmed  boolean;
  v_lesson_done boolean;
begin
  if v_uid is null then return false; end if;

  select * into v_exam from public.exams where id = p_exam_id;
  if not found then return false; end if;

  if v_exam.requires_attendance and v_exam.session_id is not null then
    select final_status, s.is_attendance_confirmed
      into v_attendance, v_confirmed
      from public.attendance_records ar
      join public.virtual_sessions s on s.id = ar.session_id
     where ar.session_id = v_exam.session_id and ar.student_id = v_uid;
    if v_attendance is distinct from 'present' or coalesce(v_confirmed, false) = false then
      return false;
    end if;
  end if;

  if v_exam.requires_lesson_complete and v_exam.lesson_id is not null then
    select exists(
      select 1 from public.lesson_progress
      where student_id = v_uid and lesson_id = v_exam.lesson_id
    ) into v_lesson_done;
    if not v_lesson_done then return false; end if;
  end if;

  return true;
end $$;

grant execute on function public.can_attempt_exam(uuid) to authenticated;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.users              enable row level security;
alter table public.account_requests   enable row level security;
alter table public.brand_settings     enable row level security;
alter table public.courses            enable row level security;
alter table public.cohorts            enable row level security;
alter table public.student_cohorts    enable row level security;
alter table public.enrollments        enable row level security;
alter table public.vouchers           enable row level security;
alter table public.voucher_redemptions enable row level security;
alter table public.virtual_sessions   enable row level security;
alter table public.attendance_records enable row level security;
alter table public.session_heartbeats enable row level security;
alter table public.device_locks       enable row level security;
alter table public.lessons            enable row level security;
alter table public.lesson_attachments enable row level security;
alter table public.lesson_progress    enable row level security;
alter table public.exams              enable row level security;
alter table public.exam_questions     enable row level security;
alter table public.exam_attempts      enable row level security;
alter table public.exam_answers       enable row level security;
alter table public.community_posts    enable row level security;
alter table public.community_replies  enable row level security;
alter table public.resources          enable row level security;
alter table public.support_tickets    enable row level security;
alter table public.support_ticket_replies enable row level security;
alter table public.certificates       enable row level security;

-- users
drop policy if exists "users self read" on public.users;
create policy "users self read" on public.users for select
  using (auth.uid() = id or public.is_admin());
drop policy if exists "users self update" on public.users;
create policy "users self update" on public.users for update
  using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "users admin write" on public.users;
create policy "users admin write" on public.users for all
  using (public.is_admin()) with check (public.is_admin());

-- account_requests
drop policy if exists "account_requests anon insert" on public.account_requests;
create policy "account_requests anon insert" on public.account_requests
  for insert with check (status = 'pending');
drop policy if exists "account_requests admin read" on public.account_requests;
create policy "account_requests admin read" on public.account_requests
  for select using (public.is_admin());
drop policy if exists "account_requests admin update" on public.account_requests;
create policy "account_requests admin update" on public.account_requests
  for update using (public.is_admin());

-- brand_settings
drop policy if exists "brand read" on public.brand_settings;
create policy "brand read" on public.brand_settings for select using (true);
drop policy if exists "brand write" on public.brand_settings;
create policy "brand write" on public.brand_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- courses
drop policy if exists "courses read" on public.courses;
create policy "courses read" on public.courses
  for select using (is_active = true or public.is_admin());
drop policy if exists "courses write" on public.courses;
create policy "courses write" on public.courses for all
  using (public.is_admin()) with check (public.is_admin());

-- enrollments
drop policy if exists "enrollments self read" on public.enrollments;
create policy "enrollments self read" on public.enrollments
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "enrollments admin write" on public.enrollments;
create policy "enrollments admin write" on public.enrollments for all
  using (public.is_admin()) with check (public.is_admin());

-- vouchers
drop policy if exists "vouchers read" on public.vouchers;
create policy "vouchers read" on public.vouchers for select using (true);
drop policy if exists "vouchers admin write" on public.vouchers;
create policy "vouchers admin write" on public.vouchers for all
  using (public.is_admin()) with check (public.is_admin());

-- voucher_redemptions
drop policy if exists "voucher_redemptions self read" on public.voucher_redemptions;
create policy "voucher_redemptions self read" on public.voucher_redemptions
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "voucher_redemptions self insert" on public.voucher_redemptions;
create policy "voucher_redemptions self insert" on public.voucher_redemptions
  for insert with check (auth.uid() = user_id);

-- cohorts
drop policy if exists "cohorts read" on public.cohorts;
create policy "cohorts read" on public.cohorts for select using (
  public.is_admin()
  or exists (
    select 1 from public.student_cohorts sc
    where sc.cohort_id = cohorts.id and sc.student_id = auth.uid()
  )
);
drop policy if exists "cohorts write" on public.cohorts;
create policy "cohorts write" on public.cohorts for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "student_cohorts read" on public.student_cohorts;
create policy "student_cohorts read" on public.student_cohorts
  for select using (auth.uid() = student_id or public.is_admin());
drop policy if exists "student_cohorts write" on public.student_cohorts;
create policy "student_cohorts write" on public.student_cohorts for all
  using (public.is_admin()) with check (public.is_admin());

-- virtual_sessions
drop policy if exists "vsessions read" on public.virtual_sessions;
create policy "vsessions read" on public.virtual_sessions for select using (
  public.is_admin()
  or exists (
    select 1 from public.student_cohorts sc
    where sc.cohort_id = virtual_sessions.cohort_id and sc.student_id = auth.uid()
  )
);
drop policy if exists "vsessions write" on public.virtual_sessions;
create policy "vsessions write" on public.virtual_sessions for all
  using (public.is_admin()) with check (public.is_admin());

-- attendance
drop policy if exists "attendance read" on public.attendance_records;
create policy "attendance read" on public.attendance_records
  for select using (auth.uid() = student_id or public.is_admin());
drop policy if exists "attendance write" on public.attendance_records;
create policy "attendance write" on public.attendance_records for all
  using (public.is_admin()) with check (public.is_admin());

-- session_heartbeats
drop policy if exists "heartbeat insert" on public.session_heartbeats;
create policy "heartbeat insert" on public.session_heartbeats
  for insert with check (auth.uid() = user_id);
drop policy if exists "heartbeat read" on public.session_heartbeats;
create policy "heartbeat read" on public.session_heartbeats
  for select using (auth.uid() = user_id or public.is_admin());

-- device_locks
drop policy if exists "device_locks read" on public.device_locks;
create policy "device_locks read" on public.device_locks
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "device_locks insert" on public.device_locks;
create policy "device_locks insert" on public.device_locks
  for insert with check (auth.uid() = user_id);
drop policy if exists "device_locks admin" on public.device_locks;
create policy "device_locks admin" on public.device_locks for all
  using (public.is_admin()) with check (public.is_admin());

-- lessons
drop policy if exists "lessons read" on public.lessons;
create policy "lessons read" on public.lessons for select using (
  public.is_admin()
  or exists (
    select 1 from public.student_cohorts sc
    where sc.cohort_id = lessons.cohort_id and sc.student_id = auth.uid()
  )
);
drop policy if exists "lessons admin write" on public.lessons;
create policy "lessons admin write" on public.lessons for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lesson_attachments read" on public.lesson_attachments;
create policy "lesson_attachments read" on public.lesson_attachments for select using (
  public.is_admin()
  or exists (
    select 1 from public.lessons l
    join public.student_cohorts sc on sc.cohort_id = l.cohort_id
    where l.id = lesson_attachments.lesson_id and sc.student_id = auth.uid()
  )
);
drop policy if exists "lesson_attachments admin write" on public.lesson_attachments;
create policy "lesson_attachments admin write" on public.lesson_attachments for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lesson_progress self read" on public.lesson_progress;
create policy "lesson_progress self read" on public.lesson_progress
  for select using (auth.uid() = student_id or public.is_admin());
drop policy if exists "lesson_progress self write" on public.lesson_progress;
create policy "lesson_progress self write" on public.lesson_progress
  for insert with check (auth.uid() = student_id);
drop policy if exists "lesson_progress self update" on public.lesson_progress;
create policy "lesson_progress self update" on public.lesson_progress
  for update using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- exams
drop policy if exists "exams read" on public.exams;
create policy "exams read" on public.exams for select using (
  public.is_admin()
  or exists (
    select 1 from public.student_cohorts sc
    where sc.cohort_id = exams.cohort_id and sc.student_id = auth.uid()
  )
);
drop policy if exists "exams admin write" on public.exams;
create policy "exams admin write" on public.exams for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "exam_questions read" on public.exam_questions;
create policy "exam_questions read" on public.exam_questions for select using (
  public.is_admin()
  or exists (
    select 1 from public.exams e
    join public.student_cohorts sc on sc.cohort_id = e.cohort_id
    where e.id = exam_questions.exam_id and sc.student_id = auth.uid()
  )
);
drop policy if exists "exam_questions admin write" on public.exam_questions;
create policy "exam_questions admin write" on public.exam_questions for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "exam_attempts self read" on public.exam_attempts;
create policy "exam_attempts self read" on public.exam_attempts
  for select using (auth.uid() = student_id or public.is_admin());
drop policy if exists "exam_attempts self insert" on public.exam_attempts;
create policy "exam_attempts self insert" on public.exam_attempts
  for insert with check (auth.uid() = student_id);
drop policy if exists "exam_attempts self update" on public.exam_attempts;
create policy "exam_attempts self update" on public.exam_attempts
  for update using (auth.uid() = student_id) with check (auth.uid() = student_id);

drop policy if exists "exam_answers self read" on public.exam_answers;
create policy "exam_answers self read" on public.exam_answers for select using (
  public.is_admin()
  or exists (
    select 1 from public.exam_attempts a
    where a.id = exam_answers.attempt_id and (a.student_id = auth.uid() or public.is_admin())
  )
);
drop policy if exists "exam_answers self write" on public.exam_answers;
create policy "exam_answers self write" on public.exam_answers for insert with check (
  exists (
    select 1 from public.exam_attempts a
    where a.id = exam_answers.attempt_id and a.student_id = auth.uid()
  )
);

-- community
drop policy if exists "community_posts read" on public.community_posts;
create policy "community_posts read" on public.community_posts for select using (
  public.is_admin()
  or exists (
    select 1 from public.student_cohorts sc
    where sc.cohort_id = community_posts.cohort_id and sc.student_id = auth.uid()
  )
);
drop policy if exists "community_posts write" on public.community_posts;
create policy "community_posts write" on public.community_posts for insert with check (auth.uid() = author_id);
drop policy if exists "community_posts update" on public.community_posts;
create policy "community_posts update" on public.community_posts
  for update using (auth.uid() = author_id or public.is_admin()) with check (auth.uid() = author_id or public.is_admin());

drop policy if exists "community_replies read" on public.community_replies;
create policy "community_replies read" on public.community_replies for select using (true);
drop policy if exists "community_replies write" on public.community_replies;
create policy "community_replies write" on public.community_replies for insert with check (auth.uid() = author_id);

-- resources
drop policy if exists "resources read" on public.resources;
create policy "resources read" on public.resources for select using (
  public.is_admin()
  or exists (
    select 1 from public.enrollments en
    where en.course_id = resources.course_id and en.user_id = auth.uid()
  )
);
drop policy if exists "resources admin write" on public.resources;
create policy "resources admin write" on public.resources for all
  using (public.is_admin()) with check (public.is_admin());

-- support_tickets
drop policy if exists "tickets self read" on public.support_tickets;
create policy "tickets self read" on public.support_tickets
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "tickets self write" on public.support_tickets;
create policy "tickets self write" on public.support_tickets
  for insert with check (auth.uid() = user_id);
drop policy if exists "tickets admin update" on public.support_tickets;
create policy "tickets admin update" on public.support_tickets
  for update using (public.is_admin());

drop policy if exists "ticket_replies read" on public.support_ticket_replies;
create policy "ticket_replies read" on public.support_ticket_replies for select using (
  public.is_admin()
  or exists (
    select 1 from public.support_tickets t
    where t.id = support_ticket_replies.ticket_id and t.user_id = auth.uid()
  )
);
drop policy if exists "ticket_replies write" on public.support_ticket_replies;
create policy "ticket_replies write" on public.support_ticket_replies for insert with check (auth.uid() = author_id);

-- certificates
drop policy if exists "certificates read" on public.certificates;
create policy "certificates read" on public.certificates for select using (true);
drop policy if exists "certificates admin write" on public.certificates;
create policy "certificates admin write" on public.certificates for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Seed Super Admin (idempotent)
-- ---------------------------------------------------------------------
do $$
declare
  v_uid uuid;
  v_email text := 'mohamed.a.a.fatah2010@gmail.com';
  v_temp  text := 'M@20252026';
begin
  if not exists (select 1 from auth.users where email = v_email) then
    v_uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_uid, 'authenticated', 'authenticated', v_email,
      crypt(v_temp, gen_salt('bf')),
      now(),
      jsonb_build_object('provider','email','providers', array['email']),
      jsonb_build_object('full_name','Super Admin'),
      now(), now(), '', '', '', ''
    );
    insert into public.users (id, email, full_name, role, must_change_password)
    values (v_uid, v_email, 'Super Admin', 'super_admin', true);
  end if;
end $$;
