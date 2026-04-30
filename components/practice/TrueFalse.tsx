'use client';

import { useRef, useState } from 'react';
import { MascotBubble } from '@/components/MascotBubble';
import { track } from '@/lib/analytics';
import type { DrillStats } from './types';

/*
  Tinder-flavoured Тийм/Үгүй drill. Statements come in one at a time.
  The wrong button shakes and the Mascot bubble surfaces; once the
  student picks the correct side, advance. After all statements are
  answered, onComplete fires.
*/
type Statement = { text_mn: string; correct: boolean };

type Props = {
  drillId: string;
  statements: Statement[];
  mascotError: string;
  onComplete: (stats: DrillStats) => void;
};

export function TrueFalse({ drillId, statements, mascotError, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [shake, setShake] = useState<'yes' | 'no' | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);

  const startedAt = useRef<number>(performance.now());
  const correctRef = useRef(0);
  const wrongRef = useRef(0);

  const stmt = statements[idx];

  const answer = (chosen: boolean) => {
    if (chosen === stmt.correct) {
      correctRef.current += 1;
      track('practice_pair_correct', { drill: drillId, stmt: idx });
      const next = idx + 1;
      if (next >= statements.length) {
        track('practice_complete', { drill: drillId, kind: 'true_false' });
        const stats: DrillStats = {
          correct: correctRef.current,
          wrong: wrongRef.current,
          durationMs: Math.round(performance.now() - startedAt.current),
        };
        setTimeout(() => onComplete(stats), 250);
      } else {
        setIdx(next);
        setErrorVisible(false);
      }
    } else {
      setShake(chosen ? 'yes' : 'no');
      setErrorVisible(true);
      wrongRef.current += 1;
      track('practice_pair_wrong', { drill: drillId, stmt: idx });
      window.setTimeout(() => setShake(null), 400);
      window.setTimeout(() => setErrorVisible(false), 2800);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[140px] items-center rounded-card border border-ink-300/60 bg-paper p-5">
        <p className="text-base leading-relaxed text-ink-900">{stmt.text_mn}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => answer(false)}
          className={`flex h-14 items-center justify-center rounded-pill border-2 border-ink-300/70 bg-paper font-display text-base font-semibold text-ink-900 ${
            shake === 'no' ? 'animate-shake' : ''
          }`}
        >
          ✗ Үгүй
        </button>
        <button
          type="button"
          onClick={() => answer(true)}
          className={`flex h-14 items-center justify-center rounded-pill border-2 border-ink-300/70 bg-paper font-display text-base font-semibold text-ink-900 ${
            shake === 'yes' ? 'animate-shake' : ''
          }`}
        >
          ✓ Тийм
        </button>
      </div>

      <p className="text-center font-mono text-[11px] text-ink-500">
        {idx + 1} / {statements.length}
      </p>

      <MascotBubble visible={errorVisible} message={mascotError} />
    </div>
  );
}
