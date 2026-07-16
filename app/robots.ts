import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default function robots(): MetadataRoute.Robots {
  return {
    // auth-страницы намеренно НЕ в disallow: они закрыты meta robots noindex,
    // а заблокированный краулинг не дал бы роботу увидеть этот noindex
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/chat"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
