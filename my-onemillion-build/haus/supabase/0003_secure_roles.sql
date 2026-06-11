-- haus — SECURITY FIX (Day 9 review): stop users from making themselves admin.
-- Run this in the Supabase SQL Editor.
--
-- Background: a user's `role` (buyer/owner/admin) was self-assignable two ways:
--   (1) at signup, the role came from browser-supplied metadata — someone could
--       send role:'admin' directly to the signup API;
--   (2) after login, nothing stopped a user from UPDATE-ing their own profile's
--       role to 'admin'.
-- Either gave a normal user the Builder dashboard = read access to every user's
-- saved financial data. This migration closes both. Admin is now grantable ONLY
-- by you, via SQL (where there is no logged-in user / auth.uid() is null).

-- 1) Signup: clamp the self-chosen role to buyer/owner. 'admin' (or anything
--    unexpected) in the signup metadata is ignored and becomes 'buyer'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested text := new.raw_user_meta_data->>'role';
begin
  insert into public.profiles (id, role)
  values (new.id, case when requested = 'owner' then 'owner' else 'buyer' end)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2) After signup: a logged-in user may edit their own profile, but may NOT
--    change their role. A BEFORE UPDATE trigger keeps the role unchanged unless
--    the change is made by an existing admin or by a non-user context
--    (auth.uid() is null = your SQL editor / service role), so YOU can still
--    promote accounts manually.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is not null and not public.is_admin() then
      new.role := old.role;  -- ignore the attempted role change
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- 3) Safety net: if any account already self-assigned admin before this fix,
--    review them. (Uncomment to see who is admin.)
-- select p.id, u.email, p.role
-- from public.profiles p join auth.users u on u.id = p.id
-- where p.role = 'admin';
--
-- To demote a wrongly-admin account back to buyer (replace the email):
-- update public.profiles set role = 'buyer'
-- where id = (select id from auth.users where email = 'WRONG_ADMIN_EMAIL_HERE');
