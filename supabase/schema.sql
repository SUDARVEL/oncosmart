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
  progress_hold_type text check (
    progress_hold_type is null
    or progress_hold_type = any (array['pause'::text, 'quit'::text])
  ),
  pause_reason text check (
    pause_reason is null
    or pause_reason = any (array['tired'::text, 'pain'::text, 'treatment'::text, 'unwell'::text])
  ),
  quit_reason text check (
    quit_reason is null
    or quit_reason = any (array['tired'::text, 'pain'::text, 'exploring'::text, 'treatment'::text, 'unwell'::text])
  ),
  paused_at timestamptz,
  quit_at timestamptz,
  pain_scores jsonb not null default '{}'::jsonb,
  day_completed_at jsonb not null default '{}'::jsonb,
  levels_completed integer not null default 0,
  onboarding_complete boolean not null default false,
  coach_tour_seen boolean not null default false,
  expo_push_token text,
  password_changed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_update_broadcasts (
  update_id text primary key,
  sent_at timestamptz not null default now(),
  recipient_count integer not null default 0
);

-- Admin devices that receive pause/quit alerts
create table if not exists admin_push_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expo_push_token text not null,
  updated_at timestamptz not null default now()
);

-- Durable pause/quit alerts for the admin dashboard + realtime local notify
create table if not exists admin_hold_alerts (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid references auth.users(id) on delete set null,
  patient_name text not null default '',
  patient_username text not null default '',
  hold_type text not null check (hold_type = any (array['pause'::text, 'quit'::text])),
  reason text,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
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
  start_bpm int,
  end_bpm int,
  completed_at timestamptz default now(),
  unique (patient_id, session_key)
);

alter table patients enable row level security;
alter table exercise_completions enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on table public.patients to authenticated;
grant select, insert, update on table public.exercise_completions to authenticated;

-- Patients: own rows only (+ admin select-all via is_admin())
-- Completions: via owning patient (+ admin select-all)
-- Admin RPC: public.admin_list_patient_progress() (security definer, admin JWT only)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;
