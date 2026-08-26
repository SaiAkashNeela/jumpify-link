import { useEffect, useRef } from "react";
import type { RadioStation } from "@/lib/events";

type Props = {
  station: RadioStation | null;
  onStop: () => void;
};

export function RadioBar({ station, onStop }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !station) return undefined;
    const play = () => {
      void el.play().catch(() => {
        /* autoplay can still be blocked; controls remain */
      });
    };
    play();
    return () => {
      el.pause();
    };
  }, [station]);

  if (!station) return null;
  return (
    <div className="pointer-events-auto jumpify-hud absolute inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-2xl px-3 py-2 sm:inset-x-auto sm:left-4 sm:w-80">
      <span className="size-2 shrink-0 rounded-full bg-live" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{station.name}</p>
        <p className="truncate text-[11px] text-muted">{station.country || "On air"}</p>
      </div>
      <audio ref={audioRef} src={station.stream} controls className="h-8 w-28" />
      <button
        type="button"
        onClick={onStop}
        className="h-8 whitespace-nowrap rounded-lg px-2 text-[12px] text-muted hover:text-ink"
      >
        Stop
      </button>
    </div>
  );
}
