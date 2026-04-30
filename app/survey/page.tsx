'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { track, useTimeOnScreen } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';

/*
  /survey — post-lesson research questionnaire (7 questions, one-per-screen).

  Per MAZY_FINAL_PROMPT §6:
    - Auto-advance after each Likert tap (no extra "next" press)
    - Open answer Q6 + Consent Q7 use the BLACK CTA pill ("Үргэлжлүүлэх →")
    - Progress dots reflect step / total
    - Final submit inserts one row into `survey_responses` with all answers in JSONB
*/

type Question =
  | { type: 'likert'; id: string; text: string }
  | { type: 'open'; id: string; text: string; placeholder: string }
  | { type: 'consent'; id: string; text: string };

const QUESTIONS: Question[] = [
  {
    type: 'likert',
    id: 'q1_motion_graphic',
    text: 'Хичээлийн хөдөлгөөнт хэлбэрээр (анимаци, чирэх) өнцгийг гэрэл толинд тусгаж үзүүлэх нь номноос үнэлгээтэй сурдаг, тайлбар ойлгомжтой.',
  },
  {
    type: 'likert',
    id: 'q2_visual_clarity',
    text: 'Дэлгэцийн дүрст мэдээлэл (текст, өнгө, томруу) тэнцвэртэй харагдсан, нүд чилэхгүй, толгой эргэх мэдрэмж төрөөгүй.',
  },
  {
    type: 'likert',
    id: 'q3_navigation',
    text: 'Дараагийн хуудас руу шилжих, асуултад хариулах үйлдэл хийхэд саатал дараагаа гайхаж сөргөөгүй, ойлгомжтой байсан.',
  },
  {
    type: 'likert',
    id: 'q4_color_palette',
    text: 'Системийн өнгөний сонголт хичээлдээ анхаарлаа төвлөрүүлэхэд тусайсан, саадгүй байлаа.',
  },
  {
    type: 'likert',
    id: 'q5_mascot_microlearning',
    text: 'Мазаалай дүр болон 3-5 минутын богино хичээл нь үргэлжлүүлж суралцах түрхэцтэй.',
  },
  {
    type: 'open',
    id: 'q6_open_feedback',
    text: 'Юу нь хамгийн их таалагдсан бэ? Юуг өөрчилбөл бүр илүү гоё, ашиглахад тааламжтай болох вэ?',
    placeholder: 'Чөлөөтэй бичээрэй...',
  },
  {
    type: 'consent',
    id: 'q7_consent',
    text: 'Дараагийн илүү хөгжүүлсэн хувилбарыг туршиж үзэхэд санал бодлоо хуваалцах боломжтой юу?',
  },
];

const LIKERT_LABELS = [
  'Огт санал нийлэхгүй',
  'Санал нийлэхгүй',
  'Дунд зэрэг',
  'Санал нийлж байна',
  'Бүрэн санал нийлж байна',
];

export default function SurveyPage() {
  useTimeOnScreen('survey');
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [openText, setOpenText] = useState('');
  const [consentChoice, setConsentChoice] = useState<'yes' | 'no' | null>(null);
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const q = QUESTIONS[step];

  const submit = async (value: unknown) => {
    const payload = { ...answers, [q.id]: value };
    setAnswers(payload);
    track('survey_answer', { question_id: q.id, value });

    if (step + 1 < QUESTIONS.length) {
      setStep((s) => s + 1);
      setOpenText('');
      setConsentChoice(null);
      setContact('');
      return;
    }

    setSubmitting(true);
    const uid =
      typeof window === 'undefined'
        ? null
        : window.localStorage.getItem('mzl_uid');
    try {
      await supabase.from('survey_responses').insert({
        user_id_client: uid ?? `anon_${Date.now()}`,
        answers: payload,
        submitted_at: new Date().toISOString(),
      });
    } catch {
      // Network/Supabase missing in dev — never block UX on telemetry.
    }
    router.push('/done');
  };

  return (
    <main className="flex min-h-dvh flex-1 flex-col px-5 pb-8 pt-6">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5">
        {QUESTIONS.map((_, i) => (
          <span
            key={i}
            className={
              i < step
                ? 'h-2 w-2 rounded-full bg-success-fg'
                : i === step
                  ? 'h-2 w-2 rounded-full bg-ink-900'
                  : 'h-2 w-2 rounded-full bg-ink-300'
            }
          />
        ))}
      </div>

      <div className="mt-8 flex flex-1 flex-col">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
          Асуулт {step + 1} / {QUESTIONS.length}
        </p>
        <h1 className="mt-2 font-display text-xl font-bold leading-snug text-ink-900">
          {q.text}
        </h1>

        {q.type === 'likert' && (
          <div className="mt-8 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => submit(n)}
                className="flex w-full items-center justify-between rounded-card border border-ink-300/60 bg-paper p-4 active:bg-brand-50"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-display text-base font-bold text-ink-900">
                    {n}
                  </span>
                  <span className="text-left font-display text-sm text-ink-900">
                    {LIKERT_LABELS[n - 1]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {q.type === 'open' && (
          <>
            <textarea
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              placeholder={q.placeholder}
              rows={6}
              className="mt-6 w-full rounded-card border border-ink-300 bg-paper p-4 text-base outline-none focus:border-info-fg"
            />
            <button
              type="button"
              onClick={() =>
                submit(openText.trim() || '(хариу үлдээгээгүй)')
              }
              className="mt-auto flex h-12 w-full items-center justify-center rounded-pill bg-ink-900 font-display text-base font-semibold text-paper"
            >
              Үргэлжлүүлэх →
            </button>
          </>
        )}

        {q.type === 'consent' && (
          <>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setConsentChoice('yes')}
                className={
                  consentChoice === 'yes'
                    ? 'flex w-full items-center gap-3 rounded-card border-2 border-info-fg bg-info-bg p-4 text-left'
                    : 'flex w-full items-center gap-3 rounded-card border-2 border-ink-300/60 bg-paper p-4 text-left'
                }
              >
                <span className="text-xl" aria-hidden>✅</span>
                <span className="font-display text-sm font-semibold text-ink-900">
                  Тийм, дуртайяа оролцоно.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setConsentChoice('no')}
                className={
                  consentChoice === 'no'
                    ? 'flex w-full items-center gap-3 rounded-card border-2 border-info-fg bg-info-bg p-4 text-left'
                    : 'flex w-full items-center gap-3 rounded-card border-2 border-ink-300/60 bg-paper p-4 text-left'
                }
              >
                <span className="text-xl" aria-hidden>⏭️</span>
                <span className="font-display text-sm font-semibold text-ink-900">
                  Үгүй, боломжгүй.
                </span>
              </button>
            </div>

            {consentChoice === 'yes' && (
              <div className="mt-4">
                <p className="font-mono text-xs text-ink-500">
                  Холбоо барих мэдээллээ үлдээнэ үү:
                </p>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Имэйл эсвэл утасны дугаар"
                  className="mt-2 w-full rounded-pill border border-ink-300 bg-paper px-4 py-3 outline-none focus:border-info-fg"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                submit({
                  consent: consentChoice,
                  contact: consentChoice === 'yes' ? contact : null,
                })
              }
              disabled={
                submitting ||
                !consentChoice ||
                (consentChoice === 'yes' && !contact)
              }
              className="mt-auto flex h-12 w-full items-center justify-center rounded-pill bg-ink-900 font-display text-base font-semibold text-paper disabled:opacity-40"
            >
              {submitting ? 'Илгээж байна…' : 'Илгээх'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
