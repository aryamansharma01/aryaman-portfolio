import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/posts";
import { siteConfig } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const postEntries = getAllPostSlugs().map((slug) => ({
    url: `${siteConfig.url}/blog/${slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: siteConfig.url, lastModified: new Date() },
    { url: `${siteConfig.url}/blog`, lastModified: new Date() },
    { url: `${siteConfig.url}/publications`, lastModified: new Date() },
    { url: `${siteConfig.url}/projects`, lastModified: new Date() },
    ...postEntries,
  ];
}
