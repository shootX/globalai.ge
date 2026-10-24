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
  const socials = socialLinks(s).filter((so) => so.url);

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
      <section className="block tight" data-testid="contact-section">
        <div className="wrap grid12 split">
          <div className="info" data-testid="contact-info">
            <div>
              <span className="label">{t("email")}</span>
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
              <span className="label">{t("phone")}</span>
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
            {s.contact_address ? (
              <div>
                <span className="label">{t("address")}</span>
                <p data-testid="contact-info-address">{s.contact_address}</p>
              </div>
            ) : null}
            {s.working_hours ? (
              <div>
                <span className="label">{t("hours")}</span>
                <p>{s.working_hours}</p>
              </div>
            ) : null}
            {socials.length > 0 ? (
              <div>
                <span className="label">{t("social")}</span>
                <p className="s">
                  {socials.map((so) => (
                    <a key={so.key} href={so.url ?? undefined} rel="noopener noreferrer" target="_blank">
                      {so.label}
                    </a>
                  ))}
                </p>
              </div>
            ) : null}
          </div>
          <div>
            <h2 className="section-title" style={{ marginBottom: 32 }}>
              {t("formTitle")}
            </h2>
            <ContactForm locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
