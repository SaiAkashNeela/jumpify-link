import { Link, useRouter } from "@tanstack/react-router";

export function RouteErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn’t load</h1>
        <p className="mt-2 text-sm text-muted">Something broke on our side. Refresh, or go back to the globe.</p>
        <p className="sr-only">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              void router.invalidate();
              reset();
            }}
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex h-10 items-center rounded-lg border border-rule px-4 text-sm font-medium"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
