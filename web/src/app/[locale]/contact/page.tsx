import type { Metadata } from "next";
import { getSettings, getPageText } from "@/lib/api";
import { pageMetadata } from "@/lib/page-seo";
import { SITE_URL, localizedPath } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { PageHero } from "@/components/page-hero";
import { ContactForm } from "@/components/contact-form";
import { socialLinks, telHref } from "@/lib/social";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await resolveLocale(params), "contact");
}

export default async function ContactPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const t = await getPageText("contact", locale);
  const s = await getSettings(locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: t("title"),
          description: t("intro"),
          url: `${SITE_URL}${localizedPath("/contact", locale)}`,
        }}
      />
      <PageHero testId="contact-hero" label={t("label")} title={t("title")} intro={t("intro")} />
      <section style={{ paddingTop: 40 }} data-testid="contact-section">
        <div className="wrap ct2">
          <div className="info" data-testid="contact-info">
            <div>
              <span className="m">{t("email")}</span>
              <p>
                {s.contact_email ? (
                  <a href={`mailto:${s.contact_email}`} data-testid="contact-info-email">
                    {s.contact_email}
                  </a>
                ) : (
                  <span data-testid="contact-info-email">—</span>
                )}
              </p>
            </div>
            <div>
              <span className="m">{t("phone")}</span>
              <p>
                {s.contact_phone ? (
                  <a href={telHref(s.contact_phone)} data-testid="contact-info-phone">
                    {s.contact_phone}
                  </a>
                ) : (
                  <span data-testid="contact-info-phone">—</span>
                )}
              </p>
            </div>
            <div>
              <span className="m">{t("address")}</span>
              <p data-testid="contact-info-address">{s.contact_address}</p>
            </div>
            {s.working_hours ? (
              <div>
                <span className="m">{t("hours")}</span>
                <p>{s.working_hours}</p>
              </div>
            ) : null}
            <div>
              <span className="m">{t("social")}</span>
              <p className="s">
                {socialLinks(s).map((so) =>
                  so.url ? (
                    <a key={so.key} href={so.url} rel="noopener noreferrer">
                      {so.label}
                    </a>
                  ) : (
                    <span key={so.key}>{so.label}</span>
                  ),
                )}
              </p>
            </div>
          </div>
          <ContactForm locale={locale} />
        </div>
      </section>
      <div className="mapwrap" data-testid="contact-map">
        <div className="map" role="img" aria-label={t("mapLabel", { address: s.contact_address ?? "" })}>
          <div className="pin" />
        </div>
        <div className="mapcard">
          <span className="m" style={{ opacity: 0.75 }}>
            {t("office")}
          </span>
          <b>{s.contact_address}</b>
        </div>
      </div>
    </>
  );
}
