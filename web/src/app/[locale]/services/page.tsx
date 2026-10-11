import type { Metadata } from "next";
import { getServices, getPageText } from "@/lib/api";
import { pageMetadata } from "@/lib/page-seo";
import { SITE_URL, localizedPath } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await resolveLocale(params), "services");
}

type Step = { t: string; d: string };

export default async function ServicesPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const t = await getPageText("services", locale);
  const services = await getServices(locale);
  const steps = t.raw("steps") as Step[];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": services.data.map((service) => ({
            "@type": "Service",
            name: service.title,
            description: service.summary || service.body || undefined,
            url: `${SITE_URL}${localizedPath(`/services/${service.slug ?? ""}`, locale)}`,
          })),
        }}
      />
      <PageHero testId="services-hero" label={t("label")} title={t("title")} intro={t("intro")} />
      <section data-testid="services-list">
        <div className="wrap">
          {services.data.map((s, i) => (
            <div className="srow" key={s.id} id={s.slug ?? undefined} data-testid={`service-${i}`}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <ul>
                {(s.tags ?? []).map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section data-testid="services-process">
        <div className="wrap">
          <div className="sh">
            <h2>
              {t("processTitle")}
              <em>.</em>
            </h2>
            <span className="m" style={{ color: "var(--grey)" }}>
              {t("processLabel")}
            </span>
          </div>
          <div className="proc">
            {steps.map((s, i) => (
              <div key={s.t} data-testid={`step-${i}`}>
                <span className="n">
                  {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
                </span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title={t("ctaBand")} cta={t("ctaContact")} testId="cta-services-contact" />
    </>
  );
}
