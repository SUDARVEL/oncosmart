-- Allow "Any other" on Why did you stop? The typed words stay in quit_reason_note.

alter table public.patients drop constraint if exists patients_quit_reason_check;

alter table public.patients add constraint patients_quit_reason_check check (
  quit_reason is null
  or quit_reason = any (
    array['tired'::text, 'pain'::text, 'exploring'::text, 'treatment'::text, 'unwell'::text, 'other'::text]
  )
);
