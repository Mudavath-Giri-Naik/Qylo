-- Qylo -- fix infinite recursion in RLS between classes <-> class_members.
--
-- 0004 added "authenticated users can view classes" (unconditional select for
-- any signed-in user) on `classes`. That made the older, narrower "members can
-- view their class" policy (which subqueries class_members) redundant -- and
-- the two tables' policies now form a genuine cycle: class_members's
-- "instructors manage class rosters" policy subqueries classes, and classes's
-- "members can view their class" policy subqueries class_members right back,
-- which Postgres detects as infinite recursion (42P17) the moment a query
-- touches either table's RLS.
--
-- Fix: drop the now-redundant policy so classes' policies no longer reference
-- class_members at all, breaking the cycle.

drop policy if exists "members can view their class" on public.classes;
