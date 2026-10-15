import type { TemperatureUnit } from '../types/weather';

/** All temperatures are fetched in Celsius; conversion happens only for display. */
export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function unitSymbol(unit: TemperatureUnit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

/** Rounded display value, e.g. "21°" or "70°F". Missing values render as an em dash. */
export function formatTemperature(
  celsius: number | null,
  unit: TemperatureUnit,
  withUnit = false,
): string {
  if (celsius === null) return '—';
  const value = Math.round(convertTemperature(celsius, unit));
  // Avoid showing "-0".
  const safe = Object.is(value, -0) ? 0 : value;
  return withUnit ? `${safe}${unitSymbol(unit)}` : `${safe}°`;
}
