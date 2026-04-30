-- =============================================================================
-- Mazy v5 — Schema patch for the 4-phase pedagogy flow
--   (Phase 1 Lab · Phase 2 Distill · Phase 3 Practice · Phase 4 Quiz)
--
-- Run AFTER schema.sql + schema_v2_patch.sql + schema_v3_survey.sql +
--          schema_v4_relax_fks.sql in Supabase Studio.
-- Idempotent on re-run.
-- =============================================================================

-- 1. practice_attempts — one row per Phase-3 drill completion
--    Captures the structured aggregate (correct/wrong/duration). Raw per-tap
--    events still flow into the generic `events` table.
create table if not exists practice_attempts (
  id              bigserial primary key,
  client_uid      text,
  lesson_id       text not null,
  drill_id        text not null,
  drill_kind      text,                                  -- tap_match | true_false | sequence
  correct_count   int  not null default 0,
  wrong_count     int  not null default 0,
  duration_ms     int,
  completed_at    timestamptz not null default now()
);

create index if not exists practice_attempts_lesson_idx on practice_attempts(lesson_id, completed_at desc);
create index if not exists practice_attempts_uid_idx    on practice_attempts(client_uid);

alter table practice_attempts enable row level security;

drop policy if exists "anon insert practice_attempts" on practice_attempts;
create policy "anon insert practice_attempts"
  on practice_attempts for insert to anon with check (true);

drop policy if exists "auth read practice_attempts" on practice_attempts;
create policy "auth read practice_attempts"
  on practice_attempts for select to authenticated using (true);

-- 2. v_lesson_funnel — phase-level reach per lesson
--    Reads from screen_views.screen_slug. The slug convention is:
--      lesson_lab:<lesson_id> · lesson_distill:<lesson_id> ·
--      lesson_practice:<lesson_id> · quiz_*:<lesson_id>:<n>
create or replace view v_lesson_funnel as
select
  lesson_id,
  count(distinct client_uid) filter (where phase = 'lab')      as lab_reached,
  count(distinct client_uid) filter (where phase = 'distill')  as distill_reached,
  count(distinct client_uid) filter (where phase = 'practice') as practice_reached,
  count(distinct client_uid) filter (where phase = 'quiz')     as quiz_reached
from (
  select
    client_uid,
    split_part(screen_slug, ':', 2) as lesson_id,
    case
      when screen_slug like 'lesson_lab:%'      then 'lab'
      when screen_slug like 'lesson_distill:%'  then 'distill'
      when screen_slug like 'lesson_practice:%' then 'practice'
      when screen_slug like 'quiz_%'            then 'quiz'
    end as phase
  from screen_views
  where screen_slug ~ '^(lesson_lab|lesson_distill|lesson_practice|quiz_)'
) t
where lesson_id <> '' and phase is not null
group by lesson_id
order by lesson_id;

comment on view v_lesson_funnel is
  'Per-lesson funnel: how many distinct clients reached each pedagogy phase. Useful for thesis "Teaching Before Testing" drop-off analysis.';

-- 3. v_practice_drill_summary — per-drill mastery stats
create or replace view v_practice_drill_summary as
select
  lesson_id,
  drill_id,
  drill_kind,
  count(*)                  as attempts,
  avg(correct_count)::numeric(10,2) as avg_correct,
  avg(wrong_count)::numeric(10,2)   as avg_wrong,
  avg(duration_ms)::int             as avg_duration_ms
from practice_attempts
group by lesson_id, drill_id, drill_kind
order by lesson_id, drill_id;

comment on view v_practice_drill_summary is
  'Per-drill aggregate: how many attempts each drill received and the mean correct/wrong/duration. Use this to tune which drills are too easy/hard.';

-- =============================================================================
-- DONE.
-- =============================================================================
