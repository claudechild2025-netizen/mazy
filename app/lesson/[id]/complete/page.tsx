'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Trophy, Star, Clock, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Mascot } from '@/components/Mascot';
import { StreakModal } from '@/components/StreakModal';
import { getLesson, getQuiz } from '@/lib/lessons';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  13 · Lesson Complete (/lesson/[id]/complete)

  Yellow background. Trophy SVG. Three stat tiles (XP gained, time, accuracy).
  Badge unlock card. Black pill CTA + plain "Нүүр буцах" link.

  Triggers the 14 · Streak Modal as a bottom sheet on first arrival.

  // TODO(dw): Persist xp + badge unlock to Supabase. For the test, the
  // celebrate state is computed client-side from sessionStorage.
*/
export default function LessonCompletePage() {
  const { id } = useParams<{ id: string }>();
  const lesson = getLesson(id);
  const questions = getQuiz(id);
  const [streakOpen, setStreakOpen] = useState(true);
  const [score, setScore] = useState(0);
  useTimeOnScreen(`lesson_complete:${id}`);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.sessionStorage.getItem(`quiz:${id}`);
    if (raw) {
      const parsed = JSON.parse(raw) as { score?: number };
      setScore(parsed.score ?? 0);
    }
    track('view', { surface: 'lesson_complete', lesson: id });
  }, [id]);

  const total = questions.length;
  const accuracyPct =
    total === 0 ? 0 : Math.round((score / total) * 100);

  return (
    <>
      <main className="bg-brand-gradient flex flex-1 flex-col items-center px-5 pt-12 pb-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-700">
          13 · ХИЧЭЭЛ ДУУСЛАА
        </p>

        <motion.div 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="mt-6 flex h-28 w-28 items-center justify-center rounded-full bg-brand-300 shadow-hero"
        >
          <Trophy size={48} strokeWidth={2.2} className="text-ink-900" />
        </motion.div>

        <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight text-ink-900">
          Гайхалтай!
        </h1>
        <p className="mt-2 max-w-[300px] text-sm text-ink-700">
          {lesson?.title_mn ?? 'Хичээл'} — {score}/{total} зөв.
        </p>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.3 }
            }
          }}
          className="mt-6 grid w-full grid-cols-3 gap-2"
        >
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
            <Tile
              icon={<Star size={16} className="text-brand-500" />}
              value={`+${lesson?.xp ?? 0}`}
              label="XP"
            />
          </motion.div>
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
            <Tile
              icon={<Clock size={16} className="text-info-fg" />}
              value={`${lesson?.minutes ?? 5}`}
              label="МИН"
            />
          </motion.div>
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
            <Tile
              icon={<Target size={16} className="text-success-fg" />}
              value={`${accuracyPct}%`}
              label="НАРИЙВЧЛАЛ"
            />
          </motion.div>
        </motion.div>

        {accuracyPct === 100 && id === 'reflection' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.8 }}
            className="mt-5 flex w-full items-center gap-3 rounded-card bg-paper p-3 text-left shadow-cta"
          >
            <span className="text-3xl" aria-hidden>🪞</span>
            <div>
              <p className="font-display text-sm font-bold text-ink-900">
                Шинэ медаль: Толины мастер
              </p>
              <p className="text-xs text-ink-700">
                Гэрлийн ойлтыг 100% эзэмшсэн.
              </p>
            </div>
          </motion.div>
        )}

        <div className="mt-auto w-full pt-6">
          {/* v4 happy path: Complete → Survey (research feedback). Navigating
              to /lessons is still possible via the secondary link, but the
              primary CTA collects the post-session questionnaire while the
              experience is fresh. */}
          <Link
            href="/survey"
            onClick={() =>
              track('cta_tap', { surface: 'lesson_complete', label: 'survey' })
            }
            className="flex h-12 w-full items-center justify-between rounded-pill bg-ink-900 px-5 font-display text-base font-semibold text-paper"
          >
            <span>Үргэлжлүүлэх</span>
            <ArrowRight size={18} strokeWidth={2.2} />
          </Link>
          <Link
            href="/"
            onClick={() =>
              track('cta_tap', { surface: 'lesson_complete', label: 'home' })
            }
            className="mt-3 inline-block w-full text-center font-display text-sm font-semibold text-ink-700 underline underline-offset-4"
          >
            Нүүр буцах
          </Link>
        </div>

        <Mascot
          size={64}
          expression="celebrate"
          className="absolute right-5 top-5 opacity-80"
        />
      </main>

      <StreakModal
        open={streakOpen}
        onClose={() => setStreakOpen(false)}
        streakDays={1}
        todayIndex={0}
      />
    </>
  );
}

function Tile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card bg-paper px-2 py-3">
      {icon}
      <p className="mt-1 font-display text-lg font-extrabold text-ink-900">
        {value}
      </p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-ink-500">
        {label}
      </p>
    </div>
  );
}
