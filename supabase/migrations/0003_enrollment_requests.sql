-- =====================================================================
-- 0003 — enrollment_requests (rename from account_requests + extend)
-- Spec §5/§6/§73: required fields, status values, anti-spam unique.
-- Idempotent.
-- =====================================================================

do $$ begin
  alter type request_status add value if not exists 'contacted';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type request_status add value if not exists 'converted';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type request_status add value if not exists 'enrolled';
exception when duplicate_object then null; end $$;

-- Rename table if it exists with the old name; otherwise leave new table alone.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'account_requests'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'enrollment_requests'
  ) then
    alter table public.account_requests rename to enrollment_requests;
  end if;
end $$;

alter table public.enrollment_requests
  add column if not exists whatsapp text,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_enrollment_requests_updated on public.enrollment_requests;
create trigger trg_enrollment_requests_updated
  before update on public.enrollment_requests
  for each row execute function public.set_updated_at();

-- Anti-spam: only one PENDING request per email at a time.
create unique index if not exists idx_enrollment_requests_pending_email
  on public.enrollment_requests (lower(email))
  where status = 'pending';

-- Updated RLS: keep public INSERT but restrict shape; deny public SELECT.
drop policy if exists "account_requests anon insert" on public.enrollment_requests;
drop policy if exists "enrollment_requests anon insert" on public.enrollment_requests;
create policy "enrollment_requests anon insert" on public.enrollment_requests
  for insert with check (
    status = 'pending'
    and length(full_name) between 2 and 200
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and (phone is null or phone ~ '^[+0-9 ()-]{6,30}$')
    and (whatsapp is null or whatsapp ~ '^[+0-9 ()-]{6,30}$')
    and (notes is null or length(notes) <= 1000)
  );

drop policy if exists "account_requests admin read" on public.enrollment_requests;
drop policy if exists "enrollment_requests admin read" on public.enrollment_requests;
create policy "enrollment_requests admin read" on public.enrollment_requests
  for select using (public.is_admin());

drop policy if exists "account_requests admin update" on public.enrollment_requests;
drop policy if exists "enrollment_requests admin update" on public.enrollment_requests;
create policy "enrollment_requests admin update" on public.enrollment_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- Drop the public-by-default service-role bypass: revoke from anon for SELECT/UPDATE.
revoke all on public.enrollment_requests from anon;
grant insert on public.enrollment_requests to anon;
grant select, update on public.enrollment_requests to authenticated;