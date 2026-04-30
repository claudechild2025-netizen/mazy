'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Timer } from 'lucide-react';
import { FizeauDragDrop } from '@/components/quiz/FizeauDragDrop';
import { MazaalaiRatioProblem } from '@/components/quiz/MazaalaiRatioProblem';
import { getQuiz, type McqItem } from '@/lib/lessons';
import { track, trackQuizAnswer, useTimeOnScreen } from '@/lib/analytics';

/*
  /quiz — v4 top-level quiz route. Lesson context is passed via search params:
    /quiz?lesson=reflection&q=1
  This replaces v3's /lesson/[id]/quiz route. Other behavior carries over:
  the dispatcher renders MCQ inline (routes to /quiz/correct or /quiz/wrong)
  or the seed quiz components (FizeauDragDrop, MazaalaiRatioProblem) with
  inline verdict + manual "Дараах" button (no auto-advance).

  Top-level routes that read useSearchParams must be Suspense-wrapped; the
  default export below provides that boundary.
*/
export default function QuizPage() {
  return (
    <Suspense fallback={<QuizFallback />}>
      <QuizContent />
    </Suspense>
  );
}

function QuizFallback() {
  return (
    <main className="flex flex-1 items-center justify-center p-6 text-sm text-ink-500">
      Ачаалж байна…
    </main>
  );
}

function QuizContent() {
  const router = useRouter();
  const search = useSearchParams();
  const lessonId = search.get('lesson') ?? 'reflection';
  const items = getQuiz(lessonId);
  const idxParam = Number(search.get('q') ?? '1');
  const idx = Math.min(
    Math.max(idxParam - 1, 0),
    Math.max(items.length - 1, 0),
  );
  const item = items[idx];

  const [selected, setSelected] = useState<string | null>(null);
  const [startedAt] = useState<number>(() =>
    typeof window === 'undefined' ? 0 : performance.now(),
  );
  const [seedResult, setSeedResult] = useState<{
    is_correct: boolean;
    time_to_answer_ms: number;
  } | null>(null);

  useTimeOnScreen(`quiz:${lessonId}:${idxParam}`);

  useEffect(() => {
    setSelected(null);
    setSeedResult(null);
  }, [idx]);

  if (!item) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 text-sm text-ink-500">
        Энэ хичээлийн тест бэлэн биш байна.
      </main>
    );
  }

  const persistResult = (isCorrect: boolean) => {
    if (typeof window === 'undefined') return;
    const key = `quiz:${lessonId}`;
    const stateRaw = window.sessionStorage.getItem(key);
    const state = stateRaw
      ? JSON.parse(stateRaw)
      : { score: 0, answered: 0 };
    state.answered = idx + 1;
    if (isCorrect) state.score = (state.score ?? 0) + 1;
    state.total = items.length;
    window.sessionStorage.setItem(key, JSON.stringify(state));
  };

  const submitMcq = () => {
    if (!selected || item.kind !== 'mcq') return;
    const isCorrect = selected === item.correct_key;
    const elapsed = Math.round(performance.now() - startedAt);

    trackQuizAnswer({
      question_id: item.id,
      selected_option: selected,
      is_correct: isCorrect,
      time_to_answer_ms: elapsed,
    });
    persistResult(isCorrect);

    router.push(
      isCorrect
        ? `/quiz/correct?lesson=${lessonId}&q=${idx + 1}`
        : `/quiz/wrong?lesson=${lessonId}&q=${idx + 1}`,
    );
  };

  const handleSeedSubmit = (args: {
    is_correct: boolean;
    time_to_answer_ms: number;
  }) => {
    persistResult(args.is_correct);
    setSeedResult(args);
  };

  const proceedAfterSeed = () => {
    const isLast = idx + 1 >= items.length;
    if (isLast) {
      router.push(`/lesson/${lessonId}/complete`);
    } else {
      router.push(`/quiz?lesson=${lessonId}&q=${idx + 2}`);
    }
  };

  return (
    <main className="flex flex-1 flex-col px-5 pt-6 pb-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Буцах"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-300/70"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
          АСУУЛТ {idx + 1}/{items.length}
        </p>
        <span className="inline-flex h-9 items-center gap-1 rounded-pill border border-ink-300/70 bg-paper px-3 font-mono text-[11px] text-ink-700">
          <Timer size={12} strokeWidth={2} /> 0:30
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-300/40">
        <div
          className="h-full rounded-full bg-success-fg transition-all"
          style={{ width: `${((idx + 1) / items.length) * 100}%` }}
        />
      </div>

      {item.kind === 'mcq' ? (
        <McqBody
          item={item}
          selected={selected}
          onSelect={(k) => {
            setSelected(k);
            track('cta_tap', {
              surface: 'quiz',
              label: 'option',
              question: item.id,
              option: k,
            });
          }}
          onSubmit={submitMcq}
        />
      ) : (
        <SeedBody kind={item.kind} onSubmit={handleSeedSubmit} />
      )}

      {item.kind !== 'mcq' && seedResult && (
        <button
          type="button"
          onClick={proceedAfterSeed}
          className="mt-4 flex h-12 w-full items-center justify-between rounded-pill bg-ink-900 px-5 font-display text-base font-semibold text-paper"
        >
          <span>
            {idx + 1 >= items.length ? 'Хичээлийг дуусгах' : 'Дараах'}
          </span>
          <ArrowRight size={18} strokeWidth={2.2} />
        </button>
      )}
    </main>
  );
}

function McqBody({
  item,
  selected,
  onSelect,
  onSubmit,
}: {
  item: McqItem;
  selected: string | null;
  onSelect: (k: string) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <h1 className="mt-6 font-display text-xl font-extrabold leading-snug text-ink-900">
        {item.prompt_mn}
      </h1>

      <div className="mt-5 space-y-2.5">
        {item.options.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
              className={
                isSelected
                  ? 'flex w-full items-center gap-3 rounded-card border-2 border-info-fg bg-info-bg/30 px-4 py-3 text-left'
                  : 'flex w-full items-center gap-3 rounded-card border border-ink-300/70 bg-paper px-4 py-3 text-left'
              }
            >
              <span
                className={
                  isSelected
                    ? 'flex h-6 w-6 items-center justify-center rounded-full border-2 border-info-fg'
                    : 'h-6 w-6 rounded-full border-2 border-ink-300'
                }
              >
                {isSelected && (
                  <span className="h-2.5 w-2.5 rounded-full bg-info-fg" />
                )}
              </span>
              <span className="text-sm font-semibold text-ink-900">
                {opt.text_mn}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={onSubmit}
        className={
          selected
            ? 'mt-auto flex h-12 w-full items-center justify-between rounded-pill bg-ink-900 px-5 font-display text-base font-semibold text-paper'
            : 'mt-auto flex h-12 w-full items-center justify-between rounded-pill bg-ink-300 px-5 font-display text-base font-semibold text-paper'
        }
      >
        <span>Үргэлжлүүлэх</span>
        <ArrowRight size={18} strokeWidth={2.2} />
      </button>
    </>
  );
}

function SeedBody({
  kind,
  onSubmit,
}: {
  kind: 'dragdrop_fizeau' | 'ratio_mazaalai';
  onSubmit: (args: { is_correct: boolean; time_to_answer_ms: number }) => void;
}) {
  return (
    <div className="mt-5">
      {kind === 'dragdrop_fizeau' ? (
        <FizeauDragDrop onSubmit={onSubmit} />
      ) : (
        <MazaalaiRatioProblem onSubmit={onSubmit} />
      )}
    </div>
  );
}
