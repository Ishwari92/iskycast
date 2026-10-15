import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import { MobileNav, Sidebar } from './components/Navigation';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherMetrics from './components/WeatherMetrics';
import SunriseSunset from './components/SunriseSunset';
import DailySummary from './components/DailySummary';
import FavoriteCities from './components/FavoriteCities';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorState, { ErrorBanner } from './components/ErrorState';
import Footer from './components/Footer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useWeather } from './hooks/useWeather';
import { useGeolocation } from './hooks/useGeolocation';
import { useNow } from './hooks/useNow';
import type { GeoLocation, TemperatureUnit, Theme } from './types/weather';
import { formatTemperature } from './utils/temperature';
import { upcomingHours } from './utils/forecast';

/** Shown on a first visit, before the user picks a city. Static place data only. */
const DEFAULT_LOCATION: GeoLocation = {
  id: '2643743',
  name: 'London',
  latitude: 51.50853,
  longitude: -0.12574,
  country: 'United Kingdom',
  countryCode: 'GB',
  admin1: 'England',
  timezone: 'Europe/London',
};

const isTheme = (v: unknown): v is Theme => v === 'dark' || v === 'light';
const isUnit = (v: unknown): v is TemperatureUnit => v === 'celsius' || v === 'fahrenheit';
const isLocation = (v: unknown): v is GeoLocation => {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.latitude === 'number' &&
    typeof o.longitude === 'number'
  );
};
const isLocationList = (v: unknown): v is GeoLocation[] => Array.isArray(v) && v.every(isLocation);

const samePlace = (a: GeoLocation, b: GeoLocation) =>
  Math.abs(a.latitude - b.latitude) < 1e-4 && Math.abs(a.longitude - b.longitude) < 1e-4;

export default function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('iskycast:theme', 'dark', isTheme);
  const [unit, setUnit] = useLocalStorage<TemperatureUnit>('iskycast:unit', 'celsius', isUnit);
  const [favorites, setFavorites] = useLocalStorage<GeoLocation[]>('iskycast:favorites', [], isLocationList);
  const [location, setLocation] = useLocalStorage<GeoLocation>('iskycast:last-location', DEFAULT_LOCATION, isLocation);
  const [menuOpen, setMenuOpen] = useState(false);

  const weather = useWeather(location);
  const geo = useGeolocation();
  const now = useNow(15_000);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1a1940' : '#eef0fb');
  }, [theme]);

  const { data } = weather;
  const currentTemp = data ? formatTemperature(data.current.temperature, unit) : null;

  useEffect(() => {
    document.title = currentTemp && data
      ? `${currentTemp} ${location.name} · iSkycast Weather`
      : 'iSkycast · Weather Dashboard';
  }, [currentTemp, data, location.name]);

  const hours = useMemo(() => (data ? upcomingHours(data, 24) : []), [data, now]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectCity = useCallback(
    (loc: GeoLocation) => {
      setLocation(loc);
      geo.dismiss();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setLocation, geo],
  );

  const locate = useCallback(async () => {
    const coords = await geo.request();
    if (!coords) return;
    setLocation({
      id: `geo:${coords.latitude.toFixed(3)},${coords.longitude.toFixed(3)}`,
      name: 'My location',
      latitude: coords.latitude,
      longitude: coords.longitude,
      isCurrentLocation: true,
    });
  }, [geo, setLocation]);

  const isFavorite = favorites.some((f) => samePlace(f, location));

  const toggleFavorite = useCallback(() => {
    setFavorites((prev) =>
      prev.some((f) => samePlace(f, location))
        ? prev.filter((f) => !samePlace(f, location))
        : [...prev, location],
    );
  }, [location, setFavorites]);

  const removeFavorite = useCallback(
    (id: string) => setFavorites((prev) => prev.filter((f) => f.id !== id)),
    [setFavorites],
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto flex max-w-[1680px] gap-6 px-4 py-4 sm:px-6 lg:py-6">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header
            location={location}
            currentTemp={currentTemp}
            unit={unit}
            theme={theme}
            locating={geo.status === 'locating'}
            onSelectCity={selectCity}
            onLocate={locate}
            onUnitChange={setUnit}
            onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onOpenMenu={() => setMenuOpen(true)}
          />

          <main id="main" tabIndex={-1} className="mt-6 space-y-6 focus:outline-none">
            {geo.error && <ErrorBanner message={geo.error} onRetry={locate} onDismiss={geo.dismiss} />}
            {weather.error && data && (
              <ErrorBanner message={weather.error} onRetry={weather.refresh} onDismiss={weather.dismissError} />
            )}

            {data ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="order-1 min-w-0 xl:col-start-1 xl:row-start-1">
                  <CurrentWeather
                    location={location}
                    data={data}
                    unit={unit}
                    now={now}
                    isFavorite={isFavorite}
                    refreshing={weather.refreshing}
                    onToggleFavorite={toggleFavorite}
                    onRefresh={weather.refresh}
                  />
                </div>

                <aside
                  aria-label="Forecast"
                  className="panel order-2 min-w-0 space-y-8 p-5 animate-fade-in sm:p-6 xl:col-start-2 xl:row-span-3 xl:row-start-1 xl:self-start"
                >
                  <HourlyForecast hours={hours} unit={unit} />
                  <DailyForecast days={data.daily} unit={unit} />
                </aside>

                <div className="order-3 min-w-0 xl:col-start-1 xl:row-start-2">
                  <WeatherMetrics data={data} hours={hours} />
                </div>

                <section
                  id="sun"
                  tabIndex={-1}
                  aria-label="Sun and daily summary"
                  className="order-4 grid min-w-0 scroll-mt-6 gap-6 focus:outline-none md:grid-cols-2 xl:col-start-1 xl:row-start-3"
                >
                  <DailySummary data={data} unit={unit} />
                  <SunriseSunset today={data.daily[0]} utcOffsetSeconds={data.utcOffsetSeconds} now={now} />
                </section>
              </div>
            ) : weather.status === 'error' ? (
              <ErrorState message={weather.error ?? 'Something went wrong.'} onRetry={weather.retry} />
            ) : (
              <LoadingSkeleton />
            )}

            <FavoriteCities
              favorites={favorites}
              current={location}
              isCurrentSaved={isFavorite}
              onSelect={selectCity}
              onRemove={removeFavorite}
              onAddCurrent={toggleFavorite}
            />
          </main>

          <Footer />
        </div>
      </div>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
