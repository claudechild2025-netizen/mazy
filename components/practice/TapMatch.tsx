'use client';

import { useMemo, useState } from 'react';
import { MascotBubble } from '@/components/MascotBubble';
import { track } from '@/lib/analytics';

/*
  Tap-to-pair drill. Two columns. Tap a left chip to select, then tap a
  right chip — if it matches, both chips lock with a green tick. Wrong
  pairings shake and surface the Mascot bubble, but the student stays on
  screen and just keeps trying.
*/
type Pair = { left: string; right: string };

type Props = {
  drillId: string;
  pairs: Pair[];
  mascotError: string;
  onComplete: () => void;
};

function shuffle<T>(arr: T[], seed: string): T[] {
  // Stable shuffle keyed by drillId so re-renders don't re-shuffle.
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

export function TapMatch({ drillId, pairs, mascotError, onComplete }: Props) {
  const lefts = useMemo(() => shuffle(pairs.map((_, i) => i), drillId + 'L'), [pairs, drillId]);
  const rights = useMemo(() => shuffle(pairs.map((_, i) => i), drillId + 'R'), [pairs, drillId]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState<{ l: number | null; r: number | null }>({ l: null, r: null });
  const [errorVisible, setErrorVisible] = useState(false);

  const tapLeft = (idx: number) => {
    if (matched.has(idx)) return;
    setSelectedLeft(idx);
  };

  const tapRight = (idx: number) => {
    if (matched.has(idx) || selectedLeft === null) return;
    if (selectedLeft === idx) {
      const next = new Set(matched);
      next.add(idx);
      setMatched(next);
      setSelectedLeft(null);
      track('practice_pair_correct', { drill: drillId });
      if (next.size === pairs.length) {
        track('practice_complete', { drill: drillId, kind: 'tap_match' });
        setTimeout(onComplete, 350);
      }
    } else {
      setShake({ l: selectedLeft, r: idx });
      setErrorVisible(true);
      track('practice_pair_wrong', { drill: drillId });
      window.setTimeout(() => setShake({ l: null, r: null }), 400);
      window.setTimeout(() => setErrorVisible(false), 2800);
      setSelectedLeft(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {lefts.map((idx) => {
            const isMatched = matched.has(idx);
            const isSelected = selectedLeft === idx;
            const isShaking = shake.l === idx;
            return (
              <button
                key={`l-${idx}`}
                type="button"
                onClick={() => tapLeft(idx)}
                disabled={isMatched}
                className={[
                  'w-full rounded-card border px-3 py-3 text-left text-sm transition-colors',
                  isMatched
                    ? 'border-success-fg/40 bg-success-bg/40 text-ink-700 line-through'
                    : isSelected
                      ? 'border-info-fg bg-info-bg text-ink-900'
                      : 'border-ink-300/60 bg-paper text-ink-900',
                  isShaking ? 'animate-shake' : '',
                ].join(' ')}
              >
                {pairs[idx].left}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {rights.map((idx) => {
            const isMatched = matched.has(idx);
            const isShaking = shake.r === idx;
            return (
              <button
                key={`r-${idx}`}
                type="button"
                onClick={() => tapRight(idx)}
                disabled={isMatched}
                className={[
                  'w-full rounded-card border px-3 py-3 text-left text-sm transition-colors',
                  isMatched
                    ? 'border-success-fg/40 bg-success-bg/40 text-ink-700 line-through'
                    : 'border-ink-300/60 bg-paper text-ink-900',
                  isShaking ? 'animate-shake' : '',
                ].join(' ')}
              >
                {pairs[idx].right}
              </button>
            );
          })}
        </div>
      </div>

      <MascotBubble visible={errorVisible} message={mascotError} />
    </div>
  );
}
