-- Session BPM + admin cancer/treatment fields + decouple quit from progress pause.

alter table public.exercise_completions
  add column if not exists start_bpm integer,
  add column if not exists end_bpm integer;

create or replace function public.patients_emit_hold_alert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_hold_type text;
  v_reason text;
  v_title text;
  v_body text;
  v_reason_label text;
  v_action text;
  v_emit_pause boolean := false;
  v_emit_quit boolean := false;
begin
  v_emit_pause :=
    coalesce(new.progress_paused, false)
    and coalesce(new.progress_hold_type, '') = 'pause'
    and (
      tg_op = 'INSERT'
      or coalesce(old.progress_paused, false) is distinct from coalesce(new.progress_paused, false)
      or coalesce(old.progress_hold_type, '') is distinct from coalesce(new.progress_hold_type, '')
      or coalesce(old.pause_reason, '') is distinct from coalesce(new.pause_reason, '')
    );

  v_emit_quit :=
    coalesce(new.quit_reason, '') <> ''
    and (
      tg_op = 'INSERT'
      or coalesce(old.quit_reason, '') is distinct from coalesce(new.quit_reason, '')
    );

  if not v_emit_pause and not v_emit_quit then
    return new;
  end if;

  v_name := nullif(trim(coalesce(new.name, '')), '');
  if v_name is null then
    v_name := 'Patient';
  end if;

  if v_emit_quit then
    v_hold_type := 'quit';
    v_reason := nullif(trim(coalesce(new.quit_reason, '')), '');
  else
    v_hold_type := 'pause';
    v_reason := nullif(trim(coalesce(new.pause_reason, '')), '');
  end if;

  v_reason_label := case v_reason
    when 'tired' then 'Feeling tired'
    when 'pain' then 'Having pain'
    when 'treatment' then 'Recently underwent treatment'
    when 'unwell' then 'Not feeling well'
    when 'exploring' then 'Just exploring'
    else coalesce(v_reason, 'No reason given')
  end;

  v_action := case when v_hold_type = 'quit' then 'quit' else 'paused' end;
  v_title := case
    when v_hold_type = 'quit' then 'Patient quit exercise'
    else 'Patient paused exercise'
  end;
  v_body := v_name || ' (' || v_name || ') has ' || v_action || '. Reason: ' || v_reason_label || '.';

  insert into public.admin_hold_alerts (
    patient_user_id,
    patient_name,
    patient_username,
    hold_type,
    reason,
    title,
    body,
    created_at
  ) values (
    new.user_id,
    v_name,
    v_name,
    v_hold_type,
    v_reason,
    v_title,
    v_body,
    coalesce(
      case when v_hold_type = 'quit' then new.quit_at else new.paused_at end,
      now()
    )
  );

  return new;
end;
$$;

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
            'end_bpm', ec.end_bpm
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
