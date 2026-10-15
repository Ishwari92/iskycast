import {
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudMoonRain,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  CloudSunRain,
  Cloudy,
  HelpCircle,
  Moon,
  Snowflake,
  Sun,
  type LucideIcon,
} from 'lucide-react';

export type WeatherCategory =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'freezing'
  | 'snow'
  | 'thunderstorm'
  | 'unknown';

interface WeatherCodeInfo {
  label: string;
  description: string;
  category: WeatherCategory;
  dayIcon: LucideIcon;
  nightIcon: LucideIcon;
}

const info = (
  label: string,
  description: string,
  category: WeatherCategory,
  dayIcon: LucideIcon,
  nightIcon: LucideIcon = dayIcon,
): WeatherCodeInfo => ({ label, description, category, dayIcon, nightIcon });

/** WMO weather interpretation codes, as used by Open-Meteo. */
const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: info('Clear sky', 'Clear skies with no cloud cover.', 'clear', Sun, Moon),
  1: info('Mainly clear', 'Mostly clear with a few passing clouds.', 'clear', Sun, Moon),
  2: info('Partly cloudy', 'A mix of sun and cloud.', 'partly-cloudy', CloudSun, CloudMoon),
  3: info('Overcast', 'Skies fully covered by cloud.', 'cloudy', Cloudy),
  45: info('Fog', 'Fog is reducing visibility.', 'fog', CloudFog),
  48: info('Rime fog', 'Freezing fog depositing rime ice.', 'fog', CloudFog),
  51: info('Light drizzle', 'Light, fine drizzle.', 'drizzle', CloudDrizzle),
  53: info('Drizzle', 'Moderate drizzle.', 'drizzle', CloudDrizzle),
  55: info('Dense drizzle', 'Persistent, dense drizzle.', 'drizzle', CloudDrizzle),
  56: info('Freezing drizzle', 'Light freezing drizzle; surfaces may be icy.', 'freezing', CloudDrizzle),
  57: info('Freezing drizzle', 'Dense freezing drizzle; surfaces may be icy.', 'freezing', CloudDrizzle),
  61: info('Light rain', 'Slight rain.', 'rain', CloudRain),
  63: info('Rain', 'Moderate rain.', 'rain', CloudRain),
  65: info('Heavy rain', 'Heavy rain.', 'rain', CloudRainWind),
  66: info('Freezing rain', 'Light freezing rain; roads may be icy.', 'freezing', CloudHail),
  67: info('Freezing rain', 'Heavy freezing rain; roads may be icy.', 'freezing', CloudHail),
  71: info('Light snow', 'Slight snowfall.', 'snow', CloudSnow),
  73: info('Snow', 'Moderate snowfall.', 'snow', CloudSnow),
  75: info('Heavy snow', 'Heavy snowfall.', 'snow', Snowflake),
  77: info('Snow grains', 'Fine snow grains.', 'snow', Snowflake),
  80: info('Light showers', 'Slight rain showers.', 'rain', CloudSunRain, CloudMoonRain),
  81: info('Rain showers', 'Moderate rain showers.', 'rain', CloudRain),
  82: info('Violent showers', 'Violent rain showers.', 'rain', CloudRainWind),
  85: info('Snow showers', 'Slight snow showers.', 'snow', CloudSnow),
  86: info('Heavy snow showers', 'Heavy snow showers.', 'snow', Snowflake),
  95: info('Thunderstorm', 'Thunderstorms in the area.', 'thunderstorm', CloudLightning),
  96: info('Thunderstorm, hail', 'Thunderstorm with slight hail.', 'thunderstorm', CloudLightning),
  99: info('Thunderstorm, hail', 'Thunderstorm with heavy hail.', 'thunderstorm', CloudLightning),
};

const UNKNOWN = info('Unknown', 'Conditions are not available.', 'unknown', HelpCircle);

export interface WeatherDisplay {
  label: string;
  description: string;
  category: WeatherCategory;
  Icon: LucideIcon;
}

export function getWeatherDisplay(code: number | null, isDay = true): WeatherDisplay {
  const entry = (code !== null && WEATHER_CODES[code]) || (code === null ? UNKNOWN : fallback(code));
  return {
    label: entry.label,
    description: entry.description,
    category: entry.category,
    Icon: isDay ? entry.dayIcon : entry.nightIcon,
  };
}

/** Unlisted codes still fall into a sensible family by range. */
function fallback(code: number): WeatherCodeInfo {
  if (code >= 95) return WEATHER_CODES[95];
  if (code >= 85) return WEATHER_CODES[85];
  if (code >= 80) return WEATHER_CODES[80];
  if (code >= 70) return WEATHER_CODES[73];
  if (code >= 60) return WEATHER_CODES[63];
  if (code >= 50) return WEATHER_CODES[53];
  if (code >= 40) return WEATHER_CODES[45];
  if (code > 3) return WEATHER_CODES[3];
  return UNKNOWN;
}

/** Icon tint per category, used for small inline icons. */
export const CATEGORY_ICON_COLOR: Record<WeatherCategory, string> = {
  clear: 'text-amber-400',
  'partly-cloudy': 'text-amber-300',
  cloudy: 'text-slate-400',
  fog: 'text-slate-400',
  drizzle: 'text-sky-400',
  rain: 'text-sky-400',
  freezing: 'text-cyan-300',
  snow: 'text-sky-200',
  thunderstorm: 'text-violet-400',
  unknown: 'text-slate-400',
};

export function iconColor(category: WeatherCategory, isDay: boolean): string {
  if (!isDay && category === 'clear') return 'text-indigo-300';
  if (!isDay && category === 'partly-cloudy') return 'text-indigo-200';
  return CATEGORY_ICON_COLOR[category];
}

/** Background glow colours for the hero card, by condition and time of day. */
export function heroGradient(category: WeatherCategory, isDay: boolean): string {
  if (!isDay) {
    if (category === 'thunderstorm') return 'from-violet-700/40 via-indigo-900/30 to-transparent';
    if (category === 'rain' || category === 'drizzle')
      return 'from-blue-800/40 via-indigo-900/30 to-transparent';
    return 'from-indigo-600/35 via-violet-800/25 to-transparent';
  }
  switch (category) {
    case 'clear':
      return 'from-sky-400/40 via-blue-500/25 to-transparent';
    case 'partly-cloudy':
      return 'from-sky-400/35 via-indigo-500/20 to-transparent';
    case 'cloudy':
    case 'fog':
      return 'from-slate-400/35 via-slate-500/20 to-transparent';
    case 'drizzle':
    case 'rain':
      return 'from-blue-500/40 via-cyan-600/20 to-transparent';
    case 'freezing':
    case 'snow':
      return 'from-cyan-200/40 via-sky-300/20 to-transparent';
    case 'thunderstorm':
      return 'from-violet-600/40 via-indigo-700/25 to-transparent';
    default:
      return 'from-blue-500/30 via-violet-500/15 to-transparent';
  }
}
