"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Project } from "@/lib/api-types";
import { ProjectCardView } from "./project-card-view";

const FILTERS = ["all", "web", "mobile", "ai"] as const;
type Filter = (typeof FILTERS)[number];

type ProjectsViewProps = { projects: Project[] };

export function ProjectsView({ projects }: ProjectsViewProps) {
  const t = useTranslations("projects");
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <>
      <div className="chips m" role="group" aria-label={t("filterLabel")}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            data-testid={`filter-${f}`}
            onClick={() => setFilter(f)}
          >
            {t(`filters.${f}`)}
          </button>
        ))}
      </div>
      <div className="pj">
        {visible.map((p, i) => (
          <ProjectCardView key={p.id} project={p} index={i} tag={p.category && FILTERS.includes(p.category as Filter) ? t(`filters.${p.category}`) : (p.category ?? "")} />
        ))}
      </div>
    </>
  );
}
