import { Inspector, Field } from "@/components/jumpify/inspector";
import { PlaceInspector } from "@/components/jumpify/place-inspector";
import {
  categoryMeta,
  formatRelativeTime,
  formatUtcDateTime,
  type IssPayload,
  type JumpifyEvent,
  type Quake,
  type RadioStation,
} from "@/lib/events";
import type { InspectTarget } from "@/components/jumpify/globe";

type Props = {
  target: InspectTarget | null;
  events: JumpifyEvent[];
  quakes: Quake[];
  stations: RadioStation[];
  iss: IssPayload | null;
  now: number;
  onClose: () => void;
  onPlayRadio: (station: RadioStation) => void;
};

export function DetailSheet({
  target,
  events,
  quakes,
  stations,
  iss,
  now,
  onClose,
  onPlayRadio,
}: Props) {
  if (!target) return null;

  if (target.kind === "event") {
    const event = events.find((e) => e.id === target.id);
    if (!event) return null;
    const meta = categoryMeta(event.category);
    return (
      <Inspector title={event.title} kicker={event.categoryTitle} onClose={onClose} footer="Natural event data: NASA EONET">
        <Field label="Started" value={formatUtcDateTime(event.date)} />
        <Field label="Status" value={event.closed ? "Closed" : "Active"} />
        {event.magnitudeValue !== null ? (
          <Field
            label="Magnitude"
            value={`${event.magnitudeValue.toLocaleString()}${event.magnitudeUnit ? ` ${event.magnitudeUnit}` : ""}`}
          />
        ) : null}
        {event.description ? <p className="text-muted">{event.description}</p> : null}
        {event.sourceUrl ? (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-lg border border-rule px-3 text-sm font-medium hover:bg-paper-2"
          >
            Source{event.sourceName ? ` · ${event.sourceName}` : ""}
          </a>
        ) : null}
        <span className="sr-only">{meta.label}</span>
      </Inspector>
    );
  }

  if (target.kind === "quake") {
    const quake = quakes.find((q) => q.id === target.id);
    if (!quake) return null;
    return (
      <Inspector title={quake.place} kicker="USGS earthquake" onClose={onClose} footer="Earthquake data: USGS">
        <Field label="Magnitude" value={quake.mag === null ? "—" : quake.mag.toFixed(1)} />
        <Field label="When" value={formatRelativeTime(new Date(quake.time).toISOString(), now)} />
        {quake.depth !== null ? <Field label="Depth" value={`${quake.depth.toFixed(1)} km`} /> : null}
        {quake.url ? (
          <a
            href={quake.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-lg border border-rule px-3 text-sm font-medium hover:bg-paper-2"
          >
            USGS event page
          </a>
        ) : null}
      </Inspector>
    );
  }

  if (target.kind === "radio") {
    const station = stations.find((s) => s.id === target.id);
    if (!station) return null;
    return (
      <Inspector title={station.name} kicker="World radio" onClose={onClose} footer="Stations: Radio Browser">
        <Field label="Country" value={station.country || "—"} />
        {station.tags ? <Field label="Tags" value={station.tags} /> : null}
        {station.bitrate ? <Field label="Bitrate" value={`${station.bitrate} kbps`} /> : null}
        <button
          type="button"
          onClick={() => onPlayRadio(station)}
          className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-medium text-accent-ink"
        >
          Play station
        </button>
      </Inspector>
    );
  }

  if (target.kind === "iss") {
    return (
      <Inspector title="International Space Station" kicker="Orbit" onClose={onClose} footer="Position: Where The ISS At">
        {iss ? (
          <>
            <Field label="Latitude" value={iss.latitude.toFixed(2)} />
            <Field label="Longitude" value={iss.longitude.toFixed(2)} />
            <Field label="Altitude" value={`${iss.altitude.toFixed(0)} km`} />
            <Field label="Velocity" value={`${iss.velocity.toFixed(0)} km/h`} />
            <Field label="Visibility" value={iss.visibility} />
          </>
        ) : (
          <p className="text-muted">Waiting on the next ISS ping.</p>
        )}
      </Inspector>
    );
  }

  return <PlaceInspector lng={target.lng} lat={target.lat} onClose={onClose} />;
}
