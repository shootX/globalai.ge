import { notoGeorgian, spaceGrotesk } from "@/lib/fonts";
import "./globals.css";

// Fallback for 404s outside [locale] (e.g. invalid locale): default to "ka".
export default function GlobalNotFound() {
  return (
    <html lang="ka" className={`${notoGeorgian.variable} ${spaceGrotesk.variable}`}>
      <body>
        <main className="wrap ph" role="alert">
          <h1>
            404<em>.</em>
          </h1>
        </main>
      </body>
    </html>
  );
}
