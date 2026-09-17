-- Qylo — Phase 1 schema (idempotent, self-contained)
--
-- Run this migration alone — it supersedes 0001. On some Supabase projects
-- 0001's `create table public.users (...)` collides with a table Supabase
-- already provisioned (id, email, created_at only), which rolls the whole
-- script back and silently creates nothing else. This version adapts
-- whatever's already there instead of fighting it, and every statement is
-- `if not exists` / `drop ... if exists`, so it's safe to run once on a
-- clean project or repeatedly on a partially-set-up one.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users — create it if this is a clean project, or adapt whatever's already
-- there (e.g. a Supabase-provisioned id/email/created_at shadow table).
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.users add column if not exists role text;
alter table public.users add column if not exists preferred_language text not null default 'en';

update public.users set role = 'learner' where role is null;
alter table public.users alter column role set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_role_check'
  ) then
    alter table public.users
      add constraint users_role_check check (role in ('learner', 'instructor'));
  end if;
end $$;

-- classes — an instructor's class/section
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- class_members — which learners belong to which class
create table if not exists public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

-- lessons — Phase 2 content, one row per lesson (per language version)
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_code text not null,
  title text not null,
  body_markdown text not null default '',
  language text not null default 'en',
  difficulty text not null default 'beginner',
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- circuits — Phase 3 saved circuit runs
create table if not exists public.circuits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  circuit_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- challenges — Phase 5 quizzes / coding / circuit challenges
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  module_code text not null,
  difficulty text not null default 'beginner',
  prompt text not null,
  starter_data jsonb,
  grading_rule jsonb,
  created_at timestamptz not null default now()
);

-- submissions — Phase 5 attempts against a challenge
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  submitted_data jsonb not null,
  score numeric,
  ai_feedback text,
  "timestamp" timestamptz not null default now()
);

-- progress — Phase 5 per-user, per-module/lesson progress
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  module_code text not null,
  lesson_id uuid references public.lessons (id) on delete set null,
  status text not null default 'not_started',
  score numeric,
  last_accessed timestamptz not null default now()
);

create index if not exists classes_instructor_id_idx on public.classes (instructor_id);
create index if not exists class_members_student_id_idx on public.class_members (student_id);
create index if not exists lessons_module_code_order_idx on public.lessons (module_code, order_index);
create index if not exists circuits_user_id_idx on public.circuits (user_id);
create index if not exists challenges_module_code_idx on public.challenges (module_code);
create index if not exists submissions_user_id_idx on public.submissions (user_id);
create index if not exists submissions_challenge_id_idx on public.submissions (challenge_id);
create index if not exists progress_user_id_idx on public.progress (user_id);

-- ---------------------------------------------------------------------------
-- Auto-create/backfill a public.users profile whenever someone signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role, preferred_language)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'learner'),
    coalesce(new.raw_user_meta_data ->> 'preferred_language', 'en')
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill any auth.users created before this trigger existed.
insert into public.users (id, email, role, preferred_language)
select
  id,
  email,
  coalesce(raw_user_meta_data ->> 'role', 'learner'),
  coalesce(raw_user_meta_data ->> 'preferred_language', 'en')
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.lessons enable row level security;
alter table public.circuits enable row level security;
alter table public.challenges enable row level security;
alter table public.submissions enable row level security;
alter table public.progress enable row level security;

drop policy if exists "users can view own profile" on public.users;
create policy "users can view own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "instructors manage own classes" on public.classes;
create policy "instructors manage own classes"
  on public.classes for all
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

drop policy if exists "members can view their class" on public.classes;
create policy "members can view their class"
  on public.classes for select
  using (
    exists (
      select 1 from public.class_members cm
      where cm.class_id = classes.id and cm.student_id = auth.uid()
    )
  );

drop policy if exists "instructors manage class rosters" on public.class_members;
create policy "instructors manage class rosters"
  on public.class_members for all
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_members.class_id and c.instructor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classes c
      where c.id = class_members.class_id and c.instructor_id = auth.uid()
    )
  );

drop policy if exists "students view own membership" on public.class_members;
create policy "students view own membership"
  on public.class_members for select
  using (auth.uid() = student_id);

drop policy if exists "authenticated users can read lessons" on public.lessons;
create policy "authenticated users can read lessons"
  on public.lessons for select
  to authenticated
  using (true);

drop policy if exists "users manage own circuits" on public.circuits;
create policy "users manage own circuits"
  on public.circuits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "authenticated users can read challenges" on public.challenges;
create policy "authenticated users can read challenges"
  on public.challenges for select
  to authenticated
  using (true);

drop policy if exists "users manage own submissions" on public.submissions;
create policy "users manage own submissions"
  on public.submissions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "instructors view class submissions" on public.submissions;
create policy "instructors view class submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.student_id = submissions.user_id and c.instructor_id = auth.uid()
    )
  );

drop policy if exists "users manage own progress" on public.progress;
create policy "users manage own progress"
  on public.progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "instructors view class progress" on public.progress;
create policy "instructors view class progress"
  on public.progress for select
  using (
    exists (
      select 1 from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.student_id = progress.user_id and c.instructor_id = auth.uid()
    )
  );

notify pgrst, 'reload schema';
