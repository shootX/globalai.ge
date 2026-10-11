import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="wrap ph" role="alert">
      <h1>
        404<em>.</em>
      </h1>
      <p>{t("title")}</p>
      <p>
        <Link href="/">{t("back")}</Link>
      </p>
    </div>
  );
}
