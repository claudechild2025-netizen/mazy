-- =============================================================================
-- Mazy v5b — Open up v5 entities to the anon (read-only admin) role.
--
-- schema_v5_pedagogy_phases.sql gave practice_attempts an "auth read" policy
-- and didn't grant anon SELECT on the new views. mazy-admin runs without
-- auth (anon key only), so it needs explicit anon read access. Run this AFTER
-- schema_v5_pedagogy_phases.sql in Supabase SQL Editor.
-- =============================================================================

-- 1. practice_attempts — anon SELECT
drop policy if exists "anon read practice_attempts" on practice_attempts;
create policy "anon read practice_attempts"
  on practice_attempts for select to anon using (true);

-- 2. Views — security_invoker + anon GRANT
alter view v_lesson_funnel           set (security_invoker = on);
alter view v_practice_drill_summary  set (security_invoker = on);

grant select on v_lesson_funnel          to anon;
grant select on v_practice_drill_summary to anon;
