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
-- the patient's tracker (and vice versa).
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.admissions;
