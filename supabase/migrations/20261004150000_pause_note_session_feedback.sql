-- Pause reason "any other" note + post-session feedback.

alter table public.patients
  add column if not exists pause_reason_note text;

alter table public.patients drop constraint if exists patients_pause_reason_check;
alter table public.patients add constraint patients_pause_reason_check check (
  pause_reason is null
  or pause_reason = any (array['tired'::text, 'pain'::text, 'treatment'::text, 'unwell'::text, 'other'::text])
);

alter table public.exercise_completions
  add column if not exists session_feedback text;

alter table public.exercise_completions drop constraint if exists exercise_completions_session_feedback_check;
alter table public.exercise_completions add constraint exercise_completions_session_feedback_check check (
  session_feedback is null
  or session_feedback = any (array['easy'::text, 'hard'::text, 'tired'::text])
);

-- Applied remotely as pause_note_and_session_feedback.
-- Hold alerts include the free-text note, and the admin list returns it.
