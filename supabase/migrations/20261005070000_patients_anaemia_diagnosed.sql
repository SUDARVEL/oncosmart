-- Anaemia answer collected on the cancer-pathway onboarding screen.

alter table public.patients
  add column if not exists anaemia_diagnosed boolean;
