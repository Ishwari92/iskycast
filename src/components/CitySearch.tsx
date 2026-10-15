import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { searchCities } from '../services/geocodingApi';
import { errorMessage, isAbortError } from '../services/http';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { GeoLocation } from '../types/weather';

interface Props {
  onSelect: (location: GeoLocation) => void;
}

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

const MIN_CHARS = 2;

export function formatPlace(loc: GeoLocation): string {
  return [loc.admin1, loc.country].filter(Boolean).join(', ');
}

export default function CitySearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [resultsFor, setResultsFor] = useState('');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [retryToken, setRetryToken] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const debounced = useDebouncedValue(query.trim(), 300);

  // Debounced typing feeds the active search term.
  useEffect(() => setTerm(debounced), [debounced]);

  useEffect(() => {
    if (term.length < MIN_CHARS) {
      setResults([]);
      setResultsFor('');
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    setStatus('loading');
    setError(null);
    searchCities(term, controller.signal)
      .then((cities) => {
        setResults(cities);
        setResultsFor(term);
        setActiveIndex(cities.length > 0 ? 0 : -1);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setResults([]);
        setStatus('error');
        setError(errorMessage(err, 'City search failed.'));
      });
    return () => controller.abort();
  }, [term, retryToken]);

  // Close when clicking outside.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const choose = (loc: GeoLocation) => {
    onSelect(loc);
    setQuery('');
    setTerm('');
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const clear = () => {
    setQuery('');
    setTerm('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < MIN_CHARS) {
      setOpen(true);
      return;
    }
    if (resultsFor === q && results.length > 0) {
      choose(results[Math.max(0, activeIndex)]);
      return;
    }
    // Search immediately, skipping the debounce.
    setTerm(q);
    setOpen(true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
      } else if (query) {
        setQuery('');
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      if (results.length) setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      if (results.length) setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Home' && open && results.length) {
      setActiveIndex(0);
    } else if (e.key === 'End' && open && results.length) {
      setActiveIndex(results.length - 1);
    }
  };

  const q = query.trim();
  const typing = q !== term && q.length >= MIN_CHARS;
  const showDropdown = open && q.length > 0;
  const activeId = activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;

  return (
    <div ref={rootRef} className="relative w-full">
      <form role="search" onSubmit={onSubmit} className="relative">
        <label htmlFor={`${listboxId}-input`} className="sr-only">
          Search for a city
        </label>
        <input
          ref={inputRef}
          id={`${listboxId}-input`}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={showDropdown ? activeId : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder="Search city, e.g. Paris or Springfield"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => q && setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-12 w-full rounded-full border border-brand-400/40 bg-white pl-5 pr-24 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 dark:border-brand-400/30 dark:bg-night-850 dark:text-white dark:placeholder:text-indigo-200/40"
        />
        <div className="absolute inset-y-0 right-1 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-indigo-200/60 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow transition hover:bg-brand-600"
            aria-label="Search"
          >
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-fade-in dark:border-white/10 dark:bg-night-850">
          {q.length < MIN_CHARS ? (
            <p className="px-4 py-3 text-sm text-muted">Type at least {MIN_CHARS} characters.</p>
          ) : status === 'error' ? (
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="text-red-500 dark:text-red-300">{error}</span>
              <button
                type="button"
                onClick={() => setRetryToken((n) => n + 1)}
                className="shrink-0 rounded-full px-3 py-1 font-medium text-brand-600 hover:bg-brand-500/10 dark:text-brand-300"
              >
                Retry
              </button>
            </div>
          ) : status === 'loading' || typing ? (
            <p className="flex items-center gap-2 px-4 py-3 text-sm text-muted" role="status">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </p>
          ) : results.length === 0 && resultsFor === q ? (
            <p className="px-4 py-3 text-sm text-muted" role="status">
              No cities found for “{q}”. Check the spelling or try a nearby city.
            </p>
          ) : null}

          {results.length > 0 && resultsFor === q && status === 'success' && (
            <ul id={listboxId} role="listbox" aria-label="City suggestions" className="max-h-80 overflow-y-auto py-1 scrollbar-thin">
              {results.map((city, i) => (
                <li
                  key={city.id}
                  id={`${listboxId}-opt-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(city)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    i === activeIndex ? 'bg-brand-500/10 dark:bg-white/[0.06]' : ''
                  }`}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-brand-500 dark:text-brand-300" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-900 dark:text-white">{city.name}</span>
                    <span className="block truncate text-xs text-muted">{formatPlace(city) || 'Unknown region'}</span>
                  </span>
                  {city.countryCode && (
                    <span className="badge bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-indigo-200/70">
                      {city.countryCode}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
