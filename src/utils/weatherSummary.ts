import type { TemperatureUnit, WeatherData } from '../types/weather';
import { formatTemperature } from './temperature';
import { getWeatherDisplay } from './weatherCodes';

export type SummaryTone = 'info' | 'caution' | 'warning';

export interface SummaryPoint {
  text: string;
  tone: SummaryTone;
}

export interface WeatherSummary {
  headline: string;
  points: SummaryPoint[];
}

/**
 * Builds a short, rule-based summary of today's forecast. Every sentence is
 * derived from a value in the API response; a rule is skipped when its value
 * is missing.
 */
export function buildDailySummary(data: WeatherData, unit: TemperatureUnit): WeatherSummary | null {
  const today = data.daily[0];
  if (!today) return null;

  const t = (c: number | null) => formatTemperature(c, unit);
  const condition = getWeatherDisplay(today.weatherCode).label.toLowerCase();

  let headline = `Expect ${condition} today`;
  if (today.temperatureMax !== null && today.temperatureMin !== null) {
    headline += `, with a high of ${t(today.temperatureMax)} and a low of ${t(today.temperatureMin)}`;
  }
  headline += '.';

  const points: SummaryPoint[] = [];

  const pop = today.precipitationProbabilityMax;
  const sum = today.precipitationSum;
  if (pop !== null && pop >= 60) {
    points.push({
      tone: 'warning',
      text: `High chance of precipitation (${pop}%)${sum !== null && sum > 0 ? `, around ${sum.toFixed(1)} mm expected` : ''}. Keep an umbrella handy.`,
    });
  } else if (pop !== null && pop >= 30) {
    points.push({ tone: 'caution', text: `Some chance of precipitation today (${pop}%).` });
  } else if (pop !== null) {
    points.push({ tone: 'info', text: `Low chance of precipitation (${pop}%).` });
  }

  const uv = today.uvIndexMax;
  if (uv !== null && uv >= 8) {
    points.push({ tone: 'warning', text: `UV index peaks at ${uv.toFixed(1)} (very high). Limit midday sun exposure.` });
  } else if (uv !== null && uv >= 6) {
    points.push({ tone: 'caution', text: `UV index peaks at ${uv.toFixed(1)} (high). Sun protection is recommended.` });
  }

  const wind = today.windSpeedMax;
  if (wind !== null && wind >= 50) {
    points.push({ tone: 'warning', text: `Very strong winds, up to ${Math.round(wind)} km/h.` });
  } else if (wind !== null && wind >= 30) {
    points.push({ tone: 'caution', text: `Breezy, with winds up to ${Math.round(wind)} km/h.` });
  }

  if (today.temperatureMax !== null && today.temperatureMax >= 35) {
    points.push({ tone: 'warning', text: 'Very hot conditions. Stay hydrated and avoid strenuous activity at midday.' });
  }
  if (today.temperatureMin !== null && today.temperatureMin <= 0) {
    points.push({ tone: 'caution', text: 'Temperatures drop to freezing. Watch for frost or ice.' });
  }

  const { temperature, apparentTemperature } = data.current;
  if (temperature !== null && apparentTemperature !== null) {
    const diff = apparentTemperature - temperature;
    if (Math.abs(diff) >= 3) {
      points.push({
        tone: 'info',
        text: `It currently feels ${diff > 0 ? 'warmer' : 'colder'} than the actual temperature (${t(apparentTemperature)} vs ${t(temperature)}).`,
      });
    }
  }

  return { headline, points };
}
