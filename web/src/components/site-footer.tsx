import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Settings } from "@/lib/api";
import { LogoImage } from "./logo";
import { socialLinks } from "@/lib/social";

type SiteFooterProps = { locale: Locale; settings: Settings };

export async function SiteFooter({ locale, settings }: SiteFooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const n = await getTranslations({ locale, namespace: "nav" });
  return (
    <footer>
      <div className="wrap">
        <div className="ft">
          <div>
            <span className="logo-chip" data-testid="footer-logo">
              <LogoImage />
            </span>
            <p style={{ opacity: 0.8, marginTop: 14, fontSize: 14 }}>
              {settings.contact_address}, {t("country")}
            </p>
          </div>
          <div>
            <span className="m">{t("menu")}</span>
            <Link href="/">{n("home")}</Link>
            <Link href="/about">{n("about")}</Link>
            <Link href="/services">{n("services")}</Link>
          </div>
          <div>
            <span className="m">{t("links")}</span>
            <Link href="/projects">{n("projects")}</Link>
            <Link href="/contact">{n("contact")}</Link>
          </div>
          <div>
            <span className="m">{t("social")}</span>
            {socialLinks(settings).map((s) =>
              s.url ? (
                <a key={s.key} href={s.url} rel="noopener noreferrer">
                  {s.label}
                </a>
              ) : (
                <span key={s.key} className="soc-off">
                  {s.label}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="cp m">
          <span>© {2026} globalAI.GE — {t("rights")}</span>
          <span>{t("city")}</span>
        </div>
      </div>
    </footer>
  );
}
