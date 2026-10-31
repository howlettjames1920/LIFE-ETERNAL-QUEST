-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.quest_sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.quest_sync enable row level security;
drop policy if exists "Users can read their own quest" on public.quest_sync;
drop policy if exists "Users can insert their own quest" on public.quest_sync;
drop policy if exists "Users can update their own quest" on public.quest_sync;
create policy "Users can read their own quest" on public.quest_sync for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own quest" on public.quest_sync for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own quest" on public.quest_sync for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'quest_sync'
  ) then
    alter publication supabase_realtime add table public.quest_sync;
  end if;
end $$;
