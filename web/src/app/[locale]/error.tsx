"use client";

import { useTranslations } from "next-intl";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("common");
  return (
    <div className="wrap page-hero" role="alert">
      <span className="label">Error</span>
      <h1>{t("errorTitle")}</h1>
      <div className="extra">
        <button type="button" className="btn" onClick={reset}>
          {t("retry")} <span aria-hidden="true">↻</span>
        </button>
      </div>
    </div>
  );
}
