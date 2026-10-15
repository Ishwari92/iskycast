import type { ReactNode } from 'react';
import {
  CloudRain,
  Cloudy,
  Droplets,
  Eye,
  Gauge,
  Navigation,
  SunMedium,
  Wind,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import RingGauge from './RingGauge';
import type { DailyPoint, HourlyPoint, WeatherData } from '../types/weather';
import {
  compassDirection,
  describeCloudCover,
  describeHumidity,
  describePressure,
  describeVisibility,
  describeWind,
  formatVisibility,
  uvLevel,
} from '../utils/metrics';

type Source = 'now' | 'hour' | 'today';

const SOURCE_LABEL: Record<Source, string> = {
  now: 'Now',
  hour: 'This hour',
  today: 'Today',
};

interface CardProps {
  title: string;
  Icon: LucideIcon;
  source: Source;
  children: ReactNode;
}

function MetricCard({ title, Icon, source, children }: CardProps) {
  return (
    <article className="panel flex min-w-0 flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <header className="flex items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 font-semibold">
          <Icon className="h-[18px] w-[18px] shrink-0 text-brand-500 dark:text-brand-300" aria-hidden="true" />
          <span className="truncate">{title}</span>
        </h3>
        <span
          className={source === 'now' ? 'badge-now' : 'badge-forecast'}
          title={source === 'now' ? 'Current conditions' : 'Forecast value'}
        >
          {SOURCE_LABEL[source]}
        </span>
      </header>
      <div className="mt-4 flex flex-1 items-center gap-4">{children}</div>
    </article>
  );
}

function Unavailable() {
  return <p className="text-sm text-muted">Not available for this location.</p>;
}

function Value({ value, unit, note }: { value: string; unit?: string; note?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-3xl font-semibold tabular-nums tracking-tight">
        {value}
        {unit && <span className="ml-1 text-base font-medium text-muted">{unit}</span>}
      </p>
      {note && <p className="mt-1 text-sm text-soft">{note}</p>}
    </div>
  );
}

/** Small SVG line of upcoming hourly wind speeds (forecast). */
function WindSparkline({ hours }: { hours: HourlyPoint[] }) {
  const values = hours.map((h) => h.windSpeed).filter((v): v is number => v !== null);
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const w = 160;
  const h = 44;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - 4 - ((v - min) / Math.max(1, max - min)) * (h - 8)).toFixed(1)}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-brand-400"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

interface Props {
  data: WeatherData;
  hours: HourlyPoint[];
}

export default function WeatherMetrics({ data, hours }: Props) {
  const { current } = data;
  const thisHour: HourlyPoint | undefined = hours[0];
  const today: DailyPoint | undefined = data.daily[0];

  const uvNow = thisHour?.uvIndex ?? null;
  const uv = uvNow !== null ? uvLevel(uvNow) : null;
  const visibility = thisHour?.visibility ?? null;
  const rainChance = today?.precipitationProbabilityMax ?? null;

  return (
    <section id="metrics" tabIndex={-1} aria-labelledby="metrics-heading" className="scroll-mt-6 focus:outline-none">
      <h2 id="metrics-heading" className="section-title mb-4">
        Conditions
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard title="Wind" Icon={Wind} source="now">
          {current.windSpeed === null ? (
            <Unavailable />
          ) : (
            <div className="w-full min-w-0">
              <WindSparkline hours={hours} />
              <div className="mt-2 flex items-end justify-between gap-2">
                <Value value={String(Math.round(current.windSpeed))} unit="km/h" note={describeWind(current.windSpeed)} />
                {current.windDirection !== null && (
                  <div className="flex flex-col items-center text-xs text-muted">
                    <Navigation
                      className="h-6 w-6 text-brand-500 dark:text-brand-300"
                      // Wind direction is where it blows FROM; the arrow points where it goes.
                      style={{ transform: `rotate(${current.windDirection + 180 - 45}deg)` }}
                      aria-hidden="true"
                    />
                    <span className="mt-1">
                      From {compassDirection(current.windDirection)} ({Math.round(current.windDirection)}°)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </MetricCard>

        <MetricCard title="Wind gusts" Icon={Waves} source="now">
          {current.windGusts === null ? (
            <Unavailable />
          ) : (
            <div className="w-full">
              <Value value={String(Math.round(current.windGusts))} unit="km/h" note={describeWind(current.windGusts)} />
              <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-white/10" aria-hidden="true">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-brand-500"
                  style={{ width: `${Math.min(100, (current.windGusts / 100) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">Scale 0–100 km/h</p>
            </div>
          )}
        </MetricCard>

        <MetricCard title="Rain chance" Icon={CloudRain} source="today">
          {rainChance === null ? (
            <Unavailable />
          ) : (
            <>
              <RingGauge
                fraction={rainChance / 100}
                label={`${rainChance}%`}
                ariaLabel={`Maximum chance of precipitation today ${rainChance} percent`}
                colorClass="stroke-sky-400"
              />
              <div className="min-w-0 text-sm text-soft">
                <p>
                  {today?.precipitationSum !== null && today?.precipitationSum !== undefined
                    ? `${today.precipitationSum.toFixed(1)} mm expected today`
                    : 'Total not available'}
                </p>
                {current.precipitation !== null && (
                  <p className="mt-1 text-muted">Now: {current.precipitation.toFixed(1)} mm</p>
                )}
              </div>
            </>
          )}
        </MetricCard>

        <MetricCard title="UV index" Icon={SunMedium} source="hour">
          {uvNow === null || !uv ? (
            <Unavailable />
          ) : (
            <>
              <RingGauge
                fraction={uvNow / 11}
                label={uvNow.toFixed(1)}
                ariaLabel={`UV index ${uvNow.toFixed(1)}, ${uv.label}`}
                colorClass={uv.stroke}
              />
              <div className="min-w-0 text-sm">
                <p className={`font-semibold ${uv.text}`}>{uv.label}</p>
                <p className="mt-1 text-soft">{uv.advice}</p>
                {today?.uvIndexMax !== null && today?.uvIndexMax !== undefined && (
                  <p className="mt-1 text-muted">Today's max: {today.uvIndexMax.toFixed(1)}</p>
                )}
              </div>
            </>
          )}
        </MetricCard>

        <MetricCard title="Humidity" Icon={Droplets} source="now">
          {current.humidity === null ? (
            <Unavailable />
          ) : (
            <>
              <RingGauge
                fraction={current.humidity / 100}
                label={`${Math.round(current.humidity)}%`}
                ariaLabel={`Relative humidity ${Math.round(current.humidity)} percent`}
                colorClass="stroke-cyan-400"
              />
              <p className="text-sm text-soft">{describeHumidity(current.humidity)}</p>
            </>
          )}
        </MetricCard>

        <MetricCard title="Cloud cover" Icon={Cloudy} source="now">
          {current.cloudCover === null ? (
            <Unavailable />
          ) : (
            <>
              <RingGauge
                fraction={current.cloudCover / 100}
                label={`${Math.round(current.cloudCover)}%`}
                ariaLabel={`Cloud cover ${Math.round(current.cloudCover)} percent`}
              />
              <p className="text-sm text-soft">{describeCloudCover(current.cloudCover)}</p>
            </>
          )}
        </MetricCard>

        <MetricCard title="Visibility" Icon={Eye} source="hour">
          {visibility === null ? (
            <Unavailable />
          ) : (
            <Value value={formatVisibility(visibility).split(' ')[0]} unit="km" note={describeVisibility(visibility)} />
          )}
        </MetricCard>

        <MetricCard title="Pressure" Icon={Gauge} source="now">
          {current.pressureMsl === null ? (
            <Unavailable />
          ) : (
            <div>
              <Value value={String(Math.round(current.pressureMsl))} unit="hPa" note={describePressure(current.pressureMsl)} />
              {current.surfacePressure !== null && (
                <p className="mt-1 text-xs text-muted">Surface: {Math.round(current.surfacePressure)} hPa</p>
              )}
            </div>
          )}
        </MetricCard>
      </div>
    </section>
  );
}
