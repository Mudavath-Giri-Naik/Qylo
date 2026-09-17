-- Qylo — Phase 1 schema
-- Run this once in the Supabase SQL Editor (or via `supabase db push`) on a fresh project.
-- Creates every table from the Phase 1-5 data model, RLS policies for what's usable today,
-- and the trigger that turns a Supabase Auth signup into a `public.users` profile row.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users — one row per auth.users row, carrying the app-specific profile data
-- Supabase Auth can't store custom columns directly on auth.users, so this
-- table mirrors it 1:1 (id shared with auth.users.id).
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null check (role in ('learner', 'instructor')),
  preferred_language text not null default 'en',
  created_at timestamptz not null default now()
);

-- classes — an instructor's class/section
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- class_members — which learners belong to which class
create table public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

-- lessons — Phase 2 content, one row per lesson (per language version)
create table public.lessons (
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
create table public.circuits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  circuit_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- challenges — Phase 5 quizzes / coding / circuit challenges
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  module_code text not null,
  difficulty text not null default 'beginner',
  prompt text not null,
  starter_data jsonb,
  grading_rule jsonb,
  created_at timestamptz not null default now()
);

-- submissions — Phase 5 attempts against a challenge
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  submitted_data jsonb not null,
  score numeric,
  ai_feedback text,
  "timestamp" timestamptz not null default now()
);

-- progress — Phase 5 per-user, per-module/lesson progress
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  module_code text not null,
  lesson_id uuid references public.lessons (id) on delete set null,
  status text not null default 'not_started',
  score numeric,
  last_accessed timestamptz not null default now()
);

create index on public.classes (instructor_id);
create index on public.class_members (student_id);
create index on public.lessons (module_code, order_index);
create index on public.circuits (user_id);
create index on public.challenges (module_code);
create index on public.submissions (user_id);
create index on public.submissions (challenge_id);
create index on public.progress (user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a public.users profile whenever someone signs up via Supabase Auth.
-- The role and preferred_language are read from the signUp() options.data payload.
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
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
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

-- users: everyone can read their own profile. Writes go through the service
-- role (backend) only for now — there's no client-side profile editing yet.
create policy "users can view own profile"
  on public.users for select
  using (auth.uid() = id);

-- classes: instructors manage their own classes; members can see classes they're in.
create policy "instructors manage own classes"
  on public.classes for all
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

create policy "members can view their class"
  on public.classes for select
  using (
    exists (
      select 1 from public.class_members cm
      where cm.class_id = classes.id and cm.student_id = auth.uid()
    )
  );

-- class_members: the owning instructor manages rosters; students see their own membership.
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

create policy "students view own membership"
  on public.class_members for select
  using (auth.uid() = student_id);

-- lessons: readable by any signed-in user; authored via the service role (Phase 2 tooling).
create policy "authenticated users can read lessons"
  on public.lessons for select
  to authenticated
  using (true);

-- circuits: fully owned by the creating user.
create policy "users manage own circuits"
  on public.circuits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- challenges: readable by any signed-in user; authored via the service role (Phase 5 tooling).
create policy "authenticated users can read challenges"
  on public.challenges for select
  to authenticated
  using (true);

-- submissions: owned by the submitting user; visible to instructors of a class they're in.
create policy "users manage own submissions"
  on public.submissions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "instructors view class submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.student_id = submissions.user_id and c.instructor_id = auth.uid()
    )
  );

-- progress: owned by the user; visible to instructors of a class they're in.
create policy "users manage own progress"
  on public.progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "instructors view class progress"
  on public.progress for select
  using (
    exists (
      select 1 from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.student_id = progress.user_id and c.instructor_id = auth.uid()
    )
  );
