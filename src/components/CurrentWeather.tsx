import { lazy, Suspense } from 'react';
import {
  CalendarDays,
  Clock3,
  Droplets,
  Gauge,
  RotateCw,
  Star,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from 'lucide-react';
import WeatherIllustration from './WeatherIllustration';
import { formatPlace } from './CitySearch';
import type { GeoLocation, TemperatureUnit, WeatherData } from '../types/weather';
import { formatTemperature, unitSymbol, convertTemperature } from '../utils/temperature';
import { getWeatherDisplay, heroGradient } from '../utils/weatherCodes';
import {
  cityNow,
  formatClock,
  formatLongDate,
  formatRelative,
  formatTimeOfDay,
  formatViewerTime,
} from '../utils/dateTime';
import { todayPeriods, upcomingHours } from '../utils/forecast';

const WeatherChart = lazy(() => import('./WeatherChart'));

interface Props {
  location: GeoLocation;
  data: WeatherData;
  unit: TemperatureUnit;
  now: number;
  isFavorite: boolean;
  refreshing: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
}

function placeLabel(location: GeoLocation): string {
  if (location.isCurrentLocation) {
    return `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`;
  }
  return formatPlace(location);
}

export default function CurrentWeather({
  location,
  data,
  unit,
  now,
  isFavorite,
  refreshing,
  onToggleFavorite,
  onRefresh,
}: Props) {
  const { current } = data;
  const today = data.daily[0];
  const display = getWeatherDisplay(current.weatherCode, current.isDay);
  const localNow = cityNow(data.utcOffsetSeconds, now);
  const hours = upcomingHours(data, 24);
  const periods = todayPeriods(data);
  const bigTemp =
    current.temperature === null ? '—' : Math.round(convertTemperature(current.temperature, unit));

  return (
    <section
      id="overview"
      tabIndex={-1}
      aria-labelledby="current-heading"
      className="panel relative scroll-mt-6 overflow-hidden focus:outline-none animate-fade-in"
    >
      {/* Condition-tinted glow behind the card content. */}
      <div
        className={`pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-gradient-to-br blur-3xl ${heroGradient(display.category, current.isDay)}`}
        aria-hidden="true"
      />

      <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {/* Current conditions */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-start justify-between gap-3">
            <WeatherIllustration
              code={current.weatherCode}
              isDay={current.isDay}
              className="-ml-2 h-28 w-28 animate-float drop-shadow-xl sm:h-32 sm:w-32"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleFavorite}
                className="btn-icon"
                aria-pressed={isFavorite}
                aria-label={isFavorite ? `Remove ${location.name} from saved locations` : `Save ${location.name}`}
                title={isFavorite ? 'Remove from saved locations' : 'Save location'}
              >
                <Star className={`h-5 w-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="btn-icon"
                aria-label="Refresh weather"
                title="Refresh weather"
              >
                <RotateCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <h1 id="current-heading" className="sr-only">
            Current weather in {location.name}
          </h1>
          <p className="mt-4 flex items-start text-7xl font-semibold leading-none tracking-tighter sm:text-8xl">
            <span className="tabular-nums">{bigTemp}</span>
            <span className="ml-1 mt-2 text-3xl font-medium text-slate-500 dark:text-indigo-200/70 sm:text-4xl">
              {unitSymbol(unit)}
            </span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="badge-now">Current</span>
            <p className="text-lg font-medium">{display.label}</p>
          </div>
          <p className="mt-1 text-sm text-muted">{display.description}</p>

          <h2 className="mt-4 truncate text-2xl font-semibold tracking-tight">
            {location.name}
            {location.countryCode && <span className="text-muted">, {location.countryCode}</span>}
          </h2>
          {placeLabel(location) && <p className="truncate text-sm text-muted">{placeLabel(location)}</p>}

          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-soft">
            <div className="flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-brand-500 dark:text-brand-300" aria-hidden="true" />
              <dt>Feels like</dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {formatTemperature(current.apparentTemperature, unit)}
              </dd>
            </div>
            {today && (
              <div className="flex items-center gap-1.5">
                <dt>H</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {formatTemperature(today.temperatureMax, unit)}
                </dd>
                <dt className="ml-1">L</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {formatTemperature(today.temperatureMin, unit)}
                </dd>
              </div>
            )}
          </dl>

          <div className="my-5 h-px bg-slate-200 dark:bg-white/10" />

          <div className="space-y-2.5 text-sm text-soft">
            <p className="flex items-center gap-2.5">
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
              {formatLongDate(localNow)}
            </p>
            <p className="flex items-center gap-2.5">
              <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="tabular-nums">{formatClock(localNow)}</span>
              <span className="text-muted">
                local time{data.timezoneAbbreviation ? ` (${data.timezoneAbbreviation})` : ''}
              </span>
            </p>
            {today && (
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-2">
                  <Sunrise className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  <span className="sr-only">Sunrise</span>
                  {formatTimeOfDay(today.sunrise)}
                </span>
                <span className="flex items-center gap-2">
                  <Sunset className="h-4 w-4 text-orange-500" aria-hidden="true" />
                  <span className="sr-only">Sunset</span>
                  {formatTimeOfDay(today.sunset)}
                </span>
              </p>
            )}
          </div>

          <p className="mt-5 text-xs text-muted" aria-live="polite">
            {refreshing ? 'Refreshing…' : (
              <>
                Updated {formatRelative(data.fetchedAt, now)}{' '}
                <span className="opacity-80">({formatViewerTime(data.fetchedAt)} your time)</span>
              </>
            )}
          </p>
        </div>

        {/* Temperature trend */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between gap-2">
            <h2 className="section-title">Temperature</h2>
            <span className="badge-forecast">Next 24 h forecast</span>
          </div>
          <div className="mt-4">
            <Suspense fallback={<div className="skeleton h-44 w-full" />}>
              <WeatherChart hours={hours} unit={unit} />
            </Suspense>
          </div>

          <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
            {periods.map((p) => (
              <div key={p.label}>
                <dt className="truncate text-xs text-muted sm:text-sm">{p.label}</dt>
                <dd className="mt-1 text-base font-semibold sm:text-lg">{formatTemperature(p.temperature, unit)}</dd>
              </div>
            ))}
          </dl>

          <div className="my-5 h-px bg-slate-200 dark:bg-white/10" />

          <dl className="mt-auto grid grid-cols-3 gap-2 text-sm text-soft">
            <div className="flex items-center justify-center gap-1.5">
              <Gauge className="h-4 w-4 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Pressure</dt>
              <dd>{current.pressureMsl === null ? '—' : `${Math.round(current.pressureMsl)} hPa`}</dd>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Droplets className="h-4 w-4 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Humidity</dt>
              <dd>{current.humidity === null ? '—' : `${Math.round(current.humidity)}%`}</dd>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Wind className="h-4 w-4 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Wind speed</dt>
              <dd>{current.windSpeed === null ? '—' : `${Math.round(current.windSpeed)} km/h`}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
