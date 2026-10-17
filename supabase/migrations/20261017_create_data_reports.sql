-- CNNN report storage: apply once in Supabase SQL Editor (project administrator only).
-- This migration has NO patient/care-plan tables. Never put patient identifiers in reports.
create table if not exists public.report_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);
alter table public.report_admins enable row level security;
revoke all on public.report_admins from anon, authenticated;
grant select on public.report_admins to authenticated;
drop policy if exists "Read own administrator role" on public.report_admins;
create policy "Read own administrator role" on public.report_admins
  for select to authenticated using (user_id = (select auth.uid()));
-- No INSERT/UPDATE/DELETE grant or policy for clients. Only an operator using
-- SQL Editor/service role can grant administrator rights (NEVER in frontend).

create table if not exists public.data_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete restrict,
  system text not null check (system in ('nanda','noc','nic')),
  code text not null check (length(code) between 1 and 12),
  label text not null check (length(label) between 1 and 300),
  edition text not null check (length(edition) between 1 and 100),
  category text not null check (category in (
    'wrong-code','wrong-label','wrong-translation','wrong-definition',
    'wrong-indicator','wrong-activity','outdated-edition','other'
  )),
  description text not null check (char_length(btrim(description)) between 10 and 1000),
  suggestion text not null default '' check (char_length(suggestion) <= 400),
  evidence text not null default '' check (char_length(evidence) <= 300),
  status text not null default 'new' check (status in ('new','reviewing','resolved','rejected')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists data_reports_reporter_date_idx
  on public.data_reports(reporter_id,created_at desc);
create index if not exists data_reports_status_date_idx
  on public.data_reports(status,created_at desc);

-- Keep timestamps and original reporters reliable; reject attempts to forge
-- report status, data ownership or audit times on INSERT.
create or replace function public.cnnn_report_audit()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.reporter_id := (select auth.uid());
    new.status := 'new';
    new.admin_note := null;
    new.created_at := now();
  end if;
  new.updated_at := now();
  return new;
end; $$;
revoke execute on function public.cnnn_report_audit() from public, anon, authenticated;
drop trigger if exists cnnn_report_audit_trigger on public.data_reports;
create trigger cnnn_report_audit_trigger before insert or update on public.data_reports
  for each row execute function public.cnnn_report_audit();

alter table public.data_reports enable row level security;
revoke all on public.data_reports from anon, authenticated;
grant select, insert on public.data_reports to authenticated;
-- Column-level grant: normal users cannot modify report contents; even admins
-- can edit only the review status and note, not authorship / timestamps.
grant update(status, admin_note) on public.data_reports to authenticated;

drop policy if exists "User reads own reports or admin reads all" on public.data_reports;
create policy "User reads own reports or admin reads all" on public.data_reports
  for select to authenticated
  using (
    reporter_id = (select auth.uid())
    or exists(select 1 from public.report_admins where user_id = (select auth.uid()))
  );
drop policy if exists "User inserts own new reports" on public.data_reports;
create policy "User inserts own new reports" on public.data_reports
  for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and status = 'new' and admin_note is null
  );
drop policy if exists "Admin reviews reports" on public.data_reports;
create policy "Admin reviews reports" on public.data_reports
  for update to authenticated
  using (exists(select 1 from public.report_admins where user_id = (select auth.uid())))
  with check (exists(select 1 from public.report_admins where user_id = (select auth.uid())));

-- NOTE: No DELETE policy/grant on reports. Retention/deletion must be an
-- explicit authorized backend or database operation.
--
-- To grant administrator access AFTER authenticating as the desired user:
-- Find their UUID in Authentication > Users and execute this manually:
-- insert into public.report_admins(user_id) values ('USER_UUID_HERE');
-- Never insert using an email string or a UUID guessed by the app.
