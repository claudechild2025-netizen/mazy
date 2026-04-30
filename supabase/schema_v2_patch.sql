-- =============================================================================
-- Mazy v2 — Schema patch for gamification (streaks, XP, badges)
--
-- Run this AFTER schema.sql in Supabase Studio → SQL Editor.
-- Idempotent on re-run: existing columns/tables are skipped.
-- =============================================================================

-- 1. Extend `users` with gamification + identity fields ----------------------
alter table users
  add column if not exists display_name    text,
  add column if not exists avatar_initial  text,
  add column if not exists daily_goal_min  int default 5,
  add column if not exists streak_days     int default 0,
  add column if not exists streak_last     date,
  add column if not exists xp_total        int default 0;

-- 2. Knowledge level (set on screen 03 Level Pick) ---------------------------
alter table users
  add column if not exists knowledge_level text
    check (knowledge_level in ('novice', 'some', 'confident'));

-- 3. Badges -----------------------------------------------------------------
create table if not exists badges (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title_mn        text not null,
  description_mn  text,
  icon_emoji      text,
  created_at      timestamptz not null default now()
);

create table if not exists user_badges (
  user_id   uuid not null references users(id) on delete cascade,
  badge_id  uuid not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- 4. Seed badges that the hi-fi references -----------------------------------
insert into badges (slug, title_mn, description_mn, icon_emoji) values
  ('mirror-master', 'Толины мастер', 'Гэрлийн ойлт хичээлийг 3/3 онооор дууссан', '🪞'),
  ('prism-master',  'Призмийн мастер', 'Призм ба дисперсийг ойлгосон', '🌈'),
  ('light-master',  'Гэрлийн мастер', 'Гэрэл сэдвийг 100% дууссан', '💡'),
  ('lens-master',   'Линзний мастер', 'Линз ба дүрсийг эзэмшсэн', '🔬'),
  ('streak-7',      '7 хоног',        '7 өдөр дараалан суралцсан', '🔥'),
  ('streak-30',     '30 хоног',       '30 өдөр дараалан суралцсан', '⚡')
on conflict (slug) do nothing;

-- 5. RLS for new tables ------------------------------------------------------
alter table badges      enable row level security;
alter table user_badges enable row level security;

-- Anyone can read the catalogue (it's public reference data)
drop policy if exists "anyone read badges" on badges;
create policy "anyone read badges" on badges for select to anon, authenticated using (true);

-- Users insert their own earned-badges; researchers read everything
drop policy if exists "anon insert user_badges" on user_badges;
create policy "anon insert user_badges" on user_badges for insert to anon with check (true);

drop policy if exists "auth read user_badges" on user_badges;
create policy "auth read user_badges" on user_badges for select to authenticated using (true);

-- 6. Helper view: leaderboard (per-user XP rank) ----------------------------
create or replace view v_xp_leaderboard as
select
  u.id            as user_id,
  u.display_name,
  u.grade,
  u.school_code,
  u.xp_total,
  u.streak_days,
  rank() over (order by u.xp_total desc) as xp_rank
from users u
where u.xp_total > 0;

comment on view v_xp_leaderboard is
  'Read-only ranked leaderboard. Useful for cohort-level analytics in the thesis.';

-- =============================================================================
-- DONE.
-- =============================================================================
