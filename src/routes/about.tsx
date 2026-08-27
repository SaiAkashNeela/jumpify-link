import { createFileRoute, Link } from "@tanstack/react-router";
import { JumpifyMark, JumpifyWordmark } from "@/logo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Jumpify" },
      {
        name: "description",
        content:
          "Jumpify is a free interactive 3D globe and 2D flat map for ISS orbit, spaceports, earthquakes, undersea internet cables, world radio, and tap-anywhere weather.",
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
        Jumpify is a live planetary playground you can explore in <strong>3D Globe</strong> or <strong>2D Flat Map</strong> projection.
        Switch modes to inspect real-time satellite orbits, global space launchpads, USGS earthquakes, NASA disaster events,
        transoceanic submarine fiber cables, or live world radio. Tap anywhere on Earth to read local weather, time, US AQI, and Wikipedia history.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Modes & Layers</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-muted">
        <li><strong>Orbit:</strong> Real-time International Space Station tracker, major orbital spaceports (NASA KSC, Cape Canaveral, ISRO Sriharikota, ESA Kourou, SpaceX Starbase, Baikonur), and dynamic day/night terminator.</li>
        <li><strong>Pulse:</strong> Live USGS earthquake seismicity heatmap & NASA EONET natural disaster telemetry (wildfires, volcanoes, storms).</li>
        <li><strong>Cables:</strong> Physical internet infrastructure — glowing transoceanic subsea fiber optic cables connecting continents.</li>
        <li><strong>Listen:</strong> Live world radio streaming from stations worldwide via Radio Browser.</li>
        <li><strong>Jump (🎲):</strong> Instant teleport to curated Earth wonders, deep ocean trenches, and historic landmarks.</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Who runs this</h2>
      <p className="mt-2 text-muted">
        Open-source project at{" "}
        <a className="underline" href="https://github.com/SaiAkashNeela/jumpify-link" target="_blank" rel="noreferrer">
          github.com/SaiAkashNeela/jumpify-link
        </a>
        . No accounts. No tracking pixels.
      </p>

      <p className="mt-6 text-sm">
        <Link to="/" className="underline">
          ← Back to the planet
        </Link>
      </p>
    </article>
  );
}
