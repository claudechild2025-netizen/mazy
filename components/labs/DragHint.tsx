'use client';

/*
  Visible gesture hint shown beneath every interactive lab. The previous
  inline `text-xs text-ink-500` line was easy to miss — students stared
  at the canvas without realising they could drag. This pill version uses
  the info-blue surface, a pulsing emoji, and a clear "ЧИРЖ ҮЗ" label.
*/
type Props = {
  message: string;
  emoji?: string;
};

export function DragHint({ message, emoji = '👆' }: Props) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-pill bg-info-bg px-4 py-3">
      <span className="text-2xl animate-pulse-soft" aria-hidden>
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-wider text-info-fg">
          Чирж үз
        </p>
        <p className="text-sm font-semibold leading-snug text-ink-900">
          {message}
        </p>
      </div>
    </div>
  );
}
