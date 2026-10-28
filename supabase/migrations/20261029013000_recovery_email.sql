-- Real inbox used only for password-reset codes. Login stays username@oncosmart.app.
alter table public.patients
  add column if not exists recovery_email text;

-- Clients can read their own recovery email through patients RLS.
-- They cannot change it; only the password-recovery function (service role) can.
create or replace function public.keep_recovery_email_verified()
returns trigger
language plpgsql
as $$
begin
  if new.recovery_email is distinct from old.recovery_email
     and coalesce(auth.role(), '') <> 'service_role' then
    new.recovery_email := old.recovery_email;
  end if;
  return new;
end;
$$;

drop trigger if exists patients_keep_recovery_email on public.patients;
create trigger patients_keep_recovery_email
  before update on public.patients
  for each row
  execute function public.keep_recovery_email_verified();

create table if not exists public.password_reset_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('bind', 'reset')),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.password_reset_codes enable row level security;
revoke all on table public.password_reset_codes from public, anon, authenticated;
grant select, insert, update, delete on table public.password_reset_codes to service_role;

-- SMTP password lives here, not in the app. No client policy, so patients cannot read it.
create table if not exists public.mailer_settings (
  id integer primary key check (id = 1),
  smtp_login text not null,
  smtp_secret text not null,
  sender_email text not null,
  sender_name text not null
);

alter table public.mailer_settings enable row level security;
revoke all on table public.mailer_settings from public, anon, authenticated;
grant select on table public.mailer_settings to service_role;

-- Hosted project does not give service_role table DML on patients by default.
grant select, insert, update, delete on table public.patients to service_role;
