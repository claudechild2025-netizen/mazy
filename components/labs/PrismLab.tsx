'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { DragHint } from './DragHint';

/**
 * PrismLab — drag the incoming white-light beam to see dispersion through a
 * triangular prism. Output side fans into 7 colours (red→violet) — red bends
 * least, violet most, illustrating wavelength-dependent refractive index.
 *
 * Mastery: 3 distinct incidence angles → onMastery fires.
 *
 * Physics is illustrative, not exact: a single deviation angle drives the
 * spread, and per-colour offsets visualise relative dispersion (Δn ≈ 0.04
 * across the visible spectrum for crown glass).
 */
type Props = {
  surface?: string;
  onMastery?: () => void;
};

const SVG_W = 360;
const SVG_H = 240;

// Triangular prism — equilateral, centered, apex up
const PRISM_CX = SVG_W / 2;
const PRISM_CY = SVG_H / 2 + 6;
const PRISM_SIDE = 96;
const PRISM_H = (PRISM_SIDE * Math.sqrt(3)) / 2;
const APEX = { x: PRISM_CX,                    y: PRISM_CY - PRISM_H * 0.66 };
const BL   = { x: PRISM_CX - PRISM_SIDE / 2,   y: PRISM_CY + PRISM_H * 0.34 };
const BR   = { x: PRISM_CX + PRISM_SIDE / 2,   y: PRISM_CY + PRISM_H * 0.34 };

// Strike point on the left face — fixed for simplicity
const STRIKE = midpoint(APEX, BL);
// Exit point on the right face — also fixed
const EXIT = midpoint(APEX, BR);

const RAY_LEN = 130;
const HANDLE_R = 18;

// 7 spectrum colours (red → violet) with relative dispersion offsets in degrees.
// Red bends the least, violet the most — index increases with frequency.
const SPECTRUM: { color: string; label: string; offset: number }[] = [
  { color: '#E11D48', label: 'Улаан',     offset: 0 },
  { color: '#EA580C', label: 'Улбар шар', offset: 1.8 },
  { color: '#F59E0B', label: 'Шар',       offset: 3.6 },
  { color: '#22C55E', label: 'Ногоон',    offset: 5.4 },
  { color: '#06B6D4', label: 'Цэнхэр',    offset: 7.2 },
  { color: '#2563EB', label: 'Хөх',       offset: 9.0 },
  { color: '#7C3AED', label: 'Ягаан',     offset: 10.8 },
];

export function PrismLab({ surface = 'lab_prism', onMastery }: Props) {
  // Angle of incoming white ray, measured from horizontal (above 0 = upward).
  // Constrained so the ray stays clear of the prism apex / base.
  const [angleDeg, setAngleDeg] = useState(20);
  const seenAngles = useRef<Set<number>>(new Set());
  const dragging = useRef<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const angleRad = (angleDeg * Math.PI) / 180;
  const handleX = STRIKE.x - RAY_LEN * Math.cos(angleRad);
  const handleY = STRIKE.y + RAY_LEN * Math.sin(angleRad);

  // Mastery: 3 distinct 5° buckets seen.
  useEffect(() => {
    const bucket = Math.round(angleDeg / 5);
    seenAngles.current.add(bucket);
    if (seenAngles.current.size === 3) {
      track('lab_mastery', { surface, distinct_angles: 3 });
      onMastery?.();
    }
  }, [angleDeg, surface, onMastery]);

  /* --------- pointer drag --------- */

  const onPointerDown = (e: React.PointerEvent<SVGCircleElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    track('lab_drag_start', { surface });
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * SVG_W;
    const y = ((e.clientY - rect.top) / rect.height) * SVG_H;
    const dx = STRIKE.x - x;
    const dy = y - STRIKE.y;
    if (dx <= 10) return;
    const newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    setAngleDeg(Math.max(-25, Math.min(45, Math.round(newAngle))));
  };

  const onPointerUp = () => {
    if (dragging.current) {
      dragging.current = false;
      track('lab_drag_end', { surface, final_angle: angleDeg });
    }
  };

  // Output fan — base deviation grows with incidence angle. The dispersion
  // (red↔violet spread) is visually exaggerated so it reads from the back row.
  const baseDev = 18 + angleDeg * 0.4;

  return (
    <div className="rounded-card bg-brand-100 p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-700">
        Интерактив лаб · Дисперс
      </p>
      <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
        Призм ба гэрлийн задрал
      </h2>
      <p className="mt-1 text-sm text-ink-700">
        Цагаан туяаны үзүүрийг чирж тусах өнцгийг өөрчил. Призмээс гарсан гэрэл 7 өнгөнд задарна.
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="mt-4 w-full touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label={`Призмээр гэрэл задрах. Тусах өнцөг ${angleDeg} градус.`}
      >
        {/* Triangular prism — translucent fill so rays inside are visible */}
        <polygon
          points={`${APEX.x},${APEX.y} ${BL.x},${BL.y} ${BR.x},${BR.y}`}
          fill="rgba(255,255,255,0.55)"
          stroke="#1A1A1A"
          strokeWidth={2}
        />

        {/* Output spectrum fan — drawn first so the white incoming ray is on top */}
        {SPECTRUM.map((s, i) => {
          const devRad = ((baseDev + s.offset) * Math.PI) / 180;
          const x2 = EXIT.x + RAY_LEN * Math.cos(devRad);
          const y2 = EXIT.y + RAY_LEN * Math.sin(devRad);
          return (
            <line
              key={s.label}
              x1={EXIT.x}
              y1={EXIT.y}
              x2={x2}
              y2={y2}
              stroke={s.color}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.95}
            />
          );
        })}

        {/* Inside-prism beam (white-ish) — straight from strike to exit so the
            student perceives a single beam splitting AT the second face. */}
        <line
          x1={STRIKE.x}
          y1={STRIKE.y}
          x2={EXIT.x}
          y2={EXIT.y}
          stroke="#FFFFFF"
          strokeWidth={3}
          opacity={0.85}
        />

        {/* Incoming white ray (left side, draggable) */}
        <line
          x1={STRIKE.x}
          y1={STRIKE.y}
          x2={handleX}
          y2={handleY}
          stroke="#1A1A1A"
          strokeWidth={3}
        />
        <line
          x1={STRIKE.x}
          y1={STRIKE.y}
          x2={handleX}
          y2={handleY}
          stroke="#FFFFFF"
          strokeWidth={1.6}
          strokeDasharray="6 6"
        />

        {/* Strike + exit points */}
        <circle cx={STRIKE.x} cy={STRIKE.y} r={3.5} fill="#1A1A1A" />
        <circle cx={EXIT.x} cy={EXIT.y} r={3.5} fill="#1A1A1A" />

        {/* Draggable handle on incoming ray */}
        <circle
          cx={handleX}
          cy={handleY}
          r={HANDLE_R}
          fill="#FFFFFF"
          stroke="#1A1A1A"
          strokeWidth={2}
          onPointerDown={onPointerDown}
          style={{ cursor: 'grab' }}
        />
        <circle cx={handleX} cy={handleY} r={5} fill="#1A1A1A" pointerEvents="none" />

        {/* "Цагаан гэрэл" tag near the handle */}
        <text
          x={handleX - 6}
          y={handleY - HANDLE_R - 6}
          fontSize="11"
          fontFamily="ui-monospace, monospace"
          fill="#1A1A1A"
          textAnchor="end"
        >
          цагаан
        </text>
      </svg>

      {/* Numerical readout + spectrum legend */}
      <div className="mt-3 flex items-center justify-between rounded-pill bg-paper px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
          Тусах өнцөг
        </span>
        <span className="font-display text-2xl font-extrabold text-ink-900">
          θ = {angleDeg}°
        </span>
        <span className="rounded-pill bg-success-bg px-3 py-1 font-mono text-xs font-semibold text-success-fg">
          7 өнгө ✓
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {SPECTRUM.map((s) => (
          <span
            key={s.label}
            className="inline-flex items-center gap-1 rounded-pill bg-paper px-2.5 py-1 font-mono text-[11px] text-ink-700"
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>

      <DragHint message="Цагаан туяаны үзүүрийг чирж тусах өнцгийг өөрчил." emoji="🌈" />
    </div>
  );
}

/* ------------- helpers ------------- */

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
