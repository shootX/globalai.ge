import { storageUrl } from "@/lib/admin/storage";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getSettings, getTeam, getPageText } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
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
      <PageHero testId="about-hero" label={t("label")} title={t("title")} intro={t("intro")} />
      <section data-testid="about-mission">
        <div className="wrap mis">
          <div>
            <span className="m" style={{ color: "var(--grey)" }}>
              {t("missionLabel")}
            </span>
            <p className="st" style={{ marginTop: 18 }}>
              {t("mission")}
              <em style={{ color: "var(--red)", fontStyle: "normal" }}>.</em>
            </p>
          </div>
          <div>
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
            <Link className="btn" href="/services" data-testid="cta-about-services">
              {t("ctaServices")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
      <section data-testid="about-values">
        <div className="wrap">
          <div className="sh">
            <h2>
              {t("valuesTitle")}
              <em>.</em>
            </h2>
            <span className="m" style={{ color: "var(--grey)" }}>
              {t("valuesLabel")}
            </span>
          </div>
          <div className="vals">
            {values.map((v, i) => (
              <div key={v.t} data-testid={`value-${i}`}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {showTeam ? (
        <section data-testid="about-team">
          <div className="wrap">
            <div className="sh">
              <h2>
                {t("teamTitle")}
                <em>.</em>
              </h2>
              <span className="m" style={{ color: "var(--grey)" }}>
                {t("teamLabel")}
              </span>
            </div>
            <div className="team">
              {team.data.map((m, i) => (
                <article key={m.id} data-testid={`team-${i}`}>
                  <div
                    className="av"
                    role="img"
                    aria-label={m.name ?? ""}
                    style={m.photo ? { background: `center/cover url(${storageUrl(m.photo)})` } : undefined}
                  >
                    <span className="m">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3>{m.name}</h3>
                  <span className="m">{m.role}</span>
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
