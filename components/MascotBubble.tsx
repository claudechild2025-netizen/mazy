'use client';

/*
  Inline Mazaalai coaching bubble used by Phase 3 practice drills and the
  /quiz wrong-feedback. One short sentence in Mongolian, ≤ 12 words. The
  bubble fades in, holds for ~3s, fades out — students learn from the cue
  but it does not block the next attempt.
*/
type Props = {
  visible: boolean;
  message: string;
};

export function MascotBubble({ visible, message }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none flex items-start gap-2 rounded-card bg-info-bg/70 p-3 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span className="text-2xl" aria-hidden>
        🐻
      </span>
      <div className="flex-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-info-fg">
          Мазаалай
        </p>
        <p className="mt-0.5 text-sm leading-snug text-ink-900">{message}</p>
      </div>
    </div>
  );
}
