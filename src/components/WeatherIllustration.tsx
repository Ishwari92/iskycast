import { useId } from 'react';
import { getWeatherDisplay } from '../utils/weatherCodes';

interface Props {
  code: number | null;
  isDay?: boolean;
  className?: string;
}

/**
 * Soft, layered SVG weather illustration built from the WMO code.
 * Decorative: the condition text is always rendered next to it.
 */
export default function WeatherIllustration({ code, isDay = true, className = 'h-16 w-16' }: Props) {
  const uid = useId().replace(/:/g, '');
  const { category } = getWeatherDisplay(code, isDay);
  const id = (name: string) => `${name}-${uid}`;

  const showSun = category === 'clear' || category === 'partly-cloudy' || (code === 80 && isDay);
  const sunOnly = category === 'clear';
  const stormy = category === 'thunderstorm';
  const hasCloud = !sunOnly;
  const drops = category === 'rain' || category === 'drizzle' || category === 'freezing' || stormy;
  const flakes = category === 'snow' || category === 'freezing';

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id('sun')} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffe27a" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id={id('glow')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('moon')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef2ff" />
          <stop offset="100%" stopColor="#a5b4fc" />
        </linearGradient>
        <linearGradient id={id('cloud')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stormy ? '#a5a9c8' : '#ffffff'} />
          <stop offset="100%" stopColor={stormy ? '#5b5f86' : '#c9cde6'} />
        </linearGradient>
        <linearGradient id={id('cloudBack')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c3c7e0" />
          <stop offset="100%" stopColor="#7d82a8" />
        </linearGradient>
        <linearGradient id={id('drop')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id={id('bolt')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>

      {showSun && isDay && (
        <g transform={sunOnly ? 'translate(32 32)' : 'translate(24 22)'}>
          <circle r={sunOnly ? 26 : 18} fill={`url(#${id('glow')})`} />
          <circle r={sunOnly ? 15 : 11} fill={`url(#${id('sun')})`} />
        </g>
      )}
      {showSun && !isDay && (
        <g transform={sunOnly ? 'translate(32 32)' : 'translate(24 22)'}>
          <path
            d={
              sunOnly
                ? 'M6 -14 A15 15 0 1 0 14 6 A12 12 0 0 1 6 -14 Z'
                : 'M4 -10 A11 11 0 1 0 10 4 A9 9 0 0 1 4 -10 Z'
            }
            fill={`url(#${id('moon')})`}
          />
        </g>
      )}

      {category === 'cloudy' && (
        <path
          d="M18 30a9 9 0 0 1 17-4 7 7 0 0 1 9 6.5A6 6 0 0 1 43 44H20a7 7 0 0 1-2-14z"
          fill={`url(#${id('cloudBack')})`}
          transform="translate(-4 -8)"
        />
      )}

      {hasCloud && (
        <path
          d="M16 50a10 10 0 0 1 1.5-19.9A13 13 0 0 1 42 26a10.5 10.5 0 0 1 9 10.5A9.5 9.5 0 0 1 48 50z"
          fill={`url(#${id('cloud')})`}
          transform={drops || flakes ? 'translate(0 -6)' : undefined}
        />
      )}

      {category === 'fog' && (
        <g stroke="#a5aed6" strokeWidth="3" strokeLinecap="round" opacity="0.9">
          <line x1="14" y1="54" x2="44" y2="54" />
          <line x1="22" y1="59" x2="52" y2="59" />
        </g>
      )}

      {stormy && (
        <path d="M33 40 l-6 11 h6 l-3 10 l10 -14 h-6 l4 -7 z" fill={`url(#${id('bolt')})`} />
      )}

      {drops && (
        <g fill={`url(#${id('drop')})`}>
          {(stormy ? [20, 46] : flakes ? [22, 40] : [22, 32, 42]).map((x, i) => (
            <path key={x} d={`M${x} ${48 + (i % 2) * 4} q2.5 4 0 6.5 q-2.5 -2.5 0 -6.5z`} />
          ))}
        </g>
      )}

      {flakes && (
        <g fill="#e0f2fe">
          {(drops ? [31, 49] : [22, 32, 42]).map((x, i) => (
            <circle key={x} cx={x} cy={50 + (i % 2) * 5} r="2.4" />
          ))}
        </g>
      )}
    </svg>
  );
}
