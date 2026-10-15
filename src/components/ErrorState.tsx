import { CloudOff, RotateCw, X } from 'lucide-react';

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/** Full-size error shown when there is no weather data to display. */
export default function ErrorState({ title = "Couldn't load the weather", message, onRetry }: Props) {
  return (
    <div role="alert" className="panel flex flex-col items-center px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 dark:text-red-400">
        <CloudOff className="h-8 w-8" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-soft">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary mt-6">
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}

interface BannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

/** Inline notice used when something fails but existing data is still shown. */
export function ErrorBanner({ message, onRetry, onDismiss }: BannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in dark:bg-red-500/10 dark:text-red-200"
    >
      <p className="flex-1 pt-1.5">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="shrink-0 rounded-full px-3 py-1.5 font-medium hover:bg-red-500/10">
          Retry
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-red-500/10"
        aria-label="Dismiss message"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
