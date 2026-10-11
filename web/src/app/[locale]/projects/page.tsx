import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getProjects, type ApiList, type Project, getPageText } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { ProjectsView } from "@/components/projects-view";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await resolveLocale(params), "projects");
}

export default async function ProjectsPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const t = await getPageText("projects", locale);
  let projects: ApiList<Project> | null = null;
  try {
    projects = await getProjects(locale);
  } catch {
    projects = null;
  }
  const isEmpty = projects !== null && projects.meta.total === 0;

  return (
    <>
      <PageHero testId="projects-hero" label={t("label")} title={t("title")} intro={t("intro")} />
      <section style={{ border: 0, paddingTop: 20 }} data-testid="projects-list">
        <div className="wrap">
          {projects === null ? (
            <p className="fstatus err" role="alert" data-testid="projects-error">
              {t("error")}
            </p>
          ) : isEmpty ? (
            <div className="empty" data-testid="projects-empty">
              <div className="dot" aria-hidden="true">
                ●
              </div>
              <h2 className="empty-title">
                {t("emptyTitle")}
                <em>.</em>
              </h2>
              <p>{t("emptyText")}</p>
              <Link className="btn" href="/contact" data-testid="projects-empty-cta">
                {t("emptyCta")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <ProjectsView projects={projects.data} />
          )}
        </div>
      </section>
      <CtaBand title={t("ctaBand")} cta={t("ctaContact")} testId="cta-projects-contact" />
    </>
  );
}
