import { createFileRoute, Link } from "@tanstack/react-router";
import { JumpifyMark, JumpifyWordmark } from "@/logo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Jumpify" },
      {
        name: "description",
        content: "Jumpify is a free interactive globe for ISS orbit, earthquakes, radio, and tap-anywhere weather.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <article className="mx-auto min-h-dvh max-w-2xl px-5 py-12 text-ink">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <JumpifyMark size={22} />
        <JumpifyWordmark />
      </Link>
      <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">The world, poked.</h1>
      <p className="mt-4 text-muted">
        Jumpify is a one-page globe you can spin with a thumb. The default view is Orbit: day/night terminator plus the
        International Space Station. Pulse adds USGS earthquakes and NASA EONET named events as an optional overlay.
        Listen plots world radio stations. Tap anywhere for local time, weather, air quality, and a nearby Wikipedia
        extract.
      </p>
      <p className="mt-4 text-muted">
        Named disasters are not the homepage. EONET is a curated list, often sparse. An empty globe looks broken, so
        Orbit stays visually busy even on a quiet day.
      </p>
      <h2 className="mt-8 text-lg font-semibold">Who runs this</h2>
      <p className="mt-2 text-muted">
        Open-source project at{" "}
        <a className="underline" href="https://github.com/SaiAkashNeela/jumpify-link">
          github.com/SaiAkashNeela/jumpify-link
        </a>
        . No accounts. No tracking pixels. Theme preference lives in localStorage under{" "}
        <code className="font-mono text-[13px]">jumpify_theme_v1</code>.
      </p>
      <h2 className="mt-8 text-lg font-semibold">When to use it</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
        <li>You want a live planet on a phone without an account.</li>
        <li>You need a shareable camera URL (mode + lat/lng/zoom).</li>
        <li>You want keyless public data, proxied so browsers never hammer NASA or USGS.</li>
      </ul>
      <p className="mt-6 text-sm">
        <Link to="/" className="underline">
          Back to the globe
        </Link>
      </p>
    </article>
  );
}
