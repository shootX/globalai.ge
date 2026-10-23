"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Project } from "@/lib/api-types";
import { VentureList } from "./venture-list";

const FILTERS = ["all", "live", "building"] as const;
type Filter = (typeof FILTERS)[number];

type ProjectsViewProps = { projects: Project[] };

export function ProjectsView({ projects }: ProjectsViewProps) {
  const t = useTranslations("projects");
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? projects : projects.filter((p) => (p.status ?? "live") === filter);
  const hasBoth = projects.some((p) => p.status === "building") && projects.some((p) => (p.status ?? "live") === "live");

  return (
    <>
      {hasBoth ? (
        <div className="filters" role="group" aria-label={t("filterLabel")}>
          {FILTERS.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} data-testid={`filter-${f}`} onClick={() => setFilter(f)}>
              {t(`filters.${f}`)}
            </button>
          ))}
        </div>
      ) : null}
      <VentureList projects={visible} labels={{ live: t("filters.live"), building: t("filters.building") }} />
    </>
  );
}
