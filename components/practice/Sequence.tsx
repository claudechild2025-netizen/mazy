'use client';

import { useMemo, useState } from 'react';
import { MascotBubble } from '@/components/MascotBubble';
import { track } from '@/lib/analytics';

/*
  Sequence-order drill. Steps are shuffled. Tapping in the correct order
  locks each step (green tick + cross-out). A wrong tap shakes the bad
  card and pops the Mascot bubble — the student keeps trying until the
  ordered list completes.
*/
type Props = {
  drillId: string;
  steps: string[];
  mascotError: string;
  onComplete: () => void;
};

function shuffle<T>(arr: T[], seed: string): T[] {
  const out = arr.slice();
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function Sequence({ drillId, steps, mascotError, onComplete }: Props) {
  const order = useMemo(() => shuffle(steps.map((_, i) => i), drillId), [steps, drillId]);
  const [done, setDone] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);

  const tap = (idx: number) => {
    if (done.includes(idx)) return;
    const expected = done.length;
    if (idx === expected) {
      const next = [...done, idx];
      setDone(next);
      track('practice_pair_correct', { drill: drillId, step: idx });
      if (next.length === steps.length) {
        track('practice_complete', { drill: drillId, kind: 'sequence' });
        setTimeout(onComplete, 350);
      }
    } else {
      setShake(idx);
      setErrorVisible(true);
      track('practice_pair_wrong', { drill: drillId, step: idx });
      window.setTimeout(() => setShake(null), 400);
      window.setTimeout(() => setErrorVisible(false), 2800);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {order.map((idx) => {
          const isDone = done.includes(idx);
          const doneOrder = isDone ? done.indexOf(idx) + 1 : null;
          const isShaking = shake === idx;
          return (
            <button
              key={`s-${idx}`}
              type="button"
              onClick={() => tap(idx)}
              disabled={isDone}
              className={[
                'flex w-full items-center gap-3 rounded-card border px-4 py-3 text-left text-sm transition-colors',
                isDone
                  ? 'border-success-fg/40 bg-success-bg/40 text-ink-700'
                  : 'border-ink-300/60 bg-paper text-ink-900',
                isShaking ? 'animate-shake' : '',
              ].join(' ')}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold ${
                  isDone ? 'bg-success-fg text-paper' : 'bg-brand-100 text-ink-900'
                }`}
              >
                {doneOrder ?? '·'}
              </span>
              <span className={isDone ? 'line-through' : ''}>{steps[idx]}</span>
            </button>
          );
        })}
      </div>

      <p className="text-center font-mono text-[11px] text-ink-500">
        {done.length} / {steps.length}
      </p>

      <MascotBubble visible={errorVisible} message={mascotError} />
    </div>
  );
}
