import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-6xl font-semibold text-ink">404</p>
        <h1 className="mt-3 text-xl font-semibold">That page is off the map</h1>
        <p className="mt-2 text-sm text-muted">Try the globe, or read how Jumpify is put together.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink"
          >
            Open globe
          </Link>
          <Link
            to="/about"
            className="inline-flex h-10 items-center rounded-lg border border-rule px-4 text-sm font-medium"
          >
            About
          </Link>
        </div>
      </div>
    </div>
  );
}
