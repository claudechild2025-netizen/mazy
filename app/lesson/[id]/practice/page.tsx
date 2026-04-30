'use client';

import { useState } from 'react';
import { useRouter, notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getLesson } from '@/lib/lessons';
import { getPractice, type PracticeDrill } from '@/lib/practice';
import { TapMatch } from '@/components/practice/TapMatch';
import { TrueFalse } from '@/components/practice/TrueFalse';
import { Sequence } from '@/components/practice/Sequence';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  Phase 3 — Дасгал. Sequential drills. Each drill calls onComplete once
  the student has solved it; we then advance. After the last drill we
  push to /quiz to start Phase 4 assessment.
*/
export default function PracticePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const lesson = getLesson(id);
  const drills = getPractice(id);
  useTimeOnScreen(`lesson_practice:${id}`);

  const [idx, setIdx] = useState(0);

  if (!lesson) notFound();
  if (drills.length === 0) {
    // Lesson without practice drills yet — skip straight to assessment.
    if (typeof window !== 'undefined') router.replace(`/quiz?lesson=${id}&q=1`);
    return null;
  }

  const drill = drills[idx];
  const isLast = idx === drills.length - 1;

  const onComplete = () => {
    track('practice_drill_done', { lesson: id, drill: drill.id });
    if (isLast) {
      router.push(`/quiz?lesson=${id}&q=1`);
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <main className="flex flex-1 flex-col px-5 pt-6 pb-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/lesson/${id}/distill`}
          aria-label="Буцах"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-300/70"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
          ДАСГАЛ {idx + 1} / {drills.length}
        </p>
        <span className="w-10" />
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {drills.map((_, i) => (
          <span
            key={i}
            className={
              i < idx
                ? 'h-1.5 w-6 rounded-full bg-success-fg'
                : i === idx
                  ? 'h-1.5 w-6 rounded-full bg-ink-900'
                  : 'h-1.5 w-6 rounded-full bg-ink-300'
            }
          />
        ))}
      </div>

      <h1 className="mt-6 font-display text-lg font-bold leading-snug text-ink-900">
        {drill.title_mn}
      </h1>

      <div className="mt-5">
        <DrillBody key={drill.id} drill={drill} onComplete={onComplete} />
      </div>
    </main>
  );
}

function DrillBody({
  drill,
  onComplete,
}: {
  drill: PracticeDrill;
  onComplete: () => void;
}) {
  switch (drill.kind) {
    case 'tap_match':
      return (
        <TapMatch
          drillId={drill.id}
          pairs={drill.pairs}
          mascotError={drill.mascot_error_mn}
          onComplete={onComplete}
        />
      );
    case 'true_false':
      return (
        <TrueFalse
          drillId={drill.id}
          statements={drill.statements}
          mascotError={drill.mascot_error_mn}
          onComplete={onComplete}
        />
      );
    case 'sequence':
      return (
        <Sequence
          drillId={drill.id}
          steps={drill.steps}
          mascotError={drill.mascot_error_mn}
          onComplete={onComplete}
        />
      );
  }
}
