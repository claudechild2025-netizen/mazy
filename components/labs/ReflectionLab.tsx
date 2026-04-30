'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { DragHint } from './DragHint';

/**
 * ReflectionLab — drag the incident ray endpoint to change the angle of incidence.
 * The reflected ray follows automatically, demonstrating α = α₁ (law of reflection).
 *
 * Textbook reference: page 147.
 * Mastery is signalled when the student has tested 3+ distinct angles.
 */
type Props = {
  surface?: string;
  onMastery?: () => void;
};

const SVG_W = 360;
const SVG_H = 240;
const CX = SVG_W / 2;          // strike point x (always centred on axis)
const CY = SVG_H - 60;          // strike point y (above ground)
const RAY_LEN = 150;            // length of both rays
const HANDLE_R = 18;            // touch target radius

export function ReflectionLab({ surface = 'lab_reflection', onMastery }: Props) {
  // Angle from normal in DEGREES, measured clockwise (incident on the left).
  // Constrained to (5°, 85°) so the ray never goes parallel to the mirror.
  const [angleDeg, setAngleDeg] = useState(35);
  const seenAngles = useRef<Set<number>>(new Set());
  const dragging = useRef<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute incident endpoint (handle) position from angle
  const angleRad = (angleDeg * Math.PI) / 180;
  const handleX = CX - RAY_LEN * Math.sin(angleRad);
  const handleY = CY - RAY_LEN * Math.cos(angleRad);
  const reflectedX = CX + RAY_LEN * Math.sin(angleRad);
  const reflectedY = CY - RAY_LEN * Math.cos(angleRad);

  // Mastery: bucket angles into 10° bins; firing onMastery once 3 distinct bins seen.
  useEffect(() => {
    const bucket = Math.round(angleDeg / 10);
    seenAngles.current.add(bucket);
    if (seenAngles.current.size === 3) {
      track('lab_mastery', { surface, distinct_angles: 3 });
      onMastery?.();
    }
  }, [angleDeg, surface, onMastery]);

  // Drag handler — pointer events handle mouse + touch + pen
  const onPointerDown = (e: React.PointerEvent<SVGCircleElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    track('lab_drag_start', { surface });
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    // Convert client coordinates to SVG coordinates accounting for viewBox scaling
    const x = ((e.clientX - rect.left) / rect.width) * SVG_W;
    const y = ((e.clientY - rect.top) / rect.height) * SVG_H;
    // Compute angle from strike point to pointer, on the left side (incident)
    const dx = CX - x;     // positive when pointer is to the left of strike point
    const dy = CY - y;     // positive when pointer is above strike point
    if (dy < 10) return;   // disallow ray going below mirror
    const newAngle = Math.atan2(dx, dy) * (180 / Math.PI);
    setAngleDeg(Math.max(5, Math.min(85, Math.round(newAngle))));
  };

  const onPointerUp = () => {
    if (dragging.current) {
      dragging.current = false;
      track('lab_drag_end', { surface, final_angle: angleDeg });
    }
  };

  return (
    <div className="rounded-card bg-brand-100 p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-700">
        Интерактив лаб · Хуудас 147
      </p>
      <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
        Гэрлийн ойлтын хууль
      </h2>
      <p className="mt-1 text-sm text-ink-700">
        Шар бөмбөгийг чирж тусах өнцгийг өөрчил. Ойлтын өнцөг нь яг адилхан байгааг хар.
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="mt-4 w-full touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label={`Гэрлийн ойлт. Тусах өнцөг ${angleDeg} градус.`}
      >
        {/* Mirror surface (solid line) with hatching below */}
        <line x1={20} y1={CY} x2={SVG_W - 20} y2={CY} stroke="#1A1A1A" strokeWidth={2.5} />
        {Array.from({ length: 17 }).map((_, i) => (
          <line
            key={i}
            x1={28 + i * 20}
            y1={CY}
            x2={20 + i * 20}
            y2={CY + 12}
            stroke="#1A1A1A"
            strokeWidth={1.5}
          />
        ))}

        {/* Normal — dashed vertical at strike point */}
        <line
          x1={CX}
          y1={CY - RAY_LEN - 10}
          x2={CX}
          y2={CY}
          stroke="#1A1A1A"
          strokeWidth={1.2}
          strokeDasharray="4 4"
        />

        {/* Reflected ray (right side, computed) */}
        <line
          x1={CX}
          y1={CY}
          x2={reflectedX}
          y2={reflectedY}
          stroke="#1A1A1A"
          strokeWidth={2.5}
        />
        {/* Arrowhead at reflected end */}
        <polygon
          points={`${reflectedX - 6 * Math.cos(angleRad - Math.PI / 2)},${reflectedY - 6 * Math.sin(angleRad - Math.PI / 2)} ${reflectedX + 6 * Math.sin(angleRad)},${reflectedY + 6 * Math.cos(angleRad)} ${reflectedX + 6 * Math.cos(angleRad - Math.PI / 2)},${reflectedY + 6 * Math.sin(angleRad - Math.PI / 2)}`}
          fill="#1A1A1A"
          opacity={0.0}
        />

        {/* Incident ray (left side, draggable) */}
        <line
          x1={CX}
          y1={CY}
          x2={handleX}
          y2={handleY}
          stroke="#E8B400"
          strokeWidth={3}
        />

        {/* Angle arcs labelled on the canvas, adjacent to each arc (Spatial Contiguity) */}
        <path
          d={describeArc(CX, CY, 38, 270, 270 - angleDeg)}
          fill="none"
          stroke="#2563EB"
          strokeWidth={1.6}
        />
        <path
          d={describeArc(CX, CY, 38, 270, 270 + angleDeg)}
          fill="none"
          stroke="#2563EB"
          strokeWidth={1.6}
        />
        <text
          x={CX - 18 - angleDeg * 0.15}
          y={CY - 24}
          fontSize="13"
          fontFamily="ui-monospace, monospace"
          fill="#1A1A1A"
          fontWeight={600}
        >
          α
        </text>
        <text
          x={CX + 14 + angleDeg * 0.15}
          y={CY - 24}
          fontSize="13"
          fontFamily="ui-monospace, monospace"
          fill="#1A1A1A"
          fontWeight={600}
        >
          α₁
        </text>

        {/* Strike point */}
        <circle cx={CX} cy={CY} r={4} fill="#1A1A1A" />

        {/* Draggable handle on incident ray */}
        <circle
          cx={handleX}
          cy={handleY}
          r={HANDLE_R}
          fill="#E8B400"
          stroke="#1A1A1A"
          strokeWidth={2}
          onPointerDown={onPointerDown}
          style={{ cursor: 'grab' }}
        />
        <circle cx={handleX} cy={handleY} r={5} fill="#1A1A1A" pointerEvents="none" />
      </svg>

      {/* Numerical readout — large mono font, adjacent to canvas */}
      <div className="mt-3 flex items-center justify-between rounded-pill bg-paper px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
          Өнцөг
        </span>
        <span className="font-display text-2xl font-extrabold text-ink-900">
          α = {angleDeg}° &nbsp;=&nbsp; α₁ = {angleDeg}°
        </span>
        <span className="rounded-pill bg-success-bg px-3 py-1 font-mono text-xs font-semibold text-success-fg">
          α = α₁ ✓
        </span>
      </div>

      <DragHint message="Шар бөмбөгийг чирж тусах өнцгийг өөрчил." />
    </div>
  );
}

/* ------------- helpers ------------- */

/** SVG arc path between two angles (degrees, clockwise from 0=right). */
function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarToCart(cx, cy, r, endDeg);
  const end = polarToCart(cx, cy, r, startDeg);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg < startDeg ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

function polarToCart(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
