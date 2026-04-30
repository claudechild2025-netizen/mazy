'use client';

import Link from 'next/link';
import { useRouter, notFound, useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ReflectionLab } from '@/components/labs/ReflectionLab';
import { ShadowLab } from '@/components/labs/ShadowLab';
import { SphericalMirrorLab } from '@/components/labs/SphericalMirrorLab';
import { getLesson } from '@/lib/lessons';
import { track, useTimeOnScreen } from '@/lib/analytics';

/*
  /lesson/[id]/lab — v4 main lesson surface (the lab IS the lesson).

  Per MAZY_FINAL_PROMPT routing flow:
    /lesson/reflection → "Эхлэх" → /lesson/reflection/lab → "Үргэлжлүүлэх →" → /quiz

  Mastery is tracked but does not gate the CTA — fast students proceed
  whenever they want, slow students stay with the canvas longer.
*/
export default function LessonLabPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const lesson = getLesson(id);
  useTimeOnScreen(`lesson_lab:${id}`);

  if (!lesson) notFound();

  const goToQuiz = () => {
    track('cta_tap', { surface: 'lesson_lab', label: 'continue', lesson: id });
    router.push(`/quiz?lesson=${id}&q=1`);
  };

  return (
    <main className="flex flex-1 flex-col px-5 pt-6 pb-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/lesson/${id}`}
          aria-label="Буцах"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-300/70"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
          ИНТЕРАКТИВ ЛАБ
        </p>
        <span className="w-10" />
      </div>

      <div className="mt-6">
        <LabBody lesson={lesson} />
      </div>

      <button
        type="button"
        onClick={goToQuiz}
        className="mt-auto flex h-12 w-full items-center justify-between rounded-pill bg-ink-900 px-5 font-display text-base font-semibold text-paper"
      >
        <span>Үргэлжлүүлэх</span>
        <ArrowRight size={18} strokeWidth={2.2} />
      </button>
    </main>
  );
}

function LabBody({ lesson }: { lesson: ReturnType<typeof getLesson> }) {
  if (!lesson) return null;
  switch (lesson.lab) {
    case 'reflection':
      return <ReflectionLab surface={`lesson_lab:${lesson.id}`} />;
    case 'shadow':
      return <ShadowLab surface={`lesson_lab:${lesson.id}`} />;
    case 'spherical-mirror':
      return <SphericalMirrorLab surface={`lesson_lab:${lesson.id}`} />;
  }

  // TODO(dw): interactivity below standard, see ReflectionLab.tsx comment.
  // This lesson needs its own seed-quality lab (refraction, prism, etc.).
  return (
    <div className="rounded-card border border-dashed border-ink-300/70 px-6 py-12 text-center">
      <span className="text-5xl" aria-hidden>🔧</span>
      <p className="mt-3 font-display text-base font-bold text-ink-900">
        {lesson.title_mn}
      </p>
      <p className="mt-1 max-w-[260px] text-sm text-ink-500 mx-auto">
        Интерактив хувилбар удахгүй. Тестэд ороод үргэлжлүүлээрэй.
      </p>
    </div>
  );
}
