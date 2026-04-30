'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, ArrowRight } from 'lucide-react';
import { BottomTab } from '@/components/BottomTab';
import { StatTile } from '@/components/StatTile';
import { LessonCard } from '@/components/LessonCard';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  Home (/) — v4 entry per MAZY_FINAL_PROMPT §4.

  Per v4 routing flow: "/ (auto-redirect 1.6s) → /level" — only on the
  student's first launch. Once the level pick screen has stored the
  knowledge level + daily goal in localStorage we land on Home directly.

  First-launch detection key: `mzl_level_set` (Boolean). The lib/analytics
  uid `mzl_uid` is created by the analytics layer the first time `track()`
  fires, so we don't reuse it here as the gate signal.

  // TODO(dw): Replace hardcoded user/stats with Supabase fetch (see §10).
*/

// DEMO_STATS will remain hardcoded for now, but user info comes from localStorage.
const DEMO_STATS = { streak: 0, xp: 0, lessonsDone: 0 };

const PREVIEW_LESSONS = [
  { id: 'reflection', emoji: '🪞', title: 'Гэрлийн ойлт',     duration: 5, xp: 30 },
  { id: 'refraction', emoji: '💧', title: 'Гэрлийн хугарал',   duration: 7, xp: 40 },
  { id: 'prism',      emoji: '🌈', title: 'Призм ба өнгө',     duration: 6, xp: 35, locked: true },
];

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState('');
  const [userInitial, setUserInitial] = useState('');
  
  useTimeOnScreen('home');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedName = window.localStorage.getItem('mzl_user_name');
    if (!storedName) {
      router.replace('/login');
      return;
    }
    
    setUserName(storedName);
    setUserInitial(storedName.charAt(0).toUpperCase());

    const levelSet = window.localStorage.getItem('mzl_level_set');
    if (!levelSet) {
      const t = setTimeout(() => router.replace('/level'), 1600);
      return () => clearTimeout(t);
    }
    setReady(true);
    track('view', { surface: 'home' });
  }, [router]);

  // Render a soft splash while we decide whether to redirect — avoids the
  // jarring flash-of-Home-then-redirect on a true first launch.
  if (!ready) {
    return (
      <main className="bg-brand-gradient flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="font-display text-5xl font-extrabold tracking-tight text-ink-900">
          Mazy
        </div>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-700">
          Физик · Гэрэл
        </p>
      </main>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-5 pt-6 pb-6">
        {/* Greeting */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-300 font-display text-xl font-bold text-paper">
              {userInitial || 'С'}
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink-900">
                Сайн уу, {userName || 'Сурагч'}
              </p>
              <p className="font-mono text-xs text-ink-500">
                Түвшин 1
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            aria-label="Тохиргоо"
            onClick={() =>
              track('cta_tap', { surface: 'home', label: 'settings' })
            }
            className="flex h-10 w-10 items-center justify-center rounded-full"
          >
            <Settings size={22} className="text-ink-700" />
          </Link>
        </header>

        {/* Hero — next lesson */}
        <Link
          href="/lesson/reflection"
          onClick={() =>
            track('cta_tap', { surface: 'home', label: 'next_lesson' })
          }
          className="bg-brand-gradient block rounded-card p-5 shadow-hero"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-pill bg-paper/80 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-900">
              Дараагийн хичээл
            </span>
            <span className="rounded-pill bg-paper/80 px-3 py-1 font-mono text-xs font-medium text-ink-900">
              5 мин
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-4xl" aria-hidden>🪞</span>
            <h1 className="font-display text-3xl font-extrabold text-ink-900">
              Гэрлийн ойлт
            </h1>
          </div>
          <p className="mt-2 text-sm text-ink-700">Толинд тусах гэрэл</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-mono text-xs text-ink-700">⭐ +30 XP</span>
            <span className="font-mono text-xs text-ink-700">🟢 Хялбар</span>
          </div>
          <div className="mt-4 flex h-12 items-center justify-center gap-2 rounded-pill bg-ink-900 font-display text-base font-semibold text-paper">
            Хичээлийг эхлэх
            <ArrowRight size={18} strokeWidth={2.2} />
          </div>
        </Link>

        {/* Pastel quad-tile (3 of 4 — trophy lives on Progress) */}
        <div className="grid grid-cols-3 gap-3">
          <StatTile category="streak"  emoji="🔥" value={DEMO_STATS.streak}      label="Хоног" />
          <StatTile category="xp"      emoji="⭐" value={DEMO_STATS.xp}           label="Оноо" />
          <StatTile category="lessons" emoji="📚" value={DEMO_STATS.lessonsDone}  label="Хичээл" />
        </div>

        {/* Lessons preview */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900">
              Бүх хичээлүүд
            </h2>
            <Link
              href="/lessons"
              onClick={() =>
                track('cta_tap', { surface: 'home', label: 'see_all' })
              }
              className="font-display text-sm font-semibold text-info-fg"
            >
              Бүгдийг харах →
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {PREVIEW_LESSONS.map((l) => (
              <LessonCard
                key={l.id}
                id={l.id}
                emoji={l.emoji}
                title={l.title}
                duration={l.duration}
                xp={l.xp}
                locked={l.locked}
              />
            ))}
          </div>
        </section>
      </div>

      <BottomTab />
    </>
  );
}
