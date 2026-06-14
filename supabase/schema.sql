-- ONCOSMART Supabase schema (optional — for progress sync later)
-- Run in Supabase → SQL Editor when you add patient login.

-- Patient profile linked to Supabase Auth
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default '',
  language text check (language in ('en', 'ta')),
  gender text,
  avatar text,
  age_range text,
  parq_cleared boolean default false,
  created_at timestamptz default now()
);

-- Which exercise days the patient completed
create table if not exists exercise_completions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  day int not null check (day > 0),
  exercise_id text,
  completed_at timestamptz default now(),
  unique (patient_id, day)
);

-- Row Level Security (enable after testing)
-- alter table patients enable row level security;
-- alter table exercise_completions enable row level security;
