import { storageUrl } from "@/lib/admin/storage";
import type { Project } from "@/lib/api-types";

const COVERS = [
  "radial-gradient(circle at 70% 40%,#fff 0,#9a9a96 35%,#2b2b2b 100%)",
  "linear-gradient(160deg,#d9d9d5,#5f5f5c)",
  "repeating-linear-gradient(90deg,#3a3a3a 0 40px,#bdbdb9 40px 80px)",
  "radial-gradient(circle at 30% 70%,#e9e9e6 0 20%,#7a7a76 21% 45%,#333 46%)",
  "linear-gradient(0deg,#2f2f2f 0 35%,#cfcfcb 35% 100%)",
  "conic-gradient(from 45deg at 60% 50%,#8a8a86,#e2e2de,#4a4a48,#8a8a86)",
];

type ProjectCardViewProps = { project: Project; index: number; tag: string };

export function ProjectCardView({ project, index, tag }: ProjectCardViewProps) {
  const background = project.cover_image ? `center/cover url(${storageUrl(project.cover_image)})` : COVERS[index % COVERS.length];
  return (
    <article data-testid={`project-${index}`}>
      <div className="img" style={{ background }}>
        <span className="tag">{tag}</span>
      </div>
      <h3>{project.title}</h3>
      <p className="d">{project.summary}</p>
    </article>
  );
}
