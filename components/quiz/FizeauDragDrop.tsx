'use client';

import { useEffect, useRef, useState } from 'react';
import { trackQuizAnswer } from '@/lib/analytics';

/**
 * FizeauDragDrop — Q7 from textbook page 145.
 *
 * Student is shown the formula c = 4·N·n·l and a bank of value chips
 * (some correct, some distractors). They drag the right values into the
 * three slots. After all three slots are filled, the result is computed
 * and validated against the speed of light (~3 × 10⁸ m/s).
 *
 * Pedagogy: this tests TRANSFER (recognise which value plays which role)
 * not just retention. The distractor chips with similar magnitudes prevent
 * pattern-matching by sheer number size.
 */

type Slot = 'N' | 'n' | 'l';

type Chip = {
  id: string;
  value: number;
  unit: string;
  correctSlot: Slot | null; // null = distractor
};

const QUESTION_ID = 'fizeau_q7';

const CHIPS: Chip[] = [
  { id: 'N720',      value: 720,    unit: 'шүд',     correctSlot: 'N' },
  { id: 'n12_6',     value: 12.6,   unit: 'эрг/с',   correctSlot: 'n' },
  { id: 'l8633',     value: 8633,   unit: 'м',       correctSlot: 'l' },
  // Distractors:
  { id: 'd_360',     value: 360,    unit: 'шүд',     correctSlot: null },
  { id: 'd_25',      value: 25,     unit: 'эрг/с',   correctSlot: null },
  { id: 'd_1000',    value: 1000,   unit: 'м',       correctSlot: null },
];

type Props = {
  onSubmit?: (args: { is_correct: boolean; time_to_answer_ms: number }) => void;
};

export function FizeauDragDrop({ onSubmit }: Props) {
  const [filled, setFilled] = useState<Record<Slot, Chip | null>>({
    N: null,
    n: null,
    l: null,
  });
  const [verdict, setVerdict] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const startedAt = useRef<number>(performance.now());

  const allFilled = Boolean(filled.N && filled.n && filled.l);
  const usedChipIds = new Set(
    [filled.N, filled.n, filled.l].filter(Boolean).map((c) => c!.id),
  );

  /** When student taps a chip from the bank, place it in the first empty slot
   *  that this chip is *meant* for (correctSlot), or the first empty slot
   *  if it's a distractor. Tap behaviour is keyboard- and touch-friendly. */
  const placeChip = (chip: Chip) => {
    if (usedChipIds.has(chip.id)) return;
    const target: Slot | undefined =
      chip.correctSlot && !filled[chip.correctSlot]
        ? chip.correctSlot
        : (['N', 'n', 'l'] as Slot[]).find((s) => !filled[s]);
    if (!target) return;
    setFilled((p) => ({ ...p, [target]: chip }));
    setVerdict('idle');
  };

  /** Tap a filled slot to clear it and return its chip to the bank. */
  const clearSlot = (slot: Slot) => {
    setFilled((p) => ({ ...p, [slot]: null }));
    setVerdict('idle');
  };

  const check = () => {
    if (!allFilled) return;
    const isCorrect =
      filled.N!.correctSlot === 'N' &&
      filled.n!.correctSlot === 'n' &&
      filled.l!.correctSlot === 'l';
    const elapsed = Math.round(performance.now() - startedAt.current);
    setVerdict(isCorrect ? 'correct' : 'wrong');
    trackQuizAnswer({
      question_id: QUESTION_ID,
      selected_option: `${filled.N!.id}|${filled.n!.id}|${filled.l!.id}`,
      is_correct: isCorrect,
      time_to_answer_ms: elapsed,
    });
    onSubmit?.({ is_correct: isCorrect, time_to_answer_ms: elapsed });
  };

  // Computed result (only meaningful when correct chips are placed; we display always
  // once all slots are filled, so the student can see WHY a wrong arrangement is wrong)
  const c =
    filled.N && filled.n && filled.l
      ? 4 * filled.N.value * filled.n.value * filled.l.value
      : null;

  return (
    <div className="rounded-card bg-paper p-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
        Сорилт · Хуудас 145 · Асуулт 7
      </p>
      <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
        Физогийн туршилт
      </h2>
      <p className="mt-2 text-sm text-ink-700">
        Физогийн дугуй <strong>N = 720</strong> шүдтэй,{' '}
        <strong>n = 12.6</strong> эргэлт/с-ээр эргэдэг. Гэрэл нийт{' '}
        <strong>l = 8633 м</strong> явж эргэн ирдэг. Доорх томьёонд утгуудыг
        зөв оруулж гэрлийн хурдыг ол.
      </p>

      {/* Formula with slots */}
      <div className="mt-5 flex items-center justify-center gap-2 rounded-card bg-brand-50 px-3 py-5 font-display text-xl font-extrabold text-ink-900">
        <span>c = 4 ·</span>
        <Slot label="N" chip={filled.N} onClear={() => clearSlot('N')} />
        <span>·</span>
        <Slot label="n" chip={filled.n} onClear={() => clearSlot('n')} />
        <span>·</span>
        <Slot label="l" chip={filled.l} onClear={() => clearSlot('l')} />
      </div>

      {/* Chip bank */}
      <div className="mt-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
          Утга
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CHIPS.map((chip) => {
            const used = usedChipIds.has(chip.id);
            return (
              <button
                key={chip.id}
                onClick={() => placeChip(chip)}
                disabled={used}
                className={`rounded-pill px-4 py-2 font-mono text-sm font-semibold transition-all ${
                  used
                    ? 'bg-ink-300/40 text-ink-500 line-through'
                    : 'bg-brand-100 text-ink-900 active:scale-95'
                }`}
              >
                {chip.value} {chip.unit}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result preview / verdict */}
      {allFilled && (
        <div
          className={`mt-5 rounded-card p-4 ${
            verdict === 'correct'
              ? 'bg-success-bg'
              : verdict === 'wrong'
              ? 'bg-error-bg'
              : 'bg-brand-50'
          }`}
        >
          <p className="font-mono text-xs text-ink-700">
            c = 4 · {filled.N!.value} · {filled.n!.value} · {filled.l!.value} ={' '}
            <strong>{formatBig(c!)}</strong> м/с
          </p>
          {verdict === 'correct' && (
            <p className="mt-2 font-display text-base font-bold text-success-fg">
              Гайхалтай! Гэрлийн хурд ≈ 3 × 10⁸ м/с-тэй яг ойролцоо гарч байна.
            </p>
          )}
          {verdict === 'wrong' && (
            <p className="mt-2 font-display text-base font-bold text-error-fg">
              Утгууд нь зөв ч, харин аль үсэг ямар утгад харгалзахыг дахин шалга.
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={check}
        disabled={!allFilled || verdict !== 'idle'}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-pill bg-ink-900 font-display text-base font-semibold text-paper disabled:opacity-40"
      >
        Хариу шалгах
      </button>
    </div>
  );
}

/* ----------- subcomponents ----------- */

function Slot({
  label,
  chip,
  onClear,
}: {
  label: string;
  chip: Chip | null;
  onClear: () => void;
}) {
  if (chip) {
    return (
      <button
        onClick={onClear}
        className="rounded-pill bg-ink-900 px-3 py-1.5 font-mono text-base font-semibold text-paper"
        aria-label={`${label} устгах`}
      >
        {chip.value}
      </button>
    );
  }
  return (
    <span className="inline-flex h-8 min-w-[58px] items-center justify-center rounded-pill border-2 border-dashed border-ink-300 bg-paper px-3 font-mono text-sm text-ink-500">
      {label}
    </span>
  );
}

function formatBig(n: number): string {
  if (Math.abs(n) >= 1e8) return n.toExponential(2);
  return n.toLocaleString('mn-MN');
}
