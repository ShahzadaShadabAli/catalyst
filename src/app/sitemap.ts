import type { MetadataRoute } from "next";
import { getEvents } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const events = await getEvents();
  return [
    { url: site, changeFrequency: "weekly", priority: 1 },
    ...events.map((e) => ({ url: `${site}/works/${e.slug}`, lastModified: e.date, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
