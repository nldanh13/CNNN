-- Defense in depth: prevent one account from filling the Supabase database
-- with an unlimited number of 1 MB backup snapshots.
-- Safe for existing data: NO DELETE / UPDATE / schema rewrite.
-- Run in the CNNN Supabase SQL Editor AFTER the original RLS migration.
begin;

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

commit;
