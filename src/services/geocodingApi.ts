import type { GeoLocation } from '../types/weather';
import { ApiError, fetchJson, isRecord, toNumber, toStringOrNull } from './http';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/** Search cities by name. Returns an empty array when nothing matches. */
export async function searchCities(query: string, signal?: AbortSignal): Promise<GeoLocation[]> {
  const params = new URLSearchParams({
    name: query.trim(),
    count: '8',
    language: 'en',
    format: 'json',
  });

  const body = await fetchJson(`${GEOCODING_URL}?${params.toString()}`, signal);
  if (!isRecord(body)) {
    throw new ApiError('parse', 'The city search returned an unexpected response.');
  }
  // Open-Meteo omits `results` entirely when there are no matches.
  if (body.results === undefined) return [];
  if (!Array.isArray(body.results)) {
    throw new ApiError('parse', 'The city search returned an unexpected response.');
  }

  const cities: GeoLocation[] = [];
  for (const raw of body.results) {
    if (!isRecord(raw)) continue;
    const latitude = toNumber(raw.latitude);
    const longitude = toNumber(raw.longitude);
    const name = toStringOrNull(raw.name);
    if (latitude === null || longitude === null || name === null) continue;
    cities.push({
      id: String(raw.id ?? `${latitude},${longitude}`),
      name,
      latitude,
      longitude,
      country: toStringOrNull(raw.country) ?? undefined,
      countryCode: toStringOrNull(raw.country_code) ?? undefined,
      admin1: toStringOrNull(raw.admin1) ?? undefined,
      timezone: toStringOrNull(raw.timezone) ?? undefined,
    });
  }
  return cities;
}
