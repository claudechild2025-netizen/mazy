'use client';

import { useState } from 'react';
import { useRouter, notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getLesson } from '@/lib/lessons';
import { getDistill } from '@/lib/distill';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  Phase 2 — Танилцах. Stepped takeaway cards. One card per screen, soft
  pulse on the icon, single CTA. Last card swaps the CTA for "Дасгал руу".
*/
export default function DistillPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const lesson = getLesson(id);
  const cards = getDistill(id);
  useTimeOnScreen(`lesson_distill:${id}`);

  const [step, setStep] = useState(0);

  if (!lesson) notFound();
  if (cards.length === 0) {
    // Lesson without distill data yet — bypass straight to practice.
    if (typeof window !== 'undefined') router.replace(`/lesson/${id}/practice`);
    return null;
  }

  const card = cards[step];
  const isLast = step === cards.length - 1;

  const next = () => {
    track('cta_tap', {
      surface: 'lesson_distill',
      label: 'next',
      lesson: id,
      card: card.id,
    });
    if (isLast) {
      router.push(`/lesson/${id}/practice`);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <main className="flex flex-1 flex-col px-5 pt-6 pb-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/lesson/${id}/lab`}
          aria-label="Буцах"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-300/70"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
          ТАНИЛЦАХ
        </p>
        <span className="w-10" />
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {cards.map((_, i) => (
          <span
            key={i}
            className={
              i < step
                ? 'h-1.5 w-6 rounded-full bg-success-fg'
                : i === step
                  ? 'h-1.5 w-6 rounded-full bg-ink-900'
                  : 'h-1.5 w-6 rounded-full bg-ink-300'
            }
          />
        ))}
      </div>

      <div className="mt-10 flex flex-1 flex-col items-center justify-center text-center">
        <span
          className="text-6xl animate-pulse-soft"
          aria-hidden
        >
          {card.icon}
        </span>
        <h1 className="mt-8 max-w-[320px] font-display text-2xl font-extrabold leading-snug text-ink-900">
          {card.headline_mn}
        </h1>
        {card.formula && (
          <p className="mt-4 rounded-card bg-info-bg px-4 py-2 font-mono text-base text-info-fg">
            {card.formula}
          </p>
        )}
        {card.detail_mn && (
          <p className="mt-4 max-w-[320px] text-sm leading-relaxed text-ink-700">
            {card.detail_mn}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={next}
        className="mt-auto flex h-12 w-full items-center justify-between rounded-pill bg-ink-900 px-5 font-display text-base font-semibold text-paper"
      >
        <span>{isLast ? 'Дасгал руу' : 'Дараах'}</span>
        <ArrowRight size={18} strokeWidth={2.2} />
      </button>
    </main>
  );
}
