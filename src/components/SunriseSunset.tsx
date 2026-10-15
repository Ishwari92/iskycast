import { Sunrise, Sunset } from 'lucide-react';
import type { DailyPoint } from '../types/weather';
import { cityNow, formatDuration, formatTimeOfDay, parseWallTime } from '../utils/dateTime';

interface Props {
  today: DailyPoint | undefined;
  utcOffsetSeconds: number;
  now: number;
}

/** Sun arc showing today's daylight and the sun's current position. */
export default function SunriseSunset({ today, utcOffsetSeconds, now }: Props) {
  const rise = parseWallTime(today?.sunrise);
  const set = parseWallTime(today?.sunset);
  const localNow = cityNow(utcOffsetSeconds, now);

  if (rise === null || set === null || set <= rise) {
    return (
      <article className="panel p-6">
        <h3 className="section-title">Sunrise &amp; sunset</h3>
        <p className="mt-4 text-sm text-muted">
          Sunrise and sunset times are not available for this location today (e.g. polar day or night).
        </p>
      </article>
    );
  }

  const progress = Math.min(1, Math.max(0, (localNow - rise) / (set - rise)));
  const isDaylight = localNow >= rise && localNow <= set;
  const daylightMinutes = (set - rise) / 60000;
  const remainingMinutes = Math.max(0, (set - localNow) / 60000);

  // Semicircle arc from (20,100) to (220,100), centre (120,100), radius 100.
  const angle = Math.PI * (1 - progress);
  const sunX = 120 + 100 * Math.cos(angle);
  const sunY = 100 - 100 * Math.sin(angle);
  const arcLength = Math.PI * 100;

  return (
    <article className="panel p-6" aria-labelledby="sun-heading">
      <div className="flex items-center justify-between gap-2">
        <h3 id="sun-heading" className="section-title">
          Sunrise &amp; sunset
        </h3>
        <span className="badge-forecast">Today</span>
      </div>

      <svg viewBox="0 0 240 116" className="mx-auto mt-4 w-full max-w-xs" role="img" aria-label={`Sun position: ${Math.round(progress * 100)}% through daylight`}>
        <path d="M20 100 A100 100 0 0 1 220 100" fill="none" strokeWidth="2" strokeDasharray="4 6" className="stroke-slate-300 dark:stroke-white/15" />
        <path
          d="M20 100 A100 100 0 0 1 220 100"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          stroke="url(#sun-arc)"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - progress)}
        />
        <defs>
          <linearGradient id="sun-arc" x1="0" x2="1">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#8b7cf8" />
          </linearGradient>
        </defs>
        <line x1="8" y1="100" x2="232" y2="100" strokeWidth="1" className="stroke-slate-300 dark:stroke-white/15" />
        {isDaylight && (
          <>
            <circle cx={sunX} cy={sunY} r="13" fill="#fbbf24" opacity="0.25" />
            <circle cx={sunX} cy={sunY} r="7.5" fill="#fbbf24" />
          </>
        )}
      </svg>

      <dl className="mt-2 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2.5">
          <Sunrise className="h-5 w-5 text-amber-500" aria-hidden="true" />
          <div>
            <dt className="text-muted">Sunrise</dt>
            <dd className="font-semibold">{formatTimeOfDay(today?.sunrise ?? null)}</dd>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 text-right">
          <div>
            <dt className="text-muted">Sunset</dt>
            <dd className="font-semibold">{formatTimeOfDay(today?.sunset ?? null)}</dd>
          </div>
          <Sunset className="h-5 w-5 text-orange-500" aria-hidden="true" />
        </div>
      </dl>
      <p className="mt-4 text-center text-sm text-soft">
        {formatDuration(daylightMinutes)} of daylight
        {isDaylight
          ? ` · ${formatDuration(remainingMinutes)} left`
          : localNow < rise
            ? ' · sun not up yet'
            : ' · sun has set'}
      </p>
    </article>
  );
}
