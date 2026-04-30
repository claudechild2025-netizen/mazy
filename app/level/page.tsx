'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { track, useTimeOnScreen, getUserId } from '@/lib/analytics';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/*
  03 · Level Pick (/level)

  Three knowledge cards + three time-goal pills. Selected state: blue border
  + blue check chip. Black pill CTA "Эхлэх" → /home.

  // TODO(dw): Persist selection to Supabase users.knowledge_level + daily_goal_min
  // (see supabase/schema_v2_patch.sql). For the 3-day test, selection only
  // drives the analytics event — Home renders the same regardless.
*/

const LEVELS = [
  {
    key: 'novice',
    title: 'Шинэхэн',
    blurb: 'Гэрлийн физикийг бараг үзээгүй.',
  },
  {
    key: 'some',
    title: 'Багавтар',
    blurb: 'Толь, ойлтыг анги дотор сонссон.',
  },
  {
    key: 'confident',
    title: 'Итгэлтэй',
    blurb: 'Снелл, призм, линзийг таньдаг.',
  },
] as const;

const GOALS = [3, 5, 10];

export default function LevelPage() {
  const router = useRouter();
  const [level, setLevel] = useState<(typeof LEVELS)[number]['key']>('novice');
  const [goal, setGoal] = useState<number>(5);
  useTimeOnScreen('level');

  const handleStart = () => {
    track('cta_tap', { surface: 'level', label: 'start', level, goal });
    if (typeof window !== 'undefined') {
      // First-launch gate. Home reads this to skip the redirect on return visits.
      window.localStorage.setItem('mzl_level_set', '1');
      window.localStorage.setItem('mzl_level', level);
      window.localStorage.setItem('mzl_goal_min', String(goal));
      
      if (isSupabaseConfigured) {
        const uid = getUserId();
        supabase.from('users').update({
          knowledge_level: level,
          daily_goal_min: goal
        }).eq('client_uid', uid).then(({ error }) => {
          if (error) console.error('Supabase Error:', error);
        });
      }
    }
    router.push('/');
  };

  return (
    <main className="flex flex-1 flex-col px-6 pt-12 pb-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
        03 · ТҮВШИН
      </p>
      <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight text-ink-900">
        Чи юу мэдэх вэ?
      </h1>
      <p className="mt-1 text-sm text-ink-700">
        Тохирсон түвшнөөр эхэлье.
      </p>

      <div className="mt-6 space-y-3">
        {LEVELS.map((l) => {
          const selected = level === l.key;
          return (
            <button
              key={l.key}
              type="button"
              onClick={() => {
                setLevel(l.key);
                track('cta_tap', { surface: 'level', label: 'level', value: l.key });
              }}
              className={
                selected
                  ? 'flex w-full items-center justify-between rounded-card border-2 border-info-fg bg-info-bg/30 px-4 py-3 text-left'
                  : 'flex w-full items-center justify-between rounded-card border border-ink-300/70 bg-paper px-4 py-3 text-left'
              }
            >
              <div>
                <p className="font-display text-base font-bold text-ink-900">
                  {l.title}
                </p>
                <p className="text-xs text-ink-700">{l.blurb}</p>
              </div>
              <span
                className={
                  selected
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-info-fg text-paper'
                    : 'h-5 w-5 rounded-full border-2 border-ink-300'
                }
              >
                {selected && <Check size={16} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-base font-bold text-ink-900">
        Өдрийн зорилго
      </h2>
      <p className="text-xs text-ink-500">Хэдэн минут хичээллэх вэ?</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {GOALS.map((g) => {
          const selected = goal === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => {
                setGoal(g);
                track('cta_tap', {
                  surface: 'level',
                  label: 'goal',
                  value: g,
                });
              }}
              className={
                selected
                  ? 'flex h-12 items-center justify-center rounded-pill bg-info-bg font-display text-sm font-semibold text-info-fg ring-2 ring-info-fg'
                  : 'flex h-12 items-center justify-center rounded-pill border border-ink-300/70 font-display text-sm font-semibold text-ink-700'
              }
            >
              {g} мин
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleStart}
        className="mt-auto flex h-12 w-full items-center justify-center rounded-pill bg-ink-900 px-5 font-display text-base font-semibold text-paper"
      >
        Эхлэх
      </button>
    </main>
  );
}
