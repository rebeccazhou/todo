create extension if not exists "pgcrypto";

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  text text not null,
  category text not null,
  period text not null check (period in ('week', 'future')),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sort_order integer not null default 0
);

create table if not exists public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  collapsed boolean not null default false,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  zip text not null default '10001',
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists todos_set_updated_at on public.todos;
create trigger todos_set_updated_at
before update on public.todos
for each row
execute function public.set_updated_at();

drop trigger if exists preferences_set_updated_at on public.preferences;
create trigger preferences_set_updated_at
before update on public.preferences
for each row
execute function public.set_updated_at();

alter table public.todos enable row level security;
alter table public.preferences enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.todos to authenticated;
grant select, insert, update, delete on public.preferences to authenticated;

drop policy if exists "Todos are private" on public.todos;
create policy "Todos are private"
on public.todos
for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Preferences are private" on public.preferences;
create policy "Preferences are private"
on public.preferences
for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
