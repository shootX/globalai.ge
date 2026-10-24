import Link from "next/link";
import { archivo, notoGeorgian } from "@/lib/fonts";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Fallback for 404s outside [locale] (e.g. invalid locale): default to "ka".
export default function GlobalNotFound() {
  return (
    <html lang="ka" className={`${notoGeorgian.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <main className="wrap page-hero" role="alert">
          <h1>404</h1>
          <p className="intro">გვერდი ვერ მოიძებნა · Page not found</p>
          <div className="extra">
            <Link className="btn" href="/">
              globalai.ge <span aria-hidden="true">→</span>
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
