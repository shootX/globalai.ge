import { Link } from "@/i18n/navigation";
import type { Project } from "@/lib/api-types";

export type VentureLabels = { live: string; building: string };
type NextRow = { title: string; meta: string; text: string };
type VentureListProps = { projects: Project[]; labels: VentureLabels; next?: NextRow };

const GEORGIAN = /[Ⴀ-ჿᲐ-Ჿ]/;

/** Big-type list of ventures. Each row opens the project page. The optional last row is an outlined "what's next" line. */
export function VentureList({ projects, labels, next }: VentureListProps) {
  return (
    <div className="venture-list">
      {projects.map((p, i) => {
        const status = p.status === "building" ? "building" : "live";
        const name = p.title ?? "";
        return (
          <Link key={p.id} className="venture" href={`/projects/${p.slug ?? ""}`} data-testid={`project-${i}`}>
            <h3 className={GEORGIAN.test(name) ? "name ka" : "name"}>{name}</h3>
            <div className="meta">
              <span className={status === "live" ? "chip" : "chip muted"}>{labels[status]}</span>
              {p.category ? <b>{p.category}</b> : null}
              {p.summary ? <span>{p.summary}</span> : null}
            </div>
          </Link>
        );
      })}
      {next ? (
        <Link className="venture soon" href="/contact" data-testid="venture-next">
          <h3 className={GEORGIAN.test(next.title) ? "name ka" : "name"}>{next.title}</h3>
          <div className="meta">
            <b>{next.meta}</b>
            <span>{next.text}</span>
          </div>
        </Link>
      ) : null}
    </div>
  );
}
