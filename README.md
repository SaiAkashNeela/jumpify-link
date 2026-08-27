# Jumpify.link

Poke the live planet. A free, no-account globe you can spin with a thumb.

Default view is **Orbit**: day/night terminator plus the International Space Station. Named disasters are an optional overlay, not the homepage — NASA EONET is a curated list and a 3-day window is often empty. An empty globe looks broken. Orbit stays busy on a quiet day.

## Modes

| Mode | What moves | Source |
| --- | --- | --- |
| **Orbit** | ISS track + night side | [Where The ISS At](https://wheretheiss.at/w/developer) |
| **Pulse** | Earthquakes + named events | [USGS GeoJSON](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php), [NASA EONET v3](https://eonet.gsfc.nasa.gov/docs/v3) |
| **Listen** | World radio | [Radio Browser](https://all.api.radio-browser.info/) |

Tap anywhere: place name, local time, weather, US AQI, nearby Wikipedia extract (Open-Meteo + Wikipedia geosearch).

Share a view: the URL stores `m` (mode), `lng`, `lat`, `z`.

Light / dark / system. Choice persisted as `jumpify_theme_v1`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build
npx wrangler deploy
```

No env vars required. The app is fully keyless. If you later add a NASA `DEMO_KEY` or FIRMS `MAP_KEY`, put them in Wrangler secrets — the current layers do not need them.

## Architecture

```
Browser  →  /api/iss | /api/events | /api/quakes | /api/radio | /api/place
                ↓
         Cloudflare Worker (in-memory cache)
                ↓
         Upstream (ISS / EONET / USGS / Radio Browser / Open-Meteo / Wikipedia)
```

The browser never talks to NASA, USGS, or Radio Browser directly.

TTLs: ISS 4s · EONET 3 min · quakes 60s · radio 10 min · place 10 min.

Stack: TanStack Start (React 19) + MapLibre GL JS globe projection (`setProjection({ type: 'globe' })`) + CARTO Positron / Dark Matter basemaps. Deployed as a **Cloudflare Worker** (not Pages).

## Why these layers

Four feeds, done well, beat twenty broken ones.

- **ISS** always moves. That is the “alive” guarantee.
- **USGS 2.5+ day** is dense enough for a heatmap without painting 50k points.
- **EONET open/7 days** is the optional disaster overlay. Geometry is normalised server-side; unknown categories become `other`.
- **Radio Browser** (HTTPS streams only, geo tagged) gives Listen a texture of cities.

Open-Meteo and OpenSky free use is typically non-commercial; this site is non-commercial. Nominatim is not used (1 req/s public instance).

## Attribution

Basemap © CARTO, © OpenStreetMap contributors. India outline: [Datameet composite](https://github.com/datameet/maps/blob/master/Country/README.md) matching the [Survey of India](https://www.surveyofindia.gov.in/) claim (Jammu & Kashmir, Ladakh, Gilgit-Baltistan, Aksai Chin). Events: NASA EONET (no NASA endorsement). Earthquakes: USGS. Weather / AQI: Open-Meteo. ISS: Where The ISS At. Stations: Radio Browser. Wikipedia extracts: Wikimedia.

Do not use the NASA logo.

## Design

Wordless mark is a meridian leaping a globe — React SVG in `src/logo.tsx`, same paths in `public/favicon.svg`.

Hallmark: Map / Diagram macrostructure, atmospheric HUD, Bricolage Grotesque + IBM Plex Sans, amber accent. No glassmorphism, no purple gradients, no Inter.

## Licence

MIT. See the repository.
