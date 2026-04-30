'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Clock, Star } from 'lucide-react';
import { BottomTab } from '@/components/BottomTab';
import { LESSONS, type Lesson } from '@/lib/lessons';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  05 · Lessons List (/lessons) — Tab 2

  Filter pills (Бүгд / Дуусаагүй / Дууссан / Хаалттай). 3 unlocked + 2 locked
  cards. Locked cards show reduced opacity and a lock icon.

  // TODO(dw): Replace LESSONS import with a Supabase fetch + a "lesson_progress"
  // join once persistence is wired.
*/

const FILTERS = [
  { key: 'all', label: 'Бүгд' },
  { key: 'todo', label: 'Дуусаагүй' },
  { key: 'done', label: 'Дууссан' },
  { key: 'locked', label: 'Хаалттай' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export default function LessonsPage() {
  const [filter, setFilter] = useState<FilterKey>('all');
  useTimeOnScreen('lessons');

  const lessons = LESSONS.filter((l) => {
    switch (filter) {
      case 'all':
        return true;
      case 'todo':
        return !l.locked && !l.done;
      case 'done':
        return l.done;
      case 'locked':
        return l.locked;
    }
  });

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-5 pt-8 pb-6">
        <header>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            05 · ХИЧЭЭЛ
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-900">
            Гэрэл — 1-р сэдэв
          </h1>
        </header>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setFilter(key);
                  track('cta_tap', { surface: 'lessons', label: 'filter', value: key });
                }}
                className={
                  active
                    ? 'h-9 shrink-0 rounded-pill bg-ink-900 px-4 font-display text-sm font-semibold text-paper'
                    : 'h-9 shrink-0 rounded-pill border border-ink-300/70 bg-paper px-4 font-display text-sm font-semibold text-ink-700'
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        <ul className="space-y-3">
          {lessons.map((l) => (
            <li key={l.id}>
              <LessonRow lesson={l} />
            </li>
          ))}
          {lessons.length === 0 && (
            <li className="rounded-card border border-dashed border-ink-300/70 px-4 py-10 text-center text-sm text-ink-500">
              Хичээл алга байна.
            </li>
          )}
        </ul>

        {/*
          Labs are openable as standalone explorations — no lesson completion
          gate (per INTERACTION_REVISION.md). Surfaced here so curious students
          can jump straight to manipulation.
        */}
        <section className="mt-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            ★ Лаборатори
          </p>
          <p className="mt-1 text-xs text-ink-500">
            Хичээлээс үл хамаарч шууд туршиж үзээрэй.
          </p>
          <ul className="mt-3 space-y-2">
            {LAB_SHORTCUTS.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/lab/${l.slug}`}
                  onClick={() =>
                    track('cta_tap', {
                      surface: 'lessons',
                      label: 'open_lab',
                      slug: l.slug,
                    })
                  }
                  className="flex items-center gap-3 rounded-card border border-ink-300/60 bg-paper p-3"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-xl"
                    aria-hidden
                  >
                    {l.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold text-ink-900">
                      {l.title}
                    </p>
                    <p className="text-xs text-ink-500">{l.blurb}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <BottomTab />
    </>
  );
}

const LAB_SHORTCUTS = [
  {
    slug: 'reflection',
    title: 'Гэрлийн ойлтын хууль',
    blurb: 'Туяаг чирж өнцгийг өөрчил.',
    emoji: '↩️',
  },
  {
    slug: 'shadow',
    title: 'Бүтэн ба хагас сүүдэр',
    blurb: 'Хоёр гэрэлтэй умбра, пенумбра.',
    emoji: '🌓',
  },
  {
    slug: 'spherical-mirror',
    title: 'Бөмбөлөг толь',
    blurb: 'Биеийг чирж дүрс үүсэхийг хар.',
    emoji: '🪞',
  },
];

function LessonRow({ lesson }: { lesson: Lesson }) {
  const inner = (
    <div
      className={
        lesson.locked
          ? 'flex items-center gap-3 rounded-card border border-ink-300/60 bg-paper p-3 opacity-60'
          : 'flex items-center gap-3 rounded-card border border-ink-300/60 bg-paper p-3'
      }
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-100">
        {lesson.locked ? (
          <Lock size={22} className="text-ink-700" strokeWidth={2} />
        ) : (
          <span className="font-display text-2xl font-extrabold text-ink-900">
            {lesson.title_mn.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-bold text-ink-900">
          {lesson.title_mn}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
          {lesson.blurb_mn}
        </p>
        <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-ink-700">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} strokeWidth={2} /> {lesson.minutes} мин
          </span>
          <span className="inline-flex items-center gap-1">
            <Star size={12} strokeWidth={2} className="text-brand-500" /> {lesson.xp} XP
          </span>
        </div>
      </div>
    </div>
  );

  if (lesson.locked) {
    return inner;
  }

  return (
    <Link
      href={`/lesson/${lesson.id}`}
      onClick={() =>
        track('cta_tap', {
          surface: 'lessons',
          label: 'open',
          lesson: lesson.id,
        })
      }
      className="block"
    >
      {inner}
    </Link>
  );
}
