-- Reliable admin pause/quit alerts:
-- Create admin_hold_alerts whenever a patient row becomes paused/quit.
-- (Client insert + edge push remain best-effort; this is the source of truth.)

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
begin
  if not (
    coalesce(new.progress_paused, false)
    and coalesce(new.progress_hold_type, '') in ('pause', 'quit')
  ) then
    return new;
  end if;

  -- Emit only when hold status / type / reason changes (ignore paused_at/quit_at stamps).
  if tg_op = 'UPDATE'
     and coalesce(old.progress_paused, false) = coalesce(new.progress_paused, false)
     and coalesce(old.progress_hold_type, '') = coalesce(new.progress_hold_type, '')
     and coalesce(old.pause_reason, '') = coalesce(new.pause_reason, '')
     and coalesce(old.quit_reason, '') = coalesce(new.quit_reason, '')
  then
    return new;
  end if;

  v_name := nullif(trim(coalesce(new.name, '')), '');
  if v_name is null then
    v_name := 'Patient';
  end if;

  v_hold_type := new.progress_hold_type;
  v_reason := case
    when v_hold_type = 'quit' then nullif(trim(coalesce(new.quit_reason, '')), '')
    else nullif(trim(coalesce(new.pause_reason, '')), '')
  end;

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

-- Ensure only one emit trigger exists (an older trg name may already be present).
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

-- Backfill one unread alert for currently paused/quit patients.
insert into public.admin_hold_alerts (
  patient_user_id,
  patient_name,
  patient_username,
  hold_type,
  reason,
  title,
  body,
  created_at
)
select
  p.user_id,
  coalesce(nullif(trim(p.name), ''), 'Patient'),
  coalesce(nullif(trim(p.name), ''), 'Patient'),
  p.progress_hold_type,
  case
    when p.progress_hold_type = 'quit' then p.quit_reason
    else p.pause_reason
  end,
  case
    when p.progress_hold_type = 'quit' then 'Patient quit exercise'
    else 'Patient paused exercise'
  end,
  coalesce(nullif(trim(p.name), ''), 'Patient')
    || ' ('
    || coalesce(nullif(trim(p.name), ''), 'Patient')
    || ') has '
    || case when p.progress_hold_type = 'quit' then 'quit' else 'paused' end
    || '. Reason: '
    || case
      when coalesce(
        case when p.progress_hold_type = 'quit' then p.quit_reason else p.pause_reason end,
        ''
      ) = 'tired' then 'Feeling tired'
      when coalesce(
        case when p.progress_hold_type = 'quit' then p.quit_reason else p.pause_reason end,
        ''
      ) = 'pain' then 'Having pain'
      when coalesce(
        case when p.progress_hold_type = 'quit' then p.quit_reason else p.pause_reason end,
        ''
      ) = 'treatment' then 'Recently underwent treatment'
      when coalesce(
        case when p.progress_hold_type = 'quit' then p.quit_reason else p.pause_reason end,
        ''
      ) = 'unwell' then 'Not feeling well'
      when coalesce(
        case when p.progress_hold_type = 'quit' then p.quit_reason else p.pause_reason end,
        ''
      ) = 'exploring' then 'Just exploring'
      else coalesce(
        nullif(trim(case when p.progress_hold_type = 'quit' then p.quit_reason else p.pause_reason end), ''),
        'No reason given'
      )
    end
    || '.',
  coalesce(
    case when p.progress_hold_type = 'quit' then p.quit_at else p.paused_at end,
    now()
  )
from public.patients p
where coalesce(p.progress_paused, false)
  and coalesce(p.progress_hold_type, '') in ('pause', 'quit')
  and p.user_id is not null
  and not exists (
    select 1
    from public.admin_hold_alerts a
    where a.patient_user_id = p.user_id
      and a.hold_type = p.progress_hold_type
      and a.read_at is null
  );
