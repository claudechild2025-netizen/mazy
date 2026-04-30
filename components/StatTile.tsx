/*
  StatTile — pastel quad-tile from DESIGN_V4.md.
  Category drives bg + fg color identity:
    streak=peach (heat), xp=cream (gold), lessons=sky (info), trophy=mint (success).
*/
type Category = 'streak' | 'xp' | 'lessons' | 'trophy';

const STYLES: Record<Category, { bg: string; fg: string }> = {
  streak:  { bg: 'bg-pastel-peach-bg', fg: 'text-pastel-peach-fg' },
  xp:      { bg: 'bg-pastel-cream-bg', fg: 'text-pastel-cream-fg' },
  lessons: { bg: 'bg-pastel-sky-bg',   fg: 'text-pastel-sky-fg' },
  trophy:  { bg: 'bg-pastel-mint-bg',  fg: 'text-pastel-mint-fg' },
};

export function StatTile({
  category,
  emoji,
  value,
  label,
}: {
  category: Category;
  emoji: string;
  value: number | string;
  label: string;
}) {
  const s = STYLES[category];
  return (
    <div
      className={`${s.bg} flex flex-col items-center justify-center rounded-card py-4`}
    >
      <span className="text-2xl" aria-hidden>{emoji}</span>
      <p className="mt-1 font-display text-2xl font-extrabold text-ink-900">
        {value}
      </p>
      <p className={`font-mono text-[11px] uppercase tracking-wider ${s.fg}`}>
        {label}
      </p>
    </div>
  );
}
