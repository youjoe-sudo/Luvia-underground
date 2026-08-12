-- =====================================================================
-- Migration 0002 — staff (instructor / coordinator) RLS and helpers
--
-- Builds on top of 0001_init.sql. Idempotent — safe to re-run.
--
-- Adds three SECURITY DEFINER helpers used by RLS policies and by the
-- new instructor / coordinator dashboards in app/instructor and
-- app/coordinator:
--
--   public.is_cohort_staff(p_cohort uuid)  — true when caller is the
--       cohort's instructor or coordinator.
--   public.is_cohort_instructor(p_cohort)  — true only for instructor.
--   public.my_staff_cohorts()              — table of cohorts the
--       caller is staff on, with the staff role per row.
--
-- Then rewrites every cohort-scoped SELECT / UPDATE policy so that
-- instructor/coordinator of a cohort can read or update the data
-- scoped to that cohort. Coordinator gets read-only; instructor can
-- also write virtual_sessions (toggle is_link_active / attendance
-- confirmation) and attendance_records (mark final_status), plus
-- lessons and lesson_attachments (CRUD on their cohort content).
--
-- Admin powers are preserved unchanged.
-- Student-facing SELECTs still work — we only added OR branches.
-- INSERTs remain admin-only by design (creating lessons / sessions /
-- exams stays with admins).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) helpers
-- ---------------------------------------------------------------------
create or replace function public.is_cohort_staff(p_cohort uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cohorts c
    where c.id = p_cohort
      and (c.instructor_id = auth.uid() or c.coordinator_id = auth.uid())
  );
$$;

create or replace function public.is_cohort_instructor(p_cohort uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cohorts c
    where c.id = p_cohort
      and c.instructor_id = auth.uid()
      and exists (
        select 1 from public.users u
        where u.id = auth.uid()
          and u.role = 'instructor'
          and u.is_banned = false
      )
  );
$$;

create or replace function public.my_staff_cohorts()
returns table(id uuid, course_id uuid, group_name text, role text)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.course_id, c.group_name,
         case
           when c.instructor_id  = auth.uid() then 'instructor'
           when c.coordinator_id = auth.uid() then 'coordinator'
           else null
         end as role
  from public.cohorts c
  where c.instructor_id = auth.uid()
     or c.coordinator_id = auth.uid();
$$;

grant execute on function public.is_cohort_staff(uuid)      to authenticated;
grant execute on function public.is_cohort_instructor(uuid) to authenticated;
grant execute on function public.my_staff_cohorts()         to authenticated;

-- ---------------------------------------------------------------------
-- 2) revised RLS policies
-- ---------------------------------------------------------------------

-- cohorts: staff can read their assigned cohort row
drop policy if exists "cohorts read" on public.cohorts;
create policy "cohorts read" on public.cohorts for select using (
  public.is_admin()
  or exists (
    select 1 from public.student_cohorts sc
    where sc.cohort_id = cohorts.id and sc.student_id = auth.uid()
  )
  or public.is_cohort_staff(cohorts.id)
);

-- student_cohorts: staff can list students of their cohort
drop policy if exists "student_cohorts read" on public.student_cohorts;
create policy "student_cohorts read" on public.student_cohorts for select using (
  auth.uid() = student_id
  or public.is_admin()
  or public.is_cohort_staff(student_cohorts.cohort_id)
);

-- virtual_sessions: staff read, instructor update (toggle link/attendance)
drop policy if exists "vsessions read" on public.virtual_sessions;
create policy "vsessions read" on public.virtual_sessions for select using (
  public.is_admin()
  or exists (
    select 1 from public.student_cohorts sc
    where sc.cohort_id = virtual_sessions.cohort_id and sc.student_id = auth.uid()
  )
  or public.is_cohort_staff(virtual_sessions.cohort_id)
);

drop policy if exists "vsessions write" on public.virtual_sessions;
create policy "vsessions write" on public.virtual_sessions for update
  using  (public.is_admin() or public.is_cohort_instructor(virtual_sessions.cohort_id))
  with check (public.is_admin() or public.is_cohort_instructor(virtual_sessions.cohort_id));

-- attendance_records: staff read, instructor update (mark attendance)
drop policy if exists "attendance read" on public.attendance_records;
create policy "attendance read" on public.attendance_records for select using (
  auth.uid() = student_id
  or public.is_admin()
  or exists (
    select 1 from public.virtual_sessions s
    where s.id = attendance_records.session_id
      and public.is_cohort_staff(s.cohort_id)
  )
);

drop policy if exists "attendance write" on public.attendance_records;
create policy "attendance write" on public.attendance_records for update
  using (
    public.is_admin()
    or exists (
      select 1 from public.virtual_sessions s
      where s.id = attendance_records.session_id
        and public.is_cohort_instructor(s.cohort_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.virtual_sessions s
      where s.id = attendance_records.session_id
        and public.is_cohort_instructor(s.cohort_id)
    )
  );

-- lessons: staff read, instructor write
drop policy if exists "lessons read" on public.lessons;
create policy "lessons read" on public.lessons for select using (
  public.is_admin()
  or exists (
    select 1 from public.student_cohorts sc
    where sc.cohort_id = lessons.cohort_id and sc.student_id = auth.uid()
  )
  or public.is_cohort_staff(lessons.cohort_id)
);

drop policy if exists "lessons admin write" on public.lessons;
create policy "lessons admin write" on public.lessons for all
  using  (public.is_admin() or public.is_cohort_instructor(lessons.cohort_id))
  with check (public.is_admin() or public.is_cohort_instructor(lessons.cohort_id));

-- lesson_attachments: staff read, instructor write
drop policy if exists "lesson_attachments read" on public.lesson_attachments;
create policy "lesson_attachments read" on public.lesson_attachments for select using (
  public.is_admin()
  or exists (
    select 1 from public.lessons l
    join public.student_cohorts sc on sc.cohort_id = l.cohort_id
    where l.id = lesson_attachments.lesson_id and sc.student_id = auth.uid()
  )
  or exists (
    select 1 from public.lessons l
    where l.id = lesson_attachments.lesson_id
      and public.is_cohort_staff(l.cohort_id)
  )
);

drop policy if exists "lesson_attachments admin write" on public.lesson_attachments;
create policy "lesson_attachments admin write" on public.lesson_attachments for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.lessons l
      where l.id = lesson_attachments.lesson_id
        and public.is_cohort_instructor(l.cohort_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.lessons l
      where l.id = lesson_attachments.lesson_id
        and public.is_cohort_instructor(l.cohort_id)
    )
  );

-- lesson_progress: staff read progress for their cohort
drop policy if exists "lesson_progress self read" on public.lesson_progress;
create policy "lesson_progress self read" on public.lesson_progress for select using (
  auth.uid() = student_id
  or public.is_admin()
  or exists (
    select 1 from public.lessons l
    where l.id = lesson_progress.lesson_id
      and public.is_cohort_staff(l.cohort_id)
  )
);

-- exams: staff read
drop policy if exists "exams read" on public.exams;
create policy "exams read" on public.exams for select using (
  public.is_admin()
  or exists (
    select 1 from public.student_cohorts sc
    where sc.cohort_id = exams.cohort_id and sc.student_id = auth.uid()
  )
  or public.is_cohort_staff(exams.cohort_id)
);

-- exam_questions: staff read
drop policy if exists "exam_questions read" on public.exam_questions;
create policy "exam_questions read" on public.exam_questions for select using (
  public.is_admin()
  or exists (
    select 1 from public.exams e
    join public.student_cohorts sc on sc.cohort_id = e.cohort_id
    where e.id = exam_questions.exam_id and sc.student_id = auth.uid()
  )
  or exists (
    select 1 from public.exams e
    where e.id = exam_questions.exam_id
      and public.is_cohort_staff(e.cohort_id)
  )
);

-- exam_attempts: staff read attempts for their cohort
drop policy if exists "exam_attempts self read" on public.exam_attempts;
create policy "exam_attempts self read" on public.exam_attempts for select using (
  auth.uid() = student_id
  or public.is_admin()
  or exists (
    select 1 from public.exams e
    where e.id = exam_attempts.exam_id
      and public.is_cohort_staff(e.cohort_id)
  )
);

-- community_posts: staff read
drop policy if exists "community_posts read" on public.community_posts;
create policy "community_posts read" on public.community_posts for select using (
  public.is_admin()
  or exists (
    select 1 from public.student_cohorts sc
    where sc.cohort_id = community_posts.cohort_id and sc.student_id = auth.uid()
  )
  or public.is_cohort_staff(community_posts.cohort_id)
);