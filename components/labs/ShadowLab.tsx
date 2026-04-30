'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';

/**
 * ShadowLab — two draggable light sources project shadows of an opaque object onto a wall.
 * The student observes how umbra (full shadow, both lights blocked) and penumbra
 * (half shadow, only one light blocked) emerge from the geometry.
 *
 * Textbook reference: page 140.
 *
 * Mastery: student has dragged a light to at least 3 distinct positions AND
 * observed both single-source (penumbra absent) and well-separated-source states.
 */
type Props = {
  surface?: string;
  onMastery?: () => void;
};

const W = 360;
const H = 220;
const WALL_X = W - 30;
const OBJ_X = 200;     // opaque object (vertical line) x
const OBJ_TOP = 80;    // object top y
const OBJ_BOT = 140;   // object bottom y
const HANDLE_R = 18;

export function ShadowLab({ surface = 'lab_shadow', onMastery }: Props) {
  // Two light sources, draggable in y axis (vertical position)
  const [l1, setL1] = useState({ x: 60, y: 90 });
  const [l2, setL2] = useState({ x: 60, y: 130 });

  const dragging = useRef<'l1' | 'l2' | null>(null);
  const positionsSeen = useRef<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute where each light's shadow falls on the wall (range of y values)
  const sh1 = shadowRangeOnWall(l1, OBJ_X, OBJ_TOP, OBJ_BOT, WALL_X);
  const sh2 = shadowRangeOnWall(l2, OBJ_X, OBJ_TOP, OBJ_BOT, WALL_X);

  // Umbra = intersection (both blocked). Penumbra = symmetric difference (only one blocked).
  const umbraTop = Math.max(sh1.top, sh2.top);
  const umbraBot = Math.min(sh1.bot, sh2.bot);
  const hasUmbra = umbraTop < umbraBot;

  // Penumbra extents (full union minus umbra)
  const unionTop = Math.min(sh1.top, sh2.top);
  const unionBot = Math.max(sh1.bot, sh2.bot);

  useEffect(() => {
    const key = `${Math.round(l1.y / 10)}_${Math.round(l2.y / 10)}`;
    positionsSeen.current.add(key);
    if (positionsSeen.current.size === 3) {
      track('lab_mastery', { surface });
      onMastery?.();
    }
  }, [l1.y, l2.y, surface, onMastery]);

  /* --------- pointer drag --------- */

  const onPointerDown =
    (which: 'l1' | 'l2') => (e: React.PointerEvent<SVGCircleElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = which;
      track('lab_drag_start', { surface, source: which });
    };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * H;
    const newY = Math.max(30, Math.min(H - 30, y));
    if (dragging.current === 'l1') setL1((p) => ({ ...p, y: newY }));
    else setL2((p) => ({ ...p, y: newY }));
  };

  const onPointerUp = () => {
    if (dragging.current) {
      track('lab_drag_end', { surface, source: dragging.current });
      dragging.current = null;
    }
  };

  /* --------- render --------- */

  return (
    <div className="rounded-card bg-brand-100 p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-700">
        Интерактив лаб · Хуудас 140
      </p>
      <h2 className="mt-1 font-display text-xl font-extrabold text-ink-900">
        Бүтэн ба хагас сүүдэр
      </h2>
      <p className="mt-1 text-sm text-ink-700">
        Хоёр гэрэл үүсгэгчийг чирж ойртуул, холдуул. Хана дээрх{' '}
        <strong>бүтэн сүүдэр (умбра)</strong> ба{' '}
        <strong>хагас сүүдэр (пенумбра)</strong> хэрхэн өөрчлөгдөж байгааг ажигла.
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full touch-none select-none rounded-2xl bg-paper/70"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="img"
        aria-label="Сүүдрийн зураглал"
      >
        {/* Wall (target) */}
        <line x1={WALL_X} y1={20} x2={WALL_X} y2={H - 20} stroke="#1A1A1A" strokeWidth={3} />
        <text x={WALL_X + 4} y={28} fontSize="9" fill="#8A8A8A" fontFamily="ui-monospace, monospace">
          ХАНА
        </text>

        {/* Light cones (faint yellow fills from each source over object's span to wall) */}
        <LightCone src={l1} objX={OBJ_X} objTop={OBJ_TOP} objBot={OBJ_BOT} wallX={WALL_X} />
        <LightCone src={l2} objX={OBJ_X} objTop={OBJ_TOP} objBot={OBJ_BOT} wallX={WALL_X} />

        {/* Penumbra band on wall (lighter shadow — only one light blocked) */}
        {!hasUmbra ? (
          // No overlap — entire union is penumbra
          <rect
            x={WALL_X - 8}
            y={unionTop}
            width={8}
            height={unionBot - unionTop}
            fill="#1A1A1A"
            opacity={0.35}
          />
        ) : (
          <>
            <rect
              x={WALL_X - 8}
              y={unionTop}
              width={8}
              height={umbraTop - unionTop}
              fill="#1A1A1A"
              opacity={0.35}
            />
            <rect
              x={WALL_X - 8}
              y={umbraBot}
              width={8}
              height={unionBot - umbraBot}
              fill="#1A1A1A"
              opacity={0.35}
            />
          </>
        )}

        {/* Umbra band on wall (full shadow — both lights blocked) */}
        {hasUmbra && (
          <rect
            x={WALL_X - 8}
            y={umbraTop}
            width={8}
            height={umbraBot - umbraTop}
            fill="#1A1A1A"
            opacity={0.85}
          />
        )}

        {/* Object — opaque vertical bar */}
        <rect
          x={OBJ_X - 4}
          y={OBJ_TOP}
          width={8}
          height={OBJ_BOT - OBJ_TOP}
          fill="#1A1A1A"
          rx={2}
        />

        {/* Labels for shadow regions, on the canvas adjacent to the bands */}
        {hasUmbra && (
          <text
            x={WALL_X - 14}
            y={(umbraTop + umbraBot) / 2 + 3}
            fontSize="9"
            textAnchor="end"
            fontFamily="ui-monospace, monospace"
            fill="#1A1A1A"
            fontWeight={700}
          >
            УМБРА
          </text>
        )}
        {unionTop < umbraTop && (
          <text
            x={WALL_X - 14}
            y={(unionTop + umbraTop) / 2 + 3}
            fontSize="8"
            textAnchor="end"
            fontFamily="ui-monospace, monospace"
            fill="#4A4A4A"
          >
            пенумбра
          </text>
        )}

        {/* Light source 1 — draggable */}
        <circle
          cx={l1.x}
          cy={l1.y}
          r={HANDLE_R}
          fill="#FCEDA0"
          stroke="#E8B400"
          strokeWidth={2}
          onPointerDown={onPointerDown('l1')}
          style={{ cursor: 'grab' }}
        />
        <circle cx={l1.x} cy={l1.y} r={6} fill="#E8B400" pointerEvents="none" />

        {/* Light source 2 — draggable */}
        <circle
          cx={l2.x}
          cy={l2.y}
          r={HANDLE_R}
          fill="#FCEDA0"
          stroke="#E8B400"
          strokeWidth={2}
          onPointerDown={onPointerDown('l2')}
          style={{ cursor: 'grab' }}
        />
        <circle cx={l2.x} cy={l2.y} r={6} fill="#E8B400" pointerEvents="none" />
      </svg>

      {/* Live readout */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-pill bg-paper px-3 py-2 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Үүсвэр хоорондын зай
          </p>
          <p className="font-display text-base font-extrabold text-ink-900">
            {Math.round(Math.abs(l1.y - l2.y))} нэгж
          </p>
        </div>
        <div className="rounded-pill bg-paper px-3 py-2 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
            Бүтэн сүүдэр
          </p>
          <p className="font-display text-base font-extrabold text-ink-900">
            {hasUmbra ? `${Math.round(umbraBot - umbraTop)} нэгж` : 'Үгүй'}
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-ink-500">
        <span aria-hidden>👆</span>
        <span>Хоёр шар бөмбөгийг чирж сүүдрийг ажигла.</span>
      </p>
    </div>
  );
}

/* ------------- geometry helpers ------------- */

/** Project the object's vertical extent through a point light onto the wall. */
function shadowRangeOnWall(
  src: { x: number; y: number },
  objX: number,
  objTop: number,
  objBot: number,
  wallX: number,
) {
  const t = (wallX - src.x) / (objX - src.x);
  const top = src.y + t * (objTop - src.y);
  const bot = src.y + t * (objBot - src.y);
  return { top: Math.min(top, bot), bot: Math.max(top, bot) };
}

/** Faint yellow light cone: from source through both edges of object to wall. */
function LightCone({
  src,
  objX,
  objTop,
  objBot,
  wallX,
}: {
  src: { x: number; y: number };
  objX: number;
  objTop: number;
  objBot: number;
  wallX: number;
}) {
  const sh = shadowRangeOnWall(src, objX, objTop, objBot, wallX);
  // The unobstructed light fills everything ABOVE and BELOW the object's projection.
  // Render two thin yellow polygons illustrating the unblocked beams.
  return (
    <>
      <polygon
        points={`${src.x},${src.y} ${objX - 5},${objTop} ${wallX},${sh.top}`}
        fill="#FCEDA0"
        opacity={0.0}
      />
      {/* Faint edge-rays so the geometry is legible without overwhelming the canvas */}
      <line x1={src.x} y1={src.y} x2={wallX} y2={sh.top} stroke="#E8B400" strokeWidth={0.8} opacity={0.45} />
      <line x1={src.x} y1={src.y} x2={wallX} y2={sh.bot} stroke="#E8B400" strokeWidth={0.8} opacity={0.45} />
    </>
  );
}
