-- =============================================================================
-- Mazy v4 — Relax NOT NULL/FK constraints so the anonymous client can write
-- directly to users / screen_views / quiz_answers without first resolving
-- uuid foreign keys.
--
-- Run AFTER schema.sql + schema_v2_patch.sql + schema_v3_survey.sql.
-- Idempotent on re-run.
-- =============================================================================

-- 1. users — allow stub rows from analytics before /login captures grade -------
alter table users alter column grade drop not null;

-- 2. screen_views — accept client_uid + screen slug instead of uuid FKs --------
alter table screen_views alter column user_id   drop not null;
alter table screen_views alter column screen_id drop not null;
alter table screen_views add column if not exists client_uid  text;
alter table screen_views add column if not exists screen_slug text;
create index if not exists screen_views_client_uid_idx on screen_views(client_uid);

-- 3. quiz_answers — same: client_uid + question_key + lesson_id ---------------
alter table quiz_answers alter column attempt_id  drop not null;
alter table quiz_answers alter column question_id drop not null;
alter table quiz_answers add column if not exists client_uid  text;
alter table quiz_answers add column if not exists question_key text;
alter table quiz_answers add column if not exists lesson_id    text;
create index if not exists quiz_answers_client_uid_idx on quiz_answers(client_uid);

-- =============================================================================
-- DONE.
-- =============================================================================
