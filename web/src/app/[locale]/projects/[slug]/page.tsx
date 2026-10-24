import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, getPageText } from "@/lib/api";
import { storageUrl } from "@/lib/admin/storage";
import { CtaBand } from "@/components/cta-band";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { routing } from "@/i18n/routing";
import { resolveLocale } from "@/lib/locale-params";
import { OG_LOCALE, ogImageUrl } from "@/lib/page-seo";
import { SITE_URL, localizedPath } from "@/lib/seo";

const LABEL = { ka: "პროექტი", en: "Project", ru: "Проект" } as const;

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const project = await getProject(slug, locale);
  if (!project?.data.title) return {};
  const data = project.data;
  const title = data.seo_title || data.title || "globalAI";
  const description = data.seo_description || data.summary || "";
  const path = `/projects/${data.slug ?? slug}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    const alt = data.alternates?.[l] || data.slug || slug;
    languages[l] = localizedPath(`/projects/${alt}`, l);
  }
  languages["x-default"] = languages[routing.defaultLocale];
  const image = ogImageUrl(data.og_image || data.cover_image);
  const canonical = localizedPath(path, locale);
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    robots: data.noindex ? { index: false, follow: false } : { index: true, follow: true },
    alternates: { canonical, languages },
    openGraph: { title, description, url: canonical, locale: OG_LOCALE[locale], type: "website", images: [{ url: image, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProjectDetailPage({ params }: Params) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const project = await getProject(slug, locale);
  if (!project?.data.title) notFound();
  const t = await getPageText("projects", locale);
  const data = project.data;
  const url = `${SITE_URL}${localizedPath(`/projects/${data.slug ?? slug}`, locale)}`;
  const status = data.status === "building" ? "building" : "live";
  const cover = data.cover_image ? storageUrl(data.cover_image) : null;
  const gallery = (data.gallery ?? []).map((g) => storageUrl(g)).filter((g): g is string => Boolean(g));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: data.title,
          description: data.seo_description || data.summary,
          url,
          ...(cover ? { image: cover } : {}),
          ...(data.website_url ? { sameAs: data.website_url } : {}),
          creator: { "@id": `${SITE_URL}/#org` },
        }}
      />
      <PageHero testId="project-detail" label={data.category ?? LABEL[locale]} title={data.title ?? ""} intro={data.summary ?? ""}>
        <span className={status === "live" ? "chip" : "chip muted"}>{t(`filters.${status}`)}</span>
        {data.website_url ? (
          <a className="btn" href={data.website_url} target="_blank" rel="noopener" data-testid="project-website">
            {t("visit")} <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </PageHero>
      {cover ? (
        <div className="wrap">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote storage URL */}
          <img className="cover" src={cover} alt={data.title ?? ""} />
        </div>
      ) : null}
      {data.body ? (
        <section className="block">
          <div className="wrap grid12">
            <div className="prose">{data.body}</div>
          </div>
        </section>
      ) : null}
      {gallery.length > 0 ? (
        <section className="block tight">
          <div className="wrap gallery">
            {gallery.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- remote storage URL
              <img key={i} src={src} alt={`${data.title ?? ""} ${i + 1}`} loading="lazy" />
            ))}
          </div>
        </section>
      ) : null}
      <CtaBand title={t("ctaBand")} cta={t("ctaContact")} testId="cta-project-contact" />
    </>
  );
}
