import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getProjects, getServices, getSettings, getPageText } from "@/lib/api";
import { pageMetadata } from "@/lib/page-seo";
import { SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { StatsBand } from "@/components/stats-band";
import { ProjectCard } from "@/components/project-card";
import { ContactForm } from "@/components/contact-form";
import { telHref } from "@/lib/social";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await resolveLocale(params), "home");
}

export default async function HomePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const t = await getPageText("home", locale);
  const [services, projects, settings] = await Promise.all([
    getServices(locale),
    getProjects(locale).catch(() => ({ data: [], meta: { total: 0 } })),
    getSettings(locale),
  ]);
  const featured = projects.data.slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "globalAI.GE",
          url: SITE_URL,
          logo: `${SITE_URL}/brand/globalai-logo.png`,
        }}
      />
      <div className="wrap hero">
        <div className="blob" aria-hidden="true" style={{ width: 170, height: 170, left: "30%", top: 60 }} />
        <div className="blob" aria-hidden="true" style={{ width: 240, height: 240, right: "12%", bottom: 120 }} />
        <div className="blob" aria-hidden="true" style={{ width: 90, height: 90, right: "22%", bottom: 300 }} />
        <div className="ring" aria-hidden="true" />
        <div className="orb" role="img" aria-label={t("orbLabel")} />
        <div className="prev" aria-hidden="true">
          <div className="thumb">
            <span>▶</span>
          </div>
          <div className="m" style={{ marginTop: 12, fontSize: 10 }}>
            <b>{t("showreel")}</b> · {t("showreelSub")}
          </div>
          <div className="dots">
            <i className="on" />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="redcard">
          <div className="m">
            {t("redcard1")}
            <br />
            {t("redcard2")}
          </div>
          <Link href="/contact" data-testid="cta-hero-primary">
            {t("ctaPrimary")} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="cols">
          <p className="m">
            <b>{t("col1t")}</b>
            <br />
            {t("col1")}
          </p>
          <p className="m">
            <b>{t("col2t")}</b>
            <br />
            {t("col2")}
          </p>
          <p className="m">
            <b>{t("col3t")}</b>
            <br />
            {t("col3")}
          </p>
        </div>
        <div className="idx" aria-hidden="true">
          — 01
        </div>
        <h1>
          {t("h1a")}
          <br />
          {t("h1b")}
          <em>.</em>
        </h1>
        <div className="sec2">
          <Link href="/projects" data-testid="cta-hero-secondary">
            {t("ctaSecondary")}
          </Link>
          <span className="m" style={{ color: "var(--grey)" }} aria-hidden="true">
            {t("scroll")}
          </span>
        </div>
        <a className="down" href="#services" aria-label={t("down")}>
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <section id="services">
        <div className="wrap">
          <div className="sh">
            <h2>
              {t("servicesTitle")}
              <em>.</em>
            </h2>
            <span className="m" style={{ color: "var(--grey)" }}>
              {t("servicesLabel")}
            </span>
          </div>
          <div className="svc">
            {services.data.map((s, i) => (
              <Link key={s.id} href="/services" data-testid={`service-link-${i}`}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                </div>
                <span className="ar" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <StatsBand settings={settings} />

      <section id="projects">
        <div className="wrap">
          <div className="sh">
            <h2>
              {t("projectsTitle")}
              <em>.</em>
            </h2>
            <span className="m" style={{ color: "var(--grey)" }}>
              {t("projectsLabel")}
            </span>
          </div>
          {featured.length > 0 ? (
            <div className="pj">
              {featured.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          ) : null}
          <div className="soon" style={featured.length === 0 ? { marginTop: 0 } : undefined}>
            <span>
              <b style={{ color: "var(--red)" }} aria-hidden="true">
                ●
              </b>{" "}
              {t("soon1")} <b>{t("soon2")}</b> {t("soon3")}
            </span>
            <Link href="/contact" className="m" data-testid="cta-home-projects">
              {t("soonCta")}
            </Link>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="wrap ab">
          <div>
            <span className="m" style={{ color: "var(--grey)" }}>
              {t("aboutLabel")}
            </span>
            <h2 style={{ marginTop: 16 }}>
              {t("aboutTitle1")}
              <br />
              {t("aboutTitle2")}
              <em>.</em>
            </h2>
          </div>
          <div>
            <p>{t("aboutText")}</p>
            <Link className="btn" href="/about" data-testid="cta-about">
              {t("aboutCta")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="contact">
        <div className="wrap ct">
          <div className="ci">
            <span className="m" style={{ color: "var(--grey)" }}>
              {t("contactLabel")}
            </span>
            <h2 style={{ marginTop: 16 }}>
              {t("contactTitle1")}
              <br />
              {t("contactTitle2")}
              <em>.</em>
            </h2>
            {settings.contact_email && (
              <p>
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              </p>
            )}
            {settings.contact_phone && (
              <p>
                <a href={telHref(settings.contact_phone)}>{settings.contact_phone}</a>
              </p>
            )}
            <p>{settings.contact_address}</p>
          </div>
          <ContactForm locale={locale} compact />
        </div>
      </section>
    </>
  );
}
