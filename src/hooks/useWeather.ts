import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeather, getCachedWeather } from '../services/weatherApi';
import { errorMessage, isAbortError } from '../services/http';
import type { GeoLocation, WeatherData } from '../types/weather';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface WeatherState {
  status: Status;
  data: WeatherData | null;
  error: string | null;
  refreshing: boolean;
  /** Coordinates this state belongs to. */
  key: string | null;
}

const INITIAL: WeatherState = { status: 'idle', data: null, error: null, refreshing: false, key: null };
const LOADING: WeatherState = { status: 'loading', data: null, error: null, refreshing: false, key: null };

const keyOf = (loc: GeoLocation) => `${loc.latitude},${loc.longitude}`;

/**
 * Loads weather for a location. Each new request aborts the previous one, and
 * results are only applied if they belong to the latest request, so quickly
 * switching cities can never show the wrong city's data.
 */
export function useWeather(location: GeoLocation | null) {
  const [state, setState] = useState<WeatherState>(INITIAL);
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async (loc: GeoLocation, force: boolean) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    const key = keyOf(loc);

    // Serve fresh cached data instantly, without a network request.
    if (!force) {
      const cached = getCachedWeather(loc.latitude, loc.longitude);
      if (cached) {
        setState({ status: 'success', data: cached, error: null, refreshing: false, key });
        return;
      }
    }

    setState((prev) =>
      force && prev.data && prev.key === key
        ? { ...prev, refreshing: true, error: null }
        : { ...LOADING, key },
    );

    try {
      const data = await fetchWeather(loc.latitude, loc.longitude, {
        signal: controller.signal,
        force,
      });
      if (requestId !== requestIdRef.current) return;
      setState({ status: 'success', data, error: null, refreshing: false, key });
    } catch (err) {
      if (isAbortError(err) || requestId !== requestIdRef.current) return;
      const message = errorMessage(err, 'Something went wrong while loading the weather.');
      // On a failed refresh keep showing the last good data alongside the error.
      setState((prev) =>
        prev.data && prev.key === key
          ? { ...prev, error: message, refreshing: false }
          : { status: 'error', data: null, error: message, refreshing: false, key },
      );
    }
  }, []);

  const lat = location?.latitude;
  const lon = location?.longitude;

  useEffect(() => {
    if (!location) return;
    void load(location, false);
    // Re-run only when the coordinates change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, load]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const refresh = useCallback(() => {
    if (location) void load(location, true);
  }, [location, load]);

  const dismissError = useCallback(() => setState((prev) => ({ ...prev, error: null })), []);

  // Until the effect for a newly selected location runs, never expose the
  // previous location's data under the new location's name.
  const stale = location !== null && state.key !== keyOf(location);
  const visible = stale ? LOADING : state;

  return {
    status: visible.status,
    data: visible.data,
    error: visible.error,
    refreshing: visible.refreshing,
    refresh,
    retry: refresh,
    dismissError,
  };
}
