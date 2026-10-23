import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getProjects, getSettings, getPageText } from "@/lib/api";
import { pageMetadata } from "@/lib/page-seo";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { Logo } from "@/components/logo";
import { StatsBand } from "@/components/stats-band";
import { VentureList } from "@/components/venture-list";
import { CopyEmail } from "@/components/copy-email";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  return pageMetadata(await resolveLocale(params), "home");
}

/** Joins "lead <accent> tail" without a space before closing punctuation (ru tail is just "."). */
const gap = (tail: string) => (/^[.,!?:;…]/.test(tail) ? "" : " ");

export default async function HomePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const t = await getPageText("home", locale);
  const [projects, settings] = await Promise.all([getProjects(locale).catch(() => ({ data: [], meta: { total: 0 } })), getSettings(locale)]);
  const steps = [1, 2, 3, 4].map((n) => ({ title: t(`step${n}Title`), text: t(`step${n}Text`) }));
  const audiences = [1, 2, 3].map((n) => ({ title: t(`aud${n}Title`), text: t(`aud${n}Text`), cta: t(`aud${n}Cta`) }));

  return (
    <>
      <section className="wrap hero" data-testid="home-hero">
        <div className="grid12 top">
          <h1>
            {t("heroLead")} <em>{t("heroAccent")}</em>
            {gap(t("heroTail"))}
            {t("heroTail")}
          </h1>
          <div className="side">
            <p>{t("heroSide")}</p>
            <div className="actions">
              <Link className="btn" href="/projects" data-testid="cta-hero-primary">
                {t("ctaPrimary")} <span aria-hidden="true">→</span>
              </Link>
              <Link className="btn ghost" href="/contact" data-testid="cta-hero-secondary">
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
        <div className="monument">
          <Logo priority sizes="100vw" />
        </div>
        <div className="foot">
          <span>{t("heroFoot")}</span>
          <a href="#about">{t("heroMore")}</a>
        </div>
      </section>

      <section className="block" id="about" data-testid="home-about">
        <div className="wrap">
          <span className="label">{t("aboutLabel")}</span>
          <h2 className="thesis">
            {t("thesisLead")} <em>{t("thesisAccent")}</em>
            {gap(t("thesisTail"))}
            {t("thesisTail")}
          </h2>
          <div className="grid12 thesis-body">
            <div>
              <p>{t("aboutText")}</p>
              <p>
                <b>{t("aboutStrong")}</b>
              </p>
              <Link className="text-link" href="/about" data-testid="cta-about">
                {t("aboutCta")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="block tight" id="projects" data-testid="home-projects">
        <div className="wrap">
          <div className="ventures-head">
            <h2>{t("venturesTitle")}</h2>
            <span>{t("venturesNote")}</span>
          </div>
          <VentureList
            projects={projects.data}
            labels={{ live: t("statusLive"), building: t("statusBuilding") }}
            next={{ title: t("nextTitle"), meta: t("nextMeta"), text: t("nextText") }}
          />
        </div>
      </section>

      <StatsBand settings={settings} />

      <section className="block lime-field" id="model" data-testid="home-model">
        <div className="wrap">
          <span className="label">{t("modelLabel")}</span>
          <h2>{t("modelTitle")}</h2>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={i} data-testid={`step-${i}`}>
                <b>{s.title}</b>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="block" id="partners" data-testid="home-partners">
        <div className="wrap">
          <span className="label">{t("partnersLabel")}</span>
          <h2 className="section-title">{t("partnersTitle")}</h2>
          <div className="cards">
            {audiences.map((a, i) => (
              <article className="card" key={i} data-testid={`audience-${i}`}>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <Link className="text-link" href="/contact">
                  {a.cta} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="block tight" id="contact" data-testid="home-contact">
        <div className="wrap grid12 cta">
          <h2>{t("contactTitle")}</h2>
          <div className="act">
            {settings.contact_email ? <CopyEmail email={settings.contact_email} copy={t("copy")} copied={t("copied")} /> : null}
            <Link className="btn" href="/contact" data-testid="cta-home-contact">
              {t("contactCta")} <span aria-hidden="true">→</span>
            </Link>
            <small>{t("contactNote")}</small>
          </div>
        </div>
      </section>
    </>
  );
}
