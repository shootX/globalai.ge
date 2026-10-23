"use client";

import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { storageUrl } from "@/lib/admin/storage";
import type { Project } from "@/lib/api-types";

export type VentureLabels = { live: string; building: string };
type NextRow = { title: string; meta: string; text: string };
type VentureListProps = { projects: Project[]; labels: VentureLabels; next?: NextRow };

const GEORGIAN = /[Ⴀ-ჿᲐ-Ჿ]/;

/**
 * Big-type list of ventures. Each row opens the project page; on desktop the cover image
 * follows the pointer ("peek"). The optional last row is an outlined "what's next" line.
 */
export function VentureList({ projects, labels, next }: VentureListProps) {
  const peekRef = useRef<HTMLDivElement>(null);
  const [cover, setCover] = useState<string | null>(null);

  const move = (e: React.PointerEvent) => {
    const el = peekRef.current;
    if (!el) return;
    el.style.left = `${e.clientX}px`;
    el.style.top = `${e.clientY}px`;
  };

  return (
    <div className="venture-list" onPointerMove={move} onPointerLeave={() => setCover(null)}>
      {projects.map((p, i) => {
        const status = p.status === "building" ? "building" : "live";
        const img = p.cover_image ? storageUrl(p.cover_image) : null;
        const name = p.title ?? "";
        return (
          <Link
            key={p.id}
            className="venture"
            href={`/projects/${p.slug ?? ""}`}
            data-testid={`project-${i}`}
            onPointerEnter={() => setCover(img)}
          >
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
        <Link className="venture soon" href="/contact" data-testid="venture-next" onPointerEnter={() => setCover(null)}>
          <h3 className={GEORGIAN.test(next.title) ? "name ka" : "name"}>{next.title}</h3>
          <div className="meta">
            <b>{next.meta}</b>
            <span>{next.text}</span>
          </div>
        </Link>
      ) : null}
      <div ref={peekRef} className={cover ? "peek on" : "peek"} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote storage URL, decorative */}
        {cover ? <img src={cover} alt="" /> : null}
      </div>
    </div>
  );
}
