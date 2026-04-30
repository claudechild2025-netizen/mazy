'use client';

import { Flame, X } from 'lucide-react';
import { track } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';

/*
  14 · Streak Modal — bottom sheet over a dimmed --ink-900/40 backdrop.
  Triggered after Lesson Complete (13) or from the streak chip on Home (04).

  Visual rules (from PROJECT_PLAN_v2 §5 + §3):
    - Backdrop: ink-900 at 40% opacity
    - Sheet: white, 24px top radius
    - Flame circle: heat-bg with heat-fg flame icon
    - 7 day-of-week chips:
        * completed → orange filled (heat-bg + heat-fg ring)
        * today (and not yet completed) → white outlined
        * future → muted ink-300

  // TODO(dw): Animate the sheet on open with Framer Motion (slide-up + scrim
  // fade). Confirm exact corner radius vs. the hi-fi prototype.
*/

type Props = {
  open: boolean;
  onClose: () => void;
  streakDays: number;
  // Day index of "today" (0 = Mon ... 6 = Sun), matches the visual chip row.
  todayIndex?: number;
};

const DAY_LABELS = ['Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям', 'Ням'];

export function StreakModal({
  open,
  onClose,
  streakDays,
  todayIndex = 0,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Дараалсан өдрүүд"
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          type="button"
          aria-label="Хаах"
          onClick={() => {
            track('cta_tap', { surface: 'streak_modal', label: 'backdrop' });
            onClose();
          }}
          className="absolute inset-0 bg-ink-900/40"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[480px] rounded-t-[28px] bg-paper px-5 pt-5 pb-7 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.25)]"
        >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-300" />

        <button
          type="button"
          aria-label="Хаах"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-700 hover:bg-ink-300/30"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <div className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-heat-bg"
          >
            <Flame size={40} className="text-heat-fg" strokeWidth={2.2} />
          </motion.div>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-ink-500">
            Дараалал
          </p>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-ink-900">
            {streakDays} хоног
          </h2>
          <p className="mt-2 max-w-[280px] text-sm text-ink-700">
            Сайн байна! Маргааш 5 минут хичээллэвэл дараалал үргэлжилнэ.
          </p>

          <div className="mt-6 grid w-full grid-cols-7 gap-1.5">
            {DAY_LABELS.map((label, idx) => {
              const completed = idx < todayIndex;
              const isToday = idx === todayIndex;
              return (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500">
                    {label}
                  </span>
                  <span
                    className={
                      completed
                        ? 'flex h-9 w-9 items-center justify-center rounded-full bg-heat-bg text-heat-fg'
                        : isToday
                          ? 'flex h-9 w-9 items-center justify-center rounded-full border-2 border-heat-fg text-heat-fg'
                          : 'flex h-9 w-9 items-center justify-center rounded-full bg-ink-300/30 text-ink-500'
                    }
                  >
                    {completed ? <Flame size={16} /> : isToday ? '•' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              track('cta_tap', { surface: 'streak_modal', label: 'continue' });
              onClose();
            }}
            className="mt-7 flex h-12 w-full items-center justify-center rounded-pill bg-ink-900 px-5 font-display text-base font-semibold text-paper"
          >
            Үргэлжлүүлэх
          </button>
        </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
