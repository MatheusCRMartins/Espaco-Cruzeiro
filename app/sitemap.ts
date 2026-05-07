import type { MetadataRoute } from "next";

import { EVENT_TYPES } from "@/lib/mock/event-types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0, lastModified: now },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${SITE_URL}/contato`, changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: `${SITE_URL}/reservar`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${SITE_URL}/visita`, changeFrequency: "weekly", priority: 0.85, lastModified: now },
    { url: `${SITE_URL}/politica-de-privacidade`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${SITE_URL}/termos-de-uso`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${SITE_URL}/politica-de-cancelamento`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
  ];

  const eventRoutes: MetadataRoute.Sitemap = EVENT_TYPES.map((e) => ({
    url: `${SITE_URL}/eventos/${e.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    lastModified: now,
  }));

  return [...staticRoutes, ...eventRoutes];
}
