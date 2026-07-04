import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "https://wed.tonewbeginning.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/uploads/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
