-- Remove accidental duplicate emit trigger left from an earlier apply.
drop trigger if exists patients_emit_hold_alert_trg on public.patients;

drop trigger if exists patients_emit_hold_alert on public.patients;
create trigger patients_emit_hold_alert
  after insert or update of
    progress_paused,
    progress_hold_type,
    pause_reason,
    quit_reason,
    name
  on public.patients
  for each row
  execute function public.patients_emit_hold_alert();
