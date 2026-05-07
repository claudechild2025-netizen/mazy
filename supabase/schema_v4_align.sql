-- =============================================================================
-- Mazy v4 — Schema alignment with actual mazy app analytics inserts
--
-- Run AFTER schema.sql + schema_v2_patch.sql + schema_v3_survey.sql.
-- (schema_admin_read.sql is superseded by this file — no need to run it.)
--
-- This patch:
--   1. Drops `screen_views`, `quiz_answers` (UUID/FK shape from schema.sql)
--      and recreates them with the simpler client_uid + slug shape that
--      mazy app's lib/analytics.ts actually writes. Without this, every
--      screen_view / quiz_answer insert silently fails on RLS+column errors,
--      so neither tables nor `users` get rows (ensureUserRow upserts also
--      fall through because grade was NOT NULL).
--   2. Relaxes users.grade to nullable — analytics.ensureUserRow only sends
--      client_uid; the login form does send grade so logged-in users still
--      have it populated.
--   3. Adds anon SELECT policies so mazy-admin (no auth) can read the
--      dashboard data using the same anon key.
--
-- Idempotent: re-running drops & recreates the two analytics tables.
-- =============================================================================

-- 1. screen_views — match analytics.ts insert shape ----------------------------
drop table if exists screen_views cascade;
create table screen_views (
  id            bigserial primary key,
  client_uid    text not null,
  screen_slug   text not null,
  time_spent_ms int  not null default 0 check (time_spent_ms >= 0),
  completed     bool not null default false,
  viewed_at     timestamptz not null default now()
);
create index screen_views_client_idx on screen_views(client_uid, viewed_at desc);
create index screen_views_slug_idx   on screen_views(screen_slug);

-- 2. quiz_answers — match analytics.ts insert shape ----------------------------
drop table if exists quiz_answers cascade;
create table quiz_answers (
  id                bigserial primary key,
  client_uid        text not null,
  question_key      text,
  selected_key      text,
  is_correct        bool not null default false,
  time_to_answer_ms int  not null default 0 check (time_to_answer_ms >= 0),
  lesson_id         text,
  answered_at       timestamptz not null default now()
);
create index quiz_answers_client_idx on quiz_answers(client_uid, answered_at desc);

-- 3. Relax users.grade — analytics.ensureUserRow only sends client_uid ---------
alter table users alter column grade drop not null;

-- 4. RLS — anon insert + anon select for the dashboard -------------------------
alter table screen_views enable row level security;
alter table quiz_answers enable row level security;

drop policy if exists "anon insert screen_views" on screen_views;
create policy "anon insert screen_views" on screen_views for insert to anon with check (true);

drop policy if exists "anon insert quiz_answers" on quiz_answers;
create policy "anon insert quiz_answers" on quiz_answers for insert to anon with check (true);

drop policy if exists "anon read screen_views" on screen_views;
create policy "anon read screen_views"   on screen_views for select to anon using (true);

drop policy if exists "anon read quiz_answers" on quiz_answers;
create policy "anon read quiz_answers"   on quiz_answers for select to anon using (true);

drop policy if exists "anon read users" on users;
create policy "anon read users" on users for select to anon using (true);

drop policy if exists "anon read events" on events;
create policy "anon read events" on events for select to anon using (true);

drop policy if exists "anon read survey_responses" on survey_responses;
create policy "anon read survey_responses" on survey_responses for select to anon using (true);

-- =============================================================================
-- DONE. mazy app inserts now succeed; mazy-admin can read.
-- =============================================================================
