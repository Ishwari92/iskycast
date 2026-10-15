import { Droplet } from 'lucide-react';
import WeatherIllustration from './WeatherIllustration';
import type { HourlyPoint, TemperatureUnit } from '../types/weather';
import { formatTemperature } from '../utils/temperature';
import { formatHourLabel } from '../utils/dateTime';
import { getWeatherDisplay } from '../utils/weatherCodes';

interface Props {
  hours: HourlyPoint[];
  unit: TemperatureUnit;
}

export default function HourlyForecast({ hours, unit }: Props) {
  return (
    <section id="hourly" tabIndex={-1} aria-labelledby="hourly-heading" className="scroll-mt-6 focus:outline-none">
      <div className="flex items-center justify-between gap-2">
        <h2 id="hourly-heading" className="section-title">
          Today
        </h2>
        <span className="badge-forecast">Hourly forecast</span>
      </div>

      {hours.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Hourly forecast is unavailable.</p>
      ) : (
        <ol
          className="scrollbar-thin relative -mx-1 mt-4 flex snap-x gap-3 overflow-x-auto px-1 pb-3"
          aria-label="Forecast for the next 24 hours"
          tabIndex={0}
        >
          {hours.map((h, i) => {
            const isNow = i === 0;
            const display = getWeatherDisplay(h.weatherCode, h.isDay);
            return (
              <li
                key={h.time}
                className={`flex w-[5.5rem] shrink-0 snap-start flex-col items-center rounded-2xl px-2 py-4 text-center transition-colors ${
                  isNow
                    ? 'bg-brand-500 text-white shadow-glow'
                    : 'subpanel hover:bg-slate-200/80 dark:hover:bg-night-800'
                }`}
                aria-current={isNow ? 'time' : undefined}
              >
                <span className={`text-sm font-semibold ${isNow ? '' : 'text-soft'}`}>
                  {isNow ? 'Now' : formatHourLabel(h.time)}
                </span>
                <WeatherIllustration code={h.weatherCode} isDay={h.isDay} className="my-2 h-12 w-12" />
                <span className="sr-only">{display.label}, </span>
                <span className="text-lg font-semibold tabular-nums">{formatTemperature(h.temperature, unit)}</span>
                <span
                  className={`mt-1 flex items-center gap-0.5 text-xs ${
                    isNow ? 'text-white/85' : 'text-sky-600 dark:text-sky-300'
                  }`}
                  title="Chance of precipitation"
                >
                  <Droplet className="h-3 w-3" aria-hidden="true" />
                  <span className="sr-only">Chance of precipitation </span>
                  {h.precipitationProbability === null ? '—' : `${h.precipitationProbability}%`}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
