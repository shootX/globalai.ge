import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="wrap page-hero" role="alert">
      <span className="label">404</span>
      <h1>{t("title")}</h1>
      <div className="extra">
        <Link className="btn" href="/">
          {t("back")} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
