'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Pause, Play, X } from 'lucide-react';
import { getLesson } from '@/lib/lessons';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  07 · Motion Player (modal, dark theme)

  Only screen with dark theme. Background --ink-900. Yellow play/pause button.
  Caption track in yellow-bordered chip below illustration.

  Implementation: Framer Motion animates the incident → reflected ray. Rive
  is deferred to v2 per PROJECT_PLAN_v2 §5.
*/
export default function MotionPlayerPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const lesson = getLesson(id);
  const [playing, setPlaying] = useState(true);
  useTimeOnScreen(`motion_player:${id}`);

  // Auto-advance after the loop has played a few cycles. // TODO(dw): tune.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(false), 8000);
    return () => clearTimeout(t);
  }, [playing]);

  return (
    <main className="fixed inset-0 z-40 flex flex-col bg-ink-900 px-5 pt-12 pb-8 text-paper">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Хаах"
          onClick={() => {
            track('cta_tap', { surface: 'motion_player', label: 'close', lesson: id });
            router.push(`/lesson/${id}/lab`);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/10"
        >
          <X size={20} strokeWidth={2} />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70">
          07 · АНИМАЦИ
        </p>
        <span className="w-10" />
      </div>

      <h1 className="mt-6 font-display text-2xl font-extrabold leading-tight">
        {lesson?.title_mn ?? 'Хичээл'}
      </h1>

      <div className="mt-6 flex-1 rounded-card bg-ink-900/60 p-4">
        <svg viewBox="0 0 320 200" className="h-full w-full" aria-label="Анимаци">
          <line x1="20" y1="160" x2="300" y2="160" stroke="#FCEDA0" strokeWidth="2" />
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={i}
              x1={28 + i * 20}
              y1={160}
              x2={20 + i * 20}
              y2={172}
              stroke="#FCEDA0"
              strokeWidth="1.5"
            />
          ))}
          <line
            x1="160"
            y1="40"
            x2="160"
            y2="160"
            stroke="#FCEDA0"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Animated incident → reflected ray */}
          <motion.line
            x1={80}
            y1={50}
            x2={80}
            y2={50}
            stroke="#F4D63B"
            strokeWidth="3"
            initial={{ x2: 80, y2: 50 }}
            animate={
              playing
                ? { x2: [80, 160, 240], y2: [50, 160, 50] }
                : { x2: 240, y2: 50 }
            }
            transition={{
              duration: 2.4,
              repeat: playing ? Infinity : 0,
              ease: 'linear',
            }}
          />
          <circle cx="160" cy="160" r="5" fill="#F4D63B" />
        </svg>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          aria-label={playing ? 'Зогсоох' : 'Үргэлжлүүлэх'}
          onClick={() => {
            setPlaying((p) => !p);
            track('cta_tap', {
              surface: 'motion_player',
              label: playing ? 'pause' : 'play',
              lesson: id,
            });
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-300 text-ink-900 shadow-hero"
        >
          {playing ? <Pause size={22} strokeWidth={2.4} /> : <Play size={22} strokeWidth={2.4} />}
        </button>
      </div>

      <div className="mt-5 rounded-card border border-brand-300/60 bg-paper/5 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-brand-300">
          Тайлбар
        </p>
        <p className="mt-1 text-sm leading-relaxed text-paper/90">
          Гэрлийн туяа толин дээр тусч, тэнцүү өнцгөөр ойлгоно. Тусах өнцөг (i) =
          ойлтын өнцөг (r).
        </p>
      </div>

      <Link
        href={`/lesson/${id}/lab`}
        onClick={() =>
          track('cta_tap', { surface: 'motion_player', label: 'continue', lesson: id })
        }
        className="mt-5 flex h-12 w-full items-center justify-center rounded-pill bg-brand-300 px-5 font-display text-base font-semibold text-ink-900"
      >
        Үргэлжлүүлэх →
      </Link>
    </main>
  );
}
