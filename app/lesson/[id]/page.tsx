'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, ListOrdered, Star } from 'lucide-react';
import { LessonIllustration } from '@/components/LessonIllustration';
import { getLesson } from '@/lib/lessons';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  06 · Lesson Intro (/lesson/[id])

  Yellow illustration card top. Three meta chips: time, steps, XP reward.
  Numbered "ЧИ ЮУ СУРАХ ВЭ" list. Black pill CTA → Motion Player (07).
*/
export default function LessonIntroPage() {
  const { id } = useParams<{ id: string }>();
  const lesson = getLesson(id);
  useTimeOnScreen(`lesson_intro:${id}`);

  if (!lesson) notFound();

  const visual =
    id === 'reflection'
      ? 'reflection'
      : id === 'propagation'
        ? 'propagation'
        : id === 'refraction'
          ? 'refraction'
          : 'lens';

  return (
    <main className="flex flex-1 flex-col px-5 pt-6 pb-6">
      <div className="flex items-center justify-between">
        <Link
          href="/lessons"
          aria-label="Буцах"
          onClick={() =>
            track('cta_tap', { surface: 'lesson_intro', label: 'back', lesson: id })
          }
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-300/70"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
          06 · ХИЧЭЭЛ
        </p>
        <span className="w-10" />
      </div>

      <div className="bg-brand-gradient mt-6 rounded-card p-5 shadow-hero">
        <LessonIllustration
          variant={visual}
          className="mx-auto h-40 w-full max-w-[280px]"
        />
      </div>

      <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight text-ink-900">
        {lesson.title_mn}
      </h1>
      <p className="mt-2 text-sm text-ink-700">{lesson.blurb_mn}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip icon={<Clock size={14} />} label={`${lesson.minutes} мин`} />
        <Chip icon={<ListOrdered size={14} />} label={`${lesson.steps} алхам`} />
        <Chip icon={<Star size={14} className="text-brand-500" />} label={`${lesson.xp} XP`} />
      </div>

      <section className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
          Чи юу сурах вэ
        </p>
        <ol className="mt-3 space-y-3">
          {lesson.learnings_mn.map((line, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-xs font-bold text-ink-900">
                {idx + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink-900">{line}</p>
            </li>
          ))}
        </ol>
      </section>

      {/*
        v3: primary path is direct manipulation. The interactive lab embedded
        in step 1 IS the explanation. Motion Player is demoted to a secondary
        link below for students who want a guided walkthrough first.
      */}
      <Link
        href={`/lesson/${id}/lab`}
        onClick={() =>
          track('cta_tap', { surface: 'lesson_intro', label: 'start', lesson: id })
        }
        className="mt-auto flex h-12 w-full items-center justify-between rounded-pill bg-ink-900 px-5 font-display text-base font-semibold text-paper"
      >
        <span>Хичээлийг эхлэх</span>
        <ArrowRight size={18} strokeWidth={2.2} />
      </Link>
      <Link
        href={`/lesson/${id}/play`}
        onClick={() =>
          track('cta_tap', { surface: 'lesson_intro', label: 'watch_animation', lesson: id })
        }
        className="mt-3 text-center font-display text-sm font-semibold text-ink-700 underline underline-offset-4"
      >
        Эхлээд анимаци үзэх
      </Link>
    </main>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-ink-300/70 bg-paper px-3 py-1.5 font-mono text-[11px] text-ink-700">
      {icon}
      {label}
    </span>
  );
}
