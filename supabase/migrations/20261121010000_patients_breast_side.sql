-- Which breast is affected, asked on the treatment onboarding screen for breast cancer.

alter table public.patients
  add column if not exists breast_side text;

alter table public.patients
  drop constraint if exists patients_breast_side_check;

alter table public.patients
  add constraint patients_breast_side_check
  check (breast_side is null or breast_side in ('left', 'right', 'both'));
