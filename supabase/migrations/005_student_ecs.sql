-- Per-student extracurricular list. Entered in the Activity portfolio, saved to the
-- account, and used (with practice marks) to recommend scholarships.
create table if not exists public.student_ecs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default '',
  duration text not null default '',
  hours integer not null default 0,
  detail text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_ecs_user_idx
  on public.student_ecs (user_id, sort_order);

alter table public.student_ecs enable row level security;

-- Users may only ever see and change their own activities.
create policy "users manage own ecs"
  on public.student_ecs for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists student_ecs_set_updated_at on public.student_ecs;
create trigger student_ecs_set_updated_at
  before update on public.student_ecs
  for each row execute function public.set_updated_at();
