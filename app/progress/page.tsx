'use client';

import { useState } from 'react';
import { Award } from 'lucide-react';
import { BottomTab } from '@/components/BottomTab';
import { StatTile } from '@/components/StatTile';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  /progress (Tab 3) — v4 layout per MAZY_FINAL_PROMPT §0:
    - Pastel quad-tile (streak, xp, lessons, trophy)
    - Line chart for weekly XP gain
    - Subject mastery card
    - Badge grid

  // TODO(dw): Replace mock series with real reads from screen_views +
  // quiz_attempts (PROJECT_PLAN_v2 §6).
*/

const FILTERS = [
  { key: '7d', label: '7 хоног' },
  { key: 'm',  label: 'Сар' },
  { key: 'all', label: 'Бүгд' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

const WEEKLY_XP = [10, 15, 20, 0, 25, 18, 22];
const DAY_LABELS = ['Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям', 'Ням'];

const BADGES = [
  { slug: 'mirror-master', emoji: '🪞', title: 'Толины мастер', earned: true },
  { slug: 'prism-master',  emoji: '🌈', title: 'Призмийн мастер' },
  { slug: 'lens-master',   emoji: '🔬', title: 'Линзний мастер' },
  { slug: 'streak-7',      emoji: '🔥', title: '7 хоног' },
  { slug: 'light-master',  emoji: '💡', title: 'Гэрлийн мастер' },
  { slug: 'streak-30',     emoji: '⚡', title: '30 хоног' },
];

export default function ProgressPage() {
  const [filter, setFilter] = useState<FilterKey>('7d');
  useTimeOnScreen('progress');

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-5 pt-6 pb-6">
        <header>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            АХИЦ
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">
            Чиний явц
          </h1>
        </header>

        {/* Pastel quad-tile */}
        <div className="grid grid-cols-2 gap-3">
          <StatTile category="streak"  emoji="🔥" value={1}   label="Хоног" />
          <StatTile category="xp"      emoji="⭐" value={30}  label="Оноо" />
          <StatTile category="lessons" emoji="📚" value={1}   label="Хичээл" />
          <StatTile category="trophy"  emoji="🏆" value={1}   label="Медаль" />
        </div>

        {/* Filter pills + line chart */}
        <section className="rounded-card border border-ink-300/60 bg-paper p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              7 хоногийн оноо
            </p>
            <div className="flex gap-1">
              {FILTERS.map(({ key, label }) => {
                const active = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setFilter(key);
                      track('cta_tap', {
                        surface: 'progress',
                        label: 'filter',
                        value: key,
                      });
                    }}
                    className={
                      active
                        ? 'h-7 rounded-pill bg-ink-900 px-3 font-display text-[11px] font-semibold text-paper'
                        : 'h-7 rounded-pill px-3 font-display text-[11px] font-semibold text-ink-500'
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <LineChart values={WEEKLY_XP} labels={DAY_LABELS} />
        </section>

        {/* Subject mastery */}
        <section className="rounded-card bg-brand-100 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-700">
            Гэрэл — Эзэмшил
          </p>
          <div className="mt-1 flex items-end justify-between">
            <p className="font-display text-4xl font-extrabold text-ink-900">42%</p>
            <span className="text-2xl" aria-hidden>⭐</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-paper/60">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: '42%' }}
            />
          </div>
        </section>

        {/* Badge grid */}
        <section>
          <div className="flex items-center gap-2">
            <Award size={16} strokeWidth={2.2} />
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
              Медалиуд
            </p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {BADGES.map((b) => (
              <div
                key={b.slug}
                className={
                  b.earned
                    ? 'flex flex-col items-center gap-1 rounded-card border border-ink-300/60 bg-paper p-3'
                    : 'flex flex-col items-center gap-1 rounded-card border border-ink-300/60 bg-paper p-3 opacity-40'
                }
              >
                <span className="text-3xl" aria-hidden>{b.emoji}</span>
                <p className="text-center font-display text-[11px] font-semibold leading-tight text-ink-900">
                  {b.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomTab />
    </>
  );
}

/* Inline SVG line chart — sufficient for the test without pulling Recharts. */
function LineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 300;
  const H = 120;
  const max = Math.max(...values, 1);
  const stepX = W / (values.length - 1);
  const points = values
    .map((v, i) => `${i * stepX},${H - (v / max) * (H - 24) - 10}`)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 16}`}
      className="mt-4 w-full"
      aria-label="7 хоногийн оноо"
    >
      <polyline
        points={points}
        fill="none"
        stroke="rgb(var(--color-info-fg))"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={i * stepX}
          cy={H - (v / max) * (H - 24) - 10}
          r={4}
          fill="rgb(var(--color-info-fg))"
        />
      ))}
      {labels.map((l, i) => (
        <text
          key={l}
          x={i * stepX}
          y={H + 12}
          fontSize="9"
          fontFamily="ui-monospace, monospace"
          fill="rgb(var(--color-ink-500))"
          textAnchor="middle"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}
