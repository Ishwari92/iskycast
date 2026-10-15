/*
 * Open-Meteo (with timezone=auto) returns times as the city's local wall-clock
 * time without an offset, e.g. "2026-10-15T14:00". We treat these as UTC
 * "wall epochs" and always format them with timeZone: 'UTC', so they display
 * exactly as the city sees them, regardless of the viewer's own timezone.
 */

const WALL_RE = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;
const HOUR_MS = 60 * 60 * 1000;

export function parseWallTime(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const m = WALL_RE.exec(iso);
  if (!m) return null;
  const [, y, mo, d, h = '0', mi = '0'] = m;
  return Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
}

/** The city's current wall-clock time, as a wall epoch. */
export function cityNow(utcOffsetSeconds: number, now = Date.now()): number {
  return now + utcOffsetSeconds * 1000;
}

function fmt(wall: number, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' }).format(wall);
}

export function formatClock(wall: number): string {
  return fmt(wall, { hour: 'numeric', minute: '2-digit' });
}

export function formatLongDate(wall: number): string {
  return fmt(wall, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatTimeOfDay(iso: string | null): string {
  const wall = parseWallTime(iso);
  return wall === null ? '—' : formatClock(wall);
}

export function formatHourLabel(iso: string): string {
  const wall = parseWallTime(iso);
  return wall === null ? '—' : fmt(wall, { hour: 'numeric' });
}

export function formatWeekday(iso: string, short = true): string {
  const wall = parseWallTime(iso);
  return wall === null ? '—' : fmt(wall, { weekday: short ? 'short' : 'long' });
}

export function formatShortDate(iso: string): string {
  const wall = parseWallTime(iso);
  return wall === null ? '—' : fmt(wall, { day: 'numeric', month: 'short' });
}

/** Index of the hourly entry covering the city's current hour (0 if not found). */
export function findCurrentHourIndex(times: string[], utcOffsetSeconds: number): number {
  const now = cityNow(utcOffsetSeconds);
  for (let i = 0; i < times.length; i++) {
    const wall = parseWallTime(times[i]);
    if (wall !== null && now >= wall && now < wall + HOUR_MS) return i;
  }
  return 0;
}

/** "just now", "5 min ago", "2 h ago". */
export function formatRelative(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ago`;
}

export function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

/** Viewer's own local time, used for "last updated". */
export function formatViewerTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(timestamp);
}
