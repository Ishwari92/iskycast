import type { ApiErrorKind } from '../types/weather';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
  }
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof ApiError && err.kind === 'aborted') ||
    (err instanceof DOMException && err.name === 'AbortError')
  );
}

/** Fetch JSON with consistent, user-friendly errors. */
export async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (isAbortError(err)) throw new ApiError('aborted', 'Request was cancelled.');
    throw new ApiError(
      'network',
      navigator.onLine === false
        ? 'You appear to be offline. Check your internet connection and try again.'
        : 'Could not reach the weather service. Check your connection and try again.',
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (err) {
    if (isAbortError(err)) throw new ApiError('aborted', 'Request was cancelled.');
    throw new ApiError('parse', 'The weather service returned an unreadable response.');
  }

  if (!response.ok) {
    const reason =
      isRecord(body) && typeof body.reason === 'string' ? body.reason : `HTTP ${response.status}`;
    throw new ApiError('http', `The weather service returned an error: ${reason}`);
  }

  return body;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Read a finite number from an unknown value; anything else becomes null. */
export function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Safely read element `i` of an array-valued field as a number. */
export function numAt(arr: unknown, i: number): number | null {
  return Array.isArray(arr) ? toNumber(arr[i]) : null;
}

export function strAt(arr: unknown, i: number): string | null {
  return Array.isArray(arr) ? toStringOrNull(arr[i]) : null;
}

export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}
