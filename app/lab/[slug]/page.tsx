'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BottomTab } from '@/components/BottomTab';
import { ReflectionLab } from '@/components/labs/ReflectionLab';
import { ShadowLab } from '@/components/labs/ShadowLab';
import { SphericalMirrorLab } from '@/components/labs/SphericalMirrorLab';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  Interactive labs (/lab/[slug])

  Per INTERACTION_REVISION.md: lab IS the lesson. The five seed components
  set the interaction quality bar — every lab listed here that doesn't have
  a seed component yet is rendered as a static placeholder with a TODO(dw)
  marker noting the interactivity is below standard.

  Entry from Lessons List is allowed without lesson completion (per v3:
  "Do not gate access to labs behind lesson completion").
*/

const LABS = [
  { slug: 'reflection',       short: 'Ойлт',         title: 'Гэрлийн ойлтын хууль' },
  { slug: 'shadow',           short: 'Сүүдэр',       title: 'Бүтэн ба хагас сүүдэр' },
  { slug: 'spherical-mirror', short: 'Бөмбөлөг',     title: 'Бөмбөлөг толь · Дүрсний хууль' },
  { slug: 'refraction',       short: 'Хугарал',      title: 'Гэрлийн хугарал' },
  { slug: 'tir',              short: 'TIR',          title: 'Бүрэн дотоод ойлт' },
  { slug: 'lenses',           short: 'Линз',         title: 'Линзний дүрс' },
  { slug: 'prism',            short: 'Призм',        title: 'Призм ба дисперс' },
  { slug: 'rgb',              short: 'RGB',          title: 'RGB холих' },
  { slug: 'speed-of-light',   short: 'Хурд',         title: 'Гэрлийн хурд' },
  { slug: 'moon-phases',      short: 'Сар',          title: 'Сарны үе' },
];

const BUILT = new Set(['reflection', 'shadow', 'spherical-mirror']);

export default function LabPage() {
  const { slug } = useParams<{ slug: string }>();
  const lab = LABS.find((l) => l.slug === slug) ?? LABS[0];
  useTimeOnScreen(`lab:${lab.slug}`);

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-5 pt-6 pb-6">
        <div className="flex items-center justify-between">
          <Link
            href="/lessons"
            aria-label="Буцах"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-300/70"
          >
            <ArrowLeft size={20} strokeWidth={1.8} />
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            ★ ЛАБ
          </p>
          <span className="w-10" />
        </div>

        <nav
          aria-label="Лабын жагсаалт"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        >
          {LABS.map((l) => {
            const active = l.slug === lab.slug;
            return (
              <Link
                key={l.slug}
                href={`/lab/${l.slug}`}
                onClick={() =>
                  track('cta_tap', {
                    surface: 'lab',
                    label: 'switch',
                    slug: l.slug,
                  })
                }
                className={
                  active
                    ? 'h-9 shrink-0 rounded-pill bg-ink-900 px-4 font-display text-sm font-semibold text-paper'
                    : 'h-9 shrink-0 rounded-pill border border-ink-300/70 bg-paper px-4 font-display text-sm font-semibold text-ink-700'
                }
              >
                {l.short}
              </Link>
            );
          })}
        </nav>

        {!BUILT.has(lab.slug) ? (
          <Placeholder title={lab.title} />
        ) : lab.slug === 'reflection' ? (
          <ReflectionLab surface="lab_reflection" />
        ) : lab.slug === 'shadow' ? (
          <ShadowLab surface="lab_shadow" />
        ) : (
          <SphericalMirrorLab surface="lab_mirror" />
        )}
      </div>

      <BottomTab />
    </>
  );
}

/*
  // TODO(dw): interactivity below standard, see ReflectionLab.tsx comment.
  These slugs need their own seed-quality lab. Until then the page renders a
  static stub so navigation doesn't break and the route still tracks views.
*/
function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-card border border-dashed border-ink-300/70 px-6 py-16 text-center">
      <span className="text-5xl" aria-hidden>🔧</span>
      <p className="mt-4 font-display text-base font-bold text-ink-900">
        {title}
      </p>
      <p className="mt-1 max-w-[260px] text-sm text-ink-500">
        Энэ лаб удахгүй нээгдэнэ. Чанарын босгод хүрэх хүртэл интерактив хувилбарыг түр зогсоосон.
      </p>
    </div>
  );
}
