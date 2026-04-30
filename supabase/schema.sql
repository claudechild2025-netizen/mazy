-- =============================================================================
-- Mazaalai — Microlearning Platform
-- Schema for: Module 01 — Principles of Optical Reflection & Mirror Dynamics
-- Target: Supabase / Postgres 15+
--
-- Run this entire file in Supabase Studio → SQL Editor → New query → Run.
-- Designed to be idempotent: drop & re-create cleanly during development.
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- Drop in reverse-dependency order (safe re-runs in dev) -----------------------
drop table if exists sus_responses cascade;
drop table if exists events cascade;
drop table if exists quiz_answers cascade;
drop table if exists quiz_attempts cascade;
drop table if exists quiz_questions cascade;
drop table if exists screen_views cascade;
drop table if exists screens cascade;
drop table if exists modules cascade;
drop table if exists users cascade;

-- =============================================================================
-- 1. users — anonymous student identity (no PII)
-- =============================================================================
create table users (
  id              uuid primary key default gen_random_uuid(),
  client_uid      text unique not null,         -- matches localStorage `mzl_uid`
  grade           int  not null check (grade between 7 and 12),
  school_code     text,                          -- optional, for cohort analysis
  created_at      timestamptz not null default now()
);

comment on table users is
  'Anonymous student record. client_uid links to the browser-generated id stored in localStorage. No personal data captured.';

-- =============================================================================
-- 2. modules — top-level learning unit
-- =============================================================================
create table modules (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title_mn        text not null,
  description_mn  text,
  order_index     int  not null,
  created_at      timestamptz not null default now()
);

-- Seed the one module we care about for the thesis ----------------------------
insert into modules (slug, title_mn, description_mn, order_index) values
  ('optical-reflection',
   'Гэрлийн ойлтын хууль ба толины динамик',
   'Хавтгай ба бөмбөлгөн толин дээр тусах гэрлийн өнцөг ба ойлтын зүй тогтол.',
   1);

-- =============================================================================
-- 3. screens — individual learn-screens within a module
-- =============================================================================
create table screens (
  id              uuid primary key default gen_random_uuid(),
  module_id       uuid not null references modules(id) on delete cascade,
  order_index     int  not null,
  kind            text not null check (kind in ('intro','concept','interactive','summary')),
  title_mn        text not null,
  body_mn         text,                          -- short paragraph (Spatial Contiguity: keep adjacent in UI)
  created_at      timestamptz not null default now(),
  unique (module_id, order_index)
);

-- =============================================================================
-- 4. screen_views — every time a student opens a screen, with duration
--    THIS IS THE PRIMARY COGNITIVE-EFFICIENCY METRIC (Sweller, 1988)
-- =============================================================================
create table screen_views (
  id              bigserial primary key,
  user_id         uuid not null references users(id) on delete cascade,
  screen_id       uuid not null references screens(id) on delete cascade,
  time_spent_ms   int  not null check (time_spent_ms >= 0),
  completed       bool not null default false,    -- did the student tap "Next"?
  viewed_at       timestamptz not null default now()
);

create index screen_views_user_idx on screen_views(user_id, viewed_at desc);
create index screen_views_screen_idx on screen_views(screen_id);

-- =============================================================================
-- 5. quiz_questions — question bank
-- =============================================================================
create table quiz_questions (
  id              uuid primary key default gen_random_uuid(),
  module_id       uuid not null references modules(id) on delete cascade,
  order_index     int  not null,
  prompt_mn       text not null,
  options         jsonb not null,                 -- [{key:'a', text_mn:'...'}, ...]
  correct_key     text not null,
  bloom_level     text check (bloom_level in ('remember','understand','apply','analyse','evaluate','create')),
  unique (module_id, order_index)
);

-- =============================================================================
-- 6. quiz_attempts — one row per quiz session
-- =============================================================================
create table quiz_attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  module_id       uuid not null references modules(id) on delete cascade,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  score           int,                            -- 0..n_questions, set on completion
  total           int                             -- snapshot of n_questions at attempt time
);

create index quiz_attempts_user_idx on quiz_attempts(user_id, started_at desc);

-- =============================================================================
-- 7. quiz_answers — per-question response with timing
-- =============================================================================
create table quiz_answers (
  id                 bigserial primary key,
  attempt_id         uuid not null references quiz_attempts(id) on delete cascade,
  question_id        uuid not null references quiz_questions(id) on delete cascade,
  selected_key       text not null,
  is_correct         bool not null,
  time_to_answer_ms  int  not null check (time_to_answer_ms >= 0),
  answered_at        timestamptz not null default now()
);

create index quiz_answers_attempt_idx on quiz_answers(attempt_id);

-- =============================================================================
-- 8. events — generic UX event log (clicks, navigation, taps)
--    Schemaless `meta jsonb` so new event types can be added without migration.
-- =============================================================================
create table events (
  id           bigserial primary key,
  user_id      text,                              -- the client_uid string; FK is loose to allow pre-row events
  event        text not null,
  meta         jsonb not null default '{}'::jsonb,
  path         text,
  viewport     jsonb,
  ts           bigint not null,                   -- ms since epoch (client clock; sortable enough)
  inserted_at  timestamptz not null default now()
);

create index events_user_idx on events(user_id, inserted_at desc);
create index events_event_idx on events(event);

-- =============================================================================
-- 9. sus_responses — Brooke (1996) System Usability Scale, post-session
-- =============================================================================
create table sus_responses (
  id               bigserial primary key,
  user_id          uuid not null references users(id) on delete cascade,
  attempt_id       uuid references quiz_attempts(id) on delete set null,
  question_number  int  not null check (question_number between 1 and 10),
  score            int  not null check (score between 1 and 5),
  submitted_at     timestamptz not null default now(),
  unique (user_id, attempt_id, question_number)
);

-- Convenience view: SUS score per user (range 0–100, ≥68 = acceptable) -------
create or replace view v_sus_scores as
select
  user_id,
  attempt_id,
  round((
    sum(case when question_number % 2 = 1 then score - 1 else 5 - score end)
  ) * 2.5)::int as sus_score,
  count(*)      as items_answered,
  max(submitted_at) as completed_at
from sus_responses
group by user_id, attempt_id
having count(*) = 10;

comment on view v_sus_scores is
  'Computes SUS per Brooke (1996): odd items contribute (score-1), even items contribute (5-score), sum × 2.5. Only complete (10/10) responses are returned.';

-- =============================================================================
-- 10. Row Level Security
--     Anon writes are allowed for the analytics table only. Reads are gated
--     to authenticated researchers (you, in Supabase Studio).
-- =============================================================================
alter table users          enable row level security;
alter table screen_views   enable row level security;
alter table quiz_attempts  enable row level security;
alter table quiz_answers   enable row level security;
alter table events         enable row level security;
alter table sus_responses  enable row level security;

-- Anon can insert their own data (no read access from the client) -------------
create policy "anon insert users"         on users         for insert to anon with check (true);
create policy "anon insert screen_views"  on screen_views  for insert to anon with check (true);
create policy "anon insert quiz_attempts" on quiz_attempts for insert to anon with check (true);
create policy "anon insert quiz_answers"  on quiz_answers  for insert to anon with check (true);
create policy "anon insert events"        on events        for insert to anon with check (true);
create policy "anon insert sus_responses" on sus_responses for insert to anon with check (true);

-- Authenticated (the researcher) can read everything --------------------------
create policy "auth read users"         on users         for select to authenticated using (true);
create policy "auth read screen_views"  on screen_views  for select to authenticated using (true);
create policy "auth read quiz_attempts" on quiz_attempts for select to authenticated using (true);
create policy "auth read quiz_answers"  on quiz_answers  for select to authenticated using (true);
create policy "auth read events"        on events        for select to authenticated using (true);
create policy "auth read sus_responses" on sus_responses for select to authenticated using (true);

-- =============================================================================
-- DONE. Next: paste your Supabase URL + anon key into .env.local.
-- =============================================================================
