-- Rawat Lawat - Supabase schema
-- Run this in the Supabase dashboard: SQL Editor > New query > paste > Run.
--
-- Design: each table stores the full record as a `data` jsonb column so the
-- app's existing TypeScript shapes (PatientProfile, AdmissionRecord) map 1:1.
-- A few flat columns are duplicated out of `data` for filtering and access
-- rules (patient_email, status, hospital_name).

-- ---------------------------------------------------------------------------
-- Patient profiles: one row per patient, saved once after the ID/policy scan.
-- ---------------------------------------------------------------------------
create table if not exists public.patient_profiles (
  patient_email text primary key,
  data          jsonb not null,          -- { identity, policy }
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admissions: the shared workflow record every role reads and updates.
-- ---------------------------------------------------------------------------
create table if not exists public.admissions (
  id            text primary key,
  patient_email text,
  hospital_name text,
  status        text,
  data          jsonb not null,          -- full AdmissionRecord
  created_at    timestamptz not null default now()
);

create index if not exists admissions_patient_email_idx
  on public.admissions (patient_email);
create index if not exists admissions_hospital_name_idx
  on public.admissions (hospital_name);

-- ---------------------------------------------------------------------------
-- Row-level security.
-- NOTE: login is still mocked (no Supabase Auth yet), so the browser uses the
-- anon role. These permissive policies let the demo read/write freely. When
-- real Supabase Auth is added, replace them with per-role, per-owner rules.
-- ---------------------------------------------------------------------------
alter table public.patient_profiles enable row level security;
alter table public.admissions enable row level security;

drop policy if exists "demo full access" on public.patient_profiles;
create policy "demo full access" on public.patient_profiles
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "demo full access" on public.admissions;
create policy "demo full access" on public.admissions
  for all to anon, authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Realtime: broadcast admission changes so an admin approval shows up live on
-- the patient's tracker (and vice versa). Idempotent so re-running is safe.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'admissions'
  ) then
    alter publication supabase_realtime add table public.admissions;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Auth: user profiles and roles (Supabase Auth).
-- Each auth user gets a profile row (created automatically on sign-up) with a
-- display name and role. Patients default to 'user'; staff roles are set
-- manually (see the snippet at the very bottom).
-- ---------------------------------------------------------------------------
do $$
begin
  create type public.user_role as enum ('user', 'doctor', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  name       text,
  role       public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Any signed-in user can read profiles (role is not secret in this demo).
drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated" on public.profiles
  for select to authenticated using (true);

-- A user may update their own profile (e.g. display name).
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Create a profile automatically whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- After creating the demo accounts (Authentication > Users), set staff roles:
--   update public.profiles set role = 'doctor' where email = 'doctor@hospital.com';
--   update public.profiles set role = 'admin'  where email = 'admin@hospital.com';
-- (patient@example.com stays 'user' by default.)
-- ---------------------------------------------------------------------------
