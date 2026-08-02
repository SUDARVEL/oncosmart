-- ONCOSMART Supabase schema — per-user cloud profile + progress
-- Applied remotely via migrations; kept here as source of truth for the app.

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text not null default '',
  language text check (language in ('en', 'ta')),
  gender text,
  avatar text,
  age integer,
  age_range text,
  cancer_type text not null default '',
  treatment_undergoing text,
  underwent_surgery boolean,
  parq_answers jsonb not null default '[]'::jsonb,
  parq_cleared boolean default false,
  progress_paused boolean not null default false,
  pain_scores jsonb not null default '{}'::jsonb,
  day_completed_at jsonb not null default '{}'::jsonb,
  levels_completed integer not null default 0,
  onboarding_complete boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

create table if not exists exercise_completions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  day int not null check (day > 0),
  level int default 1,
  day_in_level int default 1,
  session_key text,
  exercise_id text,
  pain_score int,
  completed_at timestamptz default now(),
  unique (patient_id, session_key)
);

alter table patients enable row level security;
alter table exercise_completions enable row level security;

-- Patients: own rows only
-- create policy patients_select_own on patients for select using (auth.uid() = user_id);
-- create policy patients_insert_own on patients for insert with check (auth.uid() = user_id);
-- create policy patients_update_own on patients for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Completions: via owning patient
-- create policy completions_* ... (see live project policies)
