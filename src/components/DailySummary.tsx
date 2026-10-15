import { AlertTriangle, Info, Sparkles } from 'lucide-react';
import type { TemperatureUnit, WeatherData } from '../types/weather';
import { buildDailySummary, type SummaryTone } from '../utils/weatherSummary';

const TONE_STYLE: Record<SummaryTone, { Icon: typeof Info; className: string }> = {
  info: { Icon: Info, className: 'text-sky-500 dark:text-sky-300' },
  caution: { Icon: AlertTriangle, className: 'text-amber-500 dark:text-amber-300' },
  warning: { Icon: AlertTriangle, className: 'text-red-500 dark:text-red-400' },
};

interface Props {
  data: WeatherData;
  unit: TemperatureUnit;
}

export default function DailySummary({ data, unit }: Props) {
  const summary = buildDailySummary(data, unit);

  return (
    <article className="panel relative overflow-hidden p-6" aria-labelledby="summary-heading">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-500/25 via-cyan-400/10 to-transparent blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between gap-2">
        <h3 id="summary-heading" className="section-title flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-500 dark:text-brand-300" aria-hidden="true" />
          Today at a glance
        </h3>
        <span className="badge-forecast">Forecast</span>
      </div>

      {summary ? (
        <>
          <p className="relative mt-4 text-base font-medium leading-relaxed">{summary.headline}</p>
          {summary.points.length > 0 && (
            <ul className="relative mt-4 space-y-2.5">
              {summary.points.map(({ text, tone }) => {
                const { Icon, className } = TONE_STYLE[tone];
                return (
                  <li key={text} className="flex gap-2.5 text-sm text-soft">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${className}`} aria-hidden="true" />
                    <span>{text}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="relative mt-4 text-xs text-muted">Generated from today's forecast values.</p>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted">A summary isn't available for today.</p>
      )}
    </article>
  );
}
