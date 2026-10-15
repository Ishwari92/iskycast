import { useCallback, useEffect, useState } from 'react';

function read<T>(key: string, initial: T, validate?: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return initial;
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return initial;
    return parsed as T;
  } catch {
    return initial;
  }
}

/**
 * useState that persists to LocalStorage as JSON. An optional validator
 * guards against stale or hand-edited values.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
  validate?: (v: unknown) => v is T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => read(key, initial, validate));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be full or blocked (private mode); keep working in memory.
    }
  }, [key, value]);

  // Keep multiple open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(read(key, initial, validate));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
  return [value, update];
}
