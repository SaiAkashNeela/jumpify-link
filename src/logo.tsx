type JumpifyMarkProps = {
  size?: number;
  title?: string;
  className?: string;
};

/**
 * Wordless mark: a meridian arc leaping a small globe.
 * Same path is inlined as favicon.svg.
 */
export function JumpifyMark({
  size = 28,
  title = "Jumpify",
  className,
}: JumpifyMarkProps) {
  const id = "jumpify-mark";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      className={className}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="16" cy="17" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <ellipse
        cx="16"
        cy="17"
        rx="4.4"
        ry="10.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path d="M6.2 17h19.6" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      <path
        d="M8 11.2c4.2-6.6 11.6-6.6 16 0"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="24.1" cy="11.1" r="1.7" fill="var(--accent)" />
      <circle cx="16" cy="17" r="1.15" fill="currentColor" />
      <desc id={id}>Jumpify mark: globe with a leaping meridian.</desc>
    </svg>
  );
}

export function JumpifyWordmark({ className }: { className?: string }) {
  return (
    <span className={className} style={{ fontFamily: "var(--font-display)" }}>
      Jumpify
    </span>
  );
}
