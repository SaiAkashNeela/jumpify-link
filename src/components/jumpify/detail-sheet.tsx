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
import { SPACEPORTS } from "@/lib/spaceports";
import { CABLES } from "@/lib/cables";
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

  if (target.kind === "spaceport") {
    const sp = SPACEPORTS.find((s) => s.id === target.id);
    if (!sp) return null;
    return (
      <Inspector
        title={sp.name}
        kicker={`Orbital Spaceport · ${sp.country}`}
        onClose={onClose}
        footer="Spaceport data: Global Launch Registry"
      >
        <Field label="Operator" value={sp.operator} />
        <Field label="Rockets" value={sp.rockets.join(", ")} />
        <Field label="Coordinates" value={`${sp.lat.toFixed(3)}°, ${sp.lng.toFixed(3)}°`} />
        <p className="text-muted text-xs leading-relaxed">{sp.description}</p>
        <a
          href={sp.wikiUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center rounded-lg border border-rule px-3 text-sm font-medium hover:bg-paper-2"
        >
          Wikipedia page
        </a>
      </Inspector>
    );
  }

  if (target.kind === "cable") {
    const cable = CABLES.find((c) => c.id === target.id);
    if (!cable) return null;
    return (
      <Inspector
        title={cable.name}
        kicker="Subsea Optical Fiber"
        onClose={onClose}
        footer="Submarine cable data: TeleGeography Open"
      >
        <Field label="Length" value={`${cable.lengthKm.toLocaleString()} km`} />
        <Field label="Ready" value={String(cable.readyYear)} />
        <Field label="Owners" value={cable.owners} />
        <Field label="Landing points" value={cable.landingPoints.join(" · ")} />
        <p className="text-muted text-xs leading-relaxed">{cable.description}</p>
      </Inspector>
    );
  }

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
