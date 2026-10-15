import { useId } from 'react';

export default function Logo() {
  const gid = `logo-${useId().replace(/:/g, '')}`;
  return (
    <a href={import.meta.env.BASE_URL} className="flex items-center gap-2.5 rounded-lg" aria-label="iSkycast home">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="0.5" stopColor="#6366f1" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="6" fill="#fbbf24" />
        <path d="M10 25h13a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.4 1.8A4.1 4.1 0 0 0 10 25z" fill={`url(#${gid})`} />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        iSkycast
      </span>
    </a>
  );
}
