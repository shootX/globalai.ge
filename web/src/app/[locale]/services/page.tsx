import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
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
      <section className="block tight" data-testid="services-list">
        <div className="wrap service-list">
          {services.data.map((s, i) => {
            const inner = (
              <>
                <h3>{s.title}</h3>
                <div>
                  <p>{s.summary || s.body}</p>
                  {(s.tags ?? []).length > 0 ? (
                    <div className="tags">
                      {(s.tags ?? []).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className="go" aria-hidden="true">
                  →
                </span>
              </>
            );
            return s.slug ? (
              <Link className="service-row" key={s.id} id={s.slug} href={`/services/${s.slug}`} data-testid={`service-${i}`}>
                {inner}
              </Link>
            ) : (
              <div className="service-row" key={s.id} data-testid={`service-${i}`}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>
      <section className="block lime-field" data-testid="services-process">
        <div className="wrap">
          <span className="label">{t("processLabel")}</span>
          <h2>{t("processTitle")}</h2>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s.t} data-testid={`step-${i}`}>
                <b>{s.t}</b>
                <span>{s.d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <CtaBand title={t("ctaBand")} cta={t("ctaContact")} testId="cta-services-contact" />
    </>
  );
}
