/**
 * Lightweight analytics for the Mazaalai microlearning platform.
 *
 * Two responsibilities:
 *   1. `track(event, meta)` — fire-and-forget event logger.
 *      Always writes to Supabase `events` when env is configured. For
 *      `screen_view` and `quiz_answer` events it ALSO writes to the
 *      dedicated thesis tables (`screen_views`, `quiz_answers`).
 *   2. `useTimeOnScreen(screenId)` — React hook that records the duration a
 *      student spends on a screen. Primary input for cognitive efficiency
 *      analysis (Sweller, 1988).
 *
 * Privacy notes:
 *   - No PII is ever collected.
 *   - No mouse coordinates, no keystrokes, no third-party SDKs.
 *   - Anonymous user_id is stored in localStorage (see `getUserId`).
 */

'use client';

import { useEffect, useRef } from 'react';

// ---------- session id ----------

const USER_ID_KEY = 'mzl_uid';

export function getUserId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let uid = window.localStorage.getItem(USER_ID_KEY);
  if (!uid) {
    uid = `u_${crypto.randomUUID()}`;
    window.localStorage.setItem(USER_ID_KEY, uid);
  }
  return uid;
}

// ---------- ensure user row exists ----------

let userEnsured = false;

async function ensureUserRow(uid: string): Promise<void> {
  if (userEnsured) return;
  userEnsured = true;
  try {
    const { supabase, isSupabaseConfigured } = await import('./supabase');
    if (!isSupabaseConfigured) return;
    await supabase
      .from('users')
      .upsert({ client_uid: uid }, { onConflict: 'client_uid', ignoreDuplicates: true });
  } catch {
    /* analytics must never break the UI */
  }
}

// ---------- track ----------

type EventMeta = Record<string, unknown>;

const asString = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const asNumber = (v: unknown): number | null => (typeof v === 'number' ? v : null);

export function track(event: string, meta: EventMeta = {}): void {
  if (typeof window === 'undefined') return;

  const uid = getUserId();
  const payload = {
    user_id: uid,
    event,
    meta,
    ts: Date.now(),
    path: window.location.pathname,
    viewport: { w: window.innerWidth, h: window.innerHeight },
  };

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[track]', event, payload);
  }

  import('./supabase')
    .then(({ supabase, isSupabaseConfigured }) => {
      if (!isSupabaseConfigured) return;

      ensureUserRow(uid);

      supabase
        .from('events')
        .insert(payload)
        .then(({ error }) => {
          if (error) console.warn('[track] events insert failed:', error.message);
        });

      if (event === 'screen_view') {
        const elapsed = asNumber(meta.elapsed_ms) ?? 0;
        supabase
          .from('screen_views')
          .insert({
            client_uid: uid,
            screen_slug: asString(meta.screen_id),
            time_spent_ms: elapsed,
            completed: false,
          })
          .then(({ error }) => {
            if (error) console.warn('[track] screen_views insert failed:', error.message);
          });
      } else if (event === 'quiz_answer') {
        const lessonMatch = window.location.pathname.match(/lesson\/([^/]+)/);
        supabase
          .from('quiz_answers')
          .insert({
            client_uid: uid,
            question_key: asString(meta.question_id),
            selected_key: asString(meta.selected_option) ?? '',
            is_correct: !!meta.is_correct,
            time_to_answer_ms: asNumber(meta.time_to_answer_ms) ?? 0,
            lesson_id: lessonMatch ? lessonMatch[1] : null,
          })
          .then(({ error }) => {
            if (error) console.warn('[track] quiz_answers insert failed:', error.message);
          });
      }
    })
    .catch(() => {
      /* swallow — analytics must never break the UI */
    });
}

// ---------- useTimeOnScreen ----------

/**
 * Mounts a timer for the current screen. On unmount (or tab hide) it persists
 * the elapsed milliseconds. Survives:
 *   - hard navigation (beforeunload)
 *   - soft navigation (component unmount)
 *   - app switching on mobile (visibilitychange)
 *
 * Usage:
 *   useTimeOnScreen('learn_screen_3');
 */
export function useTimeOnScreen(screenId: string): void {
  const startedAt = useRef<number>(0);
  const flushed = useRef<boolean>(false);

  useEffect(() => {
    startedAt.current = performance.now();
    flushed.current = false;

    const flush = () => {
      if (flushed.current) return;
      flushed.current = true;
      const elapsed_ms = Math.round(performance.now() - startedAt.current);
      track('screen_view', { screen_id: screenId, elapsed_ms });
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', flush);

    return () => {
      flush();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', flush);
    };
  }, [screenId]);
}

// ---------- specialised helpers ----------

/** Record a quiz answer with timing — separated for thesis-friendly schema. */
export function trackQuizAnswer(args: {
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  time_to_answer_ms: number;
}): void {
  track('quiz_answer', args);
}

/** Record a single SUS Likert response (1–5). Call 10× at end of session. */
export function trackSusResponse(question_number: number, score: 1 | 2 | 3 | 4 | 5): void {
  track('sus_response', { question_number, score });
}
