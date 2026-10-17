-- CNNN | DATABASE ALL-IN-ONE (TONG HOP)
-- Supabase SQL Editor: save as "CNNN - Quan ly du lieu va tai khoan"
--
-- Combines the 3 versioned migrations without deleting them from Git.
-- Safe to repeat after previously running the backup SQL scripts:
-- tables/indexes IF NOT EXISTS; functions CREATE OR REPLACE; policies and
-- trigger recreated atomically inside one transaction.
-- No table drops, no patient-data deletions or updates, no account removal.
-- Previously stored manual backup snapshots remain available for migration.
--
-- Deleting a saved SQL Editor Query only removes its editor text.
-- It does NOT delete database tables. Do not run cleanup DROP TABLE commands.
--
-- Run before enabling VITE_PATIENT_CLOUD_ENABLED=true. Do not store real
-- identifiable patient records: this is currently for training data.
--
BEGIN;

-- CNNN: private, explicit, append-only backup snapshots for demo / training plans.
-- Run once in the Supabase SQL Editor after reviewing the migration.
-- No NANDA-I/NOC/NIC catalog tables: all users share one canonical catalog.
-- No auth user or password replicas; accounts are owned by Supabase Auth.

create table if not exists public.cnnn_backup_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  plan_count integer not null check (plan_count >= 0 and plan_count <= 1000),
  created_at timestamptz not null default now(),
  constraint cnnn_backup_format check (
    jsonb_typeof(payload) = 'object'
    and payload ->> 'format' = 'clinicalnnn-backup'
    and payload ->> 'version' = '1'
    and jsonb_typeof(payload -> 'plans') = 'array'
  ),
  constraint cnnn_backup_size check (octet_length(payload::text) <= 1048576),
  constraint cnnn_backup_count_matches check (
    case
      when jsonb_typeof(payload -> 'plans') = 'array'
      then jsonb_array_length(payload -> 'plans') = plan_count
      else false
    end
  )
);

create index if not exists cnnn_backups_user_created_idx
  on public.cnnn_backup_snapshots (user_id, created_at desc);

alter table public.cnnn_backup_snapshots enable row level security;
alter table public.cnnn_backup_snapshots force row level security;

-- Supabase may grant broad defaults to new public tables. Revoke them first.
revoke all on table public.cnnn_backup_snapshots from public, anon, authenticated;
grant select, insert, delete on table public.cnnn_backup_snapshots to authenticated;
-- No UPDATE grant: backups are immutable; users make another backup instead.

drop policy if exists "cnnn_snapshots_select_own" on public.cnnn_backup_snapshots;
create policy "cnnn_snapshots_select_own"
  on public.cnnn_backup_snapshots for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "cnnn_snapshots_insert_own" on public.cnnn_backup_snapshots;
create policy "cnnn_snapshots_insert_own"
  on public.cnnn_backup_snapshots for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "cnnn_snapshots_delete_own" on public.cnnn_backup_snapshots;
create policy "cnnn_snapshots_delete_own"
  on public.cnnn_backup_snapshots for delete to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.cnnn_backup_snapshots is
  'Owner-only, append-only snapshots for CNNN demo/training plans. NOT a certified clinical record store.';
comment on column public.cnnn_backup_snapshots.payload is
  'Backup JSON; may contain sensitive text. Restrict content to non-identifying test data.';

-- === PART 2: Legacy per-account backup quota ===

-- Defense in depth: prevent one account from filling the Supabase database
-- with an unlimited number of 1 MB backup snapshots.
-- Safe for existing data: NO DELETE / UPDATE / schema rewrite.
-- Run in the CNNN Supabase SQL Editor AFTER the original RLS migration.

create or replace function public.cnnn_enforce_backup_quota()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  existing_count bigint;
begin
  -- Existing INSERT RLS policy still enforces new.user_id = auth.uid().
  -- Lock per UID to prevent concurrent requests from bypassing the quota.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.user_id::text, 0)
  );

  select count(*) into existing_count
  from public.cnnn_backup_snapshots
  where user_id = new.user_id;

  if existing_count >= 10 then
    raise exception 'Đã đạt giới hạn 10 bản sao lưu. Hãy xóa bản cũ trước khi tạo bản mới.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.cnnn_enforce_backup_quota() from public;
-- Trigger invokes the function in the authenticated user context.
grant execute on function public.cnnn_enforce_backup_quota() to authenticated;

drop trigger if exists cnnn_limit_backups_before_insert on public.cnnn_backup_snapshots;
create trigger cnnn_limit_backups_before_insert
before insert on public.cnnn_backup_snapshots
for each row execute function public.cnnn_enforce_backup_quota();

-- === PART 3: Auto-saved workspaces / 3 patients ===

-- CNNN account workspace: exactly one JSON care-plan document per Auth user.
-- Additive only: never deletes old backups or browser plans.
-- IMPORTANT: review and run in the CNNN Supabase SQL Editor BEFORE enabling VITE_PATIENT_CLOUD_ENABLED.

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

COMMIT;

-- Read-only configuration check (2 rows expected; does not test cross-account RLS).
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced,
  (SELECT count(*) FROM pg_policies p
   WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS policy_count
FROM pg_class c
WHERE c.oid IN (
  'public.cnnn_backup_snapshots'::regclass,
  'public.cnnn_patient_workspaces'::regclass
)
ORDER BY c.relname;
