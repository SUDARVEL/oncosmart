-- Return the typed pause note and each session's after-session feedback to admin.

drop function if exists public.admin_list_patient_progress();

create or replace function public.admin_list_patient_progress()
returns table(
  user_id uuid,
  account_email text,
  account_username text,
  patient_id uuid,
  display_name text,
  language text,
  gender text,
  age integer,
  cancer_type text,
  treatment_undergoing text,
  underwent_surgery boolean,
  onboarding_complete boolean,
  progress_paused boolean,
  progress_hold_type text,
  pause_reason text,
  pause_reason_note text,
  quit_reason text,
  paused_at timestamptz,
  quit_at timestamptz,
  levels_completed integer,
  day_completed_at jsonb,
  pain_scores jsonb,
  session_details jsonb,
  sessions_completed integer,
  password_changed boolean,
  password_changed_at timestamptz,
  last_sign_in_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    u.id as user_id,
    u.email::text as account_email,
    split_part(coalesce(u.email, ''), '@', 1) as account_username,
    p.id as patient_id,
    coalesce(nullif(trim(p.name), ''), split_part(coalesce(u.email, ''), '@', 1)) as display_name,
    p.language,
    p.gender,
    p.age,
    coalesce(p.cancer_type, '') as cancer_type,
    p.treatment_undergoing,
    p.underwent_surgery,
    coalesce(p.onboarding_complete, false) as onboarding_complete,
    coalesce(p.progress_paused, false) as progress_paused,
    p.progress_hold_type,
    p.pause_reason,
    p.pause_reason_note,
    p.quit_reason,
    p.paused_at,
    p.quit_at,
    coalesce(p.levels_completed, 0) as levels_completed,
    coalesce(p.day_completed_at, '{}'::jsonb) as day_completed_at,
    coalesce(p.pain_scores, '{}'::jsonb) as pain_scores,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'session_key', ec.session_key,
            'level', ec.level,
            'day_in_level', ec.day_in_level,
            'completed_at', ec.completed_at,
            'pain_score', ec.pain_score,
            'start_bpm', ec.start_bpm,
            'end_bpm', ec.end_bpm,
            'session_feedback', ec.session_feedback
          )
          order by ec.level, ec.day_in_level
        )
        from public.exercise_completions ec
        where ec.patient_id = p.id
      ),
      '[]'::jsonb
    ) as session_details,
    coalesce(
      (
        select count(*)::integer
        from jsonb_object_keys(coalesce(p.day_completed_at, '{}'::jsonb))
      ),
      0
    ) as sessions_completed,
    (p.password_changed_at is not null) as password_changed,
    p.password_changed_at,
    u.last_sign_in_at,
    p.updated_at,
    coalesce(p.created_at, u.created_at) as created_at
  from auth.users u
  left join public.patients p on p.user_id = u.id
  where coalesce(u.raw_app_meta_data ->> 'role', '') is distinct from 'admin'
  order by account_username asc nulls last;
end;
$$;

grant execute on function public.admin_list_patient_progress() to authenticated;
