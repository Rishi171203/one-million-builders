-- haus — profiles + roles (RBAC). Run this in the Supabase SQL Editor.

-- 1) Profiles table (one row per user), linked to the auth user.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'buyer' check (role in ('buyer','owner','admin')),
  display_name text,
  country text,
  created_at timestamptz default now()
);

-- 2) Row-Level Security: a user can see/change only their own profile.
alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 3) Auto-create a profile when someone signs up, using the role they chose.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'buyer'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Backfill profiles for any accounts created before this trigger existed.
insert into public.profiles (id, role)
select id, 'buyer' from auth.users
on conflict (id) do nothing;

-- 5) (Run separately, after YOU register) make your own account the builder/admin:
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
