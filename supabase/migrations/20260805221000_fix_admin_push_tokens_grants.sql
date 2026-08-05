-- Edge functions (service_role) must be able to read admin push tokens.
grant select, insert, update, delete on table public.admin_push_tokens to service_role;
grant select, insert, update, delete on table public.admin_hold_alerts to service_role;
grant select, insert, update, delete on table public.admin_push_tokens to authenticated;
grant select, insert, update, delete on table public.admin_hold_alerts to authenticated;
