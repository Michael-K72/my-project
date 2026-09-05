import type { MetadataRoute } from "next";
import { identity } from "@/config/identity";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${identity.siteUrl}/sitemap.xml`,
    host: identity.siteUrl,
  };
}
