import type { MetadataRoute } from "next";
import { hiddenLocalePaths } from "@/lib/page-seo";
import { SITE_URL } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const hidden = await hiddenLocalePaths();

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", ...hidden] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
