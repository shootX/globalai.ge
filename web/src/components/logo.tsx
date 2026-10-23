type LogoProps = { testId?: string; priority?: boolean; sizes?: string };

/**
 * The original GlobalAI mark, traced to vector with the new brand colours.
 * Two files, one per theme; CSS shows the one that matches (see .logo-pair in globals.css).
 * Never replace with a text wordmark.
 */
export function Logo({ testId, priority = false, sizes }: LogoProps) {
  const common = { width: 257, height: 51, decoding: "async" as const, sizes };
  return (
    <span className="logo-pair" data-testid={testId}>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG brand files, no optimisation needed */}
      <img className="on-dark" alt="GlobalAI" src="/brand/globalai-logo-dark.svg" {...common} fetchPriority={priority ? "high" : undefined} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="on-light" alt="GlobalAI" src="/brand/globalai-logo-light.svg" {...common} />
    </span>
  );
}
