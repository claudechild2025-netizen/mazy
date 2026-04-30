'use client';

import Link from 'next/link';
import { useTimeOnScreen, track } from '@/lib/analytics';
import { Mascot } from '@/components/Mascot';

/*
  /done — final thank-you screen after the survey is submitted.
  Routes back to /lessons or /. No new actions are gated here — the test
  session is logically complete.
*/
export default function DonePage() {
  useTimeOnScreen('done');

  return (
    <main className="bg-brand-gradient flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <Mascot size={140} expression="celebrate" />
      <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900">
        Баярлалаа!
      </h1>
      <p className="mt-3 max-w-[320px] text-sm leading-relaxed text-ink-700">
        Чиний санал бодол Mazy-ийг сайжруулахад асар их тус болж байна.
        Одоо хичээлдээ үргэлжлүүлж эсвэл хаагаад болно.
      </p>

      <div className="mt-10 w-full max-w-[320px] space-y-3">
        <Link
          href="/lessons"
          onClick={() =>
            track('cta_tap', { surface: 'done', label: 'lessons' })
          }
          className="flex h-12 w-full items-center justify-center rounded-pill bg-ink-900 font-display text-base font-semibold text-paper"
        >
          Бусад хичээл харах
        </Link>
        <Link
          href="/"
          onClick={() => track('cta_tap', { surface: 'done', label: 'home' })}
          className="block w-full text-center font-display text-sm font-semibold text-ink-700 underline underline-offset-4"
        >
          Нүүрт буцах
        </Link>
      </div>
    </main>
  );
}
