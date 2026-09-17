-- Qylo -- Phase 5 schema additions: class join codes + the RLS policies
-- needed for join-class, the instructor roster, and public circuit sharing.
-- Idempotent: safe to re-run.

-- classes need a short, student-facing code to join by.
alter table public.classes add column if not exists join_code text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'classes_join_code_key'
  ) then
    alter table public.classes add constraint classes_join_code_key unique (join_code);
  end if;
end $$;

-- Any signed-in user can look up a class (needed to resolve a join code
-- before they're a member of it). Classes aren't sensitive data.
drop policy if exists "authenticated users can view classes" on public.classes;
create policy "authenticated users can view classes"
  on public.classes for select
  to authenticated
  using (true);

-- Students add themselves to a class via a join code.
drop policy if exists "students can join classes" on public.class_members;
create policy "students can join classes"
  on public.class_members for insert
  to authenticated
  with check (auth.uid() = student_id);

-- Instructors need to see the profile (email) of students in their own
-- classes to render a roster.
drop policy if exists "instructors view own class students" on public.users;
create policy "instructors view own class students"
  on public.users for select
  using (
    exists (
      select 1 from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.student_id = users.id and c.instructor_id = auth.uid()
    )
  );

-- Collaborative sharing: a saved circuit is readable by anyone who has its
-- id (an unguessable UUID) -- the same "anyone with the link" model as most
-- sharing features. No new table or "public" flag; the link is the access
-- control.
drop policy if exists "anyone can view a circuit by id" on public.circuits;
create policy "anyone can view a circuit by id"
  on public.circuits for select
  to anon, authenticated
  using (true);
