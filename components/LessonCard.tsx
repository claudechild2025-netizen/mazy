import Link from 'next/link';
import { Lock } from 'lucide-react';

/*
  LessonCard — one row used by Home preview list and Lessons List.
  Locked variant dims the card and removes the link wrapper so it can't be tapped.
*/
export function LessonCard({
  id,
  emoji,
  title,
  duration,
  xp,
  locked = false,
}: {
  id: string;
  emoji: string;
  title: string;
  duration: number;
  xp: number;
  locked?: boolean;
}) {
  const inner = (
    <div
      className={
        locked
          ? 'flex items-center gap-3 rounded-card border border-ink-300/60 bg-paper p-3 opacity-50'
          : 'flex items-center gap-3 rounded-card border border-ink-300/60 bg-paper p-3'
      }
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl"
        aria-hidden
      >
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-display text-base font-bold text-ink-900 truncate">
          {title}
        </p>
        <p className="font-mono text-xs text-ink-500">
          {duration} мин · +{xp} XP
        </p>
      </div>
      {locked && <Lock size={16} className="text-ink-500" />}
    </div>
  );

  return locked ? inner : <Link href={`/lesson/${id}`}>{inner}</Link>;
}
