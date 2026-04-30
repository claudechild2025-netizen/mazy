'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { X, ArrowRight } from 'lucide-react';
import { getQuiz } from '@/lib/lessons';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  /quiz/wrong — v4 top-level. Soft tone, BLACK CTA per recovery framing
  ("Зүгээр, дахин үзье" — preserve verbatim).
*/
export default function WrongPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center" />}>
      <WrongContent />
    </Suspense>
  );
}

function WrongContent() {
  const search = useSearchParams();
  const lessonId = search.get('lesson') ?? 'reflection';
  const idx = Number(search.get('q') ?? '1');
  const items = getQuiz(lessonId);
  useTimeOnScreen(`quiz_wrong:${lessonId}:${idx}`);

  const isLast = idx >= items.length;
  const nextHref = isLast
    ? `/lesson/${lessonId}/complete`
    : `/quiz?lesson=${lessonId}&q=${idx + 1}`;

  // /wrong is only reachable from MCQ; guard the type narrowing.
  const current = items[idx - 1];
  const correctText =
    current?.kind === 'mcq'
      ? current.options.find((o) => o.key === current.correct_key)?.text_mn
      : undefined;

  return (
    <main
      className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
      style={{ backgroundColor: 'rgb(var(--color-error-bg))' }}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-error-fg text-paper">
        <X size={42} strokeWidth={3} />
      </div>
      <h1 className="mt-6 font-display text-3xl font-extrabold text-error-fg">
        Алдсан
      </h1>
      <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-ink-900">
        Зүгээр, дахин үзье. Алдах нь сурахын нэг хэсэг.
      </p>

      {correctText && (
        <div className="mt-5 w-full max-w-[320px] rounded-card bg-paper/70 px-4 py-3 text-left">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Зөв хариулт
          </p>
          <p className="mt-1 text-sm font-semibold text-ink-900">{correctText}</p>
        </div>
      )}

      <Link
        href={nextHref}
        onClick={() =>
          track('cta_tap', {
            surface: 'quiz_wrong',
            label: isLast ? 'finish' : 'next',
            lesson: lessonId,
            q: idx,
          })
        }
        className="mt-10 flex h-12 w-full max-w-[320px] items-center justify-between rounded-pill bg-ink-900 px-5 font-display text-base font-semibold text-paper"
      >
        <span>Үргэлжлүүлэх</span>
        <ArrowRight size={18} strokeWidth={2.2} />
      </Link>
    </main>
  );
}
