import type { HourlyPoint, WeatherData } from '../types/weather';
import { findCurrentHourIndex } from './dateTime';

/** The next `count` hourly entries, starting with the city's current hour. */
export function upcomingHours(data: WeatherData, count = 24): HourlyPoint[] {
  const start = findCurrentHourIndex(
    data.hourly.map((h) => h.time),
    data.utcOffsetSeconds,
  );
  return data.hourly.slice(start, start + count);
}

export interface DayPeriod {
  label: string;
  temperature: number | null;
}

/** Forecast temperatures for today's morning, afternoon, evening and night. */
export function todayPeriods(data: WeatherData): DayPeriod[] {
  const today = data.daily[0]?.date;
  const at = (hour: number): number | null => {
    if (!today) return null;
    const stamp = `${today}T${hour.toString().padStart(2, '0')}:00`;
    return data.hourly.find((h) => h.time === stamp)?.temperature ?? null;
  };
  return [
    { label: 'Morning', temperature: at(8) },
    { label: 'Afternoon', temperature: at(14) },
    { label: 'Evening', temperature: at(19) },
    { label: 'Night', temperature: at(23) },
  ];
}
