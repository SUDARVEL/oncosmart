-- Mobile number used for phone OTP login and forgot-password texts.
alter table public.patients
  add column if not exists phone text;

create unique index if not exists patients_phone_unique
  on public.patients (phone)
  where phone is not null;
