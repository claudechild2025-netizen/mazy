'use client';

import { useRef, useState } from 'react';
import { trackQuizAnswer } from '@/lib/analytics';

/**
 * MazaalaiRatioProblem — Q5 from textbook page 145.
 *
 * Setup: a Mazaalai bear (h₀ = 0.03 m = 3 cm tall) stands between a point
 * light source and a wall. Its shadow on the wall is hₛ = 0.15 m = 15 cm tall.
 *
 * Question: if the bear is 1 m from the light, how far is the bear from
 * the wall? (Answer: 4 m, by similar triangles.)
 *
 * Pedagogy: the visual is essential — the student must SEE that the
 * shadow is 5× the bear, not just compute 0.15 / 0.03. The similar-
 * triangles relationship is then visible: total light-to-wall distance
 * is 5× the light-to-bear distance, so bear-to-wall is 4× light-to-bear.
 */

const QUESTION_ID = 'mazaalai_q5';
const CORRECT = 4; // metres, from bear to wall

type Props = {
  onSubmit?: (args: { is_correct: boolean; time_to_answer_ms: number }) => void;
};

export function MazaalaiRatioProblem({ onSubmit }: Props) {
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState<'idle' | 'correct' | 'wrong' | 'close'>('idle');
  const startedAt = useRef<number>(performance.now());

  const check = () => {
    const num = parseFloat(answer.replace(',', '.'));
    if (Number.isNaN(num)) return;
    const elapsed = Math.round(performance.now() - startedAt.current);

    let v: typeof verdict;
    if (Math.abs(num - CORRECT) < 0.05) v = 'correct';
    else if (Math.abs(num - CORRECT) < 0.5) v = 'close';
    else v = 'wrong';

    setVerdict(v);
    trackQuizAnswer({
      question_id: QUESTION_ID,
      selected_option: answer,
      is_correct: v === 'correct',
      time_to_answer_ms: elapsed,
    });
    onSubmit?.({ is_correct: v === 'correct', time_to_answer_ms: elapsed });
  };

  return (
    <div className="rounded-card bg-paper p-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
        Сорилт · Хуудас 145 · Асуулт 5
      </p>
      <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
        Мазаалайн сүүдэр
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">
        Мазаалай баавгай <strong>3 см</strong> өндөртэй. Гэрлийн эх үүсвэр түүнээс{' '}
        <strong>1 м</strong> зайд байна. Хана дээр унасан сүүдэр нь{' '}
        <strong>15 см</strong> өндөртэй. Мазаалай ханаас хэдэн метр зайд байх вэ?
      </p>

      <svg
        viewBox="0 0 360 200"
        className="mt-4 w-full rounded-card bg-brand-50"
        role="img"
        aria-label="Гэрэл, баавгай, сүүдэр харуулсан зураг"
      >
        {/* Ground line */}
        <line x1={20} y1={170} x2={340} y2={170} stroke="#1A1A1A" strokeWidth={1.5} />

        {/* Light source */}
        <circle cx={50} cy={140} r={12} fill="#FCEDA0" stroke="#E8B400" strokeWidth={2} />
        <circle cx={50} cy={140} r={4} fill="#E8B400" />
        <text x={50} y={195} fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle" fill="#1A1A1A">
          ГЭРЭЛ
        </text>

        {/* Mazaalai bear silhouette — small at distance 1m from light */}
        <Bear x={140} groundY={170} height={28} />

        {/* Wall */}
        <line x1={320} y1={50} x2={320} y2={170} stroke="#1A1A1A" strokeWidth={3} />
        <text x={320} y={195} fontSize="9" fontFamily="ui-monospace, monospace" textAnchor="middle" fill="#1A1A1A">
          ХАНА
        </text>

        {/* Light rays grazing top and bottom of bear, extending to wall — define shadow */}
        <line x1={50} y1={140} x2={320} y2={50} stroke="#E8B400" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.7} />
        <line x1={50} y1={140} x2={320} y2={170} stroke="#E8B400" strokeWidth={0.8} opacity={0.4} />

        {/* Shadow on wall (rendered as a dark vertical band, 5× bear height) */}
        <rect x={316} y={50} width={4} height={120} fill="#1A1A1A" opacity={0.65} />

        {/* Bear height label (small arrow with 3 см) */}
        <text x={150} y={155} fontSize="9" fontFamily="ui-monospace, monospace" fill="#1A1A1A" fontWeight={600}>
          3 см
        </text>

        {/* Shadow height label */}
        <text x={295} y={115} fontSize="10" fontFamily="ui-monospace, monospace" fill="#1A1A1A" fontWeight={700} textAnchor="end">
          15 см
        </text>

        {/* Distance label: light-to-bear = 1 m */}
        <line x1={50} y1={185} x2={140} y2={185} stroke="#2563EB" strokeWidth={1} markerEnd="url(#arr)" markerStart="url(#arr)" />
        <text x={95} y={183} fontSize="9" textAnchor="middle" fontFamily="ui-monospace, monospace" fill="#2563EB" fontWeight={600}>
          1 м
        </text>

        {/* Unknown distance — bear-to-wall = ? */}
        <line x1={140} y1={185} x2={320} y2={185} stroke="#DC2626" strokeWidth={1} markerEnd="url(#arr)" markerStart="url(#arr)" strokeDasharray="3 3" />
        <text x={230} y={183} fontSize="10" textAnchor="middle" fontFamily="ui-monospace, monospace" fill="#DC2626" fontWeight={700}>
          ? м
        </text>

        <defs>
          <marker id="arr" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      {/* Hint chip — appears once a wrong/close answer is given */}
      {(verdict === 'close' || verdict === 'wrong') && (
        <div className="mt-3 rounded-card bg-info-bg p-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-info-fg">
            Зөвлөмж
          </p>
          <p className="mt-1 text-xs text-ink-700">
            Сүүдэр нь биеэс <strong>15 / 3 = 5 дахин</strong> том. Тиймээс гэрлээс
            хана хүртэлх нийт зай нь гэрлээс бие хүртэлх зайнаас{' '}
            <strong>5 дахин</strong> урт. Бие нь дунд хаана нь байна?
          </p>
        </div>
      )}

      {/* Numerical input */}
      <div className="mt-4 flex items-center gap-2 rounded-pill border-2 border-ink-300 bg-paper px-4 py-2 focus-within:border-info-fg">
        <input
          type="text"
          inputMode="decimal"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setVerdict('idle');
          }}
          placeholder="Хариугаа бич…"
          className="flex-1 bg-transparent font-display text-lg font-semibold text-ink-900 outline-none placeholder:text-ink-500 placeholder:font-normal placeholder:text-base"
        />
        <span className="font-mono text-sm text-ink-500">м</span>
      </div>

      {verdict === 'correct' && (
        <div className="mt-3 rounded-card bg-success-bg p-3">
          <p className="font-display text-base font-bold text-success-fg">Гайхалтай!</p>
          <p className="mt-1 text-xs text-ink-700">
            Сүүдэр 5 дахин том → нийт зай 5 м → бие ханаас{' '}
            <strong>5 − 1 = 4 м</strong> зайд байна.
          </p>
        </div>
      )}

      <button
        onClick={check}
        disabled={!answer || verdict === 'correct'}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-pill bg-ink-900 font-display text-base font-semibold text-paper disabled:opacity-40"
      >
        Хариу шалгах
      </button>
    </div>
  );
}

/* ------------- Mazaalai bear silhouette ------------- */

/**
 * Simple SVG silhouette of a Gobi bear, rendered upright on the ground line.
 * Not pretending to be photoreal — just enough to be recognisable as a bear.
 * AI editor: replace with a proper illustration when the brand mascot work is done.
 */
function Bear({ x, groundY, height }: { x: number; groundY: number; height: number }) {
  const w = height * 1.0;
  const top = groundY - height;
  return (
    <g>
      {/* Body */}
      <ellipse cx={x} cy={groundY - height * 0.35} rx={w * 0.55} ry={height * 0.4} fill="#5C4632" />
      {/* Head */}
      <circle cx={x + w * 0.15} cy={top + height * 0.25} r={height * 0.28} fill="#5C4632" />
      {/* Ears */}
      <circle cx={x - 1} cy={top + height * 0.05} r={height * 0.1} fill="#5C4632" />
      <circle cx={x + w * 0.3} cy={top + height * 0.05} r={height * 0.1} fill="#5C4632" />
      {/* Snout */}
      <ellipse cx={x + w * 0.32} cy={top + height * 0.32} rx={height * 0.12} ry={height * 0.08} fill="#8A6A4A" />
      {/* Legs */}
      <rect x={x - w * 0.3} y={groundY - height * 0.18} width={w * 0.18} height={height * 0.18} fill="#5C4632" />
      <rect x={x + w * 0.12} y={groundY - height * 0.18} width={w * 0.18} height={height * 0.18} fill="#5C4632" />
      {/* Eye */}
      <circle cx={x + w * 0.18} cy={top + height * 0.22} r={1.5} fill="#1A1A1A" />
    </g>
  );
}
