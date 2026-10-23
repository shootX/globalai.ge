import { storageUrl } from "@/lib/admin/storage";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getSettings, getTeam, getPageText } from "@/lib/api";
import { pageMetadata } from "@/lib/page-seo";
import { SITE_URL, localizedPath } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { StatsBand } from "@/components/stats-band";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await resolveLocale(params), "about");
}

type Value = { t: string; d: string };

export default async function AboutPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const t = await getPageText("about", locale);
  const [settings, team] = await Promise.all([getSettings(locale), getTeam(locale)]);
  const values = t.raw("values") as Value[];
  const showTeam = settings.team_visible && team.data.length > 0;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: t("title"),
          description: t("intro"),
          url: `${SITE_URL}${localizedPath("/about", locale)}`,
        }}
      />
      <PageHero testId="about-hero" label={t("label")} title={t("title")} intro={t("intro")} />
      <section className="block tight" data-testid="about-mission">
        <div className="wrap grid12 split">
          <div>
            <span className="label">{t("missionLabel")}</span>
            <p className="lead">{t("mission")}</p>
          </div>
          <div>
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
            <Link className="text-link" href="/services" data-testid="cta-about-services">
              {t("ctaServices")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="block tight" data-testid="about-values">
        <div className="wrap">
          <span className="label">{t("valuesLabel")}</span>
          <h2 className="section-title">{t("valuesTitle")}</h2>
          <div className="cards four">
            {values.map((v, i) => (
              <article className="card compact" key={v.t} data-testid={`value-${i}`}>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {showTeam ? (
        <section className="block tight" data-testid="about-team">
          <div className="wrap">
            <span className="label">{t("teamLabel")}</span>
            <h2 className="section-title">{t("teamTitle")}</h2>
            <div className="team">
              {team.data.map((m, i) => (
                <article key={m.id} data-testid={`team-${i}`}>
                  <div
                    className="ph"
                    role="img"
                    aria-label={m.name ?? ""}
                    style={m.photo ? { backgroundImage: `url(${storageUrl(m.photo)})` } : undefined}
                  />
                  <h3>{m.name}</h3>
                  <span>{m.role}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <StatsBand settings={settings} />
      <CtaBand title={t("ctaBand")} cta={t("ctaContact")} testId="cta-about-contact" />
    </>
  );
}
