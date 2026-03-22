import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/privacy", "/terms", "/legal"],
        disallow: [
          "/home",
          "/chat",
          "/scan",
          "/settings",
          "/documents",
          "/reminders",
          "/upgrade",
          "/login",
          "/register",
          "/onboarding",
          "/reset-password",
          "/update-password",
          "/api/",
        ],
      },
    ],
    sitemap: "https://fumuly.com/sitemap.xml",
  };
}
