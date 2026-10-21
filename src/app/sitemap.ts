import type { MetadataRoute } from "next";
import { getAllArticles, getAllProjects, getAllTopics } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const projects = getAllProjects();
  const topics = getAllTopics().filter((topic) => topic.articleCount > 0);

  const newest = articles[0]?.publishedAt ?? "2026-01-01";

  return [
    { url: absoluteUrl("/"), lastModified: newest, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/writing"), lastModified: newest, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/projects"), lastModified: newest, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/topics"), lastModified: newest, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/about"), lastModified: newest, changeFrequency: "yearly", priority: 0.5 },
    ...articles.map((article) => ({
      url: absoluteUrl(`/writing/${article.slug}`),
      lastModified: article.updatedAt ?? article.publishedAt,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: `${project.year}-01-01`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...topics.map((topic) => ({
      url: absoluteUrl(`/topics/${topic.slug}`),
      lastModified: topic.latest?.updatedAt ?? topic.latest?.publishedAt ?? newest,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
