/** A place the user can view weather for (from geocoding or browser geolocation). */
export interface GeoLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  countryCode?: string;
  admin1?: string;
  timezone?: string;
  /** True when the place came from the browser's Geolocation API. */
  isCurrentLocation?: boolean;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type Theme = 'dark' | 'light';

/** Current conditions. Every measurement may be missing, so all are nullable. */
export interface CurrentWeather {
  time: string;
  temperature: number | null;
  humidity: number | null;
  apparentTemperature: number | null;
  isDay: boolean;
  precipitation: number | null;
  rain: number | null;
  showers: number | null;
  snowfall: number | null;
  weatherCode: number | null;
  cloudCover: number | null;
  pressureMsl: number | null;
  surfacePressure: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windGusts: number | null;
}

export interface HourlyPoint {
  /** City-local wall-clock time, e.g. "2026-10-15T14:00". */
  time: string;
  temperature: number | null;
  humidity: number | null;
  apparentTemperature: number | null;
  precipitationProbability: number | null;
  precipitation: number | null;
  weatherCode: number | null;
  windSpeed: number | null;
  uvIndex: number | null;
  /** Metres. */
  visibility: number | null;
  isDay: boolean;
}

export interface DailyPoint {
  /** City-local date, e.g. "2026-10-15". */
  date: string;
  weatherCode: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
  apparentTemperatureMax: number | null;
  apparentTemperatureMin: number | null;
  sunrise: string | null;
  sunset: string | null;
  uvIndexMax: number | null;
  precipitationProbabilityMax: number | null;
  precipitationSum: number | null;
  windSpeedMax: number | null;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneAbbreviation: string;
  utcOffsetSeconds: number;
  elevation: number | null;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  /** Epoch ms when this data was fetched from the API. */
  fetchedAt: number;
}

export type ApiErrorKind = 'network' | 'http' | 'parse' | 'aborted';
