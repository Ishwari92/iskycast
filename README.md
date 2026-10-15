# iSkycast — Weather Dashboard

A fast, responsive weather dashboard built with **React + Vite + TypeScript + Tailwind CSS**.
Search any city in the world and see current conditions, a 24-hour forecast, a 7-day forecast
and detailed weather metrics. All data is live from the free [Open-Meteo](https://open-meteo.com/) API.
No API keys, no backend, no database: it's a static site that deploys to Vercel's free Hobby plan.

## Features

- **City search** with debounced autocomplete, keyboard navigation (↑ ↓ Enter Esc Home End),
  and region and country shown so same-name cities can be told apart (e.g. Springfield, Illinois vs Missouri).
- **Current location** via the browser Geolocation API, only when you click the locate button,
  with clear messages if permission is denied or unavailable.
- **Current weather**: temperature, condition, feels-like, today's high and low, sunrise and sunset,
  and a live local clock in the city's own timezone.
- **24-hour forecast** in a horizontally scrollable row, with the current hour highlighted, plus a temperature trend chart (Recharts, lazy-loaded).
- **7-day forecast** with precipitation chance and a temperature-range bar.
- **Metrics**: wind (with direction and a 24 h trend line), gusts, rain chance, UV index (with a severity colour),
  humidity, cloud cover, visibility and pressure. Each card is labelled *Now*, *This hour* or *Today*,
  so current values and forecast values are never confused.
- **Sunrise & sunset** arc showing the sun's position and the daylight remaining.
- **"Today at a glance"**: a rule-based summary generated only from real forecast values.
- **Saved locations**: add or remove favourite cities (stored in LocalStorage).
- **°C / °F toggle** (data is always fetched in °C and converted only for display, so values never drift).
- **Dark / light theme**, remembered between visits.
- **Refresh button** and a "last updated" time.
- **Caching**: responses are cached for 10 minutes (in memory and LocalStorage) to reduce API calls.
- **Robust**: loading skeletons, error states with retry, and safe handling of offline mode, malformed responses
  and missing values. In-flight requests are aborted when you switch cities, so a slow response can never
  overwrite a newer one.
- **Accessible**: semantic HTML, labels, visible focus rings, a skip link, an ARIA combobox, and reduced-motion support.

## Tech stack

| Purpose            | Package / API |
| ------------------ | ------------- |
| UI framework       | `react`, `react-dom` 18 |
| Build tool         | `vite` 5, `@vitejs/plugin-react` |
| Language           | `typescript` 5 (strict mode) |
| Styling            | `tailwindcss` 3, `postcss`, `autoprefixer` |
| Icons              | `lucide-react` |
| Charts             | `recharts` |
| Weather data       | Open-Meteo Forecast API: `https://api.open-meteo.com/v1/forecast` |
| City search        | Open-Meteo Geocoding API: `https://geocoding-api.open-meteo.com/v1/search` |
| Browser APIs       | Geolocation, LocalStorage, Fetch + AbortController, Intl |

## Project structure

```
iskycast/
├── index.html               # Page shell, metadata, favicon, font
├── public/favicon.svg
├── src/
│   ├── main.tsx             # App entry point
│   ├── App.tsx              # Layout and app state (location, unit, theme, favourites)
│   ├── index.css            # Tailwind layers and shared component classes
│   ├── components/
│   │   ├── Header.tsx           # Location label, search, locate, °C/°F, theme toggle
│   │   ├── Navigation.tsx       # Desktop sidebar and mobile drawer (section links)
│   │   ├── Logo.tsx
│   │   ├── CitySearch.tsx       # Autocomplete combobox
│   │   ├── CurrentWeather.tsx   # Hero card and lazy-loaded chart
│   │   ├── WeatherChart.tsx     # Recharts 24 h temperature trend
│   │   ├── HourlyForecast.tsx
│   │   ├── DailyForecast.tsx
│   │   ├── WeatherMetrics.tsx   # Metric cards
│   │   ├── RingGauge.tsx
│   │   ├── SunriseSunset.tsx
│   │   ├── DailySummary.tsx
│   │   ├── FavoriteCities.tsx
│   │   ├── WeatherIllustration.tsx  # SVG weather art per WMO code
│   │   ├── LoadingSkeleton.tsx
│   │   ├── ErrorState.tsx
│   │   └── Footer.tsx           # Open-Meteo attribution
│   ├── hooks/
│   │   ├── useWeather.ts        # Fetching, caching, abort and race protection
│   │   ├── useGeolocation.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebouncedValue.ts
│   │   └── useNow.ts
│   ├── services/
│   │   ├── http.ts              # fetch wrapper, ApiError, safe parsers
│   │   ├── weatherApi.ts        # Forecast request (URLSearchParams), parsing, cache
│   │   └── geocodingApi.ts
│   ├── utils/
│   │   ├── weatherCodes.ts      # WMO code → label, description, Lucide icon, category
│   │   ├── weatherSummary.ts    # Rule-based daily summary
│   │   ├── temperature.ts       # °C/°F conversion and formatting
│   │   ├── dateTime.ts          # City-local time formatting
│   │   ├── forecast.ts          # Next-24 h slice, day periods
│   │   └── metrics.ts           # UV levels, compass, descriptors
│   └── types/weather.ts
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── package.json
```

## Run locally

You need [Node.js](https://nodejs.org/) 18 or newer (check with `node -v`).

```bash
cd iskycast
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

Other commands:

```bash
npm run build      # type-check and build into dist/
npm run preview    # serve the production build locally
```

> Geolocation needs a secure context. It works on `localhost` and on your Vercel `https://` URL.

## Live on GitHub Pages

The site is published at **https://ishi752.github.io/iskycast/**.

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the app
(`npm run build -- --mode ghpages`, so assets are served from `/iskycast/`) and publishes `dist/` to the
`gh-pages` branch. Check progress in the repository's **Actions** tab.

If the site doesn't appear after the first run, open **Settings → Pages** and set
**Source: Deploy from a branch**, **Branch: `gh-pages` / `(root)`**.

## Deploy to Vercel (free Hobby plan)

No environment variables and no `vercel.json` are needed; Vercel detects Vite automatically.

### 1. Push the code to GitHub

1. Create a new **empty** repository on GitHub (for example `iskycast`). Don't add a README.
2. In a terminal inside the `iskycast` folder, run:

```bash
git init
git add .
git commit -m "Initial commit: iSkycast weather dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/iskycast.git
git push -u origin main
```

### 2. Import the repository into Vercel

1. Go to https://vercel.com and sign in with GitHub.
2. Click **Add New… → Project**.
3. Find your `iskycast` repository and click **Import**.
4. Check the settings (they should be detected automatically):
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (or `iskycast` if the repo contains the parent folder)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **Deploy**.

### 3. Get your public URL

When the build finishes (about a minute), Vercel shows a preview with a URL such as
`https://iskycast-yourname.vercel.app`. Click **Visit** to open it. You'll find it later on the project's dashboard too.

### 4. Redeploy after changes

Every push to `main` triggers a new production deployment automatically:

```bash
git add .
git commit -m "Describe your change"
git push
```

You can also redeploy manually from Vercel: **Project → Deployments → ⋯ → Redeploy**.

## Data & attribution

Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed under CC BY 4.0.
The free Open-Meteo API is for **non-commercial use** (under 10,000 requests per day). For commercial use, see their paid plans.

## Known limitations

- Open-Meteo provides **modelled** weather data rather than readings from a specific weather station, so "current" values are the model's latest estimate.
- Visibility and UV index are not part of Open-Meteo's `current` block, so the dashboard shows the **forecast for the current hour** (clearly labelled *This hour*).
- Open-Meteo has no reverse geocoding, so a location found with the GPS button is shown as "My location" with its coordinates instead of a city name.
- The forecast covers 7 days, the range requested from the API.
- Saved locations and settings live in your browser's LocalStorage and don't sync across devices.
