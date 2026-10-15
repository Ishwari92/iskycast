import { useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { HourlyPoint, TemperatureUnit } from '../types/weather';
import { convertTemperature, unitSymbol } from '../utils/temperature';
import { formatHourLabel } from '../utils/dateTime';

interface Props {
  hours: HourlyPoint[];
  unit: TemperatureUnit;
}

interface ChartRow {
  label: string;
  temperature: number | null;
  precipitation: number | null;
}

function ChartTooltip({ active, payload, unit }: TooltipProps<number, string> & { unit: TemperatureUnit }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as ChartRow;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-night-800">
      <p className="font-medium text-slate-500 dark:text-indigo-200/70">{row.label}</p>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">
        {row.temperature === null ? '—' : `${Math.round(row.temperature)}${unitSymbol(unit)}`}
      </p>
      {row.precipitation !== null && (
        <p className="text-sky-600 dark:text-sky-300">{row.precipitation}% chance of rain</p>
      )}
    </div>
  );
}

/** 24-hour temperature trend (forecast). Lazy-loaded to keep Recharts out of the first bundle. */
export default function WeatherChart({ hours, unit }: Props) {
  const gradientId = `temp-fill-${useId().replace(/:/g, '')}`;
  const rows: ChartRow[] = hours.map((h, i) => ({
    label: i === 0 ? 'Now' : formatHourLabel(h.time),
    temperature: h.temperature === null ? null : Number(convertTemperature(h.temperature, unit).toFixed(1)),
    precipitation: h.precipitationProbability,
  }));

  if (rows.every((r) => r.temperature === null)) {
    return <p className="py-12 text-center text-sm text-muted">Temperature trend is unavailable.</p>;
  }

  return (
    <div className="h-44 w-full" role="img" aria-label="Temperature trend for the next 24 hours">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b7cf8" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#8b7cf8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 6" stroke="rgba(139,124,248,0.18)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={3}
            tick={{ fill: '#8e8bbf', fontSize: 11 }}
            dy={6}
          />
          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            content={<ChartTooltip unit={unit} />}
            cursor={{ stroke: '#8b7cf8', strokeOpacity: 0.4, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="#8b7cf8"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            connectNulls
            dot={false}
            activeDot={{ r: 5, fill: '#b9b0ff', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
