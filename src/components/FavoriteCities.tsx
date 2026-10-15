import { Heart, MapPin, Navigation, Plus, X } from 'lucide-react';
import type { GeoLocation } from '../types/weather';
import { formatPlace } from './CitySearch';

interface Props {
  favorites: GeoLocation[];
  current: GeoLocation | null;
  isCurrentSaved: boolean;
  onSelect: (location: GeoLocation) => void;
  onRemove: (id: string) => void;
  onAddCurrent: () => void;
}

export default function FavoriteCities({
  favorites,
  current,
  isCurrentSaved,
  onSelect,
  onRemove,
  onAddCurrent,
}: Props) {
  return (
    <section
      id="favorites"
      tabIndex={-1}
      aria-labelledby="favorites-heading"
      className="panel scroll-mt-6 p-6 focus:outline-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="favorites-heading" className="section-title flex items-center gap-2">
          <Heart className="h-5 w-5 text-brand-500 dark:text-brand-300" aria-hidden="true" />
          Saved locations
        </h2>
        {current && !isCurrentSaved && (
          <button type="button" onClick={onAddCurrent} className="btn-primary py-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Save {current.name}
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No saved locations yet. Use the star on the weather card, or the button above, to save a city for quick access.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {favorites.map((fav) => {
            const active =
              current !== null &&
              Math.abs(current.latitude - fav.latitude) < 1e-4 &&
              Math.abs(current.longitude - fav.longitude) < 1e-4;
            const Icon = fav.isCurrentLocation ? Navigation : MapPin;
            return (
              <li key={fav.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(fav)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl border py-3 pl-4 pr-12 text-left transition ${
                    active
                      ? 'border-brand-500/60 bg-brand-500/10'
                      : 'border-transparent bg-slate-100/80 hover:border-brand-400/40 dark:bg-night-850 dark:hover:bg-night-800'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{fav.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {fav.isCurrentLocation
                        ? `${fav.latitude.toFixed(2)}°, ${fav.longitude.toFixed(2)}°`
                        : formatPlace(fav) || '—'}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(fav.id)}
                  className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-500/10 hover:text-red-500 dark:text-indigo-200/50"
                  aria-label={`Remove ${fav.name} from saved locations`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
