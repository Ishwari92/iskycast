import { LocateFixed, Loader2, Menu, MapPin, Moon, Sun } from 'lucide-react';
import CitySearch from './CitySearch';
import Logo from './Logo';
import type { GeoLocation, TemperatureUnit, Theme } from '../types/weather';

interface Props {
  location: GeoLocation | null;
  currentTemp: string | null;
  unit: TemperatureUnit;
  theme: Theme;
  locating: boolean;
  onSelectCity: (loc: GeoLocation) => void;
  onLocate: () => void;
  onUnitChange: (unit: TemperatureUnit) => void;
  onThemeToggle: () => void;
  onOpenMenu: () => void;
}

function UnitToggle({ unit, onChange }: { unit: TemperatureUnit; onChange: (u: TemperatureUnit) => void }) {
  const options: { value: TemperatureUnit; label: string; aria: string }[] = [
    { value: 'celsius', label: '°C', aria: 'Celsius' },
    { value: 'fahrenheit', label: '°F', aria: 'Fahrenheit' },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Temperature unit"
      className="flex h-11 items-center rounded-full bg-slate-200/70 p-1 dark:bg-night-850"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={unit === o.value}
          aria-label={o.aria}
          onClick={() => onChange(o.value)}
          className={`h-9 min-w-[2.5rem] rounded-full px-2 text-sm font-semibold transition ${
            unit === o.value
              ? 'bg-brand-500 text-white shadow-glow'
              : 'text-slate-500 hover:text-slate-900 dark:text-indigo-200/70 dark:hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark theme"
      onClick={onToggle}
      className="relative flex h-11 w-[5.5rem] shrink-0 items-center rounded-full bg-brand-500 px-1 text-xs font-semibold text-white shadow-glow transition hover:bg-brand-600"
    >
      <span className={`absolute transition-all ${dark ? 'left-3' : 'right-3'}`}>{dark ? 'Dark' : 'Light'}</span>
      <span
        className={`absolute flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-600 shadow transition-all ${
          dark ? 'right-1' : 'left-1'
        }`}
      >
        {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </button>
  );
}

export default function Header({
  location,
  currentTemp,
  unit,
  theme,
  locating,
  onSelectCity,
  onLocate,
  onUnitChange,
  onThemeToggle,
  onOpenMenu,
}: Props) {
  return (
    <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex items-center gap-2 lg:contents">
        <button type="button" onClick={onOpenMenu} className="btn-icon -ml-2 lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block lg:hidden">
          <Logo />
        </div>

        {location && (
          <p className="hidden min-w-0 shrink items-center gap-2 text-xl font-semibold lg:flex xl:text-2xl" aria-live="polite">
            <MapPin className="h-5 w-5 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden="true" />
            <span className="truncate">
              {location.name}
              {currentTemp && <span className="text-muted">, {currentTemp}</span>}
            </span>
          </p>
        )}

        <div className="ml-auto flex items-center gap-2 lg:order-last">
          <button
            type="button"
            onClick={onLocate}
            disabled={locating}
            className="btn-icon bg-slate-200/70 dark:bg-night-850"
            aria-label="Use my current location"
            title="Use my current location"
          >
            {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
          </button>
          <UnitToggle unit={unit} onChange={onUnitChange} />
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
      </div>

      <div className="w-full lg:max-w-xl lg:flex-1">
        <CitySearch onSelect={onSelectCity} />
      </div>
    </header>
  );
}
