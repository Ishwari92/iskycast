const COMPASS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/** Compass point the wind is blowing FROM. */
export function compassDirection(degrees: number): string {
  const index = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16;
  return COMPASS[index];
}

export interface UvLevel {
  label: string;
  /** Tailwind classes for text and bar colour. */
  text: string;
  bar: string;
  stroke: string;
  advice: string;
}

export function uvLevel(uv: number): UvLevel {
  if (uv < 3) return { label: 'Low', text: 'text-emerald-500', bar: 'bg-emerald-500', stroke: 'stroke-emerald-500', advice: 'Minimal protection needed.' };
  if (uv < 6) return { label: 'Moderate', text: 'text-yellow-500', bar: 'bg-yellow-400', stroke: 'stroke-yellow-400', advice: 'Seek shade around midday.' };
  if (uv < 8) return { label: 'High', text: 'text-orange-500', bar: 'bg-orange-500', stroke: 'stroke-orange-500', advice: 'Sunscreen and a hat advised.' };
  if (uv < 11) return { label: 'Very high', text: 'text-red-500', bar: 'bg-red-500', stroke: 'stroke-red-500', advice: 'Limit time in the midday sun.' };
  return { label: 'Extreme', text: 'text-violet-500', bar: 'bg-violet-500', stroke: 'stroke-violet-500', advice: 'Avoid sun exposure at midday.' };
}

export function describeVisibility(metres: number): string {
  if (metres >= 10000) return 'Clear view';
  if (metres >= 5000) return 'Good';
  if (metres >= 2000) return 'Moderate';
  if (metres >= 1000) return 'Poor';
  return 'Very poor';
}

export function formatVisibility(metres: number): string {
  const km = metres / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

export function describeHumidity(percent: number): string {
  if (percent < 30) return 'Dry';
  if (percent < 60) return 'Comfortable';
  if (percent < 80) return 'Humid';
  return 'Very humid';
}

export function describeWind(kmh: number): string {
  if (kmh < 2) return 'Calm';
  if (kmh < 12) return 'Light breeze';
  if (kmh < 29) return 'Moderate breeze';
  if (kmh < 50) return 'Strong wind';
  if (kmh < 75) return 'Gale';
  return 'Storm-force';
}

export function describePressure(hPa: number): string {
  if (hPa < 1000) return 'Low pressure';
  if (hPa > 1025) return 'High pressure';
  return 'Normal';
}

export function describeCloudCover(percent: number): string {
  if (percent < 12) return 'Clear';
  if (percent < 40) return 'Few clouds';
  if (percent < 70) return 'Partly cloudy';
  if (percent < 90) return 'Mostly cloudy';
  return 'Overcast';
}
