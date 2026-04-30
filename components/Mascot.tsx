/*
  Mazy mascot — yellow lightbulb with a friendly face.

  Inline SVG (no asset pipeline needed for the 3-day test). Sizes are
  controlled by `size` prop; default 96px matches Splash + Onboarding panels.

  // TODO(dw): Refine pose, expression, and proportions once the hi-fi
  // prototype HTML lands in reference/mazy_prototype.html. The current
  // figure is a deliberately simple stand-in derived from §3 brand tokens.
*/
type Props = {
  size?: number;
  className?: string;
  expression?: 'happy' | 'wink' | 'celebrate';
};

export function Mascot({ size = 96, className, expression = 'happy' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Mazy"
      className={className}
    >
      {/* Glow halo */}
      <circle cx="60" cy="56" r="46" fill="#FEF9E7" />
      {/* Bulb body */}
      <path
        d="M60 18c-17 0-29 13-29 29 0 11 6 19 13 25v8a6 6 0 006 6h20a6 6 0 006-6v-8c7-6 13-14 13-25 0-16-12-29-29-29z"
        fill="#F4D63B"
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Screw base */}
      <rect x="48" y="92" width="24" height="6" rx="2" fill="#1A1A1A" />
      <rect x="50" y="100" width="20" height="6" rx="3" fill="#4A4A4A" />
      {/* Cheeks */}
      <circle cx="44" cy="60" r="4" fill="#F97316" opacity="0.65" />
      <circle cx="76" cy="60" r="4" fill="#F97316" opacity="0.65" />
      {/* Eyes */}
      {expression === 'wink' ? (
        <>
          <circle cx="50" cy="52" r="3.2" fill="#1A1A1A" />
          <path
            d="M68 52 q4 0 8 0"
            stroke="#1A1A1A"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <circle cx="50" cy="52" r="3.2" fill="#1A1A1A" />
          <circle cx="70" cy="52" r="3.2" fill="#1A1A1A" />
        </>
      )}
      {/* Smile */}
      <path
        d={
          expression === 'celebrate'
            ? 'M48 66 q12 14 24 0'
            : 'M50 64 q10 8 20 0'
        }
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sparkle (celebrate only) */}
      {expression === 'celebrate' && (
        <g stroke="#E8B400" strokeWidth="2.4" strokeLinecap="round">
          <line x1="22" y1="30" x2="28" y2="30" />
          <line x1="25" y1="27" x2="25" y2="33" />
          <line x1="92" y1="34" x2="98" y2="34" />
          <line x1="95" y1="31" x2="95" y2="37" />
        </g>
      )}
    </svg>
  );
}
