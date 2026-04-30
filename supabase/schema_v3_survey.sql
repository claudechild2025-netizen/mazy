-- =============================================================================
-- Mazy v3 — Schema patch for the post-session research survey (7 questions)
--
-- Run this AFTER schema.sql + schema_v2_patch.sql in Supabase Studio.
-- Idempotent on re-run.
-- =============================================================================

create table if not exists survey_responses (
  id              bigserial primary key,
  user_id_client  text not null,                    -- localStorage 'mzl_uid'
  answers         jsonb not null,                   -- {q1..q7} in one object
  submitted_at    timestamptz not null default now(),
  inserted_at     timestamptz not null default now()
);

create index if not exists survey_responses_user_idx
  on survey_responses(user_id_client, submitted_at desc);

-- RLS — anon insert, authenticated read (researcher) ---------------------------
alter table survey_responses enable row level security;

drop policy if exists "anon insert survey" on survey_responses;
create policy "anon insert survey"
  on survey_responses for insert to anon with check (true);

drop policy if exists "auth read survey" on survey_responses;
create policy "auth read survey"
  on survey_responses for select to authenticated using (true);

-- Helper view: per-question Likert means + total response count ---------------
create or replace view v_survey_likert_means as
select
  count(*)                                              as n_responses,
  avg((answers->>'q1_motion_graphic')::numeric)         as q1_motion_graphic,
  avg((answers->>'q2_visual_clarity')::numeric)         as q2_visual_clarity,
  avg((answers->>'q3_navigation')::numeric)             as q3_navigation,
  avg((answers->>'q4_color_palette')::numeric)          as q4_color_palette,
  avg((answers->>'q5_mascot_microlearning')::numeric)   as q5_mascot_microlearning
from survey_responses
where answers ? 'q1_motion_graphic';

comment on view v_survey_likert_means is
  'Per-question mean (1–5). 4+ indicates positive feedback.';

-- =============================================================================
-- DONE.
-- =============================================================================
