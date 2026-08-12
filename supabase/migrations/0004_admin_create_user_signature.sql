-- =====================================================================
-- 0004 — admin_create_user: bring RPC signature in line with the spec
-- Spec §8/§72: server-side trusted function for organizer-created
-- accounts. We normalize the parameter set and ensure the call is
-- idempotent (rejects existing email) and always sets
-- must_change_password = true.
-- Idempotent — safe to re-run.
-- =====================================================================

create or replace function public.admin_create_user(
  p_email         text,
  p_full_name     text,
  p_phone         text,
  p_role          user_role,
  p_temp_password text
) returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_email   text := lower(trim(p_email));
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  if v_email is null or v_email = '' then
    raise exception 'email_required';
  end if;

  if length(p_temp_password) < 8 then
    raise exception 'temp_password_too_short';
  end if;

  if exists (select 1 from auth.users where email = v_email) then
    raise exception 'email_already_exists';
  end if;

  v_user_id := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated', v_email,
    crypt(p_temp_password, gen_salt('bf')),
    now(),
    jsonb_build_object('provider','email','providers', array['email']),
    jsonb_build_object('full_name', p_full_name, 'phone', p_phone),
    now(), now(), '', '', '', ''
  );

  insert into public.users (id, email, full_name, phone, role, must_change_password)
  values (v_user_id, v_email, p_full_name, p_phone, p_role, true);

  return v_user_id;
end $$;

grant execute on function public.admin_create_user(text,text,text,user_role,text) to authenticated;