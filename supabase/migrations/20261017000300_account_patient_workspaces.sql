-- CNNN account workspace: exactly one JSON care-plan document per Auth user.
-- Additive only: never deletes old backups or browser plans.
-- IMPORTANT: review and run in the CNNN Supabase SQL Editor BEFORE enabling VITE_PATIENT_CLOUD_ENABLED.
begin;

create table if not exists public.cnnn_patient_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plans jsonb not null default '[]'::jsonb,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint cnnn_workspace_is_array check (jsonb_typeof(plans) = 'array'),
  constraint cnnn_workspace_max_three check (jsonb_array_length(plans) <= 3),
  constraint cnnn_workspace_size check (octet_length(plans::text) <= 1048576)
);

alter table public.cnnn_patient_workspaces enable row level security;
alter table public.cnnn_patient_workspaces force row level security;
revoke all on public.cnnn_patient_workspaces from public, anon, authenticated;
grant select on public.cnnn_patient_workspaces to authenticated;

drop policy if exists cnnn_workspace_read_own on public.cnnn_patient_workspaces;
create policy cnnn_workspace_read_own
on public.cnnn_patient_workspaces
for select to authenticated
using (user_id = (select auth.uid()));

-- Explicit RPC is the only write gateway. Its arguments do not accept user_id.
-- Optimistic revision guards concurrent edits from another tab/device.
create or replace function public.cnnn_save_patient_workspace(
  p_expected_revision bigint,
  p_plans jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_revision bigint;
begin
  if v_user is null or (select auth.role()) <> 'authenticated' then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'Invalid revision' using errcode = '22023';
  end if;
  if p_plans is null or jsonb_typeof(p_plans) <> 'array'
     or jsonb_array_length(p_plans) > 3 then
    raise exception 'Maximum three patients per account' using errcode = '23514';
  end if;
  if octet_length(p_plans::text) > 1048576 then
    raise exception 'Patient plan document too large' using errcode = '23514';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_plans) p
    where jsonb_typeof(p) <> 'object'
       or jsonb_typeof(p->'id') <> 'string'
       or length(p->>'id') < 1
       or jsonb_typeof(p->'patient') <> 'object'
       or jsonb_typeof(p->'entries') <> 'array'
  ) then
    raise exception 'Invalid care plan document' using errcode = '23514';
  end if;
  if (
    select count(distinct p->>'id')
    from jsonb_array_elements(p_plans) p
  ) <> jsonb_array_length(p_plans) then
    raise exception 'Duplicate care plan identifiers' using errcode = '23514';
  end if;

  -- Per-account advisory lock ensures no duplicate first writes and consistent CAS.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user::text, 11293)
  );
  select revision into v_revision
  from public.cnnn_patient_workspaces
  where user_id = v_user
  for update;

  if not found then
    if p_expected_revision <> 0 then
      raise exception 'Workspace changed on another device' using errcode = '40001';
    end if;
    insert into public.cnnn_patient_workspaces(user_id, plans, revision)
    values (v_user, p_plans, 1);
    return 1;
  end if;

  if v_revision <> p_expected_revision then
    raise exception 'Workspace changed on another device' using errcode = '40001';
  end if;
  update public.cnnn_patient_workspaces
  set plans = p_plans, revision = revision + 1, updated_at = now()
  where user_id = v_user
  returning revision into v_revision;
  return v_revision;
end;
$$;

-- Never allow anonymous / PUBLIC callers to invoke the SECURITY DEFINER RPC.
revoke all on function public.cnnn_save_patient_workspace(bigint, jsonb) from public, anon;
grant execute on function public.cnnn_save_patient_workspace(bigint, jsonb) to authenticated;

comment on table public.cnnn_patient_workspaces is
  'CNNN account workspaces. At most 3 fictional/training patient plans per account; not certified clinical record storage.';

commit;
