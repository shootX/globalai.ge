import type { Metadata, Viewport } from "next";
import { notoGeorgian, spaceGrotesk } from "@/lib/fonts";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "ადმინი — globalAI.GE", template: "%s — ადმინი globalAI.GE" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${notoGeorgian.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
