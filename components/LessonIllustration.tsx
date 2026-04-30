/*
  LessonIllustration — small set of inline SVG visuals used by Lesson Intro,
  Step, and Motion Player. Each variant follows the Spatial Contiguity
  Principle: angle/index labels sit *on the canvas* next to their feature.

  // TODO(dw): Replace with Rive/Lottie assets once the hi-fi prototype lands
  // and a separate asset pipeline is set up. For the 3-day usability test,
  // these schematic SVGs are sufficient.
*/

type Variant = 'reflection' | 'propagation' | 'refraction' | 'lens';

export function LessonIllustration({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  switch (variant) {
    case 'reflection':
      return <Reflection className={className} />;
    case 'propagation':
      return <Propagation className={className} />;
    case 'refraction':
      return <Refraction className={className} />;
    case 'lens':
      return <Lens className={className} />;
  }
}

function Reflection({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 160" className={className} aria-label="Гэрлийн ойлт">
      <line x1="20" y1="120" x2="300" y2="120" stroke="#1A1A1A" strokeWidth="2" />
      {Array.from({ length: 14 }).map((_, i) => (
        <line
          key={i}
          x1={28 + i * 20}
          y1={120}
          x2={20 + i * 20}
          y2={134}
          stroke="#1A1A1A"
          strokeWidth="1.5"
        />
      ))}
      <line
        x1="160"
        y1="20"
        x2="160"
        y2="120"
        stroke="#1A1A1A"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />
      <line x1="80" y1="36" x2="160" y2="120" stroke="#E8B400" strokeWidth="2.6" />
      <line x1="160" y1="120" x2="240" y2="36" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="160" cy="120" r="4" fill="#E8B400" />
      <path d="M 132 96 A 32 32 0 0 1 158 90" fill="none" stroke="#2563EB" strokeWidth="1.6" />
      <path d="M 162 90 A 32 32 0 0 1 188 96" fill="none" stroke="#2563EB" strokeWidth="1.6" />
      <text x="138" y="110" fontSize="12" fontFamily="ui-monospace, monospace" fill="#1A1A1A">i</text>
      <text x="178" y="110" fontSize="12" fontFamily="ui-monospace, monospace" fill="#1A1A1A">r</text>
    </svg>
  );
}

function Propagation({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 160" className={className} aria-label="Гэрлийн тархалт">
      <circle cx="46" cy="80" r="14" fill="#F4D63B" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="60" y1="80" x2="200" y2="80" stroke="#E8B400" strokeWidth="2.4" />
      <rect x="200" y="40" width="20" height="80" rx="3" fill="#1A1A1A" />
      <polygon points="220,80 300,40 300,120" fill="#FCEDA0" stroke="#1A1A1A" strokeWidth="1.5" opacity="0.55" />
      <text x="248" y="92" fontSize="12" fontFamily="ui-monospace, monospace" fill="#4A4A4A">сүүдэр</text>
    </svg>
  );
}

function Refraction({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 160" className={className} aria-label="Гэрлийн хугарал">
      <rect x="20" y="20" width="280" height="60" fill="#FEF9E7" />
      <rect x="20" y="80" width="280" height="60" fill="#DBEAFE" />
      <line x1="20" y1="80" x2="300" y2="80" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="160" y1="20" x2="160" y2="140" stroke="#1A1A1A" strokeWidth="1.2" strokeDasharray="4 4" />
      <line x1="80" y1="30" x2="160" y2="80" stroke="#E8B400" strokeWidth="2.6" />
      <line x1="160" y1="80" x2="220" y2="138" stroke="#E8B400" strokeWidth="2.6" />
      <path d="M 134 60 A 28 28 0 0 1 158 56" fill="none" stroke="#2563EB" strokeWidth="1.6" />
      <path d="M 162 100 A 22 22 0 0 1 178 116" fill="none" stroke="#16A34A" strokeWidth="1.6" />
      <text x="138" y="76" fontSize="12" fontFamily="ui-monospace, monospace" fill="#1A1A1A">θ₁</text>
      <text x="170" y="118" fontSize="12" fontFamily="ui-monospace, monospace" fill="#1A1A1A">θ₂</text>
      <text x="26" y="36" fontSize="11" fontFamily="ui-monospace, monospace" fill="#4A4A4A">n₁ агаар</text>
      <text x="26" y="100" fontSize="11" fontFamily="ui-monospace, monospace" fill="#4A4A4A">n₂ ус</text>
    </svg>
  );
}

function Lens({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 160" className={className} aria-label="Гүдгэр линз">
      <line x1="20" y1="80" x2="300" y2="80" stroke="#1A1A1A" strokeWidth="1.4" strokeDasharray="3 3" />
      <ellipse cx="160" cy="80" rx="22" ry="60" fill="#DBEAFE" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="40" y1="50" x2="160" y2="50" stroke="#E8B400" strokeWidth="2" />
      <line x1="160" y1="50" x2="260" y2="110" stroke="#E8B400" strokeWidth="2" />
      <line x1="40" y1="80" x2="260" y2="80" stroke="#E8B400" strokeWidth="2" />
      <circle cx="220" cy="80" r="3" fill="#1A1A1A" />
      <circle cx="100" cy="80" r="3" fill="#1A1A1A" />
      <text x="220" y="98" fontSize="11" fontFamily="ui-monospace, monospace" fill="#1A1A1A">F</text>
      <text x="92" y="98" fontSize="11" fontFamily="ui-monospace, monospace" fill="#1A1A1A">F</text>
    </svg>
  );
}
