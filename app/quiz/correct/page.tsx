'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, ArrowRight } from 'lucide-react';
import { getQuiz } from '@/lib/lessons';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  /quiz/correct — v4 top-level. Lesson context via ?lesson=&q=.
  On the last question routes to /lesson/[id]/complete (still per-lesson).
*/
export default function CorrectPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center" />}>
      <CorrectContent />
    </Suspense>
  );
}

function CorrectContent() {
  const search = useSearchParams();
  const lessonId = search.get('lesson') ?? 'reflection';
  const idx = Number(search.get('q') ?? '1');
  const items = getQuiz(lessonId);
  useTimeOnScreen(`quiz_correct:${lessonId}:${idx}`);

  const isLast = idx >= items.length;
  const nextHref = isLast
    ? `/lesson/${lessonId}/complete`
    : `/quiz?lesson=${lessonId}&q=${idx + 1}`;

  return (
    <main
      className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
      style={{ backgroundColor: 'rgb(var(--color-success-bg))' }}
    >
      <ConfettiBurst />
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success-fg text-paper">
        <Check size={42} strokeWidth={3} />
      </div>
      <h1 className="mt-6 font-display text-3xl font-extrabold text-success-fg">
        Зөв!
      </h1>
      <p className="mt-2 max-w-[280px] text-sm text-ink-700">
        Сайн байна. Дараагийн асуулт руу үргэлжлүүлье.
      </p>

      <Link
        href={nextHref}
        onClick={() =>
          track('cta_tap', {
            surface: 'quiz_correct',
            label: isLast ? 'finish' : 'next',
            lesson: lessonId,
            q: idx,
          })
        }
        className="mt-10 flex h-12 w-full max-w-[320px] items-center justify-between rounded-pill bg-success-fg px-5 font-display text-base font-semibold text-paper"
      >
        <span>{isLast ? 'Хичээлийг дуусгах' : 'Дараагийн асуулт'}</span>
        <ArrowRight size={18} strokeWidth={2.2} />
      </Link>
    </main>
  );
}

function ConfettiBurst() {
  const dots = [
    { x: 12, y: 18, c: '#F4D63B' },
    { x: 88, y: 14, c: '#16A34A' },
    { x: 22, y: 78, c: '#2563EB' },
    { x: 80, y: 82, c: '#F97316' },
    { x: 50, y: 8, c: '#DC2626' },
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className="pointer-events-none absolute h-full max-h-[420px] w-full max-w-[320px] opacity-60"
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={1.6} fill={d.c} />
      ))}
    </svg>
  );
}
