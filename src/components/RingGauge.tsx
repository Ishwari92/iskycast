interface Props {
  /** 0–1 fill fraction. */
  fraction: number;
  label: string;
  /** Accessible description, e.g. "Humidity 64 percent". */
  ariaLabel: string;
  /** Tailwind stroke colour class for the filled arc. */
  colorClass?: string;
  size?: number;
}

/** Circular progress ring with a centred value. */
export default function RingGauge({
  fraction,
  label,
  ariaLabel,
  colorClass = 'stroke-brand-500',
  size = 96,
}: Props) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, fraction));

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          className={`${colorClass} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums">
        {label}
      </span>
    </div>
  );
}
