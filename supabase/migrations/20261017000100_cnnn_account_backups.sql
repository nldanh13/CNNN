-- CNNN: private, explicit, append-only backup snapshots for demo / training plans.
-- Run once in the Supabase SQL Editor after reviewing the migration.
-- No NANDA-I/NOC/NIC catalog tables: all users share one canonical catalog.
-- No auth user or password replicas; accounts are owned by Supabase Auth.

begin;

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

create policy "cnnn_snapshots_select_own"
  on public.cnnn_backup_snapshots for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "cnnn_snapshots_insert_own"
  on public.cnnn_backup_snapshots for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "cnnn_snapshots_delete_own"
  on public.cnnn_backup_snapshots for delete to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.cnnn_backup_snapshots is
  'Owner-only, append-only snapshots for CNNN demo/training plans. NOT a certified clinical record store.';
comment on column public.cnnn_backup_snapshots.payload is
  'Backup JSON; may contain sensitive text. Restrict content to non-identifying test data.';

commit;
