export default function Footer() {
  return (
    <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200 pb-4 pt-6 text-xs text-muted dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
      <p>
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-600 underline-offset-4 hover:underline dark:text-brand-300"
        >
          Weather data by Open-Meteo.com
        </a>{' '}
        · licensed under CC BY 4.0
      </p>
      <p>Times are shown in each city's local time. Forecasts may differ from observed conditions.</p>
    </footer>
  );
}
