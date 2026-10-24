import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPageText, getProjects, type Settings } from "@/lib/api";
import { Logo } from "./logo";
import { socialLinks, telHref } from "@/lib/social";

type SiteFooterProps = { locale: Locale; settings: Settings };

export async function SiteFooter({ locale, settings }: SiteFooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const n = await getTranslations({ locale, namespace: "nav" });
  const home = await getPageText("home", locale);
  const projects = await getProjects(locale).catch(() => ({ data: [], meta: { total: 0 } }));
  const ventures = projects.data.filter((p) => p.website_url && p.title);

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="grid12 cols">
          <div className="c">
            <span style={{ width: 140, display: "block", marginBottom: 10 }}>
              <Logo testId="footer-logo" sizes="140px" />
            </span>
            <p>{home("footerTagline")}</p>
          </div>
          <div className="c">
            <h4>{t("menu")}</h4>
            <Link href="/projects">{n("projects")}</Link>
            <Link href="/services">{n("services")}</Link>
            <Link href="/about">{n("about")}</Link>
            <Link href="/contact">{n("contact")}</Link>
          </div>
          <div className="c">
            <h4>{t("ventures")}</h4>
            {ventures.length > 0 ? (
              ventures.map((v) => (
                <a key={v.id} href={v.website_url ?? undefined} target="_blank" rel="noopener">
                  {v.title}
                </a>
              ))
            ) : (
              <Link href="/projects">{n("projects")}</Link>
            )}
          </div>
          <div className="c">
            <h4>{t("contact")}</h4>
            {settings.contact_email ? <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a> : null}
            {settings.contact_phone ? <a href={telHref(settings.contact_phone)}>{settings.contact_phone}</a> : null}
            {settings.contact_address ? <span className="off">{settings.contact_address}</span> : null}
            {socialLinks(settings)
              .filter((s) => s.url)
              .map((s) => (
                <a key={s.key} href={s.url ?? undefined} rel="noopener noreferrer" target="_blank">
                  {s.label}
                </a>
              ))}
          </div>
        </div>
        <div className="row">
          <span>
            © 2026 GlobalAI. {t("rights")}
          </span>
          <span>{t("city")}</span>
        </div>
        <span className="watermark" aria-hidden="true" />
      </div>
    </footer>
  );
}
