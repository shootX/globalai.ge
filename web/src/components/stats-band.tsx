import type { Settings } from "@/lib/api";

type StatsBandProps = { settings: Settings };

/** Rendered only when settings.stats_visible is true and real stats exist (no fake numbers). */
export function StatsBand({ settings }: StatsBandProps) {
  const stats = settings.stats ?? [];
  if (!settings.stats_visible || stats.length === 0) return null;
  return (
    <div className="stats" data-testid="stats">
      {stats.map((s, i) => (
        <div key={i}>
          <b>
            {s.value}
          </b>
          <span className="m">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
