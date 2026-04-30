'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { DragHint } from './DragHint';

/**
 * SphericalMirrorLab — concave/convex spherical mirror with a draggable object.
 * Demonstrates the thin-mirror equation 1/a + 1/b = 1/f and how image type
 * (real/virtual, inverted/upright, magnified/diminished) depends on object distance.
 *
 * Textbook reference: pages 151–152.
 *
 * Sign convention (standard introductory physics, Mongolian curriculum):
 *   - a > 0: object distance from mirror (always positive in normal use)
 *   - f > 0 for concave, f < 0 for convex
 *   - b > 0 means real image on the same side as the object (in front of mirror)
 *   - b < 0 means virtual image behind the mirror (upright)
 *   - magnification m = -b/a; |m| > 1 magnified, m < 0 inverted.
 */
type Props = {
  surface?: string;
  onMastery?: () => void;
};

const W = 360;
const H = 220;
const AXIS_Y = H / 2;
const MIRROR_X = W - 50;
const F_DIST = 70;          // |f| in canvas units
const MIN_A = 18;
const MAX_A = 280;
const HANDLE_R = 16;

type Mode = 'concave' | 'convex';

export function SphericalMirrorLab({ surface = 'lab_mirror', onMastery }: Props) {
  const [mode, setMode] = useState<Mode>('concave');
  const [a, setA] = useState(140);              // object distance in canvas units
  const objectHeight = 50;                       // arrow length

  const dragging = useRef<boolean>(false);
  const seenRegions = useRef<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);

  const f = mode === 'concave' ? F_DIST : -F_DIST;
  // Thin-mirror equation: 1/a + 1/b = 1/f  =>  b = af / (a - f)
  const b = (a * f) / (a - f);
  const m = -b / a;                              // magnification (signed)

  const isReal = b > 0;
  const isInverted = m < 0;
  const imageHeight = m * objectHeight;          // signed; negative = inverted

  // Mastery: student has visited at least 3 distinct regions
  // (a < |f|, |f| < a < 2|f|, a > 2|f|)
  useEffect(() => {
    const af = Math.abs(f);
    const region = a < af ? 'A' : a < 2 * af ? 'B' : 'C';
    seenRegions.current.add(`${mode}_${region}`);
    if (seenRegions.current.size >= 4) {
      track('lab_mastery', { surface });
      onMastery?.();
    }
  }, [a, mode, f, surface, onMastery]);

  /* --------- drag --------- */

  const onPointerDown = (e: React.PointerEvent<SVGGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    track('lab_drag_start', { surface, mode });
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const newA = Math.max(MIN_A, Math.min(MAX_A, MIRROR_X - x));
    setA(Math.round(newA));
  };

  const onPointerUp = () => {
    if (dragging.current) {
      track('lab_drag_end', { surface, mode, final_a: a });
      dragging.current = false;
    }
  };

  /* --------- positions --------- */

  const objX = MIRROR_X - a;
  const imgX = MIRROR_X - b;
  // Clamp the image rendering so a virtual image doesn't fly off screen
  const imgRendered = Math.max(MIRROR_X - 400, Math.min(W + 200, imgX));

  return (
    <div className="rounded-card bg-brand-100 p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-700">
        Интерактив лаб · Хуудас 151–152
      </p>
      <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
        Бөмбөлөг толь · Дүрсний хууль
      </h2>
      <p className="mt-1 text-sm text-ink-700">
        Биеийг чирж зайг өөрчил. Дүрс хэрхэн томордог, эргэдэг, бодит/хийсвэр болохыг ажигла.
      </p>

      {/* Mode toggle */}
      <div className="mt-3 flex gap-2">
        <ModePill active={mode === 'concave'} onClick={() => setMode('concave')}>
          Хотгор (f &gt; 0)
        </ModePill>
        <ModePill active={mode === 'convex'} onClick={() => setMode('convex')}>
          Гүдгэр (f &lt; 0)
        </ModePill>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full touch-none select-none rounded-2xl bg-paper/70"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label="Бөмбөлөг толин дээрх дүрс үүсэх зураглал"
      >
        {/* Optical axis */}
        <line x1={10} y1={AXIS_Y} x2={W - 10} y2={AXIS_Y} stroke="#8A8A8A" strokeWidth={0.8} strokeDasharray="2 3" />

        {/* Mirror — curved arc indicating concave/convex */}
        <path
          d={mirrorArc(MIRROR_X, AXIS_Y, mode)}
          fill="none"
          stroke="#1A1A1A"
          strokeWidth={2.5}
        />

        {/* F and 2F (=C) markers */}
        <Marker x={MIRROR_X - F_DIST} y={AXIS_Y} label="F" color="#2563EB" />
        <Marker x={MIRROR_X - 2 * F_DIST} y={AXIS_Y} label="C" color="#2563EB" />

        {/* Principal rays: parallel-then-through-F + through-C-then-back */}
        {/* Ray 1: from object top, parallel to axis, then through F after mirror */}
        <line x1={objX} y1={AXIS_Y - objectHeight} x2={MIRROR_X} y2={AXIS_Y - objectHeight} stroke="#E8B400" strokeWidth={1.5} opacity={0.7} />
        {mode === 'concave' && (
          <line x1={MIRROR_X} y1={AXIS_Y - objectHeight} x2={imgRendered} y2={AXIS_Y - imageHeight} stroke="#E8B400" strokeWidth={1.5} opacity={0.7} />
        )}
        {mode === 'convex' && (
          // For convex mirror, parallel ray reflects as if from F behind mirror — show extension to virtual F
          <line
            x1={MIRROR_X}
            y1={AXIS_Y - objectHeight}
            x2={MIRROR_X - 220}
            y2={AXIS_Y - objectHeight + (objectHeight * 220) / F_DIST}
            stroke="#E8B400"
            strokeWidth={1.5}
            opacity={0.7}
            strokeDasharray={imgRendered > MIRROR_X ? '0' : '3 3'}
          />
        )}

        {/* Ray 2: from object top through C, reflects back along itself */}
        <line x1={objX} y1={AXIS_Y - objectHeight} x2={imgRendered} y2={AXIS_Y - imageHeight} stroke="#2563EB" strokeWidth={1} opacity={0.4} strokeDasharray="3 3" />

        {/* Object (orange/yellow upward arrow) */}
        <g onPointerDown={onPointerDown} style={{ cursor: 'grab' }}>
          {/* Wide invisible hit target */}
          <rect x={objX - HANDLE_R} y={AXIS_Y - objectHeight - 4} width={HANDLE_R * 2} height={objectHeight + HANDLE_R} fill="transparent" />
          <line x1={objX} y1={AXIS_Y} x2={objX} y2={AXIS_Y - objectHeight} stroke="#E8B400" strokeWidth={3} />
          <polygon points={`${objX - 5},${AXIS_Y - objectHeight + 6} ${objX + 5},${AXIS_Y - objectHeight + 6} ${objX},${AXIS_Y - objectHeight - 4}`} fill="#E8B400" />
          <circle cx={objX} cy={AXIS_Y} r={7} fill="#E8B400" stroke="#1A1A1A" strokeWidth={2} />
        </g>

        {/* Image arrow — coloured by image type */}
        {Math.abs(imageHeight) > 1 && (
          <>
            <line
              x1={imgRendered}
              y1={AXIS_Y}
              x2={imgRendered}
              y2={AXIS_Y - imageHeight}
              stroke={isReal ? '#16A34A' : '#8A8A8A'}
              strokeWidth={2.5}
              strokeDasharray={isReal ? '0' : '4 3'}
            />
            <polygon
              points={
                isInverted
                  ? `${imgRendered - 5},${AXIS_Y - imageHeight - 6} ${imgRendered + 5},${AXIS_Y - imageHeight - 6} ${imgRendered},${AXIS_Y - imageHeight + 4}`
                  : `${imgRendered - 5},${AXIS_Y - imageHeight + 6} ${imgRendered + 5},${AXIS_Y - imageHeight + 6} ${imgRendered},${AXIS_Y - imageHeight - 4}`
              }
              fill={isReal ? '#16A34A' : '#8A8A8A'}
            />
          </>
        )}
      </svg>

      {/* Numerical readouts and image classification */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="a" value={`${a}`} />
        <Stat label="b" value={`${Math.round(b)}`} />
        <Stat label="m" value={`${m.toFixed(2)}×`} />
      </div>

      <div className="mt-2 rounded-pill bg-paper px-4 py-2 text-center">
        <span className="font-mono text-xs text-ink-700">
          1/a + 1/b = 1/f &nbsp;→&nbsp; {(1 / a).toFixed(3)} + {(1 / b).toFixed(3)} = {(1 / f).toFixed(3)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Tag color={isReal ? 'success' : 'ink'}>{isReal ? 'Бодит' : 'Хийсвэр'}</Tag>
        <Tag color={isInverted ? 'info' : 'ink'}>{isInverted ? 'Эргэсэн' : 'Шулуун'}</Tag>
        <Tag color={Math.abs(m) > 1 ? 'heat' : 'ink'}>
          {Math.abs(m) > 1 ? 'Томорсон' : 'Жижигэрсэн'}
        </Tag>
      </div>

      <DragHint message="Шар сум-биеийг чирж толинд ойртуул, холдуул." />
    </div>
  );
}

/* ------------- helpers ------------- */

function mirrorArc(x: number, y: number, mode: Mode) {
  // Concave: opens toward the object (left). Convex: bulges toward the object.
  if (mode === 'concave') {
    return `M ${x} ${y - 60} Q ${x - 22} ${y} ${x} ${y + 60}`;
  }
  return `M ${x} ${y - 60} Q ${x + 22} ${y} ${x} ${y + 60}`;
}

function Marker({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
  return (
    <g>
      <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke={color} strokeWidth={1.5} />
      <text x={x} y={y + 18} fontSize="11" fontFamily="ui-monospace, monospace" fill={color} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function ModePill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-pill px-3 py-2 font-mono text-xs font-semibold transition-colors ${
        active ? 'bg-ink-900 text-paper' : 'bg-paper text-ink-700'
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper px-3 py-2 text-center">
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{label}</p>
      <p className="font-display text-lg font-extrabold text-ink-900">{value}</p>
    </div>
  );
}

function Tag({ color, children }: { color: 'success' | 'info' | 'heat' | 'ink'; children: React.ReactNode }) {
  const cls =
    color === 'success'
      ? 'bg-success-bg text-success-fg'
      : color === 'info'
      ? 'bg-info-bg text-info-fg'
      : color === 'heat'
      ? 'bg-heat-bg text-heat-fg'
      : 'bg-ink-300/40 text-ink-700';
  return (
    <span className={`rounded-pill px-3 py-1 font-mono text-[11px] font-semibold ${cls}`}>{children}</span>
  );
}
