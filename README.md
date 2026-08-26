# jumpify-link

Build **Jumpify.link**, a production-quality, mobile-first web experience for exploring natural events happening around the world in near real time.

The product should feel like a focused public information tool, not a generic SaaS dashboard.

## Core concept

**Jumpify**

**The world, right now.**

Show a beautiful interactive world map containing natural events currently happening around Earth.

Users should be able to:

* See the entire world immediately.
* See natural events plotted geographically.
* Click an event to inspect it.
* Filter events by category.
* Zoom and pan around the globe.
* Understand what is happening without needing an account or reading documentation.

Keep the product extremely simple.

No login.
No signup.
No profiles.
No payments.
No user-generated content.
No unnecessary dashboard functionality.

---

## Data source

Use **NASA EONET v3** as the initial event source.

The upstream endpoint is:

`https://eonet.gsfc.nasa.gov/api/v3/events/geojson?status=open&days=1`

This should return recent open natural events from around the world.

IMPORTANT:

**Never call NASA EONET directly from the browser.**

The browser must never expose the NASA API request in its Network panel.

Create a server-side/edge data endpoint for Jumpify, for example:

`/api/events`

Architecture:

```text
NASA EONET
     ↓
Server-side scheduled job
     ↓
Every 3 minutes
     ↓
Fetch EONET
     ↓
Validate response
     ↓
Transform/normalise data
     ↓
Cache latest successful dataset
     ↓
/api/events
     ↓
Browser
```

Users must only communicate with Jumpify's own `/api/events` endpoint.

Do not expose the upstream NASA URL to the client.

Do not make one NASA request per visitor.

The scheduled server-side job should make **one request every 3 minutes**.

If NASA fails temporarily, keep serving the previous successful dataset instead of returning an empty map.

Include a timestamp indicating when Jumpify last successfully refreshed its data.

Do not blindly rely on browser fetch caching. Make the server-side refresh/cache behaviour explicit.

Use the simplest appropriate Cloudflare-compatible architecture if this project is being deployed on Cloudflare. Do not introduce a database unless genuinely necessary. The latest event dataset can simply be cached/stored as one current snapshot.

---

## Data transformation

Do not expose the raw EONET response directly to the browser.

Create an internal normalized event model such as:

```ts
type JumpifyEvent = {
  id: string
  title: string
  category: string
  categoryTitle: string
  geometry: GeoJSON.Geometry
  date: string
  closed: string | null
  description: string | null
  sourceUrl: string | null
  sourceName: string | null
  magnitudeValue: number | null
  magnitudeUnit: string | null
}
```

Adapt this to the actual EONET v3 response after inspecting the current documentation and response structure.

Do not assume fields that aren't actually present.

Handle:

* Point
* LineString
* Polygon
* MultiPoint
* MultiLineString
* MultiPolygon

where returned by EONET.

Do not invent coordinates.

---

# Map

Use **mapcn** for the map implementation.

First inspect the current mapcn documentation and registry rather than guessing its APIs.

Website:

https://mapcn.dev

Registry:

https://mapcn.dev/r/registry.json

Install the base map component using the project's package manager:

```bash
npx shadcn@latest add @mapcn/map
```

Use the mapcn components from:

```tsx
@/components/ui/map
```

For this particular product, prefer:

```tsx
<Map blank>
```

because this is a global natural-event visualization rather than a street/navigation map.

Use a real world-country GeoJSON layer for geographic context, such as the Natural Earth country dataset referenced by mapcn.

Use `MapGeoJSON` or appropriate MapLibre layers for EONET event geometries.

The world should be visible immediately when the page loads.

The map should fit the entire world naturally rather than opening zoomed into one country.

Do not fabricate geographic boundaries.

---

# Map visual design

The map is the product.

Do NOT make it look like a generic admin dashboard with a map placed inside a card.

The map should dominate the page.

Use subtle geographic boundaries and a restrained visual treatment.

Natural events should stand out clearly.

Different event categories should have visually distinguishable markers.

Suggested categories based on actual EONET category values:

* Wildfires
* Severe Storms
* Volcanoes
* Floods
* Landslides
* Sea/Lake Ice
* Other supported EONET categories

Do not hardcode categories that EONET does not return.

If a category is unknown, gracefully display it as "Other".

For dense regions, use clustering where appropriate.

When zoomed out:

```text
        ●
      ●●●
          ●
```

should consolidate into useful clusters rather than rendering hundreds of overlapping markers.

When zoomed in, individual events should become visible.

Use mapcn's existing clustering functionality if it fits the actual current API.

---

# Event interaction

Clicking an event must open a clean information panel/popover.

Example:

```text
WILDFIRE

Northern California

Started
24 Aug 2026 · 18:42 UTC

Status
Active

Source
NASA EONET

[View source]
```

If description exists, display it.

If magnitude exists, display it.

If there is no description or magnitude, don't show empty fields.

For polygons or other geometry types, clicking the affected area should select the event.

The selected event should remain visually obvious.

On mobile, use a bottom sheet or appropriately responsive panel rather than a tiny desktop-style popup.

---

# Filters

Provide a simple filter bar:

```text
All
Wildfires
Storms
Volcanoes
Floods
Landslides
Other
```

The filters must actually filter the map.

Do not make decorative/non-functional controls.

Also provide:

**Latest**

to sort/show the most recently updated events.

Keep filtering local using the already fetched dataset. Do not request NASA again when users change filters.

---

# Header

Keep the header extremely simple.

```text
JUMPIFY

The world, right now.

[All] [Wildfires] [Storms] [Volcanoes] ...
```

Do not fill the header with navigation links.

On desktop, show a compact status indicator:

```text
● Live
Updated 2 min ago
```

On mobile, keep the controls compact and horizontally scrollable if necessary.

---

# Statistics

Provide only useful information.

For example:

```text
1,284
active events

87
countries affected
```

and:

```text
Updated 2 minutes ago
```

Do not invent statistics.

Calculate them from the actual normalized dataset.

If country information isn't directly reliable from the EONET response, don't fabricate a country count. Instead show a statistic that can be calculated reliably.

---

# Recent events

On desktop, provide a subtle recent-events panel or list alongside/below the map.

Example:

```text
Recent events

🔥 Wildfire
California
12 min ago

🌋 Volcano
Indonesia
27 min ago

🌪 Severe Storm
Atlantic Ocean
41 min ago
```

Clicking a list item should select and focus the corresponding event on the map.

On mobile, prioritize the map and selected-event experience.

Do not let the event list overwhelm the map.

---

# Loading / errors

The first render should have a useful loading state.

If the event API is temporarily unavailable:

```text
Unable to refresh events.

Showing the last successful update:
12 minutes ago
```

If there is no cached dataset at all:

```text
Events are temporarily unavailable.
Please try again shortly.
```

Never show a completely broken blank page.

---

# NASA attribution

Because the event data originates from NASA EONET, include clear attribution somewhere appropriate, such as:

**Natural event data: NASA EONET**

Do not use NASA's logo.

Do not imply NASA endorses or operates Jumpify.

Where appropriate, preserve source links supplied by EONET.

---

# SEO

The page should be indexable and understandable without JavaScript-dependent text alone.

Use a proper title and description around the actual product:

Title concept:

**Jumpify — Natural Events Happening Around the World**

Description concept:

**Explore wildfires, storms, volcanoes, floods and other natural events happening around the world on a live interactive map.**

Naturally target relevant searches such as:

* live world map
* natural events map
* world events map
* wildfires around the world
* earthquakes and natural events
* natural disasters happening now

Do not keyword stuff.

Use semantic HTML.

Add appropriate Open Graph metadata.

---

# Performance

This needs to feel extremely fast.

The browser must receive only the normalized data required for the map.

Do not ship the entire raw NASA response if unnecessary.

Avoid unnecessary dependencies.

Lazy-load nonessential UI.

Do not make additional network requests when filtering events.

The server refreshes NASA every 3 minutes, not the client.

The client can poll Jumpify's own `/api/events` endpoint periodically if necessary, but don't make it overly aggressive.

---

# Mobile

Mobile-first is mandatory.

At 320px width:

* No horizontal page scrolling.
* Map remains usable.
* Filters remain accessible.
* Event details remain readable.
* Buttons have appropriate touch targets.
* No tiny desktop controls.
* Selected events should open in a mobile-friendly sheet/panel.

Test the actual layout at narrow widths.

---

# Visual direction

This should NOT look AI-generated.

Avoid:

* excessive gradients
* glassmorphism everywhere
* giant hero sections
* meaningless metric cards
* excessive rounded cards
* excessive shadows
* purple/blue AI-style gradients
* stock illustrations
* fake activity numbers
* decorative charts that provide no information
* unnecessary animations

The map and actual event data are the visual identity.

Think **scientific / geographic / editorial / public-information product**.

Use excellent typography, spacing and hierarchy.

Keep the interface calm and trustworthy.

Light mode should be the default.

---

# Future architecture

Do not implement this yet, but structure the data layer so additional sources can later be added.

Potential future source:

USGS earthquake data.

The frontend should consume normalized `JumpifyEvent` objects rather than being tightly coupled to NASA EONET.

Future sources should be able to map into the same event model.

Do not build USGS yet.

---

# Development rules

Before writing code:

1. Inspect the current mapcn documentation.
2. Inspect the current mapcn registry.
3. Verify the actual APIs available for Map, MapGeoJSON, markers, popups and clusters.
4. Inspect the current NASA EONET v3 documentation.
5. Verify the actual EONET GeoJSON response structure.
6. Do not guess APIs or component props.
7. Use the project's existing shadcn/ui setup where appropriate.
8. Keep dependencies minimal.
9. Do not create fake data when real API data is available.
10. Do not create fake event locations or fake event counts.

After implementation:

* Test the EONET server-side request.
* Confirm the browser never directly requests `eonet.gsfc.nasa.gov`.
* Confirm `/api/events` returns the normalized dataset.
* Confirm the 3-minute refresh works.
* Confirm stale cached data is retained when NASA fails.
* Confirm all map filters work.
* Confirm event clicks work.
* Confirm polygons/areas render correctly where supplied.
* Confirm mobile layout.
* Confirm there are no console errors.
* Confirm the production build succeeds.

The final result should feel like a tiny, polished product that someone could discover on Google, open immediately, and understand within three seconds:

**Open Jumpify → see Earth → see what's happening → click an event.**
Yeah — by default, EONET gives you event locations, not “highlight this entire country.”

So if there's a wildfire in California, the map might show a point or affected geometry in California. If there's a storm with a polygon/line geometry, you can show that actual area.

For Jumpify, I'd do both, but subtly:

 🌍 Country borders always visible as geographic context.

 🔥 Event marker/geometry shows exactly where EONET places the event.

 🟠 Affected-area polygon when EONET provides one.

Don't automatically colour an entire country unless the event data actually supports that.

Example:

          EUROPE

       ┌───────────┐
       │   🇫🇷     │
       │      🔥   │  ← event
       │           │
       └───────────┘

Click 🔥 → event panel.

If you want country highlighting

That's a separate layer.

You can take the event's coordinates and determine which country contains that point, then highlight that country lightly.

So:

NASA EONET
    ↓
Event coordinates
    ↓
Country boundary lookup
    ↓
🇮🇩 Indonesia highlighted
    +
🌋 Volcano marker

But I'd not do this initially. It can make the map look like a choropleth/data dashboard, when what makes Jumpify cool is seeing actual things happening at actual locations.

The visual I'd aim for is:

World map + subtle country outlines + lots of small live event markers + larger polygons where available.

That's much more "holy shit, what's happening around the planet?" than colouring whole countries.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/328f801f-3c3e-4240-95c5-94f9996bd266).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
