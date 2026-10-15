import type { CurrentWeather, DailyPoint, HourlyPoint, WeatherData } from '../types/weather';
import { ApiError, fetchJson, isRecord, numAt, strAt, toNumber, toStringOrNull } from './http';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_STORAGE_KEY = 'iskycast:weather-cache';
const CACHE_MAX_ENTRIES = 8;

const CURRENT_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'rain',
  'showers',
  'snowfall',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'surface_pressure',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
];

const HOURLY_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'uv_index',
  'visibility',
  'is_day',
];

const DAILY_VARS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'sunrise',
  'sunset',
  'uv_index_max',
  'precipitation_probability_max',
  'precipitation_sum',
  'wind_speed_10m_max',
];

export function buildForecastUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: CURRENT_VARS.join(','),
    hourly: HOURLY_VARS.join(','),
    daily: DAILY_VARS.join(','),
    forecast_days: '7',
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });
  return `${FORECAST_URL}?${params.toString()}`;
}

// ---------- Cache (memory + LocalStorage, 10-minute TTL) ----------

type CacheMap = Record<string, WeatherData>;
const memoryCache = new Map<string, WeatherData>();

function cacheKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
}

function readStoredCache(): CacheMap {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isRecord(parsed) ? (parsed as CacheMap) : {};
  } catch {
    return {};
  }
}

function isFresh(data: WeatherData | undefined): data is WeatherData {
  return (
    !!data &&
    typeof data.fetchedAt === 'number' &&
    Date.now() - data.fetchedAt < CACHE_TTL_MS &&
    Array.isArray(data.hourly) &&
    Array.isArray(data.daily) &&
    isRecord(data.current)
  );
}

/** Returns cached weather for these coordinates if it is still fresh. */
export function getCachedWeather(latitude: number, longitude: number): WeatherData | null {
  const key = cacheKey(latitude, longitude);
  const mem = memoryCache.get(key);
  if (isFresh(mem)) return mem;
  const stored = readStoredCache()[key];
  if (isFresh(stored)) {
    memoryCache.set(key, stored);
    return stored;
  }
  return null;
}

function writeCache(latitude: number, longitude: number, data: WeatherData): void {
  const key = cacheKey(latitude, longitude);
  memoryCache.set(key, data);
  try {
    const stored = readStoredCache();
    stored[key] = data;
    // Drop expired entries and keep only the most recent few.
    const entries = Object.entries(stored)
      .filter(([, v]) => isFresh(v))
      .sort(([, a], [, b]) => b.fetchedAt - a.fetchedAt)
      .slice(0, CACHE_MAX_ENTRIES);
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Storage full or unavailable; the memory cache still works.
  }
}

// ---------- Parsing ----------

function parseCurrent(raw: Record<string, unknown>): CurrentWeather {
  return {
    time: toStringOrNull(raw.time) ?? '',
    temperature: toNumber(raw.temperature_2m),
    humidity: toNumber(raw.relative_humidity_2m),
    apparentTemperature: toNumber(raw.apparent_temperature),
    // Treat a missing is_day as daytime.
    isDay: toNumber(raw.is_day) !== 0,
    precipitation: toNumber(raw.precipitation),
    rain: toNumber(raw.rain),
    showers: toNumber(raw.showers),
    snowfall: toNumber(raw.snowfall),
    weatherCode: toNumber(raw.weather_code),
    cloudCover: toNumber(raw.cloud_cover),
    pressureMsl: toNumber(raw.pressure_msl),
    surfacePressure: toNumber(raw.surface_pressure),
    windSpeed: toNumber(raw.wind_speed_10m),
    windDirection: toNumber(raw.wind_direction_10m),
    windGusts: toNumber(raw.wind_gusts_10m),
  };
}

function parseHourly(raw: Record<string, unknown>): HourlyPoint[] {
  const times = Array.isArray(raw.time) ? raw.time : [];
  const points: HourlyPoint[] = [];
  times.forEach((t, i) => {
    if (typeof t !== 'string') return;
    points.push({
      time: t,
      temperature: numAt(raw.temperature_2m, i),
      humidity: numAt(raw.relative_humidity_2m, i),
      apparentTemperature: numAt(raw.apparent_temperature, i),
      precipitationProbability: numAt(raw.precipitation_probability, i),
      precipitation: numAt(raw.precipitation, i),
      weatherCode: numAt(raw.weather_code, i),
      windSpeed: numAt(raw.wind_speed_10m, i),
      uvIndex: numAt(raw.uv_index, i),
      visibility: numAt(raw.visibility, i),
      isDay: numAt(raw.is_day, i) !== 0,
    });
  });
  return points;
}

function parseDaily(raw: Record<string, unknown>): DailyPoint[] {
  const dates = Array.isArray(raw.time) ? raw.time : [];
  const points: DailyPoint[] = [];
  dates.forEach((d, i) => {
    if (typeof d !== 'string') return;
    points.push({
      date: d,
      weatherCode: numAt(raw.weather_code, i),
      temperatureMax: numAt(raw.temperature_2m_max, i),
      temperatureMin: numAt(raw.temperature_2m_min, i),
      apparentTemperatureMax: numAt(raw.apparent_temperature_max, i),
      apparentTemperatureMin: numAt(raw.apparent_temperature_min, i),
      sunrise: strAt(raw.sunrise, i),
      sunset: strAt(raw.sunset, i),
      uvIndexMax: numAt(raw.uv_index_max, i),
      precipitationProbabilityMax: numAt(raw.precipitation_probability_max, i),
      precipitationSum: numAt(raw.precipitation_sum, i),
      windSpeedMax: numAt(raw.wind_speed_10m_max, i),
    });
  });
  return points;
}

export function parseForecast(body: unknown): WeatherData {
  if (
    !isRecord(body) ||
    !isRecord(body.current) ||
    !isRecord(body.hourly) ||
    !isRecord(body.daily)
  ) {
    throw new ApiError('parse', 'The weather service returned incomplete data.');
  }
  const hourly = parseHourly(body.hourly);
  const daily = parseDaily(body.daily);
  if (hourly.length === 0 || daily.length === 0) {
    throw new ApiError('parse', 'The weather service returned no forecast for this location.');
  }
  return {
    latitude: toNumber(body.latitude) ?? 0,
    longitude: toNumber(body.longitude) ?? 0,
    timezone: toStringOrNull(body.timezone) ?? 'UTC',
    timezoneAbbreviation: toStringOrNull(body.timezone_abbreviation) ?? '',
    utcOffsetSeconds: toNumber(body.utc_offset_seconds) ?? 0,
    elevation: toNumber(body.elevation),
    current: parseCurrent(body.current),
    hourly,
    daily,
    fetchedAt: Date.now(),
  };
}

interface FetchWeatherOptions {
  signal?: AbortSignal;
  /** Skip the cache and always hit the API (used by the refresh button). */
  force?: boolean;
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
  { signal, force = false }: FetchWeatherOptions = {},
): Promise<WeatherData> {
  if (!force) {
    const cached = getCachedWeather(latitude, longitude);
    if (cached) return cached;
  }
  const body = await fetchJson(buildForecastUrl(latitude, longitude), signal);
  const data = parseForecast(body);
  writeCache(latitude, longitude, data);
  return data;
}
