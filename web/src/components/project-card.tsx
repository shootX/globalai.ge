import type { Project } from "@/lib/api";
import { ProjectCardView } from "./project-card-view";

type ProjectCardProps = { project: Project; index: number };

export function ProjectCard({ project, index }: ProjectCardProps) {
  return <ProjectCardView project={project} index={index} tag={project.category ?? ""} />;
}
