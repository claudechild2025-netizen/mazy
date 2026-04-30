/**
 * Lightweight analytics for the Mazaalai microlearning platform.
 *
 * Two responsibilities:
 *   1. `track(event, meta)` — fire-and-forget event logger.
 *      In dev it logs to console; in prod it inserts into Supabase `events`.
 *   2. `useTimeOnScreen(screenId)` — React hook that records the duration a
 *      student spends on a screen. This is the primary input for cognitive
 *      efficiency analysis in the thesis (Sweller, 1988).
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

// ---------- track ----------

type EventMeta = Record<string, unknown>;

export function track(event: string, meta: EventMeta = {}): void {
  if (typeof window === 'undefined') return;

  const payload = {
    user_id: getUserId(),
    event,
    meta,
    ts: Date.now(),
    // helpful for cross-screen funnel reconstruction
    path: window.location.pathname,
    viewport: { w: window.innerWidth, h: window.innerHeight },
  };

  if (process.env.NODE_ENV !== 'production') {
    // dev: print to console for fast iteration
    // eslint-disable-next-line no-console
    console.log('[track]', event, payload);
    return;
  }

  // prod: insert into Supabase. Imported lazily so the dashboard
  // doesn't pay the cost of the Supabase client until first event fires.
  import('./supabase')
    .then(({ supabase }) => supabase.from('events').insert(payload))
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
