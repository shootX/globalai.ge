import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService } from "@/lib/api";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { routing } from "@/i18n/routing";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { OG_LOCALE, ogImageUrl } from "@/lib/page-seo";
import { SITE_URL, localizedPath } from "@/lib/seo";

const LABEL = { ka: "სერვისი", en: "Service", ru: "Услуга" } as const;

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const service = await getService(slug, locale);
  if (!service?.data.title) return {};
  const data = service.data;
  const title = data.seo_title || data.title || "globalAI";
  const description = data.seo_description || data.summary || "";
  const path = `/services/${data.slug ?? slug}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    const alt = data.alternates?.[l] || data.slug || slug;
    languages[l] = localizedPath(`/services/${alt}`, l);
  }
  languages["x-default"] = languages[routing.defaultLocale];
  const image = ogImageUrl(data.og_image);
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

export default async function ServiceDetailPage({ params }: Params & LocaleParams) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const service = await getService(slug, locale);
  if (!service?.data.title) notFound();
  const data = service.data;
  const url = `${SITE_URL}${localizedPath(`/services/${data.slug ?? slug}`, locale)}`;

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: data.title, description: data.seo_description || data.summary, url }} />
      <PageHero testId="service-detail" label={LABEL[locale]} title={data.title ?? ""} intro={data.summary ?? ""} />
      {data.body ? (
        <section>
          <div className="wrap">
            <p>{data.body}</p>
          </div>
        </section>
      ) : null}
    </>
  );
}
