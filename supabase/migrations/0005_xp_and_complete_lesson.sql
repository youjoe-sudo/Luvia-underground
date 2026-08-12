-- =====================================================================
-- 0005 — XP, streaks, lesson XP rewards, complete_lesson RPC
-- Spec §20-22/§86-87. Idempotent.
--
-- Adds:
--   - lessons.xp_reward integer default 100
--   - users.xp_total integer default 0
--   - users.last_activity_date date
--   - public.complete_lesson(p_lesson_id) — server-authoritative,
--     idempotent (no double-XP), updates XP only on first completion.
-- =====================================================================

alter table public.lessons
  add column if not exists xp_reward integer not null default 100;

alter table public.lessons
  add column if not exists description_ar text;

alter table public.users
  add column if not exists xp_total integer not null default 0;

alter table public.users
  add column if not exists last_activity_date date;

-- Optional: a per-day activity log table for future streak history
-- (spec §22 — "architecture should not prevent future daily activity tracking").
create table if not exists public.learning_activity (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  activity_date date not null default current_date,
  activity_type text not null default 'lesson_complete',
  created_at    timestamptz not null default now(),
  unique (user_id, activity_date, activity_type)
);
create index if not exists idx_learning_activity_user_date
  on public.learning_activity (user_id, activity_date desc);

alter table public.learning_activity enable row level security;

drop policy if exists "learning_activity self read" on public.learning_activity;
create policy "learning_activity self read" on public.learning_activity
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "learning_activity self insert" on public.learning_activity;
create policy "learning_activity self insert" on public.learning_activity
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- complete_lesson: server-authoritative lesson completion.
-- Returns the new xp_total, or null if the lesson was already completed.
-- ---------------------------------------------------------------------------
create or replace function public.complete_lesson(p_lesson_id uuid)
returns table(xp_awarded integer, xp_total integer, already_completed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid          uuid := auth.uid();
  v_xp_reward    integer;
  v_existing_id  uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  -- The caller must be enrolled in the cohort that owns this lesson.
  if not exists (
    select 1
    from public.lessons l
    join public.student_cohorts sc on sc.cohort_id = l.cohort_id
    where l.id = p_lesson_id and sc.student_id = v_uid
  ) then
    raise exception 'not_enrolled';
  end if;

  -- Idempotency: if a row already exists, no-op.
  select id into v_existing_id
  from public.lesson_progress
  where student_id = v_uid and lesson_id = p_lesson_id;
  if v_existing_id is not null then
    return query select 0, (select xp_total from public.users where id = v_uid), true;
    return;
  end if;

  select coalesce(xp_reward, 100) into v_xp_reward
  from public.lessons where id = p_lesson_id;

  insert into public.lesson_progress (student_id, lesson_id)
  values (v_uid, p_lesson_id);

  update public.users
    set xp_total = xp_total + v_xp_reward,
        last_activity_date = current_date
    where id = v_uid;

  insert into public.learning_activity (user_id, activity_type)
  values (v_uid, 'lesson_complete')
  on conflict do nothing;

  return query
    select v_xp_reward,
           (select xp_total from public.users where id = v_uid),
           false;
end $$;

grant execute on function public.complete_lesson(uuid) to authenticated;