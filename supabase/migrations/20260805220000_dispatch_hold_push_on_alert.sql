-- When an admin_hold_alerts row is inserted, call the edge function that
-- Expo-pushes to all registered admin devices (works even if admin app is closed).

create extension if not exists pg_net with schema extensions;

create or replace function public.dispatch_admin_hold_push()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_url text;
  v_payload jsonb;
begin
  v_url := 'https://soyaeuffzytrjojifvdz.supabase.co/functions/v1/dispatch-admin-hold-push';
  v_payload := jsonb_build_object(
    'alertId', new.id,
    'title', new.title,
    'body', new.body,
    'holdType', new.hold_type,
    'patientName', new.patient_name,
    'patientUsername', new.patient_username,
    'reason', new.reason
  );

  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-oncosmart-dispatch-secret', 'oncosmart-hold-push-v1-7f3c9e2a4b8d'
    ),
    body := v_payload
  );

  return new;
exception
  when others then
    -- Never block alert inserts if push dispatch fails.
    raise warning 'dispatch_admin_hold_push failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists admin_hold_alerts_dispatch_push on public.admin_hold_alerts;
create trigger admin_hold_alerts_dispatch_push
  after insert on public.admin_hold_alerts
  for each row
  execute function public.dispatch_admin_hold_push();
