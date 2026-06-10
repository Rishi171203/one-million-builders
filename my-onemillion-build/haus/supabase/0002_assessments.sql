-- haus — saved assessments (advice history). Run this in the Supabase SQL Editor.

-- 1) One row per saved verdict, owned by the user who created it.
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  market_code text not null,
  inputs jsonb not null,                 -- {income, savings, rent, age, goal}
  status text not null,                  -- 'ready' | 'rent'
  price_min numeric not null,
  price_max numeric not null,
  emi numeric not null,
  verdict text not null,
  created_at timestamptz not null default now()
);

create index if not exists assessments_user_id_idx on public.assessments (user_id, created_at desc);

-- 2) Row-Level Security: each user sees & manages only their own saved advice.
alter table public.assessments enable row level security;

drop policy if exists "read own assessments" on public.assessments;
create policy "read own assessments" on public.assessments
  for select using (auth.uid() = user_id);

drop policy if exists "insert own assessments" on public.assessments;
create policy "insert own assessments" on public.assessments
  for insert with check (auth.uid() = user_id);

drop policy if exists "delete own assessments" on public.assessments;
create policy "delete own assessments" on public.assessments
  for delete using (auth.uid() = user_id);

-- 3) Admin helper: is the current user an admin?
--    SECURITY DEFINER + table-owner means this query bypasses RLS, so it can't
--    recurse on the profiles policies below. (Standard Supabase pattern.)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- 4) Let admins read EVERYTHING (so the Builder dashboard can review all users
--    and all saved advice). These are extra SELECT policies; they sit alongside
--    the "own row" policies and are combined with OR.
drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles
  for select using (public.is_admin());

drop policy if exists "admins read all assessments" on public.assessments;
create policy "admins read all assessments" on public.assessments
  for select using (public.is_admin());
