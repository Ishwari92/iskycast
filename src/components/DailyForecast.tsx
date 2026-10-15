import { Droplet } from 'lucide-react';
import WeatherIllustration from './WeatherIllustration';
import type { DailyPoint, TemperatureUnit } from '../types/weather';
import { formatTemperature } from '../utils/temperature';
import { formatShortDate, formatWeekday } from '../utils/dateTime';
import { getWeatherDisplay } from '../utils/weatherCodes';

interface Props {
  days: DailyPoint[];
  unit: TemperatureUnit;
}

function dayLabel(index: number, date: string): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return formatWeekday(date, false);
}

export default function DailyForecast({ days, unit }: Props) {
  const mins = days.map((d) => d.temperatureMin).filter((v): v is number => v !== null);
  const maxs = days.map((d) => d.temperatureMax).filter((v): v is number => v !== null);
  const weekMin = mins.length ? Math.min(...mins) : 0;
  const weekMax = maxs.length ? Math.max(...maxs) : 1;
  const span = Math.max(1, weekMax - weekMin);

  return (
    <section id="weekly" tabIndex={-1} aria-labelledby="weekly-heading" className="scroll-mt-6 focus:outline-none">
      <div className="flex items-center justify-between gap-2">
        <h2 id="weekly-heading" className="section-title">
          This week
        </h2>
        <span className="badge-forecast">7-day forecast</span>
      </div>

      <ul className="mt-3 divide-y divide-slate-200/80 dark:divide-white/[0.06]">
        {days.map((d, i) => {
          const display = getWeatherDisplay(d.weatherCode);
          const hasRange = d.temperatureMin !== null && d.temperatureMax !== null;
          const left = hasRange ? ((d.temperatureMin! - weekMin) / span) * 100 : 0;
          const width = hasRange ? ((d.temperatureMax! - d.temperatureMin!) / span) * 100 : 0;
          return (
            <li key={d.date} className="flex items-center gap-2 py-3.5 sm:gap-3">
              <div className="w-[4.5rem] shrink-0 sm:w-24">
                <p className="truncate font-semibold">{dayLabel(i, d.date)}</p>
                <p className="text-xs text-muted">{formatShortDate(d.date)}</p>
              </div>

              <div className="flex w-11 shrink-0 flex-col items-center" title={display.label}>
                <WeatherIllustration code={d.weatherCode} className="h-10 w-10" />
                <span className="sr-only">{display.label}</span>
              </div>

              <span
                className="flex w-11 shrink-0 items-center gap-0.5 text-xs text-sky-600 dark:text-sky-300"
                title="Maximum chance of precipitation"
              >
                <Droplet className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">Chance of precipitation </span>
                {d.precipitationProbabilityMax === null ? '—' : `${d.precipitationProbabilityMax}%`}
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-2 text-sm tabular-nums">
                <span className="w-8 shrink-0 text-right text-muted">
                  <span className="sr-only">Low </span>
                  {formatTemperature(d.temperatureMin, unit)}
                </span>
                <span className="relative h-1.5 min-w-[2rem] flex-1 rounded-full bg-slate-200 dark:bg-white/10" aria-hidden="true">
                  {hasRange && (
                    <span
                      className="absolute inset-y-0 rounded-full bg-gradient-to-r from-cyan-400 via-brand-500 to-amber-400"
                      style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                    />
                  )}
                </span>
                <span className="w-8 shrink-0 font-semibold">
                  <span className="sr-only">High </span>
                  {formatTemperature(d.temperatureMax, unit)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
