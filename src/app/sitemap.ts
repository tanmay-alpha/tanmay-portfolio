import type { MetadataRoute } from "next";
import { CASE_STUDIES } from "@/components/case-study/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tanmay-portfolio-coral.vercel.app";
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...CASE_STUDIES.map((study) => ({
      url: `${baseUrl}/work/${study.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
